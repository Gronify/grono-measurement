import { Controller, Get, Query } from '@nestjs/common';
import { MeasurementService } from './measurement.service';

@Controller('measurement')
export class MeasurementController {
  constructor(private readonly measurementService: MeasurementService) {}
  @Get()
  getMeasurement(@Query() query: { url: string }): Promise<any> {
    return this.measurementService.getMeasurement(query.url);
  }
}
