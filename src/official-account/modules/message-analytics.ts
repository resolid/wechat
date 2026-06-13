import type { WechatFetchResponse } from "../../core/error";
import { BaseModule } from "../../core/module";
import { assertWechatFetchResponse } from "../../core/utils";

export type OfficialAccountMessageUpstreamItem = {
  /** 数据的日期 */
  ref_date: string;
  /** 消息类型，代表含义如下：
   * - 1 代表文字
   * - 2 代表图片
   * - 3 代表语音
   * - 4 代表视频
   * - 6 代表第三方应用消息（链接消息） */
  msg_type: number;
  /** 上行发送了消息的用户数 */
  msg_user: number;
  /** 上行发送了消息的消息总数 */
  msg_count: number;
};

export type OfficialAccountMessageDistUpstreamItem = {
  /** 数据的日期 */
  ref_date: string;
  /** 当日发送消息量分布的区间，0代表 “0”，1代表“1-5”，2代表“6-10”，3代表“10次以上” */
  count_interval: number;
  /** 上行发送了消息的用户数 */
  msg_user: number;
};

export class MessageAnalytics extends BaseModule {
  public static readonly UPSTREAM = "/datacube/getupstreammsg";
  public static readonly MONTH_UPSTREAM = "/datacube/getupstreammsgmonth";
  public static readonly HOUR_UPSTREAM = "/datacube/getupstreammsghour";
  public static readonly WEEK_UPSTREAM = "/datacube/getupstreammsgweek";
  public static readonly DIST_UPSTREAM = "/datacube/getupstreammsgdist";
  public static readonly DIST_WEEK_UPSTREAM = "/datacube/getupstreammsgdistweek";
  public static readonly DIST_MONTH_UPSTREAM = "/datacube/getupstreammsgdistmonth";

  /**
   * 获取消息发送概况数据
   * @see https://developers.weixin.qq.com/doc/service/api/wedata/mess/api_getupstreammsg.html
   *
   * @param beginDate 起始日期(格式: yyyy-MM-dd)，与 endDate 差值小于 7 天
   * @param endDate 结束日期(最大值为昨日)
   *
   * @return 数据列表
   * */
  async getUpstream(
    beginDate: string,
    endDate: string,
  ): Promise<OfficialAccountMessageUpstreamItem[]> {
    const accessToken = await this._accessToken.getToken();

    const result = await this._client<
      WechatFetchResponse | { list: OfficialAccountMessageUpstreamItem[] }
    >(MessageAnalytics.UPSTREAM, {
      method: "POST",
      query: { access_token: accessToken },
      body: { begin_date: beginDate, end_date: endDate },
    });

    assertWechatFetchResponse("Failed to get message upstream data:", result);

    return result.list;
  }

  /**
   * 获取消息发送月数据
   * @see https://developers.weixin.qq.com/doc/service/api/wedata/mess/api_getupstreammsgmonth.html
   *
   * @param date 日期(格式: yyyy-MM-dd)
   *
   * @return 数据列表
   * */
  async getMonthUpstream(date: string): Promise<OfficialAccountMessageUpstreamItem[]> {
    const accessToken = await this._accessToken.getToken();

    const result = await this._client<
      WechatFetchResponse | { list: OfficialAccountMessageUpstreamItem[] }
    >(MessageAnalytics.MONTH_UPSTREAM, {
      method: "POST",
      query: { access_token: accessToken },
      body: { begin_date: date, end_date: date },
    });

    assertWechatFetchResponse("Failed to get message month upstream data:", result);

    return result.list;
  }

  /**
   * 获取消息发送分时数据
   * @see https://developers.weixin.qq.com/doc/service/api/wedata/mess/api_getupstreammsghour.html
   *
   * @param date 日期(格式: yyyy-MM-dd)
   *
   * @return 数据列表
   * */
  async getHourUpstream(date: string): Promise<OfficialAccountMessageUpstreamItem[]> {
    const accessToken = await this._accessToken.getToken();

    const result = await this._client<
      WechatFetchResponse | { list: OfficialAccountMessageUpstreamItem[] }
    >(MessageAnalytics.HOUR_UPSTREAM, {
      method: "POST",
      query: { access_token: accessToken },
      body: { begin_date: date, end_date: date },
    });

    assertWechatFetchResponse("Failed to get message hour upstream data:", result);

    return result.list;
  }

  /**
   * 获取消息发送周数据
   * @see https://developers.weixin.qq.com/doc/service/api/wedata/mess/api_getupstreammsgweek.html
   *
   * @param date 日期(格式: yyyy-MM-dd)
   *
   * @return 数据列表
   * */
  async getWeekUpstream(date: string): Promise<OfficialAccountMessageUpstreamItem[]> {
    const accessToken = await this._accessToken.getToken();

    const result = await this._client<
      WechatFetchResponse | { list: OfficialAccountMessageUpstreamItem[] }
    >(MessageAnalytics.WEEK_UPSTREAM, {
      method: "POST",
      query: { access_token: accessToken },
      body: { begin_date: date, end_date: date },
    });

    assertWechatFetchResponse("Failed to get message week upstream data:", result);

    return result.list;
  }

  /**
   * 获取消息发送分布数据
   * @see https://developers.weixin.qq.com/doc/service/api/wedata/mess/api_getupstreammsgdist.html
   *
   * @param beginDate 起始日期(格式: yyyy-MM-dd)，跨度不超过 15 天
   * @param endDate 结束日期
   *
   * @return 数据列表
   * */
  async getDistUpstream(
    beginDate: string,
    endDate: string,
  ): Promise<OfficialAccountMessageDistUpstreamItem[]> {
    const accessToken = await this._accessToken.getToken();

    const result = await this._client<
      WechatFetchResponse | { list: OfficialAccountMessageDistUpstreamItem[] }
    >(MessageAnalytics.DIST_UPSTREAM, {
      method: "POST",
      query: { access_token: accessToken },
      body: { begin_date: beginDate, end_date: endDate },
    });

    assertWechatFetchResponse("Failed to get message dist upstream data:", result);

    return result.list;
  }

  /**
   * 获取消息发送分布周数据
   * @see https://developers.weixin.qq.com/doc/service/api/wedata/mess/api_getupstreammsgdistweek.html
   *
   * @param beginDate 起始日期(格式: yyyy-MM-dd)，跨度不超过 15 天
   * @param endDate 结束日期
   *
   * @return 数据列表
   * */
  async getDistWeekUpstream(
    beginDate: string,
    endDate: string,
  ): Promise<OfficialAccountMessageDistUpstreamItem[]> {
    const accessToken = await this._accessToken.getToken();

    const result = await this._client<
      WechatFetchResponse | { list: OfficialAccountMessageDistUpstreamItem[] }
    >(MessageAnalytics.DIST_WEEK_UPSTREAM, {
      method: "POST",
      query: { access_token: accessToken },
      body: { begin_date: beginDate, end_date: endDate },
    });

    assertWechatFetchResponse("Failed to get message dist week upstream data:", result);

    return result.list;
  }

  /**
   * 获取消息发送分布月数据
   * @see https://developers.weixin.qq.com/doc/service/api/wedata/mess/api_getupstreammsgdistmonth.html
   *
   * @param beginDate 起始日期(格式: yyyy-MM-dd)，跨度不超过 15 天
   * @param endDate 结束日期
   *
   * @return 数据列表
   * */
  async getDistMonthUpstream(
    beginDate: string,
    endDate: string,
  ): Promise<OfficialAccountMessageDistUpstreamItem[]> {
    const accessToken = await this._accessToken.getToken();

    const result = await this._client<
      WechatFetchResponse | { list: OfficialAccountMessageDistUpstreamItem[] }
    >(MessageAnalytics.DIST_MONTH_UPSTREAM, {
      method: "POST",
      query: { access_token: accessToken },
      body: { begin_date: beginDate, end_date: endDate },
    });

    assertWechatFetchResponse("Failed to get message dist month upstream data:", result);

    return result.list;
  }
}
