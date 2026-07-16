import { AccessToken } from "./modules/access-token";
import { type ApplicationBaseConfig, OfficialAccountApplication } from "./modules/application";
import { Webhook } from "./modules/webhook";

export { OfficialAccountSubscribeScenes } from "./modules/user";

export type WechatOfficialAccountConfig = ApplicationBaseConfig & {
  /**
   *  微信应用 AppSecret
   */
  appSecret: string;

  /**
   * 是否使用稳定版 AccessToken 接口
   * @default false
   */
  stableAccessToken?: boolean;
};

export class WechatOfficialAccount extends OfficialAccountApplication {
  private readonly _appSecret;
  private readonly _stableAccessToken;

  constructor({ appSecret, stableAccessToken = false, ...rest }: WechatOfficialAccountConfig) {
    super(rest);
    this._appSecret = appSecret;
    this._stableAccessToken = stableAccessToken;
  }

  override accessToken(): AccessToken {
    return (this._accessToken ??= new AccessToken(
      this._appId,
      this._appSecret,
      this._stableAccessToken,
      this.client,
      this.cache,
    )) as AccessToken;
  }

  account(): {
    appId: string;
    appSecret: string;
    token: string;
    aesKey: string;
  } {
    return {
      appId: this._appId,
      appSecret: this._appSecret,
      token: this._token,
      aesKey: this._aesKey,
    };
  }

  webhook(request: Request): Webhook {
    return new Webhook(request, this._encryptor);
  }
}
