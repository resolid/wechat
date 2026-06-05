export class WechatError extends Error {
  override name = "WechatError";
}

export type WechatResponse = {
  /** 错误码 */
  errcode: number;
  /** 错误信息 */
  errmsg: string;
};

export class WechatHttpError extends Error {
  override name = "WechatHttpError";

  public readonly errcode: number;
  public readonly errmsg: string;

  constructor(message: string, error: WechatResponse) {
    super(`${message} ${error.errcode}, ${error.errmsg}`);

    this.errcode = error.errcode;
    this.errmsg = error.errmsg;
  }
}
