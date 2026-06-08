import type { FetchInstance } from "@resolid/utils/http";
import type { WechatResponse } from "./error";
import { type AccessTokenInterface, BaseApplication } from "./base";
import { BaseModule } from "./module";
import { assertWechatResponse } from "./utils";

type QuotaLimit = {
  /** 周期内可调用数量，单位 次 */
  call_count: number;
  /** 更新周期，单位 秒 */
  refresh_second: number;
};

export type WechatOpenApiQuotaResult = {
  /** quota 详情 */
  quota: {
    /** 当天该账号可调用该接口的次数 */
    daily_limit: number;
    /** 当天已经调用的次数 */
    used: number;
    /** 当天剩余调用次数 */
    remain: number;
  };
  /** 普通调用频率限制 */
  rate_limit: QuotaLimit;
  /** 代调用频率限制 */
  component_rate_limit: QuotaLimit;
};

export class OpenApi extends BaseModule {
  private readonly _appId: string;

  public static readonly API_QUOTA_GET = "/cgi-bin/openapi/quota/get";
  public static readonly API_QUOTA_CLEAR = "/cgi-bin/openapi/quota/clear";
  public static readonly QUOTA_CLEAR = "/cgi-bin/clear_quota";
  public static readonly QUOTA_CLEAR_BY_SECRET = "/cgi-bin/clear_quota/v2";

  constructor(appId: string, accessToken: AccessTokenInterface, client: FetchInstance) {
    super(accessToken, client);
    this._appId = appId;
  }

  /**
   * 查询API调用额度
   * @see https://developers.weixin.qq.com/doc/subscription/api/apimanage/api_getapiquota.html
   *
   * @param cgiPath API 的请求地址，例如 "/cgi-bin/message/custom/send"
   *
   * @return
   * */
  async getApiQuota(cgiPath: string): Promise<WechatOpenApiQuotaResult> {
    const accessToken = await this._accessToken.getToken();

    const result = await this._client<WechatResponse | WechatOpenApiQuotaResult>(
      OpenApi.API_QUOTA_GET,
      {
        method: "POST",
        query: { access_token: accessToken },
        body: { cgi_path: cgiPath },
      },
    );

    assertWechatResponse("Failed to get open-api quota:", result);

    return result;
  }

  /**
   * 重置指定API调用次数
   * - 每个账号每月共50次清零操作机会，清零生效一次即用掉一次机会；
   * @see https://developers.weixin.qq.com/doc/subscription/api/apimanage/api_clearapiquota.html
   *
   * @param cgiPath API 的请求地址，例如 "/cgi-bin/message/custom/send"
   *
   * @return 是否成功
   * */
  async clearApiQuota(cgiPath: string): Promise<boolean> {
    const accessToken = await this._accessToken.getToken();

    const result = await this._client<WechatResponse>(OpenApi.API_QUOTA_CLEAR, {
      method: "POST",
      query: { access_token: accessToken },
      body: { cgi_path: cgiPath },
    });

    assertWechatResponse("Failed to clear open-api quota:", result);

    return true;
  }

  /**
   * 重置API调用次数
   * @see https://developers.weixin.qq.com/doc/subscription/api/apimanage/api_clearquota.html
   *
   * @param appId 要被清空的账号的 appid, 默认调用方
   *
   * @return 是否成功
   * */
  async clearQuota(appId?: string): Promise<boolean> {
    const accessToken = await this._accessToken.getToken();

    const result = await this._client<WechatResponse>(OpenApi.QUOTA_CLEAR, {
      method: "POST",
      query: { access_token: accessToken },
      body: { appid: appId ?? this._appId },
    });

    assertWechatResponse("Failed to clear open-api quota:", result);

    return true;
  }

  /**
   * 使用 AppSecret 重置API调用次数
   *
   * - 该接口通过 appsecret 调用，解决了 accesss_token 耗尽无法调用「重置 API 调用次数」的问题。
   * - 每个账号每月使用「重置 API 调用次数」与本接口共10次清零操作机会，清零生效一次即用掉一次机会；
   *
   * @param appId 要被清空的账号的 appid
   * @param appSecret 唯一凭证密钥，即 AppSecret
   *
   * @return 是否成功
   * */
  async clearQuotaBySecret(appId: string, appSecret: string): Promise<boolean> {
    const result = await this._client<WechatResponse>(OpenApi.QUOTA_CLEAR_BY_SECRET, {
      method: "POST",
      body: { appid: appId, appsecret: appSecret },
    });

    assertWechatResponse("Failed to clear open-api quota:", result);

    return true;
  }
}

export abstract class OpenApiApplication extends BaseApplication {
  private _openApi?: OpenApi;

  openApi(): OpenApi {
    return (this._openApi ??= new OpenApi(this._appId, this.accessToken(), this._client));
  }
}
