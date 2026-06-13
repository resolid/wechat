import { describe, expect, it, vi } from "vitest";
import { Encryptor } from "../../core/encryptor";
import { buildResponse } from "../../core/server";
import { xmlBuild } from "../../core/utils";
import { Webhook } from "../modules/webhook";

describe("OfficialAccountWebhook", () => {
  it("returns echostr as-is when present in query", async () => {
    const webhook = new Webhook(
      new Request("https://example.com/webhook?echostr=hello123", {
        method: "GET",
      }),
      null,
    );
    const response = await webhook.response();

    expect(response.status).toBe(200);
    expect(await response.text()).toBe("hello123");
  });

  it("returns parsed message in plaintext mode", async () => {
    const webhook = new Webhook(
      new Request(`https://example.com/webhook`, {
        method: "POST",
        headers: { "Content-Type": "text/xml" },
        body: xmlBuild({ MsgType: "text", Content: "hello" }),
      }),
      null,
    );
    const message = await webhook.getMessage();

    expect(message.MsgType).toBe("text");
  });

  it("throws WechatError in encrypted mode when timestamp or nonce is missing", async () => {
    const webhook = new Webhook(
      new Request("https://example.com/webhook?msg_signature=abc"),
      new Encryptor("wx5823bf96d3bd56c7", "QDG6eK", "jWmYm7qr5nMoAUwZRjGtBxmz3KA1tkAj3ykkR6q2B2C"),
    );

    await expect(webhook.getMessage()).rejects.toThrow("Invalid Request.");
  });

  it("decrypts and returns the message in encrypted mode", async () => {
    const encryptor = new Encryptor(
      "wx5823bf96d3bd56c7",
      "QDG6eK",
      "jWmYm7qr5nMoAUwZRjGtBxmz3KA1tkAj3ykkR6q2B2C",
    );

    const encrypted = encryptor.encrypt(
      xmlBuild({ MsgType: "text", Content: "secret" }),
      "abc123",
      1700000000,
      "raw",
    );

    const webhook = new Webhook(
      new Request(
        `https://example.com/webhook?msg_signature=${encrypted.MsgSignature}&timestamp=${encrypted.TimeStamp}&nonce=${encrypted.Nonce}`,
        {
          method: "POST",
          body: xmlBuild(encrypted),
        },
      ),
      encryptor,
    );

    const message = await webhook.getMessage();

    expect(message.MsgType).toBe("text");
  });

  it("dispatches to a handler matched by MsgType", async () => {
    const webhook = new Webhook(
      new Request("https://example.com/webhook", {
        method: "POST",
        body: xmlBuild({ MsgType: "text", Content: "Hello" }),
      }),
      null,
    );

    webhook.handle("text", async (msg) => buildResponse({ reply: "pong", raw: msg }, null, "json"));

    const response = await webhook.response();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.reply).toBe("pong");
  });

  it("dispatches to a handler matched by event:<EventType>", async () => {
    const webhook = new Webhook(
      new Request("https://example.com/webhook", {
        method: "POST",
        body: xmlBuild({ MsgType: "event", Event: "subscribe" }),
      }),
      null,
    );

    const handler = vi.fn().mockResolvedValue({ subscribed: true });
    webhook.handle("event:subscribe", handler);

    await webhook.response();
    expect(handler).toHaveBeenCalledOnce();
  });

  it("falls back to wildcard handler when no specific handler matches", async () => {
    const webhook = new Webhook(
      new Request("https://example.com/webhook", {
        method: "POST",
        body: xmlBuild({ MsgType: "voice" }),
      }),
      null,
    );
    const fallback = vi.fn().mockResolvedValue({ fallback: true });
    webhook.handle("*", fallback);

    await webhook.response();
    expect(fallback).toHaveBeenCalledOnce();
  });

  it("stops at the first handler that returns a value and skips the wildcard", async () => {
    const webhook = new Webhook(
      new Request("https://example.com/webhook", {
        method: "POST",
        body: xmlBuild({ MsgType: "text" }),
      }),
      null,
    );

    const specific = vi.fn().mockResolvedValue({ from: "specific" });
    const fallback = vi.fn().mockResolvedValue({ from: "fallback" });

    webhook.handle("text", specific);
    webhook.handle("*", fallback);

    await webhook.response();
    expect(specific).toHaveBeenCalledOnce();
    expect(fallback).not.toHaveBeenCalled();
  });

  it("passes a Response instance from a handler through directly", async () => {
    const webhook = new Webhook(
      new Request("https://example.com/webhook", {
        method: "POST",
        body: xmlBuild({ MsgType: "text" }),
      }),
      null,
    );

    webhook.handle("text", async () => new Response("custom", { status: 201 }));

    const res = await webhook.response();
    expect(res.status).toBe(201);
    expect(await res.text()).toBe("custom");
  });

  it("returns 'success' when no handler matches", async () => {
    const webhook = new Webhook(
      new Request("https://example.com/webhook", {
        method: "POST",
        body: xmlBuild({ MsgType: "image" }),
      }),
      null,
    );

    const res = await webhook.response();
    expect(await res.text()).toBe("success");
  });

  it("executes multiple handlers for the same key in order until one returns a value", async () => {
    const webhook = new Webhook(
      new Request("https://example.com/webhook", {
        method: "POST",
        body: xmlBuild({ MsgType: "text" }),
      }),
      null,
    );

    const first = vi.fn().mockResolvedValue(null);
    const second = vi.fn().mockResolvedValue({ hit: "second" });
    const third = vi.fn();

    webhook.handle("text", first);
    webhook.handle("text", second);
    webhook.handle("text", third);

    await webhook.response();
    expect(first).toHaveBeenCalledOnce();
    expect(second).toHaveBeenCalledOnce();
    expect(third).not.toHaveBeenCalled();
  });

  it("returns 400 when a handler throws", async () => {
    const webhook = new Webhook(
      new Request("https://example.com/webhook", {
        method: "POST",
        body: xmlBuild({ MsgType: "text" }),
      }),
      null,
    );

    webhook.handle("text", async () => {
      throw new Error("handler boom");
    });

    const res = await webhook.response();
    expect(res.status).toBe(400);
    expect(await res.text()).toBe("handler boom");
  });

  it("returns 400 when message parsing fails", async () => {
    const encryptor = new Encryptor(
      "wx5823bf96d3bd56c7",
      "QDG6eK",
      "jWmYm7qr5nMoAUwZRjGtBxmz3KA1tkAj3ykkR6q2B2C",
    );

    const webhook = new Webhook(
      new Request("https://example.com/webhook?msg_signature=sig", {
        method: "POST",
        body: encryptor.encrypt(xmlBuild({ MsgType: "text" })),
      }),
      encryptor,
    );

    const res = await webhook.response();
    expect(res.status).toBe(400);
    expect(await res.text()).toContain("Invalid Request");
  });
});
