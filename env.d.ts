declare namespace NodeJS {
  export interface ProcessEnv {
    readonly WECHAT_APP_ID: string;
    readonly WECHAT_APP_SECRET: string;
    readonly WECHAT_TOKEN: string;
    readonly WECHAT_AES_KEY: string;
  }
}
