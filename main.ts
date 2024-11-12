import { NestFactory } from "@nestjs/core";
import { AppModule } from "./apps/module";
import { json } from "express";
import { Logger } from "@nestjs/common";

import utils from "utils/forge";
import { sign } from "utils/jwt";

async function bootstrap() {
  utils.generate();

  const app = await NestFactory.create(AppModule, { cors: { origin: "*" } });

  app.setGlobalPrefix(process.env.ROUTE_PREFIX);
  app.use(json({ limit: "50mb" }));

  const port = process.env.PORT || 3000;
  await app.listen(port);

  Logger.log(
    `v-${process.env.npm_package_version} listen at http://localhost:${port}`,
  );
}
bootstrap();
