import type { FetchInstance } from "@resolid/utils/http";
import { isString } from "@resolid/utils";
import type { AccessTokenInterface } from "../../core/access-token";
import { WechatError, type WechatResponse } from "../../core/error";
import { assertWechatResponse } from "../../core/utils";

export type OfficialAccountUsersResult = {
  /**
   * 用户总数
   */
  total: number;
  /**
   * 本次返回的用户数
   */
  count: number;
  /**
   * 用户数据, openId 的列表
   */
  data: { openid: string[] };
  /**
   * 本次列表后一位 openId, 为空表示列表结束
   */
  next_openid: string;
};

/**
 * 用户关注来源
 */
export const OfficialAccountSubscribeScenes = {
  /** 公众号搜索 */
  SEARCH: "ADD_SCENE_SEARCH",

  /** 公众号迁移 */
  ACCOUNT_MIGRATION: "ADD_SCENE_ACCOUNT_MIGRATION",

  /** 名片分享 */
  PROFILE_CARD: "ADD_SCENE_PROFILE_CARD",

  /** 扫描二维码 */
  QR_CODE: "ADD_SCENE_QR_CODE",

  /** 图文页内名称点击 */
  PROFILE_LINK: "ADD_SCENE_PROFILE_LINK",

  /** 图文页右上角菜单 */
  PROFILE_ITEM: "ADD_SCENE_PROFILE_ITEM",

  /** 支付后关注 */
  PAID: "ADD_SCENE_PAID",

  /** 微信广告 */
  WECHAT_ADVERTISEMENT: "ADD_SCENE_WECHAT_ADVERTISEMENT",

  /** 他人转载 */
  REPRINT: "ADD_SCENE_REPRINT",

  /** 视频号直播 */
  LIVESTREAM: "ADD_SCENE_LIVESTREAM",

  /** 视频号 */
  CHANNELS: "ADD_SCENE_CHANNELS",

  /** 小程序关注 */
  WXA: "ADD_SCENE_WXA",

  /** 其他来源 */
  OTHERS: "ADD_SCENE_OTHERS",
} as const;

export type OfficialAccountSubscribeScene =
  (typeof OfficialAccountSubscribeScenes)[keyof typeof OfficialAccountSubscribeScenes];

type UnsubscribedUser = {
  /** 用户是否订阅该公众号标识，值为0时，代表此用户没有关注该公众号，拉取不到其余信息。 */
  subscribe: 0;
  /** 用户的标识，对当前公众号唯一 */
  openid: string;
};

type SubscribedUser = {
  subscribe: 1;
  openid: string;
  /** 用户关注时间，为时间戳。如果用户曾多次关注，则取最后关注时间 */
  subscribe_time: number;
  /** 只有在用户将公众号绑定到微信开放平台账号后，才会出现该字段。 */
  unionid?: string;
  /** 公众号运营者对粉丝的备注，公众号运营者可在微信公众平台用户管理界面对粉丝添加备注 */
  remark: string;
  /** 用户所在的分组ID（兼容旧的用户分组接口） */
  groupid: number;
  /** 用户被打上的标签ID列表 */
  tagid_list: number[];
  /** 用户关注的渠道来源 */
  subscribe_scene?: OfficialAccountSubscribeScene;
  /** 二维码扫码场景 */
  qr_scene?: number;
  /** 二维码扫码场景描述 */
  qr_scene_str?: string;
};

export type OfficialAccountUser = UnsubscribedUser | SubscribedUser;

export type OfficialAccountChangeOpenIdResult = WechatResponse & {
  result_list: {
    /** 旧 openId */
    ori_openid: string;
    /** 新 openId */
    new_openid: string;
    /** 错误描述。"ori_openid error" 则表示这个 openId 目前没有关注旧账号。 */
    err_msg: string;
  }[];
};

export class User {
  private readonly _accessToken;
  private readonly _client;

  public static readonly BLACKLIST_GET = "/cgi-bin/tags/members/getblacklist";
  public static readonly BLACKLIST_BATCH = "/cgi-bin/tags/members/batchblacklist";
  public static readonly BLACKLIST_BATCH_REMOVE = "/cgi-bin/tags/members/batchunblacklist";
  public static readonly INFO_GET = "/cgi-bin/user/info";
  public static readonly INFO_BATCH_GET = "/cgi-bin/user/info/batchget";
  public static readonly FANS_GET = "/cgi-bin/user/get";
  public static readonly REMARK_UPDATE = "/cgi-bin/user/info/updateremark";
  public static readonly OPENID_CHANGE = "/cgi-bin/changeopenid";

  constructor(accessToken: AccessTokenInterface, client: FetchInstance) {
    this._accessToken = accessToken;
    this._client = client;
  }

  private _checkOpenIdsSize(openIds: unknown[], size: number) {
    if (openIds.length > size) {
      throw new WechatError(`A maximum of ${size} users can be selected.`);
    }
  }

  /**
   * 获取黑名单列表
   * @see https://developers.weixin.qq.com/doc/subscription/api/usermanage/userinfo/api_getblacklist.html
   *
   * @param beginOpenId 起始 openId，为空时从开头拉取
   *
   * @returns 黑名单
   */
  async getBlacklist(beginOpenId: string = ""): Promise<OfficialAccountUsersResult> {
    const accessToken = await this._accessToken.getToken();

    const result = await this._client<WechatResponse | OfficialAccountUsersResult>(
      User.BLACKLIST_GET,
      {
        method: "POST",
        responseFormat: "json",
        query: { access_token: accessToken },
        body: { begin_openid: beginOpenId },
      },
    );

    assertWechatResponse("Failed to get blacklist:", result);

    return result;
  }

  /**
   * 拉黑用户
   * @see https://developers.weixin.qq.com/doc/subscription/api/usermanage/userinfo/api_batchblacklist.html
   *
   * @param openIds 需要拉黑的 openId 列表
   *
   * @returns 是否成功
   */
  async batchBlacklist(openIds: string[]): Promise<boolean> {
    this._checkOpenIdsSize(openIds, 20);

    const accessToken = await this._accessToken.getToken();

    const result = await this._client<WechatResponse>(User.BLACKLIST_BATCH, {
      method: "POST",
      query: { access_token: accessToken },
      body: { openid_list: openIds },
    });

    assertWechatResponse("Failed to batch blacklist:", result);

    return true;
  }

  /**
   * 取消拉黑用户
   * @see https://developers.weixin.qq.com/doc/subscription/api/usermanage/userinfo/api_batchunblacklist.html
   *
   * @param openIds 需要取消拉黑的 openId 列表
   *
   * @returns 是否成功
   */
  async batchUnblacklist(openIds: string[]): Promise<boolean> {
    this._checkOpenIdsSize(openIds, 20);

    const accessToken = await this._accessToken.getToken();

    const result = await this._client<WechatResponse>(User.BLACKLIST_BATCH_REMOVE, {
      method: "POST",
      query: { access_token: accessToken },
      body: { openid_list: openIds },
    });

    assertWechatResponse("Failed to batch unblacklist:", result);

    return true;
  }

  /**
   * 获取用户基本信息
   * @see https://developers.weixin.qq.com/doc/subscription/api/usermanage/userinfo/api_userinfo.html
   *
   * @param openId 普通用户的标识，对当前公众号唯一
   * @param language 返回国家地区语言版本
   *
   * @returns 用户信息
   */
  async getUserInfo(openId: string, language: string = ""): Promise<OfficialAccountUser> {
    const accessToken = await this._accessToken.getToken();

    const result = await this._client<WechatResponse | OfficialAccountUser>(User.INFO_GET, {
      method: "GET",
      query: { access_token: accessToken, openid: openId, lang: language },
    });

    assertWechatResponse("Failed to get userInfo:", result);

    return result;
  }

  /**
   * 批量获取用户基本信息
   * @see https://developers.weixin.qq.com/doc/subscription/api/usermanage/userinfo/api_batchuserinfo.html
   *
   * @param userList 用户列表
   *
   * @returns 用户信息列表
   */
  async batchUserInfo(
    userList: (string | { openid: string; lang?: string })[],
  ): Promise<OfficialAccountUser[]> {
    this._checkOpenIdsSize(userList, 50);

    const accessToken = await this._accessToken.getToken();

    const result = await this._client<WechatResponse | { user_info_list: OfficialAccountUser[] }>(
      User.INFO_BATCH_GET,
      {
        method: "POST",
        responseFormat: "json",
        query: { access_token: accessToken },
        body: JSON.stringify({
          user_list: userList.map((u) =>
            isString(u) ? { openid: u, lang: "" } : { openid: u.openid, lang: u.lang ?? "" },
          ),
        }),
      },
    );

    assertWechatResponse("Failed to batch userInfo:", result);

    return result.user_info_list;
  }

  /**
   * 获取关注用户列表
   * @see https://developers.weixin.qq.com/doc/subscription/api/usermanage/userinfo/api_getfans.html
   *
   * @param nextOpenId 上一批列表的最后一个 openId，不填默认从头开始拉取
   *
   * @returns 用户列表
   */
  async getFans(nextOpenId: string = ""): Promise<OfficialAccountUsersResult> {
    const accessToken = await this._accessToken.getToken();

    const result = await this._client<WechatResponse | OfficialAccountUsersResult>(User.FANS_GET, {
      method: "GET",
      query: { access_token: accessToken, next_openid: nextOpenId },
    });

    assertWechatResponse("Failed to get fans:", result);

    return result;
  }

  /**
   * 设置用户备注名
   * @see https://developers.weixin.qq.com/doc/subscription/api/usermanage/userinfo/api_updateremark.html
   *
   * @param openId 用户标识
   * @param remark 新的备注名，长度必须小于30字节
   *
   * @returns 是否成功
   */
  async updateRemark(openId: string, remark: string): Promise<boolean> {
    const accessToken = await this._accessToken.getToken();

    const result = await this._client<WechatResponse>(User.REMARK_UPDATE, {
      method: "POST",
      query: { access_token: accessToken },
      body: { openid: openId, remark },
    });

    assertWechatResponse("Failed to update remark:", result);

    return true;
  }

  /**
   * 转换 openId
   * @see https://developers.weixin.qq.com/doc/subscription/api/usermanage/changeopenid/api_changeopenid.html
   *
   * @param fromAppId 原账号的原始id，不是 appid
   * @param openIds 原账号的用户列表，一次最多100个
   *
   * @returns 转换结果
   */
  async changeOpenId(
    fromAppId: string,
    openIds: string[],
  ): Promise<OfficialAccountChangeOpenIdResult> {
    this._checkOpenIdsSize(openIds, 100);

    const accessToken = await this._accessToken.getToken();

    return await this._client<OfficialAccountChangeOpenIdResult>(User.OPENID_CHANGE, {
      method: "POST",
      query: { access_token: accessToken },
      body: { from_appid: fromAppId, openid_list: openIds },
    });
  }
}
