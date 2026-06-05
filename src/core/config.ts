import type { Cacher } from "@resolid/cache";

export type Config = {
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
