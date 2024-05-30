import { Injectable } from '@nestjs/common';
import puppeteer from 'puppeteer';
const fetch = require('node-fetch');
import defaultConfig from '../../lighthouse-config';

@Injectable()
export class MeasurementService {
  async getMeasurement(url: string): Promise<any> {
    const options = {
      headless: true,
      args: ['--no-sandbox'],
      logLevel: 'info',
      disableDeviceEmulation: true,
      chromeFlags: [
        '--emulated-form-factor=desktop',
        '--no-first-run',
        // '--headless',
        '--disable-gpu',
        '--no-sandbox',
        '--disable-dev-shm-usage',
      ],
      port: 0,
    };

    // Launch chrome using chrome-launcher
    const chromeLauncher = await (eval(
      `import('chrome-launcher')`,
    ) as Promise<any>);
    const chrome = await chromeLauncher.launch(options);
    //@ts-ignore
    options.port = chrome.port;

    // Connect chrome-launcher to puppeteer
    const url1 = `http://localhost:${options.port}/json/version`;
    const response = await fetch(url1);
    const data = await response.json();

    const resp = data;

    const browser = await puppeteer.connect({
      browserWSEndpoint: resp.webSocketDebuggerUrl,
    });
    // Run Lighthouse

    const lighthouse = await (eval(`import('lighthouse')`) as Promise<any>);
    const chromeKillTimeout = setTimeout(() => {
      chrome.kill();
    }, 120000);

    const { lhr } = await lighthouse.default(
      url,
      {
        port: options.port,
        logLevel: 'info',
        disableDeviceEmulation: true,
        debugNavigation: false,
        disableFullPageScreenshot: true,

        // auditMode: true,
        // gatherMode: true,
        usePassiveGathering: true,
      },
      {
        extends: 'lighthouse:default',
        settings: {
          onlyAudits: [
            'first-contentful-paint',
            'first-meaningful-paint',
            'largest-contentful-paint',
            'first-meaningful-paint',
            'speed-index',
            'total-blocking-time',
            'max-potential-fid',
            'cumulative-layout-shift',
            'server-response-time',
            'interactive',
            'metrics',
          ],
          onlyCategories: ['performance'],
          emulatedFormFactor: 'none',
          formFactor: 'desktop',
          throttling: {
            rttMs: 40,
            throughputKbps: 10240,
            cpuSlowdownMultiplier: 1,
            requestLatencyMs: 0,
            downloadThroughputKbps: 0,
            uploadThroughputKbps: 0,
          },
          screenEmulation: {
            mobile: false,
            width: 1350,
            height: 940,
            deviceScaleFactor: 1,
            disabled: false,
          },
          emulatedUserAgent:
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4143.7 Safari/537.36 Chrome-Lighthouse',
        },
      },
    );
    await browser.disconnect();
    await chrome.kill();
    clearTimeout(chromeKillTimeout);
    // const reportGenerator = await (eval(
    //   `import('lighthouse/report/generator/report-generator.js')`,
    // ) as Promise<any>);

    const firstContentfulPaint =
      lhr.audits['first-contentful-paint'].numericValue;
    const largestContentfulPaint =
      lhr.audits['largest-contentful-paint'].numericValue;
    const firstMeaningfulPaint =
      lhr.audits['first-meaningful-paint'].numericValue;
    const speedIndex = lhr.audits['speed-index'].numericValue;
    const totalBlockingTime = lhr.audits['total-blocking-time'].numericValue;
    const maxPotentialFid = lhr.audits['max-potential-fid'].numericValue;
    const cumulativeLayoutShift =
      lhr.audits['cumulative-layout-shift'].numericValue;
    const serverResponseTime = lhr.audits['server-response-time'].numericValue;
    const timeToInteractive = lhr.audits['interactive'].numericValue;
    const metrics = lhr.audits['metrics'].numericValue;

    console.log('Success');

    const res = {
      firstContentfulPaint: firstContentfulPaint,
      largestContentfulPaint: largestContentfulPaint,
      firstMeaningfulPaint: firstMeaningfulPaint,
      speedIndex: speedIndex,
      totalBlockingTime: totalBlockingTime,
      maxPotentialFid: maxPotentialFid,
      cumulativeLayoutShift: cumulativeLayoutShift,
      serverResponseTime: serverResponseTime,
      timeToInteractive: timeToInteractive,
      metrics: metrics,
    };

    return res;
  }
}
