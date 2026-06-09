import { beforeEach, describe, expect, it } from "vitest";
import { setupFetchMock } from "../../../test/mock-fetch";
import { MessageAnalytics } from "../modules/message-analytics";
import { createWithMockedAccessToken } from "./utils";

const request = setupFetchMock();

describe("MessageAnalytics", () => {
  let analytics: MessageAnalytics;

  beforeEach(() => {
    analytics = createWithMockedAccessToken((account) => account.messageAnalytics());
  });

  const mockList = [
    {
      ref_date: "2026-01-01",
      msg_type: 1,
      msg_user: 10,
      msg_count: 20,
    },
  ];

  describe("upstream apis", () => {
    it.each([
      {
        name: "getUpstream",
        method: (analytics: MessageAnalytics) => analytics.getUpstream("2026-01-01", "2026-01-07"),
        endpoint: MessageAnalytics.UPSTREAM,
        body: {
          begin_date: "2026-01-01",
          end_date: "2026-01-07",
        },
        error: "Failed to get message upstream data:",
      },
      {
        name: "getMonthUpstream",
        method: (analytics: MessageAnalytics) => analytics.getMonthUpstream("2026-01-01"),
        endpoint: MessageAnalytics.MONTH_UPSTREAM,
        body: {
          begin_date: "2026-01-01",
          end_date: "2026-01-01",
        },
        error: "Failed to get message month upstream data:",
      },
      {
        name: "getHourUpstream",
        method: (analytics: MessageAnalytics) => analytics.getHourUpstream("2026-01-01"),
        endpoint: MessageAnalytics.HOUR_UPSTREAM,
        body: {
          begin_date: "2026-01-01",
          end_date: "2026-01-01",
        },
        error: "Failed to get message hour upstream data:",
      },
      {
        name: "getWeekUpstream",
        method: (analytics: MessageAnalytics) => analytics.getWeekUpstream("2026-01-01"),
        endpoint: MessageAnalytics.WEEK_UPSTREAM,
        body: {
          begin_date: "2026-01-01",
          end_date: "2026-01-01",
        },
        error: "Failed to get message week upstream data:",
      },
      {
        name: "getDistUpstream",
        method: (analytics: MessageAnalytics) =>
          analytics.getDistUpstream("2026-01-01", "2026-01-15"),
        endpoint: MessageAnalytics.DIST_UPSTREAM,
        body: {
          begin_date: "2026-01-01",
          end_date: "2026-01-15",
        },
        error: "Failed to get message dist upstream data:",
      },
      {
        name: "getDistWeekUpstream",
        method: (analytics: MessageAnalytics) =>
          analytics.getDistWeekUpstream("2026-01-01", "2026-01-15"),
        endpoint: MessageAnalytics.DIST_WEEK_UPSTREAM,
        body: {
          begin_date: "2026-01-01",
          end_date: "2026-01-15",
        },
        error: "Failed to get message dist week upstream data:",
      },
      {
        name: "getDistMonthUpstream",
        method: (analytics: MessageAnalytics) =>
          analytics.getDistMonthUpstream("2026-01-01", "2026-01-15"),
        endpoint: MessageAnalytics.DIST_MONTH_UPSTREAM,
        body: {
          begin_date: "2026-01-01",
          end_date: "2026-01-15",
        },
        error: "Failed to get message dist month upstream data:",
      },
    ])("should call $name correctly", async ({ method, endpoint, body }) => {
      const response = {
        list: mockList,
      };

      request.mockResolvedValue(response);

      const result = await method(analytics);

      expect(request).toHaveBeenCalledWith(endpoint, {
        method: "POST",
        query: {
          access_token: "mock-token",
        },
        body,
      });

      expect(result).toEqual(mockList);
    });
  });

  describe("error handling", () => {
    it("should throw when assertWechatResponse throws", async () => {
      request.mockResolvedValue({
        errcode: 40001,
        errmsg: "invalid credential",
      });

      await expect(analytics.getUpstream("2026-01-01", "2026-01-07")).rejects.toThrow(
        "invalid credential",
      );
    });
  });
});
