import type { AtLeastOne } from "@resolid/utils";
import { WechatError, type WechatFetchResponse } from "../../core/error";
import { AuthorizedModule } from "../../core/module";
import { assertWechatFetchResponse } from "../../core/utils";

type MenuBase = {
  name: string;
};

type MenuButtonWithKey = MenuBase & {
  type:
    | "click"
    | "scancode_push"
    | "scancode_waitmsg"
    | "pic_sysphoto"
    | "pic_photo_or_album"
    | "pic_weixin"
    | "location_select";
  key: string;
};

type MenuButtonView = MenuBase & {
  type: "view";
  url: string;
};

type MenuButtonMiniProgram = MenuBase & {
  type: "miniprogram";
  url: string;
  appid: string;
  pagepath: string;
};

type MenuButtonMedia = {
  type: "media_id" | "view_limited";
  name: string;
  media_id: string;
};

type MenuButtonArticle = {
  type: "article_id" | "article_view_limited";
  name: string;
  article_id: string;
};

type MenuLeafButton =
  | MenuButtonWithKey
  | MenuButtonView
  | MenuButtonMiniProgram
  | MenuButtonMedia
  | MenuButtonArticle;

type MenuParentButton = MenuBase & {
  sub_button: MenuLeafButton[];
};

export type OfficialAccountMenuButton = MenuLeafButton | MenuParentButton;

export type OfficialAccountMenuMatchRule = {
  /**
   * 用户标签 ID，可通过用户标签管理接口获取
   */
  tag_id?: string;

  /**
   * 客户端平台类型：iOS(1), Android(2), Others(3)
   */
  client_platform_type?: "1" | "2" | "3";
};

export type OfficialAccountMenuGetResult = {
  menu: {
    button: OfficialAccountMenuButton[];
  };
  conditionalmenu: {
    button: OfficialAccountMenuButton[];
    matchrule: OfficialAccountMenuMatchRule;
  }[];
};

export class Menu extends AuthorizedModule {
  public static readonly GET = "/cgi-bin/menu/get";
  public static readonly CREATE = "/cgi-bin/menu/create";
  public static readonly DELETE = "/cgi-bin/menu/delete";
  public static readonly CONDITIONAL_ADD = "/cgi-bin/menu/addconditional";
  public static readonly CONDITIONAL_DELETE = "/cgi-bin/menu/delconditional";
  public static readonly CONDITIONAL_MATCH = "/cgi-bin/menu/trymatch";

  private _checkMenuButtons(buttons: OfficialAccountMenuButton[]) {
    if (buttons.length > 3) {
      throw new WechatError("Menu can have at most 3 top-level buttons");
    }

    for (const button of buttons) {
      if ("sub_button" in button && button.sub_button.length > 5) {
        throw new WechatError(`Button "${button.name}" can have at most 5 sub-buttons`);
      }
    }
  }

  /**
   * 创建自定义菜单
   * @see https://developers.weixin.qq.com/doc/subscription/api/custommenu/api_createcustommenu.html
   *
   * @param buttons 菜单结构体数组
   *
   * @returns 是否创建成功
   */
  async createMenu(buttons: OfficialAccountMenuButton[]): Promise<boolean> {
    this._checkMenuButtons(buttons);

    const accessToken = await this._accessToken.getToken();

    const result = await this._client<WechatFetchResponse>(Menu.CREATE, {
      method: "POST",
      query: { access_token: accessToken },
      body: JSON.stringify({ button: buttons }),
    });

    assertWechatFetchResponse("Failed to create menu:", result);

    return true;
  }

  /**
   * 获取自定义菜单配置
   * @see https://developers.weixin.qq.com/doc/subscription/api/custommenu/api_getmenu.html
   *
   * @returns 默认菜单和全部个性化菜单信息
   */
  async getMenu(): Promise<OfficialAccountMenuGetResult> {
    const accessToken = await this._accessToken.getToken();

    const result = await this._client<WechatFetchResponse | OfficialAccountMenuGetResult>(
      Menu.GET,
      {
        method: "GET",
        query: { access_token: accessToken },
      },
    );

    assertWechatFetchResponse("Failed to get menu:", result);

    return result;
  }

  /**
   * 删除自定义菜单
   * @see https://developers.weixin.qq.com/doc/subscription/api/custommenu/api_deletemenu.html
   *
   * @returns 是否删除成功
   */
  async deleteMenu(): Promise<boolean> {
    const accessToken = await this._accessToken.getToken();

    const result = await this._client<WechatFetchResponse>(Menu.DELETE, {
      method: "GET",
      query: { access_token: accessToken },
    });

    assertWechatFetchResponse("Failed to delete menu:", result);

    return true;
  }

  /**
   * 创建个性化菜单
   * @see https://developers.weixin.qq.com/doc/subscription/api/custommenu/api_addconditionalmenu.html
   *
   * @param buttons 菜单结构体数组
   * @param matchRule 菜单匹配规则(至少一个非空字段)
   *
   * @returns 菜单 Id
   */
  async createConditionalMenu(
    buttons: OfficialAccountMenuButton[],
    matchRule: AtLeastOne<OfficialAccountMenuMatchRule>,
  ): Promise<string> {
    this._checkMenuButtons(buttons);

    const accessToken = await this._accessToken.getToken();

    const result = await this._client<WechatFetchResponse | { menuid: string }>(
      Menu.CONDITIONAL_ADD,
      {
        method: "POST",
        query: { access_token: accessToken },
        body: JSON.stringify({ button: buttons, matchrule: matchRule }),
      },
    );

    assertWechatFetchResponse("Failed to create conditional menu:", result);

    return result.menuid;
  }

  /**
   * 删除个性化菜单
   * @see https://developers.weixin.qq.com/doc/subscription/api/custommenu/api_deleteconditionalmenu.html
   *
   * @param id 菜单 Id
   *
   * @returns 是否删除成功
   */
  async deleteConditionalMenu(id: string): Promise<boolean> {
    const accessToken = await this._accessToken.getToken();

    const result = await this._client<WechatFetchResponse>(Menu.CONDITIONAL_DELETE, {
      method: "POST",
      query: { access_token: accessToken },
      body: { menuid: id },
    });

    assertWechatFetchResponse("Failed to delete conditional menu:", result);

    return true;
  }

  /**
   * 测试个性化菜单匹配结果
   * @see https://developers.weixin.qq.com/doc/subscription/api/custommenu/api_trymatchmenu.html
   *
   * @param userId 用户 OpenId 或微信号
   *
   * @returns 个性化菜单
   */
  async matchConditionalMenu(userId: string): Promise<OfficialAccountMenuButton[]> {
    const accessToken = await this._accessToken.getToken();

    const result = await this._client<
      WechatFetchResponse | { menu: { button: OfficialAccountMenuButton[] } }
    >(Menu.CONDITIONAL_MATCH, {
      method: "POST",
      query: { access_token: accessToken },
      body: { user_id: userId },
    });

    assertWechatFetchResponse("Failed to match conditional menu", result);

    return result.menu.button;
  }
}
