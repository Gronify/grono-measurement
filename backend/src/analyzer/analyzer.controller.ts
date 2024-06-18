import { Controller, Get, Query } from '@nestjs/common';
import { AnalyzerService } from './analyzer.service';
import { WeightsAnalyzerDto } from './dto/weights-analyzer.dto';

@Controller('analyzer')
export class AnalyzerController {
  constructor(private readonly analyzerService: AnalyzerService) {}

  @Get()
  async getAnalyze(
    @Query()
    query: {
      url: string;
      fcp: number;
      lcp: number;
      fmp: number;
      si: number;
      tbt: number;
      mpf: number;
      cls: number;
      srt: number;
      tti: number;
      m: number;
    },
  ): Promise<any> {
    const weights: WeightsAnalyzerDto = {
      firstContentfulPaint: query.fcp,
      largestContentfulPaint: query.lcp,
      firstMeaningfulPaint: query.fmp,
      speedIndex: query.si,
      totalBlockingTime: query.tbt,
      maxPotentialFid: query.mpf,
      cumulativeLayoutShift: query.cls,
      serverResponseTime: query.srt,
      timeToInteractive: query.tti,
      metrics: query.m,
    };

    return await this.analyzerService.getAnalyze(query.url, weights);
  }
}
