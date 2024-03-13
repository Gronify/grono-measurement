import { Module } from '@nestjs/common';

import { AppService } from './app.service.js';
import { MeasurementModule } from './measurement/measurement.module';

@Module({
  imports: [MeasurementModule],
  providers: [AppService],
})
export class AppModule {}
