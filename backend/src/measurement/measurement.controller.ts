import { Controller, Get, Query } from '@nestjs/common';
import { MeasurementService } from './measurement.service';
import { MeasurementDto } from './dto/measurement.dto';

@Controller('measurement')
export class MeasurementController {
  constructor(private readonly measurementService: MeasurementService) {}
  @Get()
  getMeasurement(@Query() query: { url: string }): Promise<MeasurementDto> {
    return this.measurementService.getMeasurement(query.url);
  }
}
