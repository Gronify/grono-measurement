import { Module, forwardRef } from '@nestjs/common';
import { AnalyzerService } from './analyzer.service';
import { AnalyzerController } from './analyzer.controller';
import { MeasurementModule } from 'src/measurement/measurement.module';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [AnalyzerController],
  imports: [
    forwardRef(() => MeasurementModule),
    forwardRef(() => PrismaModule),
  ],
  providers: [AnalyzerService],
})
export class AnalyzerModule {}
