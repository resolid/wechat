import type { Simplify } from "@resolid/utils";
import { xmlParse } from "./utils";

export type WechatMessageType =
  | "text"
  | "image"
  | "voice"
  | "video"
  | "shortvideo"
  | "location"
  | "link"
  | "event";

type BaseMessage = {
  /** 开发者微信号 */
  ToUserName: string;
  /** 发送方账号（一个OpenID）*/
  FromUserName: string;
  /** 消息创建时间 （整型） */
  CreateTime: number;
  /** 消息类型 */
  MsgType: WechatMessageType;
};

type CommonMessage = BaseMessage & {
  /** 消息 Id */
  MsgId: string;
};

export type WechatTextMessage = Simplify<
  CommonMessage & {
    MsgType: "text";
    /** 文本消息内容 */
    Content: string;
  }
>;

type MediaMessage = CommonMessage & {
  /** 媒体 Id，可以调用获取临时素材接口拉取数据 */
  MediaId: string;
};

export type WechatImageMessage = Simplify<
  MediaMessage & {
    MsgType: "image";
    /** 图片链接（由系统生成） */
    PicUrl: string;
  }
>;

export type WechatVoiceMessage = Simplify<
  MediaMessage & {
    MsgType: "voice";
    /** 16K采样率语音消息媒体 Id，可以调用获取临时素材接口拉取数据 */
    MediaId16K: string;
  }
>;

export type WechatVideoMessage = Simplify<
  MediaMessage & {
    MsgType: "video" | "shortvideo";
    /** 视频消息缩略图的媒体 Id，可以调用多媒体文件下载接口拉取数据 */
    ThumbMediaId: string;
  }
>;

export type WechatLocationMessage = Simplify<
  CommonMessage & {
    MsgType: "location";
    /** 地理位置纬度 */
    Location_X: number;
    /** 地理位置经度 */
    Location_Y: number;
    /** 地图缩放大小 */
    Scale: number;
    /** 地理位置信息 */
    Label: string;
  }
>;

export type WechatLinkMessage = Simplify<
  CommonMessage & {
    MsgType: "link";
    /** 消息标题 */
    Title: string;
    /** 消息描述 */
    Description: string;
    /** 消息链接 */
    Url: string;
  }
>;

export type WechatEventType = "subscribe" | "unsubscribe" | "SCAN" | "LOCATION" | "CLICK" | "VIEW";

export type EventMessage = BaseMessage & {
  MsgType: "event";
  Event: WechatEventType;
};

export type WechatEventSubscribeMessage = Simplify<
  EventMessage & {
    Event: "subscribe";
    /** 事件 KEY 值，qrscene_ 为前缀，后面为二维码的场景值 Id */
    EventKey?: string;
    /** 二维码的 ticket，可用来换取二维码图片 */
    Ticket?: string;
  }
>;

export type WechatEventUnsubscribeMessage = Simplify<
  EventMessage & {
    Event: "unsubscribe";
  }
>;

export type WechatEventScanMessage = Simplify<
  EventMessage & {
    Event: "SCAN";
    /** 事件 KEY 值，qrscene_ 为前缀，后面为二维码的场景值 Id */
    EventKey: string;
    /** 二维码的 ticket，可用来换取二维码图片 */
    Ticket: string;
  }
>;

export type WechatEventLocationMessage = Simplify<
  EventMessage & {
    Event: "LOCATION";
    /** 地理位置纬度 */
    Latitude: number;
    /** 地理位置经度 */
    Longitude: number;
    /** 地理位置精度 */
    Precision: number;
  }
>;

export type WechatEventMenuMessage = Simplify<
  EventMessage & {
    Event: "CLICK" | "VIEW";
    /** 事件 KEY 值，与自定义菜单接口中 KEY 值对应或者设置的跳转URL */
    EventKey: string;
  }
>;

export type WechatMessage =
  | WechatTextMessage
  | WechatImageMessage
  | WechatVoiceMessage
  | WechatVideoMessage
  | WechatLocationMessage
  | WechatLinkMessage
  | WechatEventSubscribeMessage
  | WechatEventUnsubscribeMessage
  | WechatEventScanMessage
  | WechatEventLocationMessage
  | WechatEventMenuMessage;

export function parseXmlMessage(message: string): WechatMessage {
  return xmlParse(message);
}
