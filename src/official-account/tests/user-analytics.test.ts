import { beforeEach, describe, expect, it, vi } from "vitest";
import { setupFetchMock } from "../../../test/mock-fetch";
import { WechatFetchError } from "../../core/error";
import {
  type OfficialAccountUserCumulateItem,
  type OfficialAccountUserSummaryItem,
  UserAnalytics,
} from "../modules/user-analytics";
import { createWithMockedAccessToken } from "./utils";

const request = setupFetchMock();

describe("UserAnalytics", () => {
  let analytics: UserAnalytics;

  beforeEach(() => {
    analytics = createWithMockedAccessToken((account) => account.userAnalytics());
  });

  describe("getSummary", () => {
    it("should get user summary data", async () => {
      const data: OfficialAccountUserSummaryItem[] = [
        {
          ref_date: "2026-06-01",
          user_source: 1,
          new_user: 10,
          cancel_user: 2,
        },
      ];

      request.mockResolvedValue({ list: data });

      const result = await analytics.getSummary("2026-06-01", "2026-06-07");

      expect(request).toHaveBeenCalledWith(UserAnalytics.SUMMARY, {
        method: "POST",
        query: {
          access_token: "mock-token",
        },
        body: {
          begin_date: "2026-06-01",
          end_date: "2026-06-07",
        },
      });

      expect(result).toEqual(data);
    });

    it("should throw when wechat api returns error", async () => {
      vi.mocked(request).mockResolvedValue({
        errcode: 40013,
        errmsg: "invalid appid",
      });

      await expect(analytics.getSummary("2026-06-01", "2026-06-07")).rejects.toThrow(
        WechatFetchError,
      );
    });
  });

  describe("getCumulate", () => {
    it("should get user cumulate data", async () => {
      const data: OfficialAccountUserCumulateItem[] = [
        {
          ref_date: "2026-06-01",
          cumulate_user: 100,
        },
      ];

      vi.mocked(request).mockResolvedValue({ list: data });

      const result = await analytics.getCumulate("2026-06-01", "2026-06-07");

      expect(request).toHaveBeenCalledWith(UserAnalytics.CUMULATE, {
        method: "POST",
        query: {
          access_token: "mock-token",
        },
        body: {
          begin_date: "2026-06-01",
          end_date: "2026-06-07",
        },
      });

      expect(result).toEqual(data);
    });

    it("should throw when wechat api returns error", async () => {
      vi.mocked(request).mockResolvedValue({
        errcode: 40013,
        errmsg: "invalid appid",
      });

      await expect(analytics.getCumulate("2026-06-01", "2026-06-07")).rejects.toThrow(
        WechatFetchError,
      );
    });
  });
});
