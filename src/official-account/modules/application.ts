import { Cacher } from "@resolid/cache";
import { MemoryCache, NullCache } from "@resolid/cache/stores";
import { ufetch } from "@resolid/utils/http";
import type { AccessTokenInterface } from "../../core/base";
import type { Config } from "../../core/config";
import { OpenApiApplication } from "../../core/open-api";
import { withTrailingSlash } from "../../core/utils";
import { ArticleAnalytics } from "./article-analytics";
import { Menu } from "./menu";
import { MessageAnalytics } from "./message-analytics";
import { Tag } from "./tag";
import { User } from "./user";
import { UserAnalytics } from "./user-analytics";

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

export class OfficialAccountApplication extends OpenApiApplication {
  protected readonly _token: string;
  protected readonly _aesKey: string;
  protected readonly _cache: Cacher;
  protected readonly _debug: boolean;

  constructor({
    appId,
    accessToken,
    token = "",
    aesKey = "",
    baseUrl = "https://api.weixin.qq.com/",
    debug = false,
    cache = new Cacher({ store: debug ? new NullCache() : new MemoryCache() }),
  }: ApplicationConfig) {
    super(
      appId,
      ufetch.create({
        baseUrl: withTrailingSlash(baseUrl),
        responseFormat: "json",
      }),
      accessToken,
    );

    this._token = token;
    this._aesKey = aesKey;
    this._cache = cache;
    this._debug = debug;
  }

  private _articleAnalytics?: ArticleAnalytics;
  articleAnalytics(): ArticleAnalytics {
    return (this._articleAnalytics ??= new ArticleAnalytics(this.accessToken(), this._client));
  }

  private _messageAnalytics?: MessageAnalytics;
  messageAnalytics(): MessageAnalytics {
    return (this._messageAnalytics ??= new MessageAnalytics(this.accessToken(), this._client));
  }

  private _user?: User;
  user(): User {
    return (this._user ??= new User(this.accessToken(), this._client));
  }

  private _userAnalytics?: UserAnalytics;
  userAnalytics(): UserAnalytics {
    return (this._userAnalytics ??= new UserAnalytics(this.accessToken(), this._client));
  }

  private _tag?: Tag;
  tag(): Tag {
    return (this._tag ??= new Tag(this.accessToken(), this._client));
  }

  private _menu?: Menu;
  menu(): Menu {
    return (this._menu ??= new Menu(this.accessToken(), this._client));
  }
}
