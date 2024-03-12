import { Injectable } from '@nestjs/common';
import puppeteer from 'puppeteer';
const fetch = require('node-fetch');

@Injectable()
export class MeasurementService {
  async getMeasurement(config = null): Promise<string> {
    const url = 'https://www.google.com.ua/';
    // https://vbd.org.ua/ https://www.google.com.ua/
    const options = {
      logLevel: 'info',
      disableDeviceEmulation: true,
      chromeFlags: ['--disable-mobile-emulation'],
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

    const { lhr } = await lighthouse.default(url, options, config);
    await browser.disconnect();
    await chrome.kill();
    const reportGenerator = await (eval(
      `import('lighthouse/report/generator/report-generator.js')`,
    ) as Promise<any>);

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

    console.log(`\n
         Lighthouse metrics:
         🎨 First Contentful Paint: ${firstContentfulPaint},
         🎨 Largest Contentful Paint: ${largestContentfulPaint},
         🎨 first-meaningful-paint: ${firstMeaningfulPaint},
         🎨 speed-index: ${speedIndex},
         ⌛️ Total Blocking Time: ${totalBlockingTime},
         ⌛️ max-potential-fid: ${maxPotentialFid},
         ⌛️ cumulative-layout-shift: ${cumulativeLayoutShift},
         ⌛️ server-response-time(TTFB): ${serverResponseTime},
         👆 Time To Interactive: ${timeToInteractive}),
         👆 Collects all available metrics: ${metrics}`);

    return lhr;
  }
}
