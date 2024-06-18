import { Module } from '@nestjs/common';

import { MeasurementModule } from './measurement/measurement.module';
import { AnalyzerModule } from './analyzer/analyzer.module';

@Module({
  imports: [MeasurementModule, AnalyzerModule],
  providers: [],
})
export class AppModule {}
