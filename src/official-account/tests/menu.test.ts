import { beforeEach, describe, expect, it } from "vitest";
import type { AtLeastOne } from "../../core/types";
import { setupFetchMock } from "../../../test/mock-fetch";
import { WechatError, WechatHttpError } from "../../core/error";
import {
  Menu,
  type OfficialAccountMenuButton,
  type OfficialAccountMenuGetResult,
  type OfficialAccountMenuMatchRule,
} from "../modules/menu";
import { createWithMockedAccessToken } from "./utils";

const request = setupFetchMock();

describe("OfficialAccountMenu", () => {
  let menu: Menu;

  beforeEach(() => {
    menu = createWithMockedAccessToken((account) => account.menu());
  });

  it("should create menu successfully", async () => {
    request.mockResolvedValue({ errcode: 0, errmsg: "ok" });

    const buttons: OfficialAccountMenuButton[] = [
      { type: "click", name: "今日歌曲", key: "V1001_TODAY_MUSIC" },
    ];

    await expect(menu.createMenu(buttons)).resolves.toBe(true);

    expect(request).toHaveBeenCalledWith(Menu.CREATE, {
      method: "POST",
      query: { access_token: "mock-token" },
      body: JSON.stringify({ button: buttons }),
    });
  });

  it("should throw WechatError when top-level buttons exceed 3", async () => {
    const buttons: OfficialAccountMenuButton[] = [
      { type: "click", name: "菜单1", key: "key1" },
      { type: "click", name: "菜单2", key: "key2" },
      { type: "click", name: "菜单3", key: "key3" },
      { type: "click", name: "菜单4", key: "key4" },
    ];

    await expect(menu.createMenu(buttons)).rejects.toThrow(WechatError);
    await expect(menu.createMenu(buttons)).rejects.toThrow(
      "Menu can have at most 3 top-level buttons",
    );
  });

  it("should throw WechatError when sub-buttons exceed 5", async () => {
    const buttons: OfficialAccountMenuButton[] = [
      {
        name: "菜单",
        sub_button: [
          { type: "click", name: "子菜单1", key: "key1" },
          { type: "click", name: "子菜单2", key: "key2" },
          { type: "click", name: "子菜单3", key: "key3" },
          { type: "click", name: "子菜单4", key: "key4" },
          { type: "click", name: "子菜单5", key: "key5" },
          { type: "click", name: "子菜单6", key: "key6" },
        ],
      },
    ];

    await expect(menu.createMenu(buttons)).rejects.toThrow(WechatError);
    await expect(menu.createMenu(buttons)).rejects.toThrow(
      `Button "菜单" can have at most 5 sub-buttons`,
    );
  });

  it("should throw WechatHttpError when api returns errcode", async () => {
    request.mockResolvedValue({ errcode: 40001, errmsg: "invalid credential" });

    const buttons: OfficialAccountMenuButton[] = [
      { type: "click", name: "今日歌曲", key: "V1001_TODAY_MUSIC" },
    ];

    await expect(menu.createMenu(buttons)).rejects.toThrow(WechatHttpError);
  });

  it("should get menu successfully", async () => {
    const mockResult: OfficialAccountMenuGetResult = {
      menu: {
        button: [{ type: "click", name: "今日歌曲", key: "V1001_TODAY_MUSIC" }],
      },
      conditionalmenu: [
        {
          button: [{ type: "click", name: "周末歌曲", key: "V1001_WEEKEND_MUSIC" }],
          matchrule: { tag_id: "2" },
        },
      ],
    };

    request.mockResolvedValue(mockResult);

    await expect(menu.getMenu()).resolves.toEqual(mockResult);

    expect(request).toHaveBeenCalledWith(Menu.GET, {
      method: "GET",
      query: { access_token: "mock-token" },
    });
  });

  it("should throw WechatHttpError when get menu api returns errcode", async () => {
    request.mockResolvedValue({ errcode: 40001, errmsg: "invalid credential" });

    await expect(menu.getMenu()).rejects.toThrow(WechatHttpError);
  });

  it("should delete menu successfully", async () => {
    request.mockResolvedValue({ errcode: 0, errmsg: "ok" });

    await expect(menu.deleteMenu()).resolves.toBe(true);

    expect(request).toHaveBeenCalledWith(Menu.DELETE, {
      method: "GET",
      query: { access_token: "mock-token" },
    });
  });

  it("should throw WechatHttpError when delete menu api returns errcode", async () => {
    request.mockResolvedValue({ errcode: 40001, errmsg: "invalid credential" });

    await expect(menu.deleteMenu()).rejects.toThrow(WechatHttpError);
  });

  it("should create conditional menu successfully", async () => {
    request.mockResolvedValue({ menuid: "208379533" });

    const buttons: OfficialAccountMenuButton[] = [
      { type: "click", name: "今日歌曲", key: "V1001_TODAY_MUSIC" },
    ];
    const matchRule: AtLeastOne<OfficialAccountMenuMatchRule> = { tag_id: "2" };

    await expect(menu.createConditionalMenu(buttons, matchRule)).resolves.toBe("208379533");

    expect(request).toHaveBeenCalledWith(Menu.CONDITIONAL_ADD, {
      method: "POST",
      query: { access_token: "mock-token" },
      body: JSON.stringify({ button: buttons, matchrule: matchRule }),
    });
  });

  it("should throw WechatHttpError when create conditional menu api returns errcode", async () => {
    request.mockResolvedValue({ errcode: 65320, errmsg: "match rule violates privacy" });

    const buttons: OfficialAccountMenuButton[] = [
      { type: "click", name: "今日歌曲", key: "V1001_TODAY_MUSIC" },
    ];

    await expect(menu.createConditionalMenu(buttons, { tag_id: "2" })).rejects.toThrow(
      WechatHttpError,
    );
  });

  it("should delete conditional menu successfully", async () => {
    request.mockResolvedValue({ errcode: 0, errmsg: "ok" });

    await expect(menu.deleteConditionalMenu("208379533")).resolves.toBe(true);

    expect(request).toHaveBeenCalledWith(Menu.CONDITIONAL_DELETE, {
      method: "POST",
      query: { access_token: "mock-token" },
      body: { menuid: "208379533" },
    });
  });

  it("should throw WechatHttpError when delete conditional menu api returns errcode", async () => {
    request.mockResolvedValue({ errcode: 40001, errmsg: "invalid credential" });

    await expect(menu.deleteConditionalMenu("208379533")).rejects.toThrow(WechatHttpError);
  });

  it("should match conditional menu successfully", async () => {
    const mockResult = {
      menu: {
        button: [
          { type: "click", name: "今日歌曲", key: "V1001_TODAY_MUSIC" },
        ] as OfficialAccountMenuButton[],
      },
    };

    request.mockResolvedValue(mockResult);

    await expect(menu.matchConditionalMenu("openid_123")).resolves.toEqual(mockResult.menu.button);

    expect(request).toHaveBeenCalledWith(Menu.CONDITIONAL_MATCH, {
      method: "POST",
      query: { access_token: "mock-token" },
      body: { user_id: "openid_123" },
    });
  });
});
