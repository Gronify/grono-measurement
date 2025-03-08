import { BadRequestException, Injectable } from '@nestjs/common';
import { WeightsAnalyzerDto } from './dto/weights-analyzer.dto';
import { MeasurementService } from 'src/measurement/measurement.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { MeasurementDto } from 'src/measurement/dto/measurement.dto';

interface AverageAnalysisParams {
  ids: number[];
  url: string;
  name: string;
  method: string;
  description: string;
}

@Injectable()
export class AnalyzerService {
  constructor(
    private measurementService: MeasurementService,
    private prisma: PrismaService,
  ) {}

  async saveAnalyze(analyze: {
    url: string;
    analyzeScore: number;
    name: string;
    method: string;
    description: string;
    measurement: MeasurementDto;
    weights: WeightsAnalyzerDto;
  }) {
    try {
      const weightsRename = {
        weightFirstContentfulPaint: analyze.weights.firstContentfulPaint,
        weightLargestContentfulPaint: analyze.weights.largestContentfulPaint,
        weightSpeedIndex: analyze.weights.speedIndex,
        weightTotalBlockingTime: analyze.weights.totalBlockingTime,
        weightMaxPotentialFid: analyze.weights.maxPotentialFid,
        weightCumulativeLayoutShift: analyze.weights.cumulativeLayoutShift,
        weightServerResponseTime: analyze.weights.serverResponseTime,
        weightTimeToInteractive: analyze.weights.timeToInteractive,
        weightMetrics: analyze.weights.metrics,
      };
      const analyzeCreate = await this.prisma.analyze.create({
        data: {
          url: analyze.url,
          ...analyze.measurement,
          analyzeScore: analyze.analyzeScore,
          ...weightsRename,
          name: analyze.name,
          method: analyze.method,
          description: analyze.description,
        },
      });
      return analyzeCreate;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') throw new BadRequestException('taken');
      }
    }
  }

  async getAnalyze(
    url: string,
    weights: WeightsAnalyzerDto,
    clientId: string,
    name: string,
    method: string,
    description: string,
  ): Promise<any> {
    const measurement = await this.measurementService.getMeasurement(
      url,
      clientId,
    );
    const getAnalyzeScore = function (m, k) {
      return Object.keys(m).reduce(function (acc, mkey) {
        return k.hasOwnProperty(mkey) ? acc + m[mkey] * k[mkey] : acc;
      }, 0);
    };

    const analyzeScore = getAnalyzeScore(measurement, weights);
    await this.saveAnalyze({
      url: url,
      name: name,
      method: method,
      description: description,
      analyzeScore: analyzeScore,
      measurement: measurement,
      weights: weights,
    });

    return { analyzeScore: analyzeScore, measurement: measurement };
  }

  async getAnalyzes(limit: number) {
    try {
      const analyzes = await this.prisma.analyze.findMany({
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      });
      return analyzes;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') throw new BadRequestException('taken');
      }
    }
  }

  async createAverageAnalysis({
    ids,
    url,
    name,
    method,
    description,
  }: AverageAnalysisParams): Promise<any> {
    const analyses = await this.prisma.analyze.findMany({
      where: { id: { in: ids } },
    });

    const first = analyses[0];

    const metricKeys = [
      'firstContentfulPaint',
      'largestContentfulPaint',
      'speedIndex',
      'totalBlockingTime',
      'maxPotentialFid',
      'cumulativeLayoutShift',
      'serverResponseTime',
      'timeToInteractive',
      'metrics',
      'analyzeScore',
    ] as const;

    const averages = metricKeys.reduce(
      (acc, key) => {
        const sum = analyses.reduce((sum, a) => sum + a[key], 0);
        acc[key] = sum / analyses.length;
        return acc;
      },
      {} as Record<(typeof metricKeys)[number], number>,
    );

    return this.prisma.analyze.create({
      data: {
        url,
        name,
        method,
        description,
        ...averages,
        weightFirstContentfulPaint: first.weightFirstContentfulPaint,
        weightLargestContentfulPaint: first.weightLargestContentfulPaint,
        weightSpeedIndex: first.weightSpeedIndex,
        weightTotalBlockingTime: first.weightTotalBlockingTime,
        weightMaxPotentialFid: first.weightMaxPotentialFid,
        weightCumulativeLayoutShift: first.weightCumulativeLayoutShift,
        weightServerResponseTime: first.weightServerResponseTime,
        weightTimeToInteractive: first.weightTimeToInteractive,
        weightMetrics: first.weightMetrics,
      },
    });
  }
}
