import type { FetchInstance } from "@resolid/utils/http";
import type { AccessTokenInterface } from "./base";

export abstract class BaseModule {
  protected readonly _accessToken: AccessTokenInterface;
  protected readonly _client: FetchInstance;

  constructor(accessToken: AccessTokenInterface, client: FetchInstance) {
    this._accessToken = accessToken;
    this._client = client;
  }
}
