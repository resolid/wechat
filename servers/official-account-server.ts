import { env } from "node:process";
import type { WechatTextMessage } from "../src/core/message";
import { WechatOfficialAccount } from "../src";

export default {
  async fetch(request: Request): Promise<Response> {
    const webhook = new WechatOfficialAccount({
      appId: env.WECHAT_APP_ID,
      appSecret: env.WECHAT_APP_SECRET,
      token: env.WECHAT_TOKEN,
      aesKey: env.WECHAT_AES_KEY,
      debug: true,
    }).webhook(request);

    webhook.handle<WechatTextMessage>("text", (message) => {
      console.log(message.Content);
    });

    webhook.handle("event:debug_demo", (message) => {
      return message;
    });

    return webhook.response();
  },
};
