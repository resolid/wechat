export class WechatError extends Error {
  override name = "WechatError";
}

export type WechatFetchResponse = {
  /** 错误码 */
  errcode: number;
  /** 错误信息 */
  errmsg: string;
};

export class WechatFetchError extends Error {
  override name = "WechatFetchError";

  public readonly errcode: number;
  public readonly errmsg: string;

  constructor(message: string, error: WechatFetchResponse, options?: ErrorOptions) {
    super(`${message} ${error.errcode}, ${error.errmsg}`, options);

    this.errcode = error.errcode;
    this.errmsg = error.errmsg;
  }
}
