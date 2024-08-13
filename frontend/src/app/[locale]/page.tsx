"use client";
import axios from "axios";
import moment from "moment";
import Image from "next/image";
import { useEffect, useState } from "react";
import "chart.js/auto";
import { Bar } from "react-chartjs-2";
import io, { Socket } from 'socket.io-client';
import { useDictionary } from "./components/dictionary-provider";
import LanguageSwitcher from "./components/LanguageSwitcher";

interface IMeasurementChartDataset {
  label: string;
  data: number[];
}

interface IHistory {
  id: string;
  url: string;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  firstMeaningfulPaint: number;
  speedIndex: number;
  totalBlockingTime: number;
  maxPotentialFid: number;
  cumulativeLayoutShift: number;
  serverResponseTime: number;
  timeToInteractive: number;
  metrics: number;
  analyzeScore: number;
  weightFirstContentfulPaint: number;
  weightLargestContentfulPaint: number;
  weightFirstMeaningfulPaint: number;
  weightSpeedIndex: number;
  weightTotalBlockingTime: number;
  weightMaxPotentialFid: number;
  weightCumulativeLayoutShift: number;
  weightServerResponseTime: number;
  weightTimeToInteractive: number;
  weightMetrics: number;
  createdAt: string;
  updatedAt: string;
}
function getRandomNumber(max: number) {
  return Math.floor(Math.random() * max);
}

const progressMapping: { [key: string]: number } = {
  "Initialize config": 0,
  "Connecting to browser": 5 + getRandomNumber(4),
  "Preparing network conditions": 10 + getRandomNumber(4),
  "Computing artifact: NetworkRecords": 15 + getRandomNumber(4),
  "Getting artifact: DOMStats": 20 + getRandomNumber(4),
  "Getting artifact: Scripts": 25 + getRandomNumber(4),
  "Computing artifact: ProcessedNavigatio": 30 + getRandomNumber(4),
  "Getting artifact: ViewportDimensions": 35 + getRandomNumber(4),
  "Computing artifact: SpeedIndex": 40 + getRandomNumber(4),
  "Computing artifact: TotalBlockingTime": 45 + getRandomNumber(4),
  "Computing artifact: MaxPotentialFID": 50 + getRandomNumber(4),
  "Computing artifact: UserTimings": 55 + getRandomNumber(4),
  "Computing artifact: TimingSummary": 60 + getRandomNumber(4),
  "Computing artifact: LCPImageRecord": 65 + getRandomNumber(4),
  "Auditing: Avoid large layout shifts": 70 + getRandomNumber(4),
  "Auditing: Minify CSS": 75 + getRandomNumber(4),
  "Auditing: Efficiently encode images": 80 + getRandomNumber(4),
  "Computing artifact: ImageRecords": 85 + getRandomNumber(4),
  "Auditing: Use HTTP/2": 90 + getRandomNumber(4),
  "Generating results...": 95 + getRandomNumber(4),
  "Success!": 100,
};

export default function Home({ params: { locale } }: { params: { locale: string } }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [lastMessage, setLastMessage] = useState<string>('');
  const [progress, setProgress] = useState<number>(0);
  const dictionary = useDictionary()
  const [url, setUrl] = useState("");
  const [weights, setWeights] = useState({
    firstContentfulPaint: 0.55,
    largestContentfulPaint: 0.55,
    firstMeaningfulPaint: 0.55,
    speedIndex: 0.55,
    totalBlockingTime: 0.55,
    maxPotentialFid: 0.55,
    cumulativeLayoutShift: 0.55,
    serverResponseTime: 0.55,
    timeToInteractive: 0.55,
    metrics: 0,
  });
  const [data, setData] = useState({
    analyzeScore: 0,
    measurement: {
      firstContentfulPaint: 0,
      largestContentfulPaint: 0,
      firstMeaningfulPaint: 0,
      speedIndex: 0,
      totalBlockingTime: 0,
      maxPotentialFid: 0,
      cumulativeLayoutShift: 0,
      serverResponseTime: 0,
      timeToInteractive: 0,
      metrics: 0,
    },
  });
  const [history, setHistory] = useState<IHistory[]>([]);
  const [chartLabels, setChartLabels] = useState<String[]>([
    `${dictionary.page.analyzeScore} (${dictionary.page.lower_better})`,
    `${dictionary.page.firstContentfulPaint} (${dictionary.page.lower_better})`,
    `${dictionary.page.largestContentfulPaint} (${dictionary.page.lower_better})`,
    `${dictionary.page.firstMeaningfulPaint} (${dictionary.page.lower_better})`,
    `${dictionary.page.speedIndex} (${dictionary.page.lower_better})`,
    `${dictionary.page.totalBlockingTime} (${dictionary.page.lower_better})`,
    `${dictionary.page.maxPotentialFid} (${dictionary.page.lower_better})`,
    `${dictionary.page.cumulativeLayoutShift} (${dictionary.page.lower_better})`,
    `${dictionary.page.serverResponseTime} (${dictionary.page.lower_better})`,
    `${dictionary.page.timeToInteractive} (${dictionary.page.lower_better})`,
    `${dictionary.page.metrics} (${dictionary.page.lower_better})`,

  ]);
  const [compareList, setCompareList] = useState<IHistory[]>([]);

  const [chartDataset, setChartDataset] = useState<IMeasurementChartDataset[]>(
    []
  );

  const handleChange = (prop: any) => (event: any) => {
    setUrl(event.target.value);
  };

  const handleRangeChange = (prop: any) => (event: any) => {
    // dispatch(humanUpdateAction({ ...human, [prop]: event.target.value }))
    setWeights({ ...weights, [prop]: event.target.value });
  };

  const updateHistory = () => {
    axios
      .get("http://localhost:5000/analyzer/analyzes", {
        params: { limit: 20 },
      })
      .then((response: any) => {
        setHistory(response.data);
      });
  };


  function send(url: string, weights: any) {

    const weightsForRequest = {
      fcp: parseFloat(weights.firstContentfulPaint),
      lcp: parseFloat(weights.largestContentfulPaint),
      fmp: parseFloat(weights.firstMeaningfulPaint),
      si: parseFloat(weights.speedIndex),
      tbt: parseFloat(weights.totalBlockingTime),
      mpf: parseFloat(weights.maxPotentialFid),
      cls: parseFloat(weights.cumulativeLayoutShift),
      srt: parseFloat(weights.serverResponseTime),
      tti: parseFloat(weights.timeToInteractive),
      m: parseFloat(weights.metrics),
    };
    if (socket) {

      axios
        .get("http://localhost:5000/analyzer", {
          params: { url: url, ...weightsForRequest, clientId: socket.id },
        })
        .then((response: any) => {
          setData(response.data);
          updateHistory();
        });
    }

  }

  useEffect(() => {
    updateHistory();

    const socketInstance = io('http://localhost:5000');
    setSocket(socketInstance);

    socketInstance.on('info', (message: string) => {
      setLastMessage(message);

      // Находим соответствующий прогресс для текущего сообщения
      const matchedProgress = Object.keys(progressMapping).find(key =>
        message.includes(key)
      );

      if (matchedProgress !== undefined) {
        setProgress(progressMapping[matchedProgress]);
      }
    });
    return () => {
      socketInstance.disconnect();
    };
  }, []);


  const chartOptions = {
    indexAxis: "y" as const,
    elements: {
      bar: {
        borderWidth: 2,
      },
    },
    responsive: true,
    plugins: {
      legend: {
        position: "right" as const,
      },
      title: {
        display: true,
        text: dictionary.page.compare_chart,
      },
    },
  };

  const handleChartDataset = () => {
    const backgroundColorList = [
      "rgba(255, 99, 132, 1)",
      "rgba(255, 205, 86, 1)",
      "rgba(54, 162, 235, 1)",
      "rgba(153, 102, 255, 1)",
      "rgba(255, 0, 234, 1)",
      "rgba(40, 199, 154, 1)",
      "rgba(255, 0, 43, 1)",
      "rgba(255, 247, 0, 1)",
      "rgba(0, 255, 60, 1)",
    ];
    const chartDataset = compareList.map((analysis, index) => {
      return {
        label: analysis.url,
        data: [
          analysis.analyzeScore,
          analysis.firstContentfulPaint,
          analysis.largestContentfulPaint,
          analysis.firstMeaningfulPaint,
          analysis.speedIndex,
          analysis.totalBlockingTime,
          analysis.maxPotentialFid,
          analysis.cumulativeLayoutShift,
          analysis.serverResponseTime,
          analysis.timeToInteractive,
          analysis.metrics,
        ],
        borderColor: "rgb(0, 0, 0, 0)",
        backgroundColor: backgroundColorList[index],
      };
    });

    setChartDataset(chartDataset);
  };

  useEffect(() => {
    handleChartDataset();
  }, [compareList]);

  const handleAddToCompare = (id: string) => {
    const indexOfAnalysisToAdd = history.findIndex(
      (analysis) => analysis.id === id
    );
    let filteredCompareList = compareList.filter(
      (analysis) => analysis.id == id
    );
    if (JSON.stringify(filteredCompareList) == JSON.stringify([])) {
      setCompareList((compareList) => [
        ...compareList,
        history[indexOfAnalysisToAdd],
      ]);
    }
  };

  const handleDeleteFromCompare = (id: string) => {
    let filteredCompareList = compareList.filter(
      (analysis) => analysis.id !== id
    );
    setCompareList(filteredCompareList);
  };

  return (
    <>
      <div className="flex justify-end m-6 mb-0">
        <LanguageSwitcher locale={locale} />
      </div>
      <main className="flex min-h-screen flex-col items-center justify-between p-12">


        <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
          <div className="max-w-xl mx-auto">
            <label className="block text-gray-700 font-bold mb-2">
              {dictionary.page.enter_url}
            </label>
            <div className="flex justify-center align-center gap-2 mb-4">
              <input
                type="text"
                id="url"
                name="url"
                placeholder={dictionary.page.enter_url}
                className="w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
                value={url}
                onChange={handleChange("")}
              />

              <button
                id="submitBtn"
                className=" text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5  dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                onClick={() => send(url, weights)}
              >
                {dictionary.page.submit}
              </button>
            </div>
            <div>

              <div className="mt-2">
                <h4>{dictionary.page.progress}:{lastMessage}</h4>
                <div style={{
                  width: '100%',
                  backgroundColor: '#e0e0e0',
                  borderRadius: '5px',
                }}>
                  <div style={{
                    width: `${progress}%`,
                    backgroundColor: '#76c7c0',
                    height: '24px',
                    borderRadius: '5px',
                    transition: 'width 0.3s ease-in-out',
                  }}></div>
                </div>
                <p>{progress.toFixed(0)}%</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <h1 className="font-bold text-xl text-center">
                {dictionary.page.score} {data.analyzeScore}
              </h1>
              <table className="w-full bg-white border rounded-lg">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-gray-600 font-bold border">
                      {dictionary.page.metric}
                    </th>
                    <th className="px-4 py-2 text-gray-600 font-bold border">
                      {dictionary.page.value}
                    </th>
                    <th className="px-4 py-2 text-gray-600 font-bold border">
                      {dictionary.page.weights}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-4 py-2 border">{dictionary.page.firstContentfulPaint}</td>
                    <td className="px-4 py-2 border">
                      {data.measurement.firstContentfulPaint}
                    </td>
                    <td className="px-4 py-2 border flex align-center">
                      <label
                        htmlFor="firstContentfulPaint"
                        className="mb-2 text-sm font-medium text-gray-900 "
                      >
                        {weights.firstContentfulPaint}{" "}
                      </label>
                      <input
                        type="range"
                        id="firstContentfulPaint"
                        min={0}
                        max={1}
                        step={0.01}
                        className="w-full h-2 m-2 bg-gray-200 rounded-lg appearance-none cursor-pointer "
                        value={weights.firstContentfulPaint}
                        onChange={handleRangeChange("firstContentfulPaint")}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 border">{dictionary.page.largestContentfulPaint}</td>
                    <td className="px-4 py-2 border">
                      {data.measurement.largestContentfulPaint}
                    </td>
                    <td className="px-4 py-2 border  flex align-center">
                      <label
                        htmlFor="largestContentfulPaint"
                        className="block mb-2 text-sm font-medium text-gray-900 "
                      >
                        {weights.largestContentfulPaint}{" "}
                      </label>
                      <input
                        type="range"
                        id="largestContentfulPaint"
                        min={0}
                        max={1}
                        step={0.01}
                        className="w-full h-2 m-2 bg-gray-200 rounded-lg appearance-none cursor-pointer "
                        value={weights.largestContentfulPaint}
                        onChange={handleRangeChange("largestContentfulPaint")}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 border">{dictionary.page.firstMeaningfulPaint}</td>
                    <td className="px-4 py-2 border">
                      {data.measurement.firstMeaningfulPaint}
                    </td>
                    <td className="px-4 py-2 border  flex align-center">
                      <label
                        htmlFor="firstMeaningfulPaint"
                        className="block mb-2 text-sm font-medium text-gray-900 "
                      >
                        {weights.firstMeaningfulPaint}{" "}
                      </label>
                      <input
                        type="range"
                        id="firstMeaningfulPaint"
                        min={0}
                        max={1}
                        step={0.01}
                        className="w-full h-2 m-2 bg-gray-200 rounded-lg appearance-none cursor-pointer "
                        value={weights.firstMeaningfulPaint}
                        onChange={handleRangeChange("firstMeaningfulPaint")}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 border">{dictionary.page.speedIndex}</td>
                    <td className="px-4 py-2 border">
                      {data.measurement.speedIndex}
                    </td>
                    <td className="px-4 py-2 border flex align-center">
                      <label
                        htmlFor="speedIndex"
                        className="block mb-2 text-sm font-medium text-gray-900 "
                      >
                        {weights.speedIndex}{" "}
                      </label>
                      <input
                        type="range"
                        id="speedIndex"
                        min={0}
                        max={1}
                        step={0.01}
                        className="w-full h-2 m-2 bg-gray-200 rounded-lg appearance-none cursor-pointer "
                        value={weights.speedIndex}
                        onChange={handleRangeChange("speedIndex")}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 border">{dictionary.page.totalBlockingTime}</td>
                    <td className="px-4 py-2 border">
                      {data.measurement.totalBlockingTime}
                    </td>
                    <td className="px-4 py-2 border flex align-center">
                      <label
                        htmlFor="totalBlockingTime"
                        className="block mb-2 text-sm font-medium text-gray-900 "
                      >
                        {weights.totalBlockingTime}{" "}
                      </label>
                      <input
                        type="range"
                        id="totalBlockingTime"
                        min={0}
                        max={1}
                        step={0.01}
                        className="w-full h-2 m-2 bg-gray-200 rounded-lg appearance-none cursor-pointer "
                        value={weights.totalBlockingTime}
                        onChange={handleRangeChange("totalBlockingTime")}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 border">{dictionary.page.maxPotentialFid}</td>
                    <td className="px-4 py-2 border">
                      {data.measurement.maxPotentialFid}
                    </td>
                    <td className="px-4 py-2 border flex align-center">
                      <label
                        htmlFor="maxPotentialFid"
                        className="block mb-2 text-sm font-medium text-gray-900 "
                      >
                        {weights.maxPotentialFid}{" "}
                      </label>
                      <input
                        type="range"
                        id="maxPotentialFid"
                        min={0}
                        max={1}
                        step={0.01}
                        className="w-full h-2 m-2 bg-gray-200 rounded-lg appearance-none cursor-pointer "
                        value={weights.maxPotentialFid}
                        onChange={handleRangeChange("maxPotentialFid")}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 border">{dictionary.page.cumulativeLayoutShift}</td>
                    <td className="px-4 py-2 border">
                      {data.measurement.cumulativeLayoutShift}
                    </td>
                    <td className="px-4 py-2 border flex align-center">
                      <label
                        htmlFor="cumulativeLayoutShift"
                        className="block mb-2 text-sm font-medium text-gray-900 "
                      >
                        {weights.cumulativeLayoutShift}{" "}
                      </label>
                      <input
                        type="range"
                        id="cumulativeLayoutShift"
                        min={0}
                        max={1}
                        step={0.01}
                        className="w-full h-2 m-2 bg-gray-200 rounded-lg appearance-none cursor-pointer "
                        value={weights.cumulativeLayoutShift}
                        onChange={handleRangeChange("cumulativeLayoutShift")}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 border">{dictionary.page.serverResponseTime}</td>
                    <td className="px-4 py-2 border">
                      {data.measurement.serverResponseTime}
                    </td>
                    <td className="px-4 py-2 border flex align-center">
                      <label
                        htmlFor="serverResponseTime"
                        className="block mb-2 text-sm font-medium text-gray-900 "
                      >
                        {weights.serverResponseTime}{" "}
                      </label>
                      <input
                        type="range"
                        id="serverResponseTime"
                        min={0}
                        max={1}
                        step={0.01}
                        className="w-full h-2 m-2 bg-gray-200 rounded-lg appearance-none cursor-pointer "
                        value={weights.serverResponseTime}
                        onChange={handleRangeChange("serverResponseTime")}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 border">{dictionary.page.timeToInteractive}</td>
                    <td className="px-4 py-2 border">
                      {data.measurement.timeToInteractive}
                    </td>
                    <td className="px-4 py-2 border flex align-center">
                      <label
                        htmlFor="timeToInteractive"
                        className="block mb-2 text-sm font-medium text-gray-900 "
                      >
                        {weights.timeToInteractive}{" "}
                      </label>
                      <input
                        type="range"
                        id="timeToInteractive"
                        min={0}
                        max={1}
                        step={0.01}
                        className="w-full h-2 m-2 bg-gray-200 rounded-lg appearance-none cursor-pointer "
                        value={weights.timeToInteractive}
                        onChange={handleRangeChange("timeToInteractive")}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 border">{dictionary.page.metrics}</td>
                    <td className="px-4 py-2 border">
                      {data.measurement.metrics}
                    </td>
                    <td className="px-4 py-2 border flex align-center">
                      <label
                        htmlFor="metrics"
                        className="block mb-2 text-sm font-medium text-gray-900 "
                      >
                        {weights.metrics}{" "}
                      </label>
                      <input
                        type="range"
                        id="metrics"
                        min={0}
                        max={1}
                        step={0.01}
                        className="w-full h-2 m-2 bg-gray-200 rounded-lg appearance-none cursor-pointer "
                        value={weights.metrics}
                        onChange={handleRangeChange("metrics")}
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="mx-auto mt-4">
          <table className="w-full bg-white border rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-gray-600 font-bold border">{dictionary.page.url}</th>
                <th className="px-4 py-2 text-gray-600 font-bold border">
                  {dictionary.page.score_table}
                </th>
                <th className="px-4 py-2 text-gray-600 font-bold border">
                  {dictionary.page.timestamp}
                </th>
                <th className="px-4 py-2 text-gray-600 font-bold border">
                  {dictionary.page.compare}
                </th>
              </tr>
            </thead>
            <tbody>
              {history.map((analysis, index) => {
                let filteredCompareList = compareList.filter(
                  (record) => record.id == analysis.id
                );
                let addButton = false;
                if (JSON.stringify(filteredCompareList) == JSON.stringify([])) {
                  addButton = true;
                }
                return (
                  <tr key={index}>
                    <td className="px-4 py-2 border">{analysis.url}</td>
                    <td className="px-4 py-2 border">{analysis.analyzeScore}</td>
                    <td className="px-4 py-2 border">
                      {moment(analysis.createdAt).format("DD.MM.YYYY hh:mm:ss")}
                    </td>

                    <td className="px-4 py-2 border flex align-center">
                      {addButton ? (
                        <button
                          type="button"
                          className="text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                          onClick={() => handleAddToCompare(analysis.id)}
                        >
                          {dictionary.page.compare_button}
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="text-white bg-red-700 hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900"
                          onClick={() => handleDeleteFromCompare(analysis.id)}
                        >
                          {dictionary.page.delete_button}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mx-auto w-full mt-4">
          <Bar
            options={chartOptions}
            data={{
              labels: chartLabels,
              datasets: chartDataset,
            }}
          ></Bar>
        </div>
      </main>
    </>
  );
}
