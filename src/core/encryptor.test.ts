import { beforeEach, describe, expect, it } from "vitest";
import { Encryptor } from "./encryptor";
import { xmlBuild, xmlParse } from "./utils";

describe("Encryptor", () => {
  let encryptor: Encryptor;

  beforeEach(() => {
    encryptor = new Encryptor(
      "wxf0d5962684549d31",
      "xL7M0C1m5ZDG3m2U",
      "PjO6MLNr7p8pf2TJiPdoKRQhybGLAaNUoN4MgW7h4VZ",
    );
  });

  it("should decrypt correctly", () => {
    const encrypted = {
      ToUserName: "gh_1673fbd15303",
      Encrypt:
        "sJLmijM/32NFhiwtRyZx2mqw1r6BgwTdDgzm/yEj1KkHjxltqHI0lpqHC1rnXfJSwNbzOl0+o5DHX2hZ0kqLGDAWvx7D1uHYqzRLLs/8aHEu2uaSDbUa/0MoGid4PVN718J9S/gn2eOBZhfcOI8UtHAR+HHBdSZQoBx1WpL2j3srvjlpFUSfYnU9m5sx1vJNsqZQWB6L5rcuz6oSZks15fZVFUR4ricN7Wu+sreC2wPH+/uVm7COLiVHJXQumfrfWcUlLaEDYCUKju4gy4fd0/s8cBPO3MkYd4qBe1PUPCU=",
    };

    const decrypted: {
      ToUserName: string;
      CreateTime: string;
    } = JSON.parse(
      encryptor.decrypt(
        encrypted.Encrypt,
        "5fae9b6855087b74a77c38e4951dc5a2c7f4e93a",
        "1206628514",
        1781144713,
      ),
    );

    expect(decrypted.ToUserName).toBe(encrypted.ToUserName);
    expect(decrypted.CreateTime).toBe(1781144713);
  });

  it("should encrypt and decrypt correctly", () => {
    const raw = {
      ToUserName: "toUser",
      FromUserName: "fromUser",
      CreateTime: 1407743423,
      MsgType: "link",
      Title: "链接",
      Description: "链接",
      Url: "https://www.resolid.tech",
    };

    const encrypted: { Encrypt: string; MsgSignature: string; TimeStamp: number; Nonce: string } =
      xmlParse(encryptor.encrypt(xmlBuild(raw), "XCRyKpQ7RcW0xdfK", 1407743423));

    expect(encrypted.TimeStamp).toBe(1407743423);
    expect(encrypted.Nonce).toBe("XCRyKpQ7RcW0xdfK");
    expect(encrypted.Encrypt).toBeDefined();
    expect(encrypted.MsgSignature).toBeDefined();

    const decrypted = xmlParse(
      encryptor.decrypt(
        encrypted.Encrypt,
        encrypted.MsgSignature,
        encrypted.Nonce,
        encrypted.TimeStamp,
      ),
    );

    expect(decrypted).toStrictEqual(raw);
  });
});
