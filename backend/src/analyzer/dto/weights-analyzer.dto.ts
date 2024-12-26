export class WeightsAnalyzerDto {
  readonly firstContentfulPaint: number;
  readonly largestContentfulPaint: number;
  readonly speedIndex: number;
  readonly totalBlockingTime: number;
  readonly maxPotentialFid: number;
  readonly cumulativeLayoutShift: number;
  readonly serverResponseTime: number;
  readonly timeToInteractive: number;
  readonly metrics: number;
}
//  fcp: 1;
//  lcp: 1;
//  fmp: 1;
//  si: 1;
//  tbt: 1;
//  mpf: 1;
//  cls: 1;
//  srt: 1;
//  tti: 1;
