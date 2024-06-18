export class MeasurementDto {
  readonly firstContentfulPaint: number;
  readonly largestContentfulPaint: number;
  readonly firstMeaningfulPaint: number;
  readonly speedIndex: number;
  readonly totalBlockingTime: number;
  readonly maxPotentialFid: number;
  readonly cumulativeLayoutShift: number;
  readonly serverResponseTime: number;
  readonly timeToInteractive: number;
  readonly metrics: number;
}
