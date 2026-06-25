import { Cacher } from "@resolid/cache";
import { MemoryCache, NullCache } from "@resolid/cache/stores";
import { type FetchInstance, ufetch } from "@resolid/utils/http";
import { WechatError } from "./error";
import { withTrailingSlash } from "./utils";

export interface AccessTokenInterface {
  getToken: () => Promise<string>;
}

export type BaseConfig = {
  /**
   * API 基础 URL（默认生产环境）
   */
  baseUrl?: string;

  /**
   * 缓存（默认内存缓存, 调试模式默认无缓存）
   */
  cache?: Cacher;

  /**
   * 调试模式
   */
  debug?: boolean;
};

export abstract class BaseApplication {
  protected _accessToken: AccessTokenInterface | undefined;
  protected readonly _debug: boolean;

  public readonly client: FetchInstance;
  public readonly cache: Cacher;

  protected constructor(
    {
      baseUrl,
      debug = false,
      cache = new Cacher({ store: debug ? new NullCache() : new MemoryCache() }),
    }: BaseConfig,
    accessToken: AccessTokenInterface | undefined,
  ) {
    this._accessToken = accessToken;

    this.client = ufetch.create({
      baseUrl: withTrailingSlash(baseUrl ?? ""),
      responseFormat: "json",
    });
    this.cache = cache;
    this._debug = debug;
  }

  accessToken(): AccessTokenInterface {
    if (!this._accessToken) {
      throw new WechatError("accessToken is not configured");
    }

    return this._accessToken;
  }
}
