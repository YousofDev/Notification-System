import http from "http";
import app from "src/app";
import { closeRabbitMQ, initRabbitMQ } from "@config/rabbitmq";
import { connectMongo, disconnectMongo } from "@config/mongodb";
import { closeSocket, initSocket } from "@config/socket";
import { startEmailConsumer } from "@consumers/emailConsumer";

let server: http.Server;

export async function startTestServer(): Promise<http.Server> {
  server = http.createServer(app);

  initSocket(server);
  await initRabbitMQ();
  await connectMongo();
  await startEmailConsumer();

  return server;
}

export async function stopTestServer(): Promise<void> {
  server.close();
  await disconnectMongo();
  await closeRabbitMQ();
  closeSocket();
}
