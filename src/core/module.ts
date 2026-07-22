import type { Cacher } from "@resolid/cache";
import type { FetchInstance } from "@resolid/utils/http";
import type { AccessTokenInterface } from "./base";

export abstract class BaseModule {
  protected readonly _client: FetchInstance;
  protected readonly _cache: Cacher;

  protected constructor(client: FetchInstance, cache: Cacher) {
    this._client = client;
    this._cache = cache;
  }
}

export abstract class AuthorizedModule extends BaseModule {
  protected readonly _accessToken: AccessTokenInterface;

  constructor(accessToken: AccessTokenInterface, client: FetchInstance, cache: Cacher) {
    super(client, cache);
    this._accessToken = accessToken;
  }
}
