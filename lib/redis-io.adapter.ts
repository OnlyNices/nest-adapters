import { createAdapter, RedisAdapter } from "@socket.io/redis-adapter";
import { INestApplication, Logger } from "@nestjs/common";
import { IoAdapter } from "@nestjs/platform-socket.io";
import { Server, ServerOptions } from "socket.io";
import { createClient } from "redis";

export class RedisIoAdapter extends IoAdapter {
  private readonly logger = new Logger(RedisIoAdapter.name);

  protected redisAdapter: (nsp: any) => RedisAdapter;

  constructor(app: INestApplication, redisUrl: string) {
    super(app);

    const pubClient = createClient({ url: redisUrl });
    const subClient = pubClient.duplicate();

    pubClient
      .connect()
      .then(() => this.logger.log("Redis PubClient connected"));
    subClient
      .connect()
      .then(() => this.logger.log("Redis SubClient connected"));

    this.redisAdapter = createAdapter(pubClient, subClient);
  }

  createIOServer(port: number, options?: ServerOptions) {
    const server = super.createIOServer(port, options) as Server;
    server.adapter(this.redisAdapter);
    return server;
  }
}
