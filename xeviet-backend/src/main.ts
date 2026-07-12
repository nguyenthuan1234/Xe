import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  app.enableCors({
    origin: config.get<string>("CORS_ORIGIN", "http://localhost:3000"),
    credentials: true,
  });

  app.setGlobalPrefix("api");

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // loại bỏ field không khai báo trong DTO
      forbidNonWhitelisted: false,
      transform: true, // tự chuyển kiểu (vd: query string -> number)
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const port = config.get<number>("PORT", 3001);
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`🚗 XeViệt API đang chạy tại: http://localhost:${port}/api`);
}
bootstrap();
