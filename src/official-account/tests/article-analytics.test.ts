import { beforeEach, describe, expect, it } from "vitest";
import { setupFetchMock } from "../../../test/mock-fetch";
import { ArticleAnalytics } from "../modules/article-analytics";
import { createWithMockedAccessToken } from "./utils";

const request = setupFetchMock();

describe("ArticleAnalytics", () => {
  let analytics: ArticleAnalytics;

  beforeEach(() => {
    analytics = createWithMockedAccessToken((account) => account.articleAnalytics());
  });

  describe("getRead", () => {
    it("should request article read data", async () => {
      const mockResult = {
        list: [],
        is_delay: false,
      };

      request.mockResolvedValue(mockResult);

      const result = await analytics.getRead("2026-01-01");

      expect(request).toHaveBeenCalledWith(ArticleAnalytics.READ, {
        method: "POST",
        query: {
          access_token: "mock-token",
        },
        body: {
          begin_date: "2026-01-01",
          end_date: "2026-01-01",
        },
      });

      expect(result).toEqual(mockResult);
    });
  });

  describe("getShare", () => {
    it("should request article share data", async () => {
      const mockResult = {
        list: [],
        is_delay: false,
      };

      request.mockResolvedValue(mockResult);

      const result = await analytics.getShare("2026-01-01");

      expect(request).toHaveBeenCalledWith(ArticleAnalytics.SHARE, {
        method: "POST",
        query: {
          access_token: "mock-token",
        },
        body: {
          begin_date: "2026-01-01",
          end_date: "2026-01-01",
        },
      });

      expect(result).toEqual(mockResult);
    });
  });

  describe("getSummary", () => {
    it("should request article summary data", async () => {
      const mockResult = {
        list: [],
        is_delay: false,
      };

      request.mockResolvedValue(mockResult);

      const result = await analytics.getSummary("2026-01-01", "2026-01-31");

      expect(request).toHaveBeenCalledWith(ArticleAnalytics.SUMMARY, {
        method: "POST",
        query: {
          access_token: "mock-token",
        },
        body: {
          begin_date: "2026-01-01",
          end_date: "2026-01-31",
        },
      });

      expect(result).toEqual(mockResult);
    });
  });

  describe("getDetails", () => {
    it("should request article details data", async () => {
      const mockResult = {
        list: [],
        is_delay: false,
      };

      request.mockResolvedValue(mockResult);

      const result = await analytics.getDetails("2026-01-01");

      expect(request).toHaveBeenCalledWith(ArticleAnalytics.DETAILS, {
        method: "POST",
        query: {
          access_token: "mock-token",
        },
        body: {
          begin_date: "2026-01-01",
          end_date: "2026-01-01",
        },
      });

      expect(result).toEqual(mockResult);
    });
  });
});
