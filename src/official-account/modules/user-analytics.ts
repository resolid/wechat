import type { WechatResponse } from "../../core/error";
import { BaseModule } from "../../core/module";
import { assertWechatResponse } from "../../core/utils";

export type OfficialAccountUserSummaryItem = {
  /** 数据的日期 */
  ref_date: string;
  /**
   * 用户的渠道，数值代表的含义如下：
   * - 0: 代表其他合计
   * - 1: 代表公众号搜索
   * - 17: 代表名片分享
   * - 30: 代表扫描二维码
   * - 57: 代表文章内账号名称
   * - 100: 代表微信广告
   * - 161: 代表他人转载
   * - 149: 代表小程序关注
   * - 200:代表视频号
   * - 201: 代表直播
   */
  user_source: number;
  /** 新增的用户数量 */
  new_user: number;
  /** 取消关注的用户数量，new_user 减去cancel_user 即为净增用户数量 */
  cancel_user: number;
};

export type OfficialAccountUserCumulateItem = {
  /** 数据的日期 */
  ref_date: string;
  /** 总用户量 */
  cumulate_user: number;
};

export class UserAnalytics extends BaseModule {
  public static readonly SUMMARY = "/datacube/getusersummary";
  public static readonly CUMULATE = "/datacube/getusercumulate";

  /**
   * 获取用户增减数据
   * @see https://developers.weixin.qq.com/doc/subscription/api/wedata/user/api_getusersummary.html
   *
   * @param beginDate 起始日期(格式yyyy-MM-dd)
   * @param endDate 结束日期(最大跨度7天)
   *
   * @return 数据列表
   * */
  async getSummary(beginDate: string, endDate: string): Promise<OfficialAccountUserSummaryItem[]> {
    const accessToken = await this._accessToken.getToken();

    const result = await this._client<WechatResponse | { list: OfficialAccountUserSummaryItem[] }>(
      UserAnalytics.SUMMARY,
      {
        method: "POST",
        query: { access_token: accessToken },
        body: { begin_date: beginDate, end_date: endDate },
      },
    );

    assertWechatResponse("Failed to get user summary data:", result);

    return result.list;
  }

  /**
   * 获取累计用户数据
   * @see https://developers.weixin.qq.com/doc/subscription/api/wedata/user/api_getusercumulate.html
   *
   * @param beginDate 起始日期(格式yyyy-MM-dd)
   * @param endDate 结束日期(最大跨度7天)
   *
   * @return 数据列表
   * */
  async getCumulate(
    beginDate: string,
    endDate: string,
  ): Promise<OfficialAccountUserCumulateItem[]> {
    const accessToken = await this._accessToken.getToken();

    const result = await this._client<WechatResponse | { list: OfficialAccountUserCumulateItem[] }>(
      UserAnalytics.CUMULATE,
      {
        method: "POST",
        query: { access_token: accessToken },
        body: { begin_date: beginDate, end_date: endDate },
      },
    );

    assertWechatResponse("Failed to get user cumulate data:", result);

    return result.list;
  }
}
