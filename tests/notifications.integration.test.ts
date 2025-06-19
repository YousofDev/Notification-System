import request from "supertest";
import env from "@config/env";
import { startTestServer, stopTestServer } from "./testServer";

let appServer: any;

beforeAll(async () => {
  appServer = await startTestServer();
});

afterAll(async () => {
  await stopTestServer();
});

describe("Notifications API", () => {
  const headers = {
    "x-api-key": env.apiKeys[0],
    "Content-Type": "application/json",
  };

  it("should queue email notification", async () => {
    const res = await request(appServer)
      .post("/api/v1/notifications/email")
      .set(headers)
      .send({
        to: "yousofdevpro@gmail.com",
        subject: "Test Email",
        templateName: "test-email",
        data: { name: "Test" },
      });

    expect(res.statusCode).toBe(202);
    expect(res.body.message).toMatch(/queued/i);
  });

  it("should queue websocket notification", async () => {
    const res = await request(appServer)
      .post("/api/v1/notifications/websocket")
      .set(headers)
      .send({
        userId: "test-user-id",
        event: "test:event",
        data: { ping: true },
      });

    expect(res.statusCode).toBe(202);
    expect(res.body.message).toMatch(/queued/i);
  });

  it("should return 401 for missing API key", async () => {
    const res = await request(appServer)
      .post("/api/v1/notifications/email")
      .send({ to: "fail@example.com" });

    expect(res.statusCode).toBe(401);
  });
});
