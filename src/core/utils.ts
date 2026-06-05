import { WechatHttpError, type WechatResponse } from "./error";

export function assertWechatResponse<T extends object>(
  message: string,
  response: WechatResponse | T,
): asserts response is T {
  if ("errcode" in response && response.errcode != 0) {
    throw new WechatHttpError(message, response);
  }
}

export function withTrailingSlash(url: string): string {
  return url.endsWith("/") ? url : `${url}/`;
}
