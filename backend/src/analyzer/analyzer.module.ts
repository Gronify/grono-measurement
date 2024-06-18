import { Module, forwardRef } from '@nestjs/common';
import { AnalyzerService } from './analyzer.service';
import { AnalyzerController } from './analyzer.controller';
import { MeasurementModule } from 'src/measurement/measurement.module';

@Module({
  controllers: [AnalyzerController],
  imports: [forwardRef(() => MeasurementModule)],
  providers: [AnalyzerService],
})
export class AnalyzerModule {}
