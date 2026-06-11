import type { Cacher } from "@resolid/cache";
import type { FetchInstance } from "@resolid/utils/http";
import type { AccessTokenInterface } from "../../core/base";
import type { WechatResponse } from "../../core/error";
import { assertWechatResponse } from "../../core/utils";

type AccessTokenPayload = {
  access_token: string;
  expires_in: number;
};

export class AccessToken implements AccessTokenInterface {
  private readonly _appId;
  private readonly _appSecret;
  private readonly _client;
  private readonly _cache;
  private readonly _stableAccessToken;

  protected readonly _cacheKeyPrefix = "OfficialAccount";

  public static readonly TOKEN = "/cgi-bin/token";
  public static readonly STABLE_TOKEN = "/cgi-bin/stable_token";

  constructor(
    appId: string,
    appSecret: string,
    stableAccessToken: boolean,
    client: FetchInstance,
    cache: Cacher,
  ) {
    this._appId = appId;
    this._appSecret = appSecret;
    this._stableAccessToken = stableAccessToken;
    this._client = client;
    this._cache = cache;
  }

  getCacheKey() {
    return `${this._cacheKeyPrefix}.${this._appId}.${this._stableAccessToken}`;
  }

  /**
   * 获取接口调用凭据
   * @see https://developers.weixin.qq.com/doc/subscription/api/base/api_getaccesstoken.html
   *
   * @returns 后台接口调用凭据（Access Token）
   */
  async getToken(): Promise<string> {
    return this._cache.getOrSet(this.getCacheKey(), async (ctx) => {
      const result = await this._requestToken();
      ctx.setTtl(result.expires_in - 10);

      return result.access_token;
    });
  }

  /**
   * 获取稳定版接口调用凭据
   * @help https://developers.weixin.qq.com/doc/subscription/api/base/api_getstableaccesstoken.html
   *
   * @param forceRefresh 强制刷新模式
   *
   * @returns 后台接口调用凭据（Access Token）
   */
  async refreshToken(forceRefresh = false): Promise<string> {
    const result = await this._requestToken(forceRefresh);

    await this._cache.set(this.getCacheKey(), result.access_token, result.expires_in - 10);

    return result.access_token;
  }

  private async _requestToken(forceRefresh = false) {
    const params = {
      appid: this._appId,
      secret: this._appSecret,
      grant_type: "client_credential",
    };

    const result = await this._client<AccessTokenPayload | WechatResponse>(
      this._stableAccessToken ? AccessToken.STABLE_TOKEN : AccessToken.TOKEN,
      {
        method: this._stableAccessToken ? "POST" : "GET",
        responseFormat: "json",
        query: this._stableAccessToken ? undefined : params,
        body: this._stableAccessToken ? { ...params, force_refresh: forceRefresh } : undefined,
      },
    );

    assertWechatResponse(
      `Failed to get ${this._stableAccessToken ? "stable " : ""}access_token: `,
      result,
    );

    return result;
  }
}
