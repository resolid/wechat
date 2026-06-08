import { beforeEach, describe, expect, it } from "vitest";
import { setupFetchMock } from "../../../test/mock-fetch";
import { OpenApi } from "../../core/open-api";
import { createWithMockedAccessToken } from "./utils";

const request = setupFetchMock();

describe("OpenApi", () => {
  let api: OpenApi;

  beforeEach(() => {
    api = createWithMockedAccessToken((account) => account.openApi());
  });

  describe("getApiQuota", () => {
    it("should get api quota", async () => {
      const mockResult = {
        quota: {
          daily_limit: 5000,
          used: 100,
          remain: 4900,
        },
      };

      request.mockResolvedValue(mockResult);

      const result = await api.getApiQuota("/cgi-bin/message/custom/send");

      expect(request).toHaveBeenCalledWith(OpenApi.API_QUOTA_GET, {
        method: "POST",
        query: {
          access_token: "mock-token",
        },
        body: {
          cgi_path: "/cgi-bin/message/custom/send",
        },
      });

      expect(result).toEqual(mockResult);
    });
  });

  describe("clearApiQuota", () => {
    it("should clear api quota", async () => {
      request.mockResolvedValue({
        errcode: 0,
      });

      const result = await api.clearApiQuota("/cgi-bin/message/custom/send");

      expect(request).toHaveBeenCalledWith(OpenApi.API_QUOTA_CLEAR, {
        method: "POST",
        query: {
          access_token: "mock-token",
        },
        body: {
          cgi_path: "/cgi-bin/message/custom/send",
        },
      });

      expect(result).toBe(true);
    });
  });

  describe("clearQuota", () => {
    it("should clear quota with default app id", async () => {
      request.mockResolvedValue({
        errcode: 0,
      });

      const result = await api.clearQuota();

      expect(request).toHaveBeenCalledWith(OpenApi.QUOTA_CLEAR, {
        method: "POST",
        query: {
          access_token: "mock-token",
        },
        body: {
          appid: "appid",
        },
      });

      expect(result).toBe(true);
    });

    it("should clear quota with custom app id", async () => {
      request.mockResolvedValue({
        errcode: 0,
      });

      const result = await api.clearQuota("custom-app-id");

      expect(request).toHaveBeenCalledWith(OpenApi.QUOTA_CLEAR, {
        method: "POST",
        query: {
          access_token: "mock-token",
        },
        body: {
          appid: "custom-app-id",
        },
      });

      expect(result).toBe(true);
    });
  });

  describe("clearQuotaBySecret", () => {
    it("should clear quota by secret", async () => {
      request.mockResolvedValue({
        errcode: 0,
      });

      const result = await api.clearQuotaBySecret("app-id", "app-secret");

      expect(request).toHaveBeenCalledWith(OpenApi.QUOTA_CLEAR_BY_SECRET, {
        method: "POST",
        body: {
          appid: "app-id",
          appsecret: "app-secret",
        },
      });

      expect(result).toBe(true);
    });
  });

  describe("error handling", () => {
    it("should throw when assertWechatResponse throws", async () => {
      request.mockResolvedValue({
        errcode: 40001,
        errmsg: "invalid credential",
      });

      await expect(api.clearQuota()).rejects.toThrow("Failed to clear open-api quota");
    });
  });
});
