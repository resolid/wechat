import { describe, expect, it } from "vitest";
import { setupFetchMock } from "../../../test/mock-fetch";
import { WechatFetchError } from "../../core/error";
import { AccessToken } from "../modules/access-token";
import { createOfficialAccount } from "./utils";

const request = setupFetchMock();

describe("OfficialAccountAccessToken", () => {
  it("should request access token", async () => {
    request.mockResolvedValue({
      access_token: "mock-token",
      expires_in: 7200,
    });

    const accessToken = createOfficialAccount().accessToken();

    const token = await accessToken.getToken();

    expect(token).toBe("mock-token");

    expect(request).toHaveBeenCalledWith(AccessToken.TOKEN, {
      method: "GET",
      responseFormat: "json",
      query: {
        appid: "appid",
        secret: "secret",
        grant_type: "client_credential",
      },
      body: undefined,
    });
  });

  it("should request stable access token", async () => {
    request.mockResolvedValue({
      access_token: "stable-token",
      expires_in: 7200,
    });

    const accessToken = createOfficialAccount({
      stableAccessToken: true,
    }).accessToken();

    const token = await accessToken.getToken();

    expect(token).toBe("stable-token");

    expect(request).toHaveBeenCalledWith(AccessToken.STABLE_TOKEN, {
      method: "POST",
      responseFormat: "json",
      query: undefined,
      body: {
        appid: "appid",
        secret: "secret",
        grant_type: "client_credential",
        force_refresh: false,
      },
    });
  });

  it("should pass force refresh to stable api", async () => {
    request.mockResolvedValue({
      access_token: "stable-token",
      expires_in: 7200,
    });

    const accessToken = createOfficialAccount({
      stableAccessToken: true,
    }).accessToken();

    await accessToken.refreshToken(true);

    expect(request).toHaveBeenCalledWith(
      AccessToken.STABLE_TOKEN,
      expect.objectContaining({
        body: expect.objectContaining({
          force_refresh: true,
        }),
      }),
    );
  });

  it("should throw WechatHttpError when api returns errcode", async () => {
    request.mockResolvedValue({ errcode: 40001, errmsg: "invalid credential" });

    const accessToken = createOfficialAccount().accessToken();

    await expect(accessToken.getToken()).rejects.toThrow(WechatFetchError);
  });
});
