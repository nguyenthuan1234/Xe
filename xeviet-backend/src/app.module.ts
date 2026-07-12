import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";

import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { CarsModule } from "./cars/cars.module";
import { CategoriesModule } from "./categories/categories.module";
import { UploadsModule } from "./uploads/uploads.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>("MONGODB_URI", "mongodb://localhost:27017/xeviet"),
      }),
    }),
    // Cho phép truy cập file ảnh đã upload qua http://localhost:3001/uploads/<file>
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, "..", "uploads"),
      serveRoot: "/uploads",
    }),
    AuthModule,
    UsersModule,
    CarsModule,
    CategoriesModule,
    UploadsModule,
  ],
})
export class AppModule {}
