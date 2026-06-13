import XMLBuilder from "fast-xml-builder";
import { XMLParser } from "fast-xml-parser";
import { WechatFetchError, type WechatFetchResponse } from "./error";

export function assertWechatFetchResponse<T extends object>(
  message: string,
  response: WechatFetchResponse | T,
): asserts response is T {
  if ("errcode" in response && response.errcode != 0) {
    throw new WechatFetchError(message, response);
  }
}

export function withTrailingSlash(url: string): string {
  return url.endsWith("/") ? url : `${url}/`;
}

export function xmlParse<T = unknown>(xml: string): T {
  return new XMLParser({
    ignoreDeclaration: true,
    ignorePiTags: true,
    tagValueProcessor: (tagName, tagValue) => {
      if (tagName == "MsgId") {
        return undefined;
      }

      return tagValue;
    },
  }).parse(xml).xml;
}

export function xmlBuild<T = unknown>(obj: T): string {
  return new XMLBuilder().build({ xml: obj });
}
