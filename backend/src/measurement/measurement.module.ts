import { Module } from '@nestjs/common';
import { MeasurementController } from './measurement.controller';
import { MeasurementService } from './measurement.service';
import { MeasurementGateway } from './measurement.gateway';

@Module({
  controllers: [MeasurementController],
  providers: [MeasurementService, MeasurementGateway],
  exports: [MeasurementService],
})
export class MeasurementModule {}
