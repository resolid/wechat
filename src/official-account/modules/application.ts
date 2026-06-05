import { Cacher } from "@resolid/cache";
import { MemoryCache, NullCache } from "@resolid/cache/stores";
import { type FetchInstance, ufetch } from "@resolid/utils/http";
import type { AccessTokenInterface } from "../../core/access-token";
import type { Config } from "../../core/config";
import { WechatError } from "../../core/error";
import { withTrailingSlash } from "../../core/utils";
import { Menu } from "./menu";
import { Tag } from "./tag";
import { User } from "./user";

export type ApplicationBaseConfig = {
  /**
   *  微信应用 AppID
   */
  appId: string;

  /**
   *  消息签名令牌 Token
   */
  token?: string;

  /**
   *  消息加解密密钥 EncodingAESKey
   */
  aesKey?: string;
} & Config;

export type ApplicationConfig = ApplicationBaseConfig & {
  /**
   *  AccessToken 获取类
   */
  accessToken?: AccessTokenInterface;
};

export class OfficialAccountApplication {
  protected readonly _appId: string;
  protected readonly _token: string;
  protected readonly _aesKey: string;
  protected readonly _client: FetchInstance;
  protected readonly _cache: Cacher;
  protected readonly _debug: boolean;

  protected readonly _accessToken: AccessTokenInterface | undefined;

  constructor({
    appId,
    accessToken,
    token = "",
    aesKey = "",
    baseUrl = "https://api.weixin.qq.com/",
    debug = false,
    cache = new Cacher({ store: debug ? new NullCache() : new MemoryCache() }),
  }: ApplicationConfig) {
    this._appId = appId;
    this._token = token;
    this._aesKey = aesKey;
    this._client = ufetch.create({
      baseUrl: withTrailingSlash(baseUrl),
      responseFormat: "json",
    });
    this._cache = cache;
    this._debug = debug;
    this._accessToken = accessToken;
  }

  accessToken(): AccessTokenInterface {
    if (!this._accessToken) {
      throw new WechatError("accessToken is not configured");
    }

    return this._accessToken;
  }

  user(): User {
    return new User(this.accessToken(), this._client);
  }

  tag(): Tag {
    return new Tag(this.accessToken(), this._client);
  }

  menu(): Menu {
    return new Menu(this.accessToken(), this._client);
  }
}
