import { beforeEach, describe, expect, it } from "vitest";
import { setupFetchMock } from "../../../test/mock-fetch";
import { InterfaceAnalytics } from "../modules/interface-analytics";
import { createWithMockedAccessToken } from "./utils";

const request = setupFetchMock();

describe("InterfaceAnalytics", () => {
  let analytics: InterfaceAnalytics;

  beforeEach(() => {
    analytics = createWithMockedAccessToken((account) => account.interfaceAnalytics());
  });

  const mockList = [
    {
      ref_date: "2026-01-01",
      callback_count: 10,
      fail_count: 1,
      total_time_cost: 100,
      max_time_cost: 50,
    },
  ];

  describe("getSummary", () => {
    it("should call API correctly", async () => {
      request.mockResolvedValue({
        list: mockList,
      });

      const result = await analytics.getSummary("2026-01-01", "2026-01-07");

      expect(request).toHaveBeenCalledWith(InterfaceAnalytics.SUMMARY, {
        method: "POST",
        query: {
          access_token: "mock-token",
        },
        body: {
          begin_date: "2026-01-01",
          end_date: "2026-01-07",
        },
      });

      expect(result).toEqual(mockList);
    });
  });

  describe("getHourSummary", () => {
    it("should call API correctly", async () => {
      request.mockResolvedValue({
        list: mockList,
      });

      const result = await analytics.getHourSummary("2026-01-01");

      expect(request).toHaveBeenCalledWith(InterfaceAnalytics.HOUR_SUMMARY, {
        method: "POST",
        query: {
          access_token: "mock-token",
        },
        body: {
          begin_date: "2026-01-01",
          end_date: "2026-01-01",
        },
      });

      expect(result).toEqual(mockList);
    });
  });

  describe("error handling", () => {
    it("should throw when wechat response is error", async () => {
      request.mockResolvedValue({
        errcode: 40001,
        errmsg: "invalid credential",
      });

      await expect(analytics.getSummary("2026-01-01", "2026-01-07")).rejects.toThrow(
        "invalid credential",
      );
    });
  });
});
