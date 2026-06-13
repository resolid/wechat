import type { MaybePromise } from "@resolid/utils";
import type { Encryptor } from "./encryptor";
import { xmlBuild, xmlParse } from "./utils";

export class ServerRequest {
  public readonly request: Request;

  constructor(request: Request) {
    this.request = request;
  }

  private _headers?: Headers;
  getHeaders(): Headers {
    return (this._headers ??= this.request.headers);
  }

  private _query?: URLSearchParams;
  getQuery(): URLSearchParams {
    return (this._query ??= new URL(this.request.url).searchParams);
  }

  private _rawBody?: string;
  async getRawBody(): Promise<string> {
    return (this._rawBody ??= await this.request.text());
  }

  private _isJsonRequest?: boolean;
  isJsonRequest(): boolean {
    return (this._isJsonRequest ??=
      this.getHeaders().get("content-type")?.includes("application/json") ?? false);
  }

  private _message?: unknown;
  async getMessage<T = unknown>(): Promise<T> {
    if (this._message) {
      return this._message as T;
    }

    const content = await this.getRawBody();

    this._message = this.isJsonRequest() ? JSON.parse(content) : xmlParse(content);

    return this._message as T;
  }
}

export function buildResponse<T = unknown>(
  obj: T,
  encryptor: Encryptor | null,
  responseType: "json" | "xml" = "xml",
): Response {
  const json = responseType == "json";
  const body = json ? JSON.stringify(obj) : xmlBuild(obj);

  return new Response(encryptor ? encryptor.encrypt(body) : body, {
    headers: new Headers({
      "Content-Type": json ? "application/json; charset=utf-8" : "application/xml; charset=utf-8",
    }),
  });
}

export type MessageHandle<T = unknown, R = unknown> = (
  message: T,
  request: ServerRequest,
) => MaybePromise<Response | R | void>;
