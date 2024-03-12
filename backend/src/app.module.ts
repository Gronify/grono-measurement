import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service.js';
import { MeasurementModule } from './measurement/measurement.module';

@Module({
  imports: [MeasurementModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
