import { beforeEach, describe, expect, it } from "vitest";
import { setupFetchMock } from "../../../test/mock-fetch";
import { Comment, type OfficialAccountListCommentResult } from "../modules/comment";
import { createWithMockedAccessToken } from "./utils";

const request = setupFetchMock();

describe("OfficialAccountComment", () => {
  let comment: Comment;

  beforeEach(() => {
    comment = createWithMockedAccessToken((account) => account.comment());
  });

  describe("openComment", () => {
    it("should post to OPEN endpoint and return true on success", async () => {
      request.mockResolvedValue({ errcode: 0, errmsg: "ok" });

      const result = await comment.openComment("msg_001");

      expect(request).toHaveBeenCalledWith(Comment.OPEN, {
        method: "POST",
        query: { access_token: "mock-token" },
        body: { msg_data_id: "msg_001", index: undefined },
      });
      expect(result).toBe(true);
    });

    it("should pass index when provided", async () => {
      request.mockResolvedValue({ errcode: 0, errmsg: "ok" });

      await comment.openComment("msg_001", 2);

      expect(request).toHaveBeenCalledWith(
        Comment.OPEN,
        expect.objectContaining({
          body: { msg_data_id: "msg_001", index: 2 },
        }),
      );
    });

    it("should throw on error response", async () => {
      request.mockResolvedValue({ errcode: 40001, errmsg: "invalid credential" });

      await expect(comment.openComment("msg_001")).rejects.toThrow();
    });
  });

  describe("closeComment", () => {
    it("should post to CLOSE endpoint and return true on success", async () => {
      request.mockResolvedValue({ errcode: 0, errmsg: "ok" });

      const result = await comment.closeComment("msg_001");

      expect(request).toHaveBeenCalledWith(Comment.CLOSE, {
        method: "POST",
        query: { access_token: "mock-token" },
        body: { msg_data_id: "msg_001", index: undefined },
      });
      expect(result).toBe(true);
    });

    it("should throw on error response", async () => {
      request.mockResolvedValue({ errcode: 40001, errmsg: "invalid credential" });

      await expect(comment.closeComment("msg_001")).rejects.toThrow();
    });
  });

  describe("listComment", () => {
    const mockListResult: OfficialAccountListCommentResult = {
      comment: [
        {
          user_comment_id: 1,
          create_time: 1700000000,
          content: "Great article!",
          comment_type: 0,
          openid: "oABC123",
          reply: { content: "Thank you!", create_time: 1700000100 },
        },
      ],
      total: 1,
    };

    it("should post to LIST endpoint and return comment data", async () => {
      request.mockResolvedValue(mockListResult);

      const result = await comment.listComment("msg_001", 0, 20, 0);

      expect(request).toHaveBeenCalledWith(Comment.LIST, {
        method: "POST",
        query: { access_token: "mock-token" },
        body: { msg_data_id: "msg_001", index: undefined, begin: 0, count: 20, type: 0 },
      });
      expect(result).toEqual(mockListResult);
    });

    it("should pass index when provided", async () => {
      request.mockResolvedValue(mockListResult);

      await comment.listComment("msg_001", 0, 20, 1, 3);

      expect(request).toHaveBeenCalledWith(
        Comment.LIST,
        expect.objectContaining({
          body: expect.objectContaining({ index: 3, type: 1 }),
        }),
      );
    });

    it("should throw on error response", async () => {
      request.mockResolvedValue({ errcode: 40001, errmsg: "invalid credential" });

      await expect(comment.listComment("msg_001", 0, 20, 0)).rejects.toThrow();
    });
  });

  describe("electComment", () => {
    it("should post to ELECT endpoint and return true on success", async () => {
      request.mockResolvedValue({ errcode: 0, errmsg: "ok" });

      const result = await comment.electComment("msg_001", 42);

      expect(request).toHaveBeenCalledWith(Comment.ELECT, {
        method: "POST",
        query: { access_token: "mock-token" },
        body: { msg_data_id: "msg_001", index: undefined, user_comment_id: 42 },
      });
      expect(result).toBe(true);
    });

    it("should throw on error response", async () => {
      request.mockResolvedValue({ errcode: 40001, errmsg: "invalid credential" });

      await expect(comment.electComment("msg_001", 42)).rejects.toThrow();
    });
  });

  describe("unelectComment", () => {
    it("should post to UNELECT endpoint and return true on success", async () => {
      request.mockResolvedValue({ errcode: 0, errmsg: "ok" });

      const result = await comment.unelectComment("msg_001", 42);

      expect(request).toHaveBeenCalledWith(Comment.UNELECT, {
        method: "POST",
        query: { access_token: "mock-token" },
        body: { msg_data_id: "msg_001", index: undefined, user_comment_id: 42 },
      });
      expect(result).toBe(true);
    });

    it("should throw on error response", async () => {
      request.mockResolvedValue({ errcode: 40001, errmsg: "invalid credential" });

      await expect(comment.unelectComment("msg_001", 42)).rejects.toThrow();
    });
  });

  describe("deleteComment", () => {
    it("should post to DELETE endpoint and return true on success", async () => {
      request.mockResolvedValue({ errcode: 0, errmsg: "ok" });

      const result = await comment.deleteComment("msg_001", 42);

      expect(request).toHaveBeenCalledWith(Comment.DELETE, {
        method: "POST",
        query: { access_token: "mock-token" },
        body: { msg_data_id: "msg_001", index: undefined, user_comment_id: 42 },
      });
      expect(result).toBe(true);
    });

    it("should throw on error response", async () => {
      request.mockResolvedValue({ errcode: 40001, errmsg: "invalid credential" });

      await expect(comment.deleteComment("msg_001", 42)).rejects.toThrow();
    });
  });

  describe("replyComment", () => {
    it("should post to REPLY endpoint and return true on success", async () => {
      request.mockResolvedValue({ errcode: 0, errmsg: "ok" });

      const result = await comment.replyComment("msg_001", 42, "Nice post!");

      expect(request).toHaveBeenCalledWith(Comment.REPLY, {
        method: "POST",
        query: { access_token: "mock-token" },
        body: {
          msg_data_id: "msg_001",
          index: undefined,
          user_comment_id: 42,
          content: "Nice post!",
        },
      });
      expect(result).toBe(true);
    });

    it("should throw on error response", async () => {
      request.mockResolvedValue({ errcode: 40001, errmsg: "invalid credential" });

      await expect(comment.replyComment("msg_001", 42, "Nice post!")).rejects.toThrow();
    });
  });

  describe("deleteReply", () => {
    it("should post to REPLY_DELETE endpoint and return true on success", async () => {
      request.mockResolvedValue({ errcode: 0, errmsg: "ok" });

      const result = await comment.deleteReply("msg_001", 42);

      expect(request).toHaveBeenCalledWith(Comment.REPLY_DELETE, {
        method: "POST",
        query: { access_token: "mock-token" },
        body: { msg_data_id: "msg_001", index: undefined, user_comment_id: 42 },
      });
      expect(result).toBe(true);
    });

    it("should throw on error response", async () => {
      request.mockResolvedValue({ errcode: 40001, errmsg: "invalid credential" });

      await expect(comment.deleteReply("msg_001", 42)).rejects.toThrow();
    });
  });
});
