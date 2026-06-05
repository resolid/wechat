import { vi } from "vitest";
import type { AccessToken } from "../modules/access-token";
import { WechatOfficialAccount, type WechatOfficialAccountConfig } from "../index";

export function createOfficialAccount(
  options?: Partial<Omit<WechatOfficialAccountConfig, "cache" | "debug" | "baseUrl">>,
): WechatOfficialAccount {
  return new WechatOfficialAccount({
    appId: "appid",
    appSecret: "secret",
    debug: true,
    ...options,
  });
}

export function createWithMockedAccessToken<T>(
  factory: (account: WechatOfficialAccount) => T,
  options?: Partial<Omit<WechatOfficialAccountConfig, "cache" | "debug" | "baseUrl">>,
): T {
  const officialAccount = createOfficialAccount(options);

  vi.spyOn(officialAccount, "accessToken").mockReturnValue({
    getToken: vi.fn().mockResolvedValue("mock-token"),
  } as unknown as AccessToken);

  return factory(officialAccount);
}
