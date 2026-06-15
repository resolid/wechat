import type { WechatFetchResponse } from "../../core/error";
import { BaseModule } from "../../core/module";
import { assertWechatFetchResponse } from "../../core/utils";

export type OfficialAccountListCommentResult = {
  /** 评论列表 */
  comment: {
    /** 用户评论 id*/
    user_comment_id: number;
    /** 评论时间 */
    create_time: number;
    /** 评论内容 */
    content: string;
    /** 是否精选评论，0 为非精选，1 为精选 */
    comment_type: number;
    /** openid，用户如果用非微信身份评论，不返回 openid */
    openid?: string;
    /** 回复信息 */
    reply: {
      /** 回复内容 */
      content: string;
      /** 回复时间  */
      create_time: number;
    };
  }[];
  /** 评论总数 */
  total: number;
};

export class Comment extends BaseModule {
  public static readonly OPEN = "/cgi-bin/comment/open";
  public static readonly CLOSE = "/cgi-bin/comment/close";
  public static readonly LIST = "/cgi-bin/comment/list";
  public static readonly ELECT = "/cgi-bin/comment/markelect";
  public static readonly UNELECT = "/cgi-bin/comment/unmarkelect";
  public static readonly DELETE = "/cgi-bin/comment/delete";
  public static readonly REPLY = "/cgi-bin/comment/reply/add";
  public static readonly REPLY_DELETE = "/cgi-bin/comment/reply/delete";

  /**
   * 打开已群发文章评论
   * @see https://developers.weixin.qq.com/doc/subscription/api/leaving/api_openarticlecomment.html
   *
   * @param msgDataId 群发返回的 msg_data_id
   * @param index 多图文时，用来指定第几篇图文，从 0 开始，不带默认操作该 msg_data_id 的第一篇图文
   *
   * @return 是否操作成功
   */
  async openComment(msgDataId: string, index?: number): Promise<boolean> {
    const accessToken = await this._accessToken.getToken();

    const result = await this._client<WechatFetchResponse>(Comment.OPEN, {
      method: "POST",
      query: { access_token: accessToken },
      body: { msg_data_id: msgDataId, index },
    });

    assertWechatFetchResponse("Failed to open article comment:", result);

    return true;
  }

  /**
   * 关闭已群发文章评论
   * @see https://developers.weixin.qq.com/doc/subscription/api/leaving/api_closecomment.html
   *
   * @param msgDataId 群发返回的 msg_data_id
   * @param index 多图文时，用来指定第几篇图文，从 0 开始，不带默认操作该 msg_data_id 的第一篇图文
   *
   * @return 是否操作成功
   */
  async closeComment(msgDataId: string, index?: number): Promise<boolean> {
    const accessToken = await this._accessToken.getToken();

    const result = await this._client<WechatFetchResponse>(Comment.CLOSE, {
      method: "POST",
      query: { access_token: accessToken },
      body: { msg_data_id: msgDataId, index },
    });

    assertWechatFetchResponse("Failed to close article comment:", result);

    return true;
  }

  /**
   * 查看指定文章的评论数据
   * @see https://developers.weixin.qq.com/doc/subscription/api/leaving/api_listcomment.html
   *
   * @param msgDataId 群发返回的 msg_data_id
   * @param begin 起始位置
   * @param count 获取数目（>=50会被拒绝）
   * @param type type=0 普通评论&精选评论; type=1 普通评论; type=2 精选评论
   * @param index 多图文时，用来指定第几篇图文，从 0 开始，不带默认返回该 msg_data_id 的第一篇图文
   *
   * @return 评论数据
   * */
  async listComment(
    msgDataId: string,
    begin: number,
    count: number,
    type: number,
    index?: number,
  ): Promise<OfficialAccountListCommentResult> {
    const accessToken = await this._accessToken.getToken();

    const result = await this._client<WechatFetchResponse | OfficialAccountListCommentResult>(
      Comment.LIST,
      {
        method: "POST",
        query: { access_token: accessToken },
        body: { msg_data_id: msgDataId, index, begin, count, type },
      },
    );

    assertWechatFetchResponse("Failed to list article comment:", result);

    return result;
  }

  /**
   * 评论标记精选
   * @see https://developers.weixin.qq.com/doc/subscription/api/leaving/api_electcomment.html
   *
   * @param msgDataId 群发返回的 msg_data_id
   * @param userCommentId 用户评论 id
   * @param index 多图文时，用来指定第几篇图文，从 0 开始，不带默认操作该 msg_data_id 的第一篇图文
   *
   * @return 是否操作成功
   * */
  async electComment(msgDataId: string, userCommentId: number, index?: number): Promise<boolean> {
    const accessToken = await this._accessToken.getToken();

    const result = await this._client<WechatFetchResponse>(Comment.ELECT, {
      method: "POST",
      query: { access_token: accessToken },
      body: { msg_data_id: msgDataId, index, user_comment_id: userCommentId },
    });

    assertWechatFetchResponse("Failed to elect article comment:", result);

    return true;
  }

  /**
   * 评论取消精选
   * @see https://developers.weixin.qq.com/doc/subscription/api/leaving/api_unelectcomment.html
   *
   * @param msgDataId 群发返回的 msg_data_id
   * @param userCommentId 用户评论 id
   * @param index 多图文时，用来指定第几篇图文，从 0 开始，不带默认操作该 msg_data_id 的第一篇图文
   *
   * @return 是否操作成功
   * */
  async unelectComment(msgDataId: string, userCommentId: number, index?: number): Promise<boolean> {
    const accessToken = await this._accessToken.getToken();

    const result = await this._client<WechatFetchResponse>(Comment.UNELECT, {
      method: "POST",
      query: { access_token: accessToken },
      body: { msg_data_id: msgDataId, index, user_comment_id: userCommentId },
    });

    assertWechatFetchResponse("Failed to unelect article comment:", result);

    return true;
  }

  /**
   * 删除评论
   * @see https://developers.weixin.qq.com/doc/subscription/api/leaving/api_delcomment.html
   *
   * @param msgDataId 群发返回的 msg_data_id
   * @param userCommentId 用户评论 id
   * @param index 多图文时，用来指定第几篇图文，从 0 开始，不带默认操作该 msg_data_id 的第一篇图文
   *
   * @return 是否操作成功
   * */
  async deleteComment(msgDataId: string, userCommentId: number, index?: number): Promise<boolean> {
    const accessToken = await this._accessToken.getToken();

    const result = await this._client<WechatFetchResponse>(Comment.DELETE, {
      method: "POST",
      query: { access_token: accessToken },
      body: { msg_data_id: msgDataId, index, user_comment_id: userCommentId },
    });

    assertWechatFetchResponse("Failed to delete article comment:", result);

    return true;
  }

  /**
   * 回复评论
   * @see https://developers.weixin.qq.com/doc/subscription/api/leaving/api_replycomment.html
   *
   * @param msgDataId 群发返回的 msg_data_id
   * @param userCommentId 用户评论 id
   * @param content 回复内容
   * @param index 多图文时，用来指定第几篇图文，从 0 开始，不带默认操作该 msg_data_id 的第一篇图文
   *
   * @return 是否操作成功
   * */
  async replyComment(
    msgDataId: string,
    userCommentId: number,
    content: string,
    index?: number,
  ): Promise<boolean> {
    const accessToken = await this._accessToken.getToken();

    const result = await this._client<WechatFetchResponse>(Comment.REPLY, {
      method: "POST",
      query: { access_token: accessToken },
      body: { msg_data_id: msgDataId, index, user_comment_id: userCommentId, content },
    });

    assertWechatFetchResponse("Failed to reply article comment:", result);

    return true;
  }

  /**
   * 删除回复
   * @see https://developers.weixin.qq.com/doc/subscription/api/leaving/api_delreplycomment.html
   *
   * @param msgDataId 群发返回的 msg_data_id
   * @param userCommentId 用户评论 id
   * @param index 多图文时，用来指定第几篇图文，从 0 开始，不带默认操作该 msg_data_id 的第一篇图文
   *
   * @return 是否操作成功
   * */
  async deleteReply(msgDataId: string, userCommentId: number, index?: number): Promise<boolean> {
    const accessToken = await this._accessToken.getToken();

    const result = await this._client<WechatFetchResponse>(Comment.REPLY_DELETE, {
      method: "POST",
      query: { access_token: accessToken },
      body: { msg_data_id: msgDataId, index, user_comment_id: userCommentId },
    });

    assertWechatFetchResponse("Failed to delete article comment reply:", result);

    return true;
  }
}
