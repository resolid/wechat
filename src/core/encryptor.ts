import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { WechatError } from "./error";
import { xmlBuild } from "./utils";

type MessageType = "xml" | "json" | "raw";
type EncryptResult = { Encrypt: string; MsgSignature: string; TimeStamp: number; Nonce: string };

export class Encryptor {
  private readonly _appId;
  private readonly _token;
  private readonly _aesKey;
  private readonly _receiveId;

  private static readonly BLOCK_SIZE = 16;

  constructor(appId: string, token: string, aesKey: string, receiveId?: string) {
    this._appId = appId;
    this._token = token;
    this._aesKey = Buffer.from(`${aesKey}=`, "base64");
    this._receiveId = receiveId;
  }

  encrypt(plaintext: string, nonce?: string, timestamp?: number, messageType?: "xml"): string;
  encrypt(plaintext: string, nonce?: string, timestamp?: number, messageType?: "json"): string;
  encrypt(
    plaintext: string,
    nonce?: string,
    timestamp?: number,
    messageType?: "raw",
  ): EncryptResult;
  encrypt(
    plaintext: string,
    nonce: string = randomBytes(Encryptor.BLOCK_SIZE).toString("hex"),
    timestamp: number = Math.floor(Date.now() / 1000),
    messageType: MessageType = "xml",
  ): EncryptResult | string {
    const buffer = Buffer.from(plaintext, "utf-8");
    const len = Buffer.alloc(4);
    len.writeUInt32BE(buffer.length, 0);

    const raw = Buffer.concat([
      randomBytes(Encryptor.BLOCK_SIZE),
      len,
      buffer,
      Buffer.from(this._appId, "utf-8"),
    ]);

    const blockSize = this._aesKey.length;
    const pad = blockSize - (raw.length % blockSize || blockSize);
    const padded = Buffer.concat([raw, Buffer.alloc(pad, pad)]);

    const cipher = createCipheriv(
      "aes-256-cbc",
      this._aesKey,
      this._aesKey.subarray(0, Encryptor.BLOCK_SIZE),
    ).setAutoPadding(false);

    const ciphertext = Buffer.concat([cipher.update(padded), cipher.final()]).toString("base64");
    const signature = this.signature(timestamp, nonce, ciphertext);

    const result = {
      Encrypt: ciphertext,
      MsgSignature: signature,
      TimeStamp: timestamp,
      Nonce: nonce,
    };

    if (messageType == "xml") {
      return xmlBuild(result);
    }

    if (messageType == "json") {
      return JSON.stringify(result);
    }

    return result;
  }

  decrypt(ciphertext: string, msgSignature: string, nonce: string, timestamp: number): string {
    if (this.signature(timestamp, nonce, ciphertext) != msgSignature) {
      throw new WechatError("Invalid Signature.");
    }

    const decipher = createDecipheriv(
      "aes-256-cbc",
      this._aesKey,
      this._aesKey.subarray(0, Encryptor.BLOCK_SIZE),
    ).setAutoPadding(false);

    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(ciphertext, "base64")),
      decipher.final(),
    ]);

    const content = decrypted.subarray(0, decrypted.length - decrypted.at(-1)!).subarray(16);

    if (content.length < 4) {
      throw new WechatError("Invalid encrypted payload.");
    }

    const length = content.readUInt32BE(0);

    if (content.length < 4 + length) {
      throw new WechatError("Invalid encrypted payload.");
    }

    if (this._receiveId && content.subarray(4 + length).toString("utf-8") != this._receiveId) {
      throw new WechatError("Invalid receiveId.");
    }

    return content.subarray(4, 4 + length).toString("utf-8");
  }

  private signature(...args: (string | number)[]): string {
    return createHash("sha1")
      .update([this._token, ...args].map(String).sort().join(""))
      .digest("hex");
  }
}
