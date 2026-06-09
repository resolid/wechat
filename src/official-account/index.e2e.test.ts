import { random } from "@resolid/utils";
import { env } from "node:process";
import { describe, expect, it } from "vitest";
import type { OfficialAccountMenuButton } from "./modules/menu";
import { WechatOfficialAccount, type WechatOfficialAccountConfig } from "./index";
import { User } from "./modules/user";

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
  it("should test openApi from wechat api", async () => {
    const api = createOfficialAccount().openApi();

    const quota = await api.getApiQuota(User.INFO_GET);
    expect(quota).toBeDefined();

    const resetApi = await api.clearApiQuota(User.INFO_GET);
    expect(resetApi).toBe(true);

    const cleared = await api.clearQuota();
    expect(cleared).toBe(true);
  });

  it("should test User, Tag and Menu from wechat api", async () => {
    const officialAccount = createOfficialAccount();
    const officialAccountUser = officialAccount.user();
    const officialAccountTag = officialAccount.tag();
    const officialAccountMenu = officialAccount.menu();

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

    const userUntagged = await officialAccountTag.batchUntagUsers(tagCreated.id, [openId]);
    expect(userUntagged.length).toBe(0);

    const tagDeleted = await officialAccountTag.deleteTag(tagCreated.id);
    expect(tagDeleted).toBe(true);

    const menuDeleted = await officialAccountMenu.deleteMenu();
    expect(menuDeleted).toBe(true);
  }, 60_000);

  it("should test UserAnalytics from wechat api", async () => {
    const analytics = createOfficialAccount().userAnalytics();

    const summaryData = await analytics.getSummary("2026-06-01", "2026-06-06");
    expect(summaryData).toBeDefined();

    const cumulateData = await analytics.getCumulate("2026-06-01", "2026-06-06");
    expect(cumulateData).toBeDefined();
  });

  it("should test ArticleAnalytics from wechat api", async () => {
    const analytics = createOfficialAccount().articleAnalytics();

    const readData = await analytics.getRead("2026-06-01");
    expect(readData).toBeDefined();

    const shareData = await analytics.getShare("2026-06-01");
    expect(shareData).toBeDefined();

    const summaryData = await analytics.getSummary("2026-06-01", "2026-06-01");
    expect(summaryData).toBeDefined();

    const detailsData = await analytics.getDetails("2026-06-01");
    expect(detailsData).toBeDefined();
  });

  it("should test MessageAnalytics from wechat api", async () => {
    const analytics = createOfficialAccount().messageAnalytics();

    const upstreamItems = await analytics.getUpstream("2026-06-01", "2026-06-06");
    expect(upstreamItems).toBeDefined();

    const monthUpstreamItems = await analytics.getMonthUpstream("2026-05-05");
    expect(monthUpstreamItems).toBeDefined();

    const weekUpstreamItems = await analytics.getWeekUpstream("2026-05-05");
    expect(weekUpstreamItems).toBeDefined();

    const hourUpstreamItems = await analytics.getHourUpstream("2026-06-01");
    expect(hourUpstreamItems).toBeDefined();

    const distUpstreamItems = await analytics.getDistUpstream("2026-06-01", "2026-06-06");
    expect(distUpstreamItems).toBeDefined();

    const distWeekUpstreamItems = await analytics.getDistWeekUpstream("2026-06-01", "2026-06-06");
    expect(distWeekUpstreamItems).toBeDefined();

    const distMonthUpstreamItems = await analytics.getDistMonthUpstream("2026-06-01", "2026-06-06");
    expect(distMonthUpstreamItems).toBeDefined();
  });
});
