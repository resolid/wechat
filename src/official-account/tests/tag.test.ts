import { beforeEach, describe, expect, it } from "vitest";
import { setupFetchMock } from "../../../test/mock-fetch";
import { WechatHttpError } from "../../core/error";
import {
  type OfficialAccountTag,
  type OfficialAccountTagFansResult,
  type OfficialAccountTagInfo,
  Tag,
} from "../modules/tag";
import { createWithMockedAccessToken } from "./utils";

const request = setupFetchMock();

describe("OfficialAccountTag", () => {
  let tag: Tag;

  beforeEach(() => {
    tag = createWithMockedAccessToken((account) => account.tag());
  });

  it("should return tag list successfully", async () => {
    const mockTags: OfficialAccountTagInfo[] = [
      { id: 134, name: "每天", count: 0 },
      { id: 135, name: "周末", count: 0 },
    ];

    request.mockResolvedValue({ tags: mockTags });

    await expect(tag.getTags()).resolves.toEqual(mockTags);

    expect(request).toHaveBeenCalledWith(Tag.GET, {
      method: "GET",
      responseFormat: "json",
      query: { access_token: "mock-token" },
    });
  });

  it("should throw WechatHttpError when get tags api returns errcode", async () => {
    request.mockResolvedValue({ errcode: 40001, errmsg: "invalid credential" });

    await expect(tag.getTags()).rejects.toThrow(WechatHttpError);
  });

  it("should create tag successfully", async () => {
    const mockTag: OfficialAccountTag = { id: 134, name: "每天" };

    request.mockResolvedValue({ tag: mockTag });

    await expect(tag.createTag("每天")).resolves.toEqual(mockTag);

    expect(request).toHaveBeenCalledWith(Tag.CREATE, {
      method: "POST",
      query: { access_token: "mock-token" },
      body: JSON.stringify({ tag: { name: "每天" } }),
    });
  });

  it("should throw WechatHttpError when create tag api returns errcode", async () => {
    request.mockResolvedValue({ errcode: 45158, errmsg: "invalid tag name size" });

    await expect(tag.createTag("每天")).rejects.toThrow(WechatHttpError);
  });

  it("should update tag successfully", async () => {
    request.mockResolvedValue({ errcode: 0, errmsg: "ok" });

    await expect(tag.updateTag({ id: 134, name: "每天更新" })).resolves.toBe(true);

    expect(request).toHaveBeenCalledWith(Tag.UPDATE, {
      method: "POST",
      query: { access_token: "mock-token" },
      body: JSON.stringify({ tag: { id: 134, name: "每天更新" } }),
    });
  });

  it("should update tag throw WechatHttpError when returns errcode", async () => {
    request.mockResolvedValue({ errcode: 45159, errmsg: "invalid tag id" });

    await expect(tag.updateTag({ id: 134, name: "每天更新" })).rejects.toThrow(WechatHttpError);
  });

  it("should delete tag successfully", async () => {
    request.mockResolvedValue({ errcode: 0, errmsg: "ok" });

    await expect(tag.deleteTag(134)).resolves.toBe(true);

    expect(request).toHaveBeenCalledWith(Tag.DELETE, {
      method: "POST",
      query: { access_token: "mock-token" },
      body: JSON.stringify({ tag: { id: 134 } }),
    });
  });

  it("should delete tag throw WechatHttpError when returns errcode", async () => {
    request.mockResolvedValue({ errcode: 45159, errmsg: "invalid tag id" });

    await expect(tag.deleteTag(134)).rejects.toThrow(WechatHttpError);
  });

  it("should return tag fans list successfully", async () => {
    const mockResult: OfficialAccountTagFansResult = {
      count: 2,
      data: { openid: ["openid_1", "openid_2"] },
      next_openid: "",
    };

    request.mockResolvedValue(mockResult);

    await expect(tag.getTagFans(134)).resolves.toEqual(mockResult);

    expect(request).toHaveBeenCalledWith(Tag.FANS_GET, {
      method: "POST",
      query: { access_token: "mock-token" },
      body: JSON.stringify({ tagid: 134, next_openid: "" }),
    });
  });

  it("should pass next_openid for tag fans pagination", async () => {
    const mockResult: OfficialAccountTagFansResult = {
      count: 1,
      data: { openid: ["openid_3"] },
      next_openid: "",
    };

    request.mockResolvedValue(mockResult);

    await expect(tag.getTagFans(134, "openid_2")).resolves.toEqual(mockResult);

    expect(request).toHaveBeenCalledWith(Tag.FANS_GET, {
      method: "POST",
      query: { access_token: "mock-token" },
      body: JSON.stringify({ tagid: 134, next_openid: "openid_2" }),
    });
  });

  it("should tag fans throw WechatHttpError when returns errcode", async () => {
    request.mockResolvedValue({ errcode: 45159, errmsg: "invalid tag id" });

    await expect(tag.getTagFans(134)).rejects.toThrow(WechatHttpError);
  });

  it("should batch tag users successfully", async () => {
    request.mockResolvedValue({ errcode: 0, errmsg: "ok" });

    await expect(tag.batchTagUsers(134, ["openid_1", "openid_2"])).resolves.toEqual([]);

    expect(request).toHaveBeenCalledWith(Tag.USERS_BATCH_TAG, {
      method: "POST",
      responseFormat: "json",
      query: { access_token: "mock-token" },
      body: JSON.stringify({ tagid: 134, openid_list: ["openid_1", "openid_2"] }),
    });
  });

  it("should batch tag return failed openids when partial failure (45171)", async () => {
    request.mockResolvedValue({
      errcode: 45171,
      errmsg: "some openid fail",
      fail_openid_list: ["openid_2"],
    });

    await expect(tag.batchTagUsers(134, ["openid_1", "openid_2"])).resolves.toEqual(["openid_2"]);
  });

  it("should throw WechatHttpError when batch tag api returns errcode", async () => {
    request.mockResolvedValue({ errcode: 40001, errmsg: "invalid credential" });

    await expect(tag.batchTagUsers(134, ["openid_1"])).rejects.toThrow(WechatHttpError);
  });

  it("should batch untag users successfully", async () => {
    request.mockResolvedValue({ errcode: 0, errmsg: "ok" });

    await expect(tag.batchUntagUsers(134, ["openid_1", "openid_2"])).resolves.toEqual([]);

    expect(request).toHaveBeenCalledWith(Tag.USERS_BATCH_UNTAG, {
      method: "POST",
      responseFormat: "json",
      query: { access_token: "mock-token" },
      body: JSON.stringify({ tagid: 134, openid_list: ["openid_1", "openid_2"] }),
    });
  });

  it("should batch untag return failed openids when partial failure (45171)", async () => {
    request.mockResolvedValue({
      errcode: 45171,
      errmsg: "some openid fail",
      fail_openid_list: ["openid_2"],
    });

    await expect(tag.batchUntagUsers(134, ["openid_1", "openid_2"])).resolves.toEqual(["openid_2"]);
  });

  it("should batch untag throw WechatHttpError when returns errcode", async () => {
    request.mockResolvedValue({ errcode: 40001, errmsg: "invalid credential" });

    await expect(tag.batchUntagUsers(134, ["openid_1"])).rejects.toThrow(WechatHttpError);
  });

  it("should return user tag ids successfully", async () => {
    request.mockResolvedValue({ tagid_list: [134, 135] });

    await expect(tag.getUserTags("openid_1")).resolves.toEqual([134, 135]);

    expect(request).toHaveBeenCalledWith(Tag.USER_TAGS_GET, {
      method: "POST",
      responseFormat: "json",
      query: { access_token: "mock-token" },
      body: { openid: "openid_1" },
    });
  });

  it("should user tag ids return empty array when tagid_list is absent", async () => {
    request.mockResolvedValue({});

    await expect(tag.getUserTags("openid_1")).resolves.toEqual([]);
  });

  it("should user tag ids throw WechatHttpError when returns errcode", async () => {
    request.mockResolvedValue({ errcode: 40003, errmsg: "invalid openid" });

    await expect(tag.getUserTags("invalid_openid")).rejects.toThrow(WechatHttpError);
  });
});
