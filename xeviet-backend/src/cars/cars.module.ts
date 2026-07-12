import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { CarsService } from "./cars.service";
import { CarsController } from "./cars.controller";
import { Car, CarSchema } from "./schemas/car.schema";

@Module({
  imports: [MongooseModule.forFeature([{ name: Car.name, schema: CarSchema }])],
  controllers: [CarsController],
  providers: [CarsService],
  exports: [MongooseModule],
})
export class CarsModule {}
