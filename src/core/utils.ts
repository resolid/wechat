import XMLBuilder from "fast-xml-builder";
import { XMLParser } from "fast-xml-parser";
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
