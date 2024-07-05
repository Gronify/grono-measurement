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
      fcp: string;
      lcp: string;
      fmp: string;
      si: string;
      tbt: string;
      mpf: string;
      cls: string;
      srt: string;
      tti: string;
      m: string;
    },
  ): Promise<any> {
    const weights: WeightsAnalyzerDto = {
      firstContentfulPaint: parseFloat(query.fcp as any as string),
      largestContentfulPaint: parseFloat(query.lcp as any as string),
      firstMeaningfulPaint: parseFloat(query.fmp as any as string),
      speedIndex: parseFloat(query.si as any as string),
      totalBlockingTime: parseFloat(query.tbt as any as string),
      maxPotentialFid: parseFloat(query.mpf as any as string),
      cumulativeLayoutShift: parseFloat(query.cls as any as string),
      serverResponseTime: parseFloat(query.srt as any as string),
      timeToInteractive: parseFloat(query.tti as any as string),
      metrics: parseFloat(query.m as any as string),
    };

    return await this.analyzerService.getAnalyze(query.url, weights);
  }

  @Get('analyzes')
  async getAnalyzes(
    @Query()
    query: {
      limit: string;
    },
  ): Promise<any> {
    return await this.analyzerService.getAnalyzes(parseInt(query.limit));
  }
}
