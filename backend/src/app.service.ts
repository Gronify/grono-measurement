import { Injectable } from '@nestjs/common';
import http from 'http';
import https from 'https';
import puppeteer from 'puppeteer';
const fetch = require('node-fetch');

@Injectable()
export class AppService {
  async getTTFB(): Promise<string> {
    // Example usage
    const url = 'https://www.google.com.ua/';
    // https://vbd.org.ua/ https://www.google.com.ua/
    const protocol = url.startsWith('https') ? https : http;

    try {
      //   return (await this.getTTFB(url)).toString()
      const startTime = process.hrtime();
      const response = await new Promise((resolve, reject) => {
        protocol
          .get(url, (res) => resolve(res))
          .on('error', (err) => reject(err));
      });

      const endTime = process.hrtime(startTime);
      const timeToFirstByte = endTime[0] * 1000 + endTime[1] / 1e6; // Convert to milliseconds

      return `timeToFirstByte: ${timeToFirstByte.toString()}`;
    } catch (error) {
      return `Error fetching ${url}: ${error.message}`;
      throw new Error(`Error fetching ${url}: ${error.message}`);
    }
  }

  async getTimeToInteractive(config = null): Promise<string> {
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
    // Extract Time to Interactive (TTI) from Lighthouse result
    // const tti = lhr.audits['interactive'].numericValue;

    // console.log(tti);

    // console.log(typeof reportGenerator);
    // console.log(reportGenerator);
    // const json = reportGenerator.generateReportHtml(lhr);

    // const audits = JSON.parse(json).audits; // Lighthouse audits
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

  //  async getTimeToInteractive(): Promise<string> {
  //   // Example usage
  //   const url = 'https://www.google.com.ua/';
  //    // Dynamically import chrome-launcher
  //    const chromeLauncher = await (eval(`import('chrome-launcher')`) as Promise<any>);

  //    // Launch Chrome using chrome-launcher
  //    const chrome = await chromeLauncher.launch();
  //    const options = { port: chrome.port };

  //    // Connect Puppeteer to the launched Chrome instance

  //    const browser = await puppeteer.connect(options);
  //    const page = await browser.newPage();

  //    // Navigate to the specified URL
  //    await page.goto(url, { waitUntil: 'domcontentloaded' });

  //    // Run Lighthouse to get performance metrics
  //   // Dynamically import
  //   const lighthouse = await (eval(`import('lighthouse')`) as Promise<any>);

  //    const lighthouseResult = await lighthouse.default(url, { port: chrome.port });

  //    // Extract Time to Interactive (TTI) from Lighthouse result
  //    const tti = lighthouseResult.lhr.audits['interactive'].numericValue;

  //    // Close the Puppeteer connection and Chrome instance
  //    await browser.close();
  //    await chrome.kill();

  //    console.log(tti)
  //   return "123"

  // }

  // //Time to Interactive:
  // async getTimeToInteractive(): Promise<string> {
  //   // Example usage

  //   const url = 'https://www.google.com.ua/';
  //   // Launch Puppeteer browser
  //   // this.measurePerformance(url);
  //   const browser = await puppeteer.launch({
  //     product: 'chrome',
  //     headless: false,
  //   });
  //   const page = await browser.newPage();

  //   try {
  //     // Navigate to the specified URL
  //     await page.goto(url, { waitUntil: 'domcontentloaded' });

  //     // Run Lighthouse
  //     //@ts-ignore
  //     const { lhr } = await lighthouse(url, { port: new URL(browser.wsEndpoint()).port });

  //     // Extract relevant metrics
  //     const metrics = {
  //       firstContentfulPaint: lhr.audits['first-contentful-paint'].numericValue,
  //       largestContentfulPaint: lhr.audits['largest-contentful-paint'].numericValue,
  //       speedIndex: lhr.audits['speed-index'].numericValue,
  //       cumulativeLayoutShift: lhr.audits['cumulative-layout-shift'].numericValue,
  //       totalBlockingTime: lhr.audits['total-blocking-time'].numericValue,
  //       timeToFirstByte: lhr.audits['time-to-first-byte'].numericValue,
  //       onloadTime: lhr.audits['onload'].numericValue,
  //       timeToInteractive: lhr.audits['interactive'].numericValue,
  //       fullyLoadedTime: lhr.audits['first-meaningful-paint'].numericValue,
  //     };

  //     const firstPaint = JSON.parse(
  //       await page.evaluate(() =>
  //         JSON.stringify(performance.getEntriesByName('first-paint')),
  //       ),
  //     );

  //     const firstContentfulPaint = JSON.parse(
  //       await page.evaluate(() =>
  //         JSON.stringify(
  //           performance.getEntriesByName('first-contentful-paint'),
  //         ),
  //       ),
  //     );
  //     // dump page metrics
  //     // const metrics = await page.metrics();

  //     // Get performance entries
  //     const rawPerfEntries = await page.evaluate(function () {
  //       return JSON.stringify(window.performance.getEntries());
  //     });

  //     // Parsing string
  //     const allPerformanceEntries = JSON.parse(rawPerfEntries);

  //     // Find FirstContentfulPaing
  //     const fcp = allPerformanceEntries.find(
  //       (x) => x.name === 'first-contentful-paint',
  //     );

  //     // Find timeToFirstByte
  //     const navigationEvent = allPerformanceEntries.find(
  //       (x) => x.entryType === 'navigation',
  //     ) as PerformanceNavigationTiming;

  //     // Find largestContentfulPaint
  //     const largestContentfulPaint = await page.evaluate(() => {
  //       return new Promise((resolve) => {
  //         new PerformanceObserver((l) => {
  //           const entries = l.getEntries();
  //           // the last entry is the largest contentful paint
  //           const largestPaintEntry = entries.at(-1);
  //           resolve(largestPaintEntry.startTime);
  //         }).observe({
  //           type: 'largest-contentful-paint',
  //           buffered: true,
  //         });
  //       });
  //     });

  //     return `timeToFirstByte: ${navigationEvent.responseStart.toString()} \n
  //      first-contentful-paint: ${fcp.startTime.toString()} \n
  //     largestContentfulPaint: ${largestContentfulPaint.toString()} \n
  //     First paint: ${firstPaint[0].startTime}\n
  //     First paint: ${firstContentfulPaint[0].startTime}`;
  //   } finally {
  //     // Close the Puppeteer browser
  //     await browser.close();
  //   }
  // }
}
