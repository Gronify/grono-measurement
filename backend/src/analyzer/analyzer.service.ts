import { BadRequestException, Injectable } from '@nestjs/common';
import { WeightsAnalyzerDto } from './dto/weights-analyzer.dto';
import { MeasurementService } from 'src/measurement/measurement.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { MeasurementDto } from 'src/measurement/dto/measurement.dto';

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
      console.log('analyzeCreate');
      console.log(analyze.analyzeScore);
      return analyzeCreate;
    } catch (error) {
      console.log(error);
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
      k.weightCumulativeLayoutShift = k.weightCumulativeLayoutShift * 10000;
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
      console.log('analyzes');
      console.log(analyzes);
      return analyzes;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') throw new BadRequestException('taken');
      }
    }
  }
}
