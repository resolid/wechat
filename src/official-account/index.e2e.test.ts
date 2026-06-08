import { random } from "@resolid/utils";
import { env } from "node:process";
import { describe, expect, it } from "vitest";
import type { OfficialAccountMenuButton } from "./modules/menu";
import { WechatOfficialAccount, type WechatOfficialAccountConfig } from "./index";

function createOfficialAccount(
  options?: Partial<Omit<WechatOfficialAccountConfig, "cache" | "debug" | "baseUrl">>,
) {
  return new WechatOfficialAccount({
    appId: env.WECHAT_APP_ID,
    appSecret: env.WECHAT_APP_SECRET,
    token: env.WECHAT_TOKEN,
    aesKey: env.WECHAT_AES_KEY,
    debug: true,
    ...options,
  });
}

describe("WechatOfficialAccount integration", () => {
  it("should test User, Tag and Menu from wechat api", async () => {
    const officialAccountUser = createOfficialAccount().user();
    const officialAccountTag = createOfficialAccount().tag();
    const officialAccountMenu = createOfficialAccount().menu();

    const fans = await officialAccountUser.getFans();
    expect(fans.data.openid.length).toBeGreaterThan(0);

    const blacked = await officialAccountUser.batchBlacklist(fans.data.openid);
    expect(blacked).toBe(true);
    const blacklist = await officialAccountUser.getBlacklist();
    expect(blacklist.data.openid.length).toBeGreaterThan(0);
    const unblacked = await officialAccountUser.batchUnblacklist(fans.data.openid);
    expect(unblacked).toBe(true);

    const openId = fans.data.openid[0]!;

    const remarked = await officialAccountUser.updateRemark(openId, "测试");
    expect(remarked).toBe(true);

    const user = await officialAccountUser.getUserInfo(openId);
    expect(user.subscribe).toBe(1);

    if (user.subscribe == 1) {
      expect(user.remark).toBe("测试");
    }

    const users = await officialAccountUser.batchUserInfo(fans.data.openid);
    expect(users.length).toBeGreaterThan(0);

    const tags = await officialAccountTag.getTags();
    expect(tags).toBeDefined();

    const tagName = random(12);
    const tagCreated = await officialAccountTag.createTag(tagName);
    expect(tagCreated.name).toBe(tagName);

    const newName = random(13);
    const tagUpdated = await officialAccountTag.updateTag({ id: tagCreated.id, name: newName });
    expect(tagUpdated).toBe(true);

    const userTagged = await officialAccountTag.batchTagUsers(tagCreated.id, [openId]);
    expect(userTagged.length).toBe(0);

    const buttons: OfficialAccountMenuButton[] = [
      { type: "click", name: "今日歌曲", key: "V1001_TODAY_MUSIC", sub_button: [] },
    ];
    const menuCreated = await officialAccountMenu.createMenu(buttons);
    expect(menuCreated).toBe(true);
    const menuGot = await officialAccountMenu.getMenu();
    expect(menuGot.menu.button).toStrictEqual(buttons);

    const conditionalButtons: OfficialAccountMenuButton[] = [
      { type: "click", name: "今日文字", key: "V2001_TODAY_TEXT", sub_button: [] },
    ];
    const conditionalMenuCreated = await officialAccountMenu.createConditionalMenu(
      conditionalButtons,
      {
        tag_id: String(tagCreated.id),
      },
    );
    expect(conditionalMenuCreated).toBeDefined();

    const conditionMatchButtons = await officialAccountMenu.matchConditionalMenu(openId);
    expect(conditionMatchButtons).toStrictEqual(conditionalButtons);

    const conditionalMenuDeleted =
      await officialAccountMenu.deleteConditionalMenu(conditionalMenuCreated);
    expect(conditionalMenuDeleted).toBe(true);

    const userUntaged = await officialAccountTag.batchUntagUsers(tagCreated.id, [openId]);
    expect(userUntaged.length).toBe(0);

    const tagDeleted = await officialAccountTag.deleteTag(tagCreated.id);
    expect(tagDeleted).toBe(true);

    const menuDeleted = await officialAccountMenu.deleteMenu();
    expect(menuDeleted).toBe(true);
  }, 60_000);
});
