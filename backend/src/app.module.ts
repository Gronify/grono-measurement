import { Module } from '@nestjs/common';

import { MeasurementModule } from './measurement/measurement.module';
import { AnalyzerModule } from './analyzer/analyzer.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    MeasurementModule,
    AnalyzerModule,
    PrismaModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  providers: [],
})
export class AppModule {}
