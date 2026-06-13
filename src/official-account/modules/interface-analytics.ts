import type { WechatFetchResponse } from "../../core/error";
import { BaseModule } from "../../core/module";
import { assertWechatFetchResponse } from "../../core/utils";

export type OfficialAccountInterfaceSummaryItem = {
  /** 数据的日期 */
  ref_date: string;
  /** 通过服务器配置地址获得消息后，被动回复用户消息的次数 */
  callback_count: number;
  /** 上述动作的失败次数 */
  fail_count: number;
  /** 总耗时，除以 callback_count 即为平均耗时 */
  total_time_cost: number;
  /** 最大耗时 */
  max_time_cost: number;
};

export type OfficialAccountInterfaceHourSummaryItem = {
  /** 数据的小时 */
  ref_hour: number;
} & OfficialAccountInterfaceSummaryItem;

export class InterfaceAnalytics extends BaseModule {
  public static readonly SUMMARY = "/datacube/getinterfacesummary";
  public static readonly HOUR_SUMMARY = "/datacube/getinterfacesummaryhour";

  /**
   * 获取被动回复概要数据
   * @see https://developers.weixin.qq.com/doc/service/api/wedata/api/api_getinterfacesummary.html
   *
   * @param beginDate 起始日期(格式: yyyy-MM-dd)
   * @param endDate 结束日期(最大时间跨度30天)
   *
   * @return 数据列表
   * */
  async getSummary(
    beginDate: string,
    endDate: string,
  ): Promise<OfficialAccountInterfaceSummaryItem[]> {
    const accessToken = await this._accessToken.getToken();

    const result = await this._client<
      WechatFetchResponse | { list: OfficialAccountInterfaceSummaryItem[] }
    >(InterfaceAnalytics.SUMMARY, {
      method: "POST",
      query: { access_token: accessToken },
      body: { begin_date: beginDate, end_date: endDate },
    });

    assertWechatFetchResponse("Failed to get interface summary data:", result);

    return result.list;
  }

  /**
   * 获取被动回复分布数据
   * @see https://developers.weixin.qq.com/doc/service/api/wedata/api/api_getinterfacesummaryhour.html
   *
   * @param date 日期(格式: yyyy-MM-dd)
   *
   * @return 数据列表
   * */
  async getHourSummary(date: string): Promise<OfficialAccountInterfaceHourSummaryItem[]> {
    const accessToken = await this._accessToken.getToken();

    const result = await this._client<
      WechatFetchResponse | { list: OfficialAccountInterfaceHourSummaryItem[] }
    >(InterfaceAnalytics.HOUR_SUMMARY, {
      method: "POST",
      query: { access_token: accessToken },
      body: { begin_date: date, end_date: date },
    });

    assertWechatFetchResponse("Failed to get interface hour summary data:", result);

    return result.list;
  }
}
