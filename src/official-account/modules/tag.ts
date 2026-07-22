import { WechatFetchError, type WechatFetchResponse } from "../../core/error";
import { AuthorizedModule } from "../../core/module";
import { assertWechatFetchResponse } from "../../core/utils";

export type OfficialAccountTag = {
  /** 标签 id，由微信分配 */
  id: number;
  /** 标签名，UTF8编码 */
  name: string;
};

export type OfficialAccountTagInfo = OfficialAccountTag & {
  /**
   * 标签下粉丝数
   */
  count: number;
};

export type OfficialAccountTagFansResult = {
  /**
   * 本次获取的粉丝数量
   */
  count: number;

  /**
   * 粉丝 openid 列表
   */
  data: {
    openid: string[];
  };

  /**
   * 下一次拉取的起始 openid，为空字符串表示已拉取完毕
   */
  next_openid: string;
};

export class Tag extends AuthorizedModule {
  public static readonly GET = "/cgi-bin/tags/get";
  public static readonly CREATE = "/cgi-bin/tags/create";
  public static readonly UPDATE = "/cgi-bin/tags/update";
  public static readonly DELETE = "/cgi-bin/tags/delete";
  public static readonly FANS_GET = "/cgi-bin/user/tag/get";
  public static readonly USERS_BATCH_TAG = "/cgi-bin/tags/members/batchtagging";
  public static readonly USERS_BATCH_UNTAG = "/cgi-bin/tags/members/batchuntagging";
  public static readonly USER_TAGS_GET = "/cgi-bin/tags/getidlist";

  /**
   * 获取标签
   * @see https://developers.weixin.qq.com/doc/subscription/api/usermanage/tag/api_gettags.html
   *
   * @returns 标签列表
   */
  async getTags(): Promise<OfficialAccountTagInfo[]> {
    const accessToken = await this._accessToken.getToken();

    const result = await this._client<WechatFetchResponse | { tags: OfficialAccountTagInfo[] }>(
      Tag.GET,
      {
        method: "GET",
        responseFormat: "json",
        query: { access_token: accessToken },
      },
    );

    assertWechatFetchResponse("Failed to create tag:", result);

    return result.tags;
  }

  /**
   * 创建标签
   * @see https://developers.weixin.qq.com/doc/subscription/api/usermanage/tag/api_createtag.html
   *
   * @param name 标签名
   *
   * @returns 标签信息
   */
  async createTag(name: string): Promise<OfficialAccountTag> {
    const accessToken = await this._accessToken.getToken();

    const result = await this._client<WechatFetchResponse | { tag: OfficialAccountTag }>(
      Tag.CREATE,
      {
        method: "POST",
        query: { access_token: accessToken },
        body: JSON.stringify({ tag: { name } }),
      },
    );

    assertWechatFetchResponse("Failed to create tag:", result);

    return result.tag;
  }

  /**
   * 编辑标签
   * @see https://developers.weixin.qq.com/doc/subscription/api/usermanage/tag/api_updatetag.html
   *
   * @param tag 标签
   *
   * @returns 是否成功
   */
  async updateTag(tag: OfficialAccountTag): Promise<boolean> {
    const accessToken = await this._accessToken.getToken();

    const result = await this._client<WechatFetchResponse>(Tag.UPDATE, {
      method: "POST",
      query: { access_token: accessToken },
      body: JSON.stringify({ tag }),
    });

    assertWechatFetchResponse("Failed to create tag:", result);

    return true;
  }

  /**
   * 删除标签
   * @see https://developers.weixin.qq.com/doc/subscription/api/usermanage/tag/api_deletetag.html
   *
   * @param id 标签 Id
   *
   * @returns 是否成功
   */
  async deleteTag(id: number): Promise<boolean> {
    const accessToken = await this._accessToken.getToken();

    const result = await this._client<WechatFetchResponse>(Tag.DELETE, {
      method: "POST",
      query: { access_token: accessToken },
      body: JSON.stringify({ tag: { id } }),
    });

    assertWechatFetchResponse("Failed to delete tag:", result);

    return true;
  }

  /**
   * 获取标签下粉丝列表
   * @see https://developers.weixin.qq.com/doc/subscription/api/usermanage/tag/api_gettagfans.html
   *
   * @param id 标签 Id
   * @param nextOpenId 第一个拉取的 openId，不填默认从头开始拉取
   *
   * @returns 粉丝列表
   */
  async getTagFans(id: number, nextOpenId: string = ""): Promise<OfficialAccountTagFansResult> {
    const accessToken = await this._accessToken.getToken();

    const result = await this._client<WechatFetchResponse | OfficialAccountTagFansResult>(
      Tag.FANS_GET,
      {
        method: "POST",
        query: { access_token: accessToken },
        body: JSON.stringify({ tagid: id, next_openid: nextOpenId }),
      },
    );

    assertWechatFetchResponse("Failed to get tag fans:", result);

    return result;
  }

  /**
   * 批量为用户打标签
   * @see https://developers.weixin.qq.com/doc/subscription/api/usermanage/tag/api_batchtagging.html
   *
   * @param id 标签 Id
   * @param openIds 粉丝 openId 列表，最多50个
   *
   * @returns 失败的 openId 列表，可以尝试对其进行重试
   */
  async batchTagUsers(id: number, openIds: string[]): Promise<string[]> {
    const accessToken = await this._accessToken.getToken();

    const result = await this._client<WechatFetchResponse & { fail_openid_list?: string[] }>(
      Tag.USERS_BATCH_TAG,
      {
        method: "POST",
        responseFormat: "json",
        query: { access_token: accessToken },
        body: JSON.stringify({ tagid: id, openid_list: openIds }),
      },
    );

    if (result.errcode != 0 && result.errcode != 45171) {
      throw new WechatFetchError("Failed to batch tag users:", result);
    }

    return result.fail_openid_list ?? [];
  }

  /**
   * 批量为用户取消标签
   * @see https://developers.weixin.qq.com/doc/subscription/api/usermanage/tag/api_batchuntagging.html
   *
   * @param id 标签 Id
   * @param openIds 粉丝 openId 列表，最多50个
   *
   * @returns 失败的 openId 列表，可以尝试对其进行重试
   */
  async batchUntagUsers(id: number, openIds: string[]): Promise<string[]> {
    const accessToken = await this._accessToken.getToken();

    const result = await this._client<WechatFetchResponse & { fail_openid_list?: string[] }>(
      Tag.USERS_BATCH_UNTAG,
      {
        method: "POST",
        responseFormat: "json",
        query: { access_token: accessToken },
        body: JSON.stringify({ tagid: id, openid_list: openIds }),
      },
    );

    if (result.errcode != 0 && result.errcode != 45171) {
      throw new WechatFetchError("Failed to batch untag users:", result);
    }

    return result.fail_openid_list ?? [];
  }

  /**
   * 获取用户的标签列表
   * @see https://developers.weixin.qq.com/doc/subscription/api/usermanage/tag/api_gettagidlist.html
   *
   * @param openId 用户 openId
   *
   * @returns 标签 Id 列表
   */
  async getUserTags(openId: string): Promise<number[]> {
    const accessToken = await this._accessToken.getToken();

    const result = await this._client<WechatFetchResponse | { tagid_list?: number[] }>(
      Tag.USER_TAGS_GET,
      {
        method: "POST",
        responseFormat: "json",
        query: { access_token: accessToken },
        body: { openid: openId },
      },
    );

    assertWechatFetchResponse("Failed to get user tags:", result);

    return result.tagid_list ?? [];
  }
}
