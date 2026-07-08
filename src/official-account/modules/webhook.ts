import type { Encryptor } from "../../core/encryptor";
import type { EventMessage, WechatMessage } from "../../core/message";
import { WechatError } from "../../core/error";
import { buildResponse, type MessageHandle, ServerRequest } from "../../core/server";
import { xmlParse } from "../../core/utils";

export class Webhook {
  public readonly request: ServerRequest;
  private readonly _encryptor: Encryptor | null;
  private readonly _handlers: Map<string, MessageHandle[]> = new Map();

  constructor(request: Request, encryptor: Encryptor | null) {
    this.request = new ServerRequest(request);
    this._encryptor = encryptor;
  }

  /**
   * 返回微信推送的消息体
   *
   * @returns 微信消息对象
   */
  async getMessage(): Promise<WechatMessage> {
    const query = this.request.getQuery();
    const message = await this.request.getMessage();
    const msgSignature = query.get("msg_signature");

    if (this._encryptor && msgSignature) {
      const timestamp = query.get("timestamp");
      const nonce = query.get("nonce");

      if (!timestamp || !nonce) {
        throw new WechatError("Invalid Request.");
      }

      const decrypted = this._encryptor.decrypt(
        (message as { Encrypt: string }).Encrypt,
        msgSignature,
        nonce,
        Number.parseInt(timestamp),
      );

      return this.request.isJsonRequest() ? JSON.parse(decrypted) : xmlParse(decrypted);
    }

    return message as WechatMessage;
  }

  /**
   * 注册消息或事件处理器
   *
   * key 格式说明：
   * - 普通消息类型直接使用 MsgType，如 `"text"`、`"image"`
   * - 事件消息使用 `"event:<EventType>"` 格式，如 `"event:subscribe"`
   * - 使用 `"*"` 可匹配所有消息类型（兜底处理器）
   *
   * 同一 key 可注册多个处理器，按注册顺序依次执行，
   * 直到某个处理器返回非空结果为止。
   *
   * @param key - 消息类型键
   * @param handler - 消息处理函数
   */
  handle<T = unknown>(key: string, handler: MessageHandle<T>): void {
    const list = this._handlers.get(key) ?? [];
    list.push(handler as MessageHandle);

    this._handlers.set(key, list);
  }

  async response(): Promise<Response> {
    const query = this.request.getQuery();
    const echostr = query.get("echostr");

    if (echostr) {
      return new Response(echostr);
    }

    let message;

    try {
      message = await this.getMessage();
    } catch (e) {
      return new Response((e as Error).message, { status: 400 });
    }

    const key =
      message.MsgType == "event" ? `event:${(message as EventMessage).Event}` : message.MsgType;

    const handles = [...(this._handlers.get(key) ?? []), ...(this._handlers.get("*") ?? [])];

    for (const handle of handles) {
      let result;

      try {
        // oxlint-disable-next-line no-await-in-loop
        result = await handle(message, this.request);
      } catch (e) {
        return new Response((e as Error).message, { status: 400 });
      }

      if (result) {
        if (result instanceof Response) {
          return result;
        }

        return buildResponse(result, this._encryptor);
      }
    }

    return new Response("success");
  }
}
