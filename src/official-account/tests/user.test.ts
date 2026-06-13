import { beforeEach, describe, expect, it } from "vitest";
import { setupFetchMock } from "../../../test/mock-fetch";
import { WechatError, WechatFetchError } from "../../core/error";
import {
  type OfficialAccountChangeOpenIdResult,
  type OfficialAccountUser,
  type OfficialAccountUsersResult,
  User,
} from "../modules/user";
import { createWithMockedAccessToken } from "./utils";

const request = setupFetchMock();

describe("User", () => {
  const mockUsersResult: OfficialAccountUsersResult = {
    total: 2,
    count: 2,
    data: { openid: ["openid_1", "openid_2"] },
    next_openid: "",
  };

  const mockSubscribedUser: OfficialAccountUser = {
    subscribe: 1,
    openid: "openid_1",
    subscribe_time: 1609459200,
    remark: "",
    groupid: 0,
    tagid_list: [],
    subscribe_scene: "ADD_SCENE_SEARCH",
  };

  const mockUnsubscribedUser: OfficialAccountUser = {
    subscribe: 0,
    openid: "openid_2",
  };

  let user: User;

  beforeEach(() => {
    user = createWithMockedAccessToken((account) => account.user());
  });

  it("should return get blacklist successfully", async () => {
    request.mockResolvedValue(mockUsersResult);

    await expect(user.getBlacklist()).resolves.toEqual(mockUsersResult);

    expect(request).toHaveBeenCalledWith(User.BLACKLIST_GET, {
      method: "POST",
      responseFormat: "json",
      query: { access_token: "mock-token" },
      body: { begin_openid: "" },
    });
  });

  it("should get blacklist pass begin_openid for pagination", async () => {
    request.mockResolvedValue(mockUsersResult);

    await user.getBlacklist("openid_1");

    expect(request).toHaveBeenCalledWith(User.BLACKLIST_GET, {
      method: "POST",
      responseFormat: "json",
      query: { access_token: "mock-token" },
      body: { begin_openid: "openid_1" },
    });
  });

  it("should get blacklist throw WechatHttpError when api returns errcode", async () => {
    request.mockResolvedValue({ errcode: 40001, errmsg: "invalid credential" });

    await expect(user.getBlacklist()).rejects.toThrow(WechatFetchError);
  });

  it("should batch blacklist successfully", async () => {
    request.mockResolvedValue({ errcode: 0, errmsg: "ok" });

    await expect(user.batchBlacklist(["openid_1", "openid_2"])).resolves.toBe(true);

    expect(request).toHaveBeenCalledWith(User.BLACKLIST_BATCH, {
      method: "POST",
      query: { access_token: "mock-token" },
      body: { openid_list: ["openid_1", "openid_2"] },
    });
  });

  it("should batch blacklist throw WechatError when openIds exceed 20", async () => {
    const openIds = Array.from({ length: 21 }, (_, i) => `openid_${i}`);

    await expect(user.batchBlacklist(openIds)).rejects.toThrow(WechatError);
    await expect(user.batchBlacklist(openIds)).rejects.toThrow(
      "A maximum of 20 users can be selected.",
    );
  });

  it("should batch blacklist throw WechatHttpError when api returns errcode", async () => {
    request.mockResolvedValue({ errcode: 40001, errmsg: "invalid credential" });

    await expect(user.batchBlacklist(["openid_1"])).rejects.toThrow(WechatFetchError);
  });

  it("should batch unblacklist successfully", async () => {
    request.mockResolvedValue({ errcode: 0, errmsg: "ok" });

    await expect(user.batchUnblacklist(["openid_1", "openid_2"])).resolves.toBe(true);

    expect(request).toHaveBeenCalledWith(User.BLACKLIST_BATCH_REMOVE, {
      method: "POST",
      query: { access_token: "mock-token" },
      body: { openid_list: ["openid_1", "openid_2"] },
    });
  });

  it("should batch unblacklist throw WechatError when openIds exceed 20", async () => {
    const openIds = Array.from({ length: 21 }, (_, i) => `openid_${i}`);

    await expect(user.batchUnblacklist(openIds)).rejects.toThrow(WechatError);
    await expect(user.batchUnblacklist(openIds)).rejects.toThrow(
      "A maximum of 20 users can be selected.",
    );
  });

  it("should batch unblacklist throw WechatHttpError when api returns errcode", async () => {
    request.mockResolvedValue({ errcode: 40001, errmsg: "invalid credential" });

    await expect(user.batchUnblacklist(["openid_1"])).rejects.toThrow(WechatFetchError);
  });

  it("should return subscribed user info successfully", async () => {
    request.mockResolvedValue(mockSubscribedUser);

    await expect(user.getUserInfo("openid_1")).resolves.toEqual(mockSubscribedUser);

    expect(request).toHaveBeenCalledWith(User.INFO_GET, {
      method: "GET",
      query: { access_token: "mock-token", openid: "openid_1", lang: "" },
    });
  });

  it("should return unsubscribed user info successfully", async () => {
    request.mockResolvedValue(mockUnsubscribedUser);

    await expect(user.getUserInfo("openid_2")).resolves.toEqual(mockUnsubscribedUser);
  });

  it("should get user info pass language parameter", async () => {
    request.mockResolvedValue(mockSubscribedUser);

    await user.getUserInfo("openid_1", "zh_CN");

    expect(request).toHaveBeenCalledWith(User.INFO_GET, {
      method: "GET",
      query: { access_token: "mock-token", openid: "openid_1", lang: "zh_CN" },
    });
  });

  it("should get user info throw WechatHttpError when api returns errcode", async () => {
    request.mockResolvedValue({ errcode: 40003, errmsg: "invalid openid" });

    await expect(user.getUserInfo("invalid_openid")).rejects.toThrow(WechatFetchError);
  });

  it("should return user info list with string openids", async () => {
    request.mockResolvedValue({ user_info_list: [mockSubscribedUser, mockUnsubscribedUser] });

    await expect(user.batchUserInfo(["openid_1", "openid_2"])).resolves.toEqual([
      mockSubscribedUser,
      mockUnsubscribedUser,
    ]);

    expect(request).toHaveBeenCalledWith(User.INFO_BATCH_GET, {
      method: "POST",
      responseFormat: "json",
      query: { access_token: "mock-token" },
      body: JSON.stringify({
        user_list: [
          { openid: "openid_1", lang: "" },
          { openid: "openid_2", lang: "" },
        ],
      }),
    });
  });

  it("should return user info list with object user list", async () => {
    request.mockResolvedValue({ user_info_list: [mockSubscribedUser] });

    await expect(user.batchUserInfo([{ openid: "openid_1", lang: "zh_CN" }])).resolves.toEqual([
      mockSubscribedUser,
    ]);

    expect(request).toHaveBeenCalledWith(User.INFO_BATCH_GET, {
      method: "POST",
      responseFormat: "json",
      query: { access_token: "mock-token" },
      body: JSON.stringify({
        user_list: [{ openid: "openid_1", lang: "zh_CN" }],
      }),
    });
  });

  it("should use empty string when lang is omitted in object user list", async () => {
    request.mockResolvedValue({ user_info_list: [mockSubscribedUser] });

    await user.batchUserInfo([{ openid: "openid_1" }]);

    expect(request).toHaveBeenCalledWith(User.INFO_BATCH_GET, {
      method: "POST",
      responseFormat: "json",
      query: { access_token: "mock-token" },
      body: JSON.stringify({
        user_list: [{ openid: "openid_1", lang: "" }],
      }),
    });
  });

  it("should batch user info throw WechatError when userList exceed 50", async () => {
    const openIds = Array.from({ length: 51 }, (_, i) => `openid_${i}`);

    await expect(user.batchUserInfo(openIds)).rejects.toThrow(WechatError);
    await expect(user.batchUserInfo(openIds)).rejects.toThrow(
      "A maximum of 50 users can be selected.",
    );
  });

  it("should batch user info throw WechatHttpError when api returns errcode", async () => {
    request.mockResolvedValue({ errcode: 40001, errmsg: "invalid credential" });

    await expect(user.batchUserInfo(["openid_1"])).rejects.toThrow(WechatFetchError);
  });

  it("should return fans list successfully", async () => {
    request.mockResolvedValue(mockUsersResult);

    await expect(user.getFans()).resolves.toEqual(mockUsersResult);

    expect(request).toHaveBeenCalledWith(User.FANS_GET, {
      method: "GET",
      query: { access_token: "mock-token", next_openid: "" },
    });
  });

  it("should get fans pass next_openid for pagination", async () => {
    request.mockResolvedValue(mockUsersResult);

    await user.getFans("openid_2");

    expect(request).toHaveBeenCalledWith(User.FANS_GET, {
      method: "GET",
      query: { access_token: "mock-token", next_openid: "openid_2" },
    });
  });

  it("should get fans throw WechatHttpError when api returns errcode", async () => {
    request.mockResolvedValue({ errcode: 40001, errmsg: "invalid credential" });

    await expect(user.getFans()).rejects.toThrow(WechatFetchError);
  });

  it("should update remark successfully", async () => {
    request.mockResolvedValue({ errcode: 0, errmsg: "ok" });

    await expect(user.updateRemark("openid_1", "备注名")).resolves.toBe(true);

    expect(request).toHaveBeenCalledWith(User.REMARK_UPDATE, {
      method: "POST",
      query: { access_token: "mock-token" },
      body: { openid: "openid_1", remark: "备注名" },
    });
  });

  it("should update remark throw WechatHttpError when api returns errcode", async () => {
    request.mockResolvedValue({ errcode: 40003, errmsg: "invalid openid" });

    await expect(user.updateRemark("invalid_openid", "备注名")).rejects.toThrow(WechatFetchError);
  });

  it("should change openid successfully", async () => {
    const mockResult: OfficialAccountChangeOpenIdResult = {
      errcode: 0,
      errmsg: "ok",
      result_list: [
        { ori_openid: "old_openid_1", new_openid: "new_openid_1", err_msg: "ok" },
        { ori_openid: "old_openid_2", new_openid: "new_openid_2", err_msg: "ok" },
      ],
    };

    request.mockResolvedValue(mockResult);

    await expect(user.changeOpenId("old_appid", ["old_openid_1", "old_openid_2"])).resolves.toEqual(
      mockResult,
    );

    expect(request).toHaveBeenCalledWith(User.OPENID_CHANGE, {
      method: "POST",
      query: { access_token: "mock-token" },
      body: { from_appid: "old_appid", openid_list: ["old_openid_1", "old_openid_2"] },
    });
  });

  it("should include err_msg for failed openids", async () => {
    const mockResult: OfficialAccountChangeOpenIdResult = {
      errcode: 0,
      errmsg: "ok",
      result_list: [
        { ori_openid: "old_openid_1", new_openid: "new_openid_1", err_msg: "ok" },
        { ori_openid: "not_following", new_openid: "", err_msg: "ori_openid error" },
      ],
    };

    request.mockResolvedValue(mockResult);

    const result = await user.changeOpenId("old_appid", ["old_openid_1", "not_following"]);

    expect(result.result_list[1]!.err_msg).toBe("ori_openid error");
  });
});
