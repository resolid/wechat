import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { WechatError } from "./error";
import { xmlBuild } from "./utils";

type MessageType = "xml" | "json";

export class Encryptor {
  private readonly _appId;
  private readonly _token;
  private readonly _aesKey;
  private readonly _receiveId;

  private readonly _BLOCK_SIZE = 16;

  constructor(appId: string, token: string, aesKey: string, receiveId?: string) {
    this._appId = appId;
    this._token = token;
    this._aesKey = Buffer.from(`${aesKey}=`, "base64");
    this._receiveId = receiveId;
  }

  encrypt(
    plaintext: string,
    nonce: string = randomBytes(this._BLOCK_SIZE).toString("hex"),
    timestamp: number = Math.floor(Date.now() / 1000),
    messageType: MessageType = "xml",
  ): string {
    const buffer = Buffer.from(plaintext, "utf8");
    const len = Buffer.alloc(4);
    len.writeUInt32BE(buffer.length, 0);

    const raw = Buffer.concat([
      randomBytes(this._BLOCK_SIZE),
      len,
      buffer,
      Buffer.from(this._appId),
    ]);

    const blockSize = this._aesKey.length;
    const pad = blockSize - (raw.length % blockSize || blockSize);
    const padded = Buffer.concat([raw, Buffer.alloc(pad, pad)]);

    const cipher = createCipheriv(
      "aes-256-cbc",
      this._aesKey,
      this._aesKey.subarray(0, this._BLOCK_SIZE),
    ).setAutoPadding(false);

    const ciphertext = Buffer.concat([cipher.update(padded), cipher.final()]).toString("base64");
    const signature = this._signature(this._token, timestamp, nonce, ciphertext);

    const result = {
      Encrypt: ciphertext,
      MsgSignature: signature,
      TimeStamp: timestamp,
      Nonce: nonce,
    };

    if (messageType == "xml") {
      return xmlBuild(result);
    }

    return JSON.stringify(result);
  }

  decrypt(ciphertext: string, msgSignature: string, nonce: string, timestamp: number): string {
    if (this._signature(this._token, timestamp, nonce, ciphertext) !== msgSignature) {
      throw new WechatError("Invalid Signature.");
    }

    const decipher = createDecipheriv(
      "aes-256-cbc",
      this._aesKey,
      this._aesKey.subarray(0, this._BLOCK_SIZE),
    ).setAutoPadding(false);

    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(ciphertext, "base64")),
      decipher.final(),
    ]);

    const content = decrypted
      .subarray(0, decrypted.length - decrypted[decrypted.length - 1]!)
      .subarray(16);

    if (content.length < 4) {
      throw new WechatError("Illegal buffer");
    }

    const length = content.readUInt32BE(0);

    if (content.length < 4 + length) {
      throw new WechatError("Illegal buffer");
    }

    if (this._receiveId && content.subarray(4 + length).toString("utf8") != this._receiveId) {
      throw new WechatError("Invalid appId");
    }

    return content.subarray(4, 4 + length).toString("utf8");
  }

  private _signature(...args: (string | number)[]): string {
    return createHash("sha1").update(args.map(String).sort().join("")).digest("hex");
  }
}
