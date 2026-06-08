import type { WechatResponse } from "../../core/error";
import { BaseModule } from "../../core/module";
import { assertWechatResponse } from "../../core/utils";

export type OfficialAccountArticleReadData = {
  list: {
    /** 数据的日期 */
    ref_date: string;
    /** 这里的 msgid 实际上是由 msgid（图文消息 id，这也就是群发接口调用后返回的 msg_data_id ）和 index（消息次序索引）组成， 例如 12003_3， 其中 12003 是 msgid，即一次群发的消息的 id； 3 为 index，假设该次群发的图文消息共 5 个文章（因为可能为多图文），3 表示 5 个中的第 3 个 */
    msgid: string;
    /** 每篇文章的详细数据 */
    detail: {
      /** 阅读人数（即 read_user_source 里面来源为全部的阅读人数） */
      read_user: number;
      /** 阅读数据（包含来源） */
      read_user_source: {
        /** 阅读人数 */
        user_count: number;
        /** 阅读场景来源。包含如下场景：全部、公众号消息、聊天会话、朋友圈、公众号主页、其他、推荐、搜一搜 */
        scene_desc: string;
      }[];
    };
  }[];
  /** 数据是否有延迟，is_delay=false 表示数据是最新的 */
  is_delay: boolean;
};

export type OfficialAccountArticleShareData = {
  list: {
    /** 数据的日期 */
    ref_date: string;
    /** 这里的 msgid 实际上是由 msgid（图文消息 id，这也就是群发接口调用后返回的 msg_data_id ）和 index（消息次序索引）组成， 例如 12003_3， 其中 12003 是 msgid，即一次群发的消息的 id； 3 为 index，假设该次群发的图文消息共 5 个文章（因为可能为多图文），3 表示 5 个中的第 3 个 */
    msgid: string;
    /** 每篇文章的详细数据 */
    detail: {
      /** 分享人数 */
      share_user: number;
    };
  }[];
  /** 数据是否有延迟，is_delay=false 表示数据是最新的 */
  is_delay: boolean;
};

export type OfficialAccountArticleSummaryData = {
  list: {
    /** 统计日期 */
    ref_date: string;
    /** 每篇文章的详细数据 */
    detail: {
      /** 阅读人数（即 read_user_source 里面来源为全部的阅读人数） */
      read_user: number;
      /** 阅读数据（包含来源） */
      read_user_source: {
        /** 阅读人数 */
        user_count: number;
        /** 阅读场景来源。包含如下场景：全部、公众号消息、聊天会话、朋友圈、公众号主页、其他、推荐、搜一搜 */
        scene_desc: string;
      }[];
      /** 分享人数 */
      share_user: number;
      /** 爱心赞人数 */
      zaikan_user: number;
      /** 拇指赞人数 */
      like_user: number;
      /** 留言条数 */
      comment_count: number;
      /** 微信收藏人数 */
      collection_user: number;
      /** 跳转原文人数 */
      redirect_ori_page_user: number;
      /** 发布篇数 */
      send_page_count: number;
    };
  }[];
  /** 数据是否有延迟，is_delay=false 表示数据是最新的 */
  is_delay: boolean;
};

export type OfficialAccountArticleDetailsData = {
  list: {
    /** 文章发表日期 */
    ref_date: string;
    /** 这里的 msgid 实际上是由 msgid（图文消息 id，这也就是群发接口调用后返回的 msg_data_id ）和 index（消息次序索引）组成， 例如 12003_3， 其中 12003 是 msgid，即一次群发的消息的 id； 3 为 index，假设该次群发的图文消息共 5 个文章（因为可能为多图文），3 表示 5 个中的第 3 个 */
    msgid: string;
    /** 发表类型，0.已通知; 1.未开启通知; */
    publish_type: number;
    /** 文章标题 */
    title: string;
    /** 文章链接 */
    content_url: string;
    /** 每篇文章的详细数据 */
    detail_list: {
      /** 统计日期, 统计数据是 [发表日期-统计日期] （包含区间首尾日期）期间内，所有指标新产生的数据总和 */
      stat_date: string;
      /** 阅读人数（即 read_user_source 里面来源为全部的阅读人数）*/
      read_user: number;
      read_user_source: {
        /** 阅读人数 */
        user_count: number;
        /** 阅读场景来源。包含如下场景：全部、公众号消息、聊天会话、朋友圈、公众号主页、其他、推荐、搜一搜 */
        scene_desc: string;
      }[];
      /** 分享人数 */
      share_user: number;
      /** 爱心赞人数 */
      zaikan_user: number;
      /** 拇指赞人数 */
      like_user: number;
      /** 留言条数 */
      comment_count: number;
      /** 微信收藏人数 */
      collection_user: number;
      /** 赞赏金额，单位分 */
      praise_money: number;
      /** 阅读后关注人数 */
      read_subscribe_user: number;
      /** 阅读送达率 */
      read_delivery_rate: number;
      /** 阅读完成率 */
      read_finish_rate: number;
      /** 平均阅读时长，单位(min) */
      read_avg_activetime: number;
      /** 用户跳出位置 */
      read_jump_position: {
        /** 用户跳出位置，1-[0~20%], 2-[20%~40%], 3-[40%~60%], 4-[60%~80%], 5-[80%~100%]。 */
        position: number;
        /** 当前跳出位置所占用户比例 */
        rate: number;
      };
    }[];
  }[];
  /** 数据是否有延迟，is_delay=false 表示数据是最新的 */
  is_delay: boolean;
};

export class ArticleAnalytics extends BaseModule {
  public static readonly READ = "/datacube/getarticleread";
  public static readonly SHARE = "/datacube/getarticleshare";
  public static readonly SUMMARY = "/datacube/getbizsummary";
  public static readonly DETAILS = "/datacube/getarticletotaldetail";

  /**
   * 获取发表内容每日阅读数据
   * @see https://developers.weixin.qq.com/doc/subscription/api/wedata/news/api_getarticleread.html
   *
   * @param date 日期(最大值为昨日), 数据存储起始时间为2025-11-01，之前日期数据无效
   *
   * @return 阅读数据
   * */
  async getRead(date: string): Promise<OfficialAccountArticleReadData> {
    const accessToken = await this._accessToken.getToken();

    const result = await this._client<WechatResponse | OfficialAccountArticleReadData>(
      ArticleAnalytics.READ,
      {
        method: "POST",
        query: { access_token: accessToken },
        body: { begin_date: date, end_date: date },
      },
    );

    assertWechatResponse("Failed to get article read data:", result);

    return result;
  }

  /**
   * 获取发表内容每日分享数据
   * @see https://developers.weixin.qq.com/doc/subscription/api/wedata/news/api_getarticleshare.html
   *
   * @param date 日期(最大值为昨日), 数据存储起始时间为2025-11-01，之前日期数据无效
   *
   * @return 分享数据
   * */
  async getShare(date: string): Promise<OfficialAccountArticleShareData> {
    const accessToken = await this._accessToken.getToken();

    const result = await this._client<WechatResponse | OfficialAccountArticleShareData>(
      ArticleAnalytics.SHARE,
      {
        method: "POST",
        query: { access_token: accessToken },
        body: { begin_date: date, end_date: date },
      },
    );

    assertWechatResponse("Failed to get article share data:", result);

    return result;
  }

  /**
   * 获取发表内容概况总数据
   * @see https://developers.weixin.qq.com/doc/subscription/api/wedata/news/api_getbizsummary.html
   *
   * @param beginDate 起始日期(格式yyyy-MM-dd), 数据存储起始时间为2025-11-01，之前日期数据无效
   * @param endDate 结束日期(最大值为昨日), 查询日期范围的长度最长支持查询30天。
   *
   * @return 概览数据
   * */
  async getSummary(beginDate: string, endDate: string): Promise<OfficialAccountArticleSummaryData> {
    const accessToken = await this._accessToken.getToken();

    const result = await this._client<WechatResponse | OfficialAccountArticleSummaryData>(
      ArticleAnalytics.SUMMARY,
      {
        method: "POST",
        query: { access_token: accessToken },
        body: { begin_date: beginDate, end_date: endDate },
      },
    );

    assertWechatResponse("Failed to get article summary data:", result);

    return result;
  }

  /**
   * 获取发表内容发表详细数据
   * @see https://developers.weixin.qq.com/doc/subscription/api/wedata/news/api_getarticletotaldetail.html
   *
   * @param date 日期(格式yyyy-MM-dd), 数据存储起始时间为2025-11-01，之前日期数据无效
   *
   * @return 概览数据
   * */
  async getDetails(date: string): Promise<OfficialAccountArticleDetailsData> {
    const accessToken = await this._accessToken.getToken();

    const result = await this._client<WechatResponse | OfficialAccountArticleDetailsData>(
      ArticleAnalytics.DETAILS,
      {
        method: "POST",
        query: { access_token: accessToken },
        body: { begin_date: date, end_date: date },
      },
    );

    assertWechatResponse("Failed to get article details data:", result);

    return result;
  }
}
