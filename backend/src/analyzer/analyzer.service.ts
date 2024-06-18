import { Injectable } from '@nestjs/common';
import { WeightsAnalyzerDto } from './dto/weights-analyzer.dto';
import { MeasurementService } from 'src/measurement/measurement.service';

@Injectable()
export class AnalyzerService {
  constructor(private measurementService: MeasurementService) {}
  async getAnalyze(url: string, weights: WeightsAnalyzerDto): Promise<any> {
    const measurement = await this.measurementService.getMeasurement(url);
    const getAnalyzeScore = function (m, k) {
      return Object.keys(m).reduce(function (acc, mkey) {
        return k.hasOwnProperty(mkey) ? acc + m[mkey] * k[mkey] : acc;
      }, 0);
    };

    const analyzeScore = getAnalyzeScore(measurement, weights);

    return { analyzeScore: analyzeScore, measurement: measurement };
  }
}
