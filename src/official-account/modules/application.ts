import type { AccessTokenInterface } from "../../core/base";
import { Encryptor } from "../../core/encryptor";
import { OpenApiApplication, type OpenApiConfig } from "../../core/open-api";
import { ArticleAnalytics } from "./article-analytics";
import { Comment } from "./comment";
import { InterfaceAnalytics } from "./interface-analytics";
import { Menu } from "./menu";
import { MessageAnalytics } from "./message-analytics";
import { Tag } from "./tag";
import { User } from "./user";
import { UserAnalytics } from "./user-analytics";

export type ApplicationBaseConfig = {
  /**
   *  消息签名令牌 Token
   */
  token?: string;

  /**
   *  消息加解密密钥 EncodingAESKey
   */
  aesKey?: string;
} & OpenApiConfig;

export type ApplicationConfig = ApplicationBaseConfig & {
  /**
   *  AccessToken 获取类
   */
  accessToken?: AccessTokenInterface;
};

export class OfficialAccountApplication extends OpenApiApplication {
  protected readonly _token: string;
  protected readonly _aesKey: string;
  protected readonly _encryptor: Encryptor | null = null;

  constructor({
    appId,
    token = "",
    aesKey = "",
    baseUrl = "https://api.weixin.qq.com/",
    accessToken,
    debug,
    cache,
  }: ApplicationConfig) {
    super({ appId, baseUrl, debug, cache }, accessToken);
    this._token = token;
    this._aesKey = aesKey;

    if (aesKey.length > 0) {
      this._encryptor = new Encryptor(appId, token, aesKey);
    }
  }

  private _articleAnalytics?: ArticleAnalytics;
  articleAnalytics(): ArticleAnalytics {
    return (this._articleAnalytics ??= new ArticleAnalytics(this.accessToken(), this.client));
  }

  private _messageAnalytics?: MessageAnalytics;
  messageAnalytics(): MessageAnalytics {
    return (this._messageAnalytics ??= new MessageAnalytics(this.accessToken(), this.client));
  }

  private _interfaceAnalytics?: InterfaceAnalytics;
  interfaceAnalytics(): InterfaceAnalytics {
    return (this._interfaceAnalytics ??= new InterfaceAnalytics(this.accessToken(), this.client));
  }

  private _user?: User;
  user(): User {
    return (this._user ??= new User(this.accessToken(), this.client));
  }

  private _userAnalytics?: UserAnalytics;
  userAnalytics(): UserAnalytics {
    return (this._userAnalytics ??= new UserAnalytics(this.accessToken(), this.client));
  }

  private _tag?: Tag;
  tag(): Tag {
    return (this._tag ??= new Tag(this.accessToken(), this.client));
  }

  private _menu?: Menu;
  menu(): Menu {
    return (this._menu ??= new Menu(this.accessToken(), this.client));
  }

  private _comment?: Comment;
  comment(): Comment {
    return (this._comment ??= new Comment(this.accessToken(), this.client));
  }
}
