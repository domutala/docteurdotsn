import { Module } from "@nestjs/common";
import * as admin from "firebase-admin";
import { readFileSync } from "fs";
import { join } from "path";
import { FirebaseAuthService } from "./admin.service";

@Module({
  controllers: [],
  providers: [
    {
      provide: "FIREBASE_ADMIN",
      useFactory: () => {
        const serviceAccount = readFileSync(
          join(process.cwd(), "firebase-adminsdk.json"),
          "utf-8",
        );

        return admin.initializeApp({
          credential: admin.credential.cert(JSON.parse(serviceAccount)),
          databaseURL: process.env.FIREBASE_DATABASE_URL,
        });
      },
    },
    FirebaseAuthService,
  ],
  exports: ["FIREBASE_ADMIN", FirebaseAuthService],
})
export class FirebaseAdminModule {}
