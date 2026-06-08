import type { FetchInstance } from "@resolid/utils/http";
import { WechatError } from "./error";

export interface AccessTokenInterface {
  getToken(): Promise<string>;
}

export abstract class BaseApplication {
  protected readonly _appId: string;
  protected readonly _client: FetchInstance;

  protected _accessToken: AccessTokenInterface | undefined;

  protected constructor(
    appId: string,
    client: FetchInstance,
    accessToken: AccessTokenInterface | undefined,
  ) {
    this._appId = appId;
    this._client = client;
    this._accessToken = accessToken;
  }

  accessToken(): AccessTokenInterface {
    if (!this._accessToken) {
      throw new WechatError("accessToken is not configured");
    }

    return this._accessToken;
  }
}
