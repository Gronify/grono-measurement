import { Injectable } from '@nestjs/common';
import puppeteer from 'puppeteer';
import { MeasurementDto } from './dto/measurement.dto';
import { MeasurementGateway } from './measurement.gateway';
import { Console } from 'console';
const fetch = require('node-fetch');

// import defaultConfig from '../../lighthouse-config';

@Injectable()
export class MeasurementService {
  constructor(private gateway: MeasurementGateway) {}
  async getMeasurement(url: string, clientId: string): Promise<MeasurementDto> {
    const options = {
      headless: true,
      args: ['--no-sandbox'],
      logLevel: 'silent',
      disableDeviceEmulation: true,
      chromeFlags: [
        '--emulated-form-factor=desktop',
        '--no-first-run',
        '--headless',
        '--disable-gpu',
        '--no-sandbox',
        '--disable-dev-shm-usage',
      ],
      port: 0,
    };

    const lighthouseLogger = await (eval(
      `import('lighthouse-logger')`,
    ) as Promise<any>);

    lighthouseLogger.default.level = 'verbose';

    lighthouseLogger.default.events.removeAllListeners('status');
    lighthouseLogger.default.events.on('status', (message) => {
      const [title, ...argsArray] = message;
      if (title === 'status') {
        this.gateway.sendLog(clientId, argsArray[0]);
      }
    });

    // Launch chrome using chrome-launcher
    const chromeLauncher = await (eval(
      `import('chrome-launcher')`,
    ) as Promise<any>);
    const chrome = await chromeLauncher.launch(options);
    //@ts-ignore
    options.port = chrome.port;

    // Connect chrome-launcher to puppeteer
    const urlToAnalyze = `http://localhost:${options.port}/json/version`;
    const response = await fetch(urlToAnalyze);
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
        logLevel: 'silent',
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
            'largest-contentful-paint',
            'speed-index',
            'total-blocking-time',
            'max-potential-fid',
            'cumulative-layout-shift',
            'server-response-time',
            'interactive',
            'metrics',
          ],
          onlyCategories: ['performance'],
          // emulatedFormFactor: 'mobile',
          // formFactor: 'mobile',
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
          // screenEmulation: {
          //   mobile: true,
          //   width: 375,
          //   height: 812,
          //   deviceScaleFactor: 2.625,
          //   disabled: false,
          // },
          screenEmulation: {
            mobile: false,
            width: 1350,
            height: 940,
            deviceScaleFactor: 1,
            disabled: false,
          },
          // emulatedUserAgent:
          //   'Mozilla/5.0 (iPhone; CPU iPhone OS 12_0 like Mac OS X) AppleWebKit/537.36 (KHTML, like Gecko) Version/12.0 Mobile/15A372 Safari/537.36',
          emulatedUserAgent:
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4143.7 Safari/537.36 Chrome-Lighthouse',
        },
      },
    );
    await browser.disconnect();
    await chrome.kill();
    clearTimeout(chromeKillTimeout);

    const firstContentfulPaint =
      lhr.audits['first-contentful-paint'].numericValue;
    const largestContentfulPaint =
      lhr.audits['largest-contentful-paint'].numericValue;
    const speedIndex = lhr.audits['speed-index'].numericValue;
    const totalBlockingTime = lhr.audits['total-blocking-time'].numericValue;
    const maxPotentialFid = lhr.audits['max-potential-fid'].numericValue;
    const cumulativeLayoutShift =
      lhr.audits['cumulative-layout-shift'].numericValue;
    const serverResponseTime = lhr.audits['server-response-time'].numericValue;
    const timeToInteractive = lhr.audits['interactive'].numericValue;
    const metrics = lhr.audits['metrics'].numericValue;

    this.gateway.sendLog(clientId, 'Success!');

    const res = {
      firstContentfulPaint: firstContentfulPaint,
      largestContentfulPaint: largestContentfulPaint,
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
