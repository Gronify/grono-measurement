'use client';
import axios from 'axios';
import moment from 'moment';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import 'chart.js/auto';
import { Bar } from 'react-chartjs-2';
import io, { Socket } from 'socket.io-client';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import { useDictionary } from '@/components/dictionary-provider';
import { ModeToggle } from '@/components/ModeToggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Download, Send } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Slider } from '@/components/ui/slider';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface IMeasurementChartDataset {
  label: string;
  data: number[];
}

interface IHistory {
  id: string;
  url: string;
  name: string;
  method: string;
  description: string;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
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
  'Initialize config': 0,
  'Connecting to browser': 5 + getRandomNumber(4),
  'Preparing network conditions': 10 + getRandomNumber(4),
  'Computing artifact: NetworkRecords': 15 + getRandomNumber(4),
  'Getting artifact: DOMStats': 20 + getRandomNumber(4),
  'Getting artifact: Scripts': 25 + getRandomNumber(4),
  'Computing artifact: ProcessedNavigatio': 30 + getRandomNumber(4),
  'Getting artifact: ViewportDimensions': 35 + getRandomNumber(4),
  'Computing artifact: SpeedIndex': 40 + getRandomNumber(4),
  'Computing artifact: TotalBlockingTime': 45 + getRandomNumber(4),
  'Computing artifact: MaxPotentialFID': 50 + getRandomNumber(4),
  'Computing artifact: UserTimings': 55 + getRandomNumber(4),
  'Computing artifact: TimingSummary': 60 + getRandomNumber(4),
  'Computing artifact: LCPImageRecord': 65 + getRandomNumber(4),
  'Auditing: Avoid large layout shifts': 70 + getRandomNumber(4),
  'Auditing: Minify CSS': 75 + getRandomNumber(4),
  'Auditing: Efficiently encode images': 80 + getRandomNumber(4),
  'Computing artifact: ImageRecords': 85 + getRandomNumber(4),
  'Auditing: Use HTTP/2': 90 + getRandomNumber(4),
  'Generating results...': 95 + getRandomNumber(4),
  'Success!': 100,
};

const API = 'https://grono-measurement-backend-production.up.railway.app';

export default function Home({ params: { locale } }: { params: { locale: string } }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [lastMessage, setLastMessage] = useState<string>('');
  const [progress, setProgress] = useState<number>(0);
  const dictionary = useDictionary();
  const [dataForResearch, setDataForResearch] = useState({
    url: '',
    name: '',
    method: '',
    description: '',
    numberOfIterations: 1,
  });
  const [numberOfIterationsProgress, setNumberOfIterationsProgress] = useState<number>(0);

  const [weights, setWeights] = useState({
    firstContentfulPaint: 0.85,
    largestContentfulPaint: 0.78,
    speedIndex: 0.63,
    totalBlockingTime: 0.79,
    maxPotentialFid: 0.86,
    cumulativeLayoutShift: 0.86,
    serverResponseTime: 0.72,
    timeToInteractive: 0.75,
    metrics: 0,
  });

  const [data, setData] = useState({
    analyzeScore: 0,
    measurement: {
      firstContentfulPaint: 0,
      largestContentfulPaint: 0,
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
    `${dictionary.page.speedIndex} (${dictionary.page.lower_better})`,
    `${dictionary.page.totalBlockingTime} (${dictionary.page.lower_better})`,
    `${dictionary.page.maxPotentialFid} (${dictionary.page.lower_better})`,
    `${dictionary.page.cumulativeLayoutShift} (${dictionary.page.lower_better})`,
    `${dictionary.page.serverResponseTime} (${dictionary.page.lower_better})`,
    `${dictionary.page.timeToInteractive} (${dictionary.page.lower_better})`,
    `${dictionary.page.metrics} (${dictionary.page.lower_better})`,
  ]);
  const [compareList, setCompareList] = useState<IHistory[]>([]);
  const [averageList, setAverageList] = useState<IHistory[]>([]);
  const [chartDataset, setChartDataset] = useState<IMeasurementChartDataset[]>([]);

  const [dataForAverage, setDataForAverage] = useState({
    url: '',
    name: '',
    method: '',
    description: '',
  });

  const handleChange = (prop: any) => (event: any) => {
    setDataForResearch({ ...dataForResearch, [prop]: event.target.value });
    if (prop == 'numberOfIterations') {
      setNumberOfIterationsProgress(0);
    }
  };

  const handleChangeAverage = (prop: any) => (event: any) => {
    setDataForAverage({ ...dataForAverage, [prop]: event.target.value });
  };

  const handleRangeChange = (prop: any) => (value: any) => {
    setWeights({ ...weights, [prop]: value });
  };

  const updateHistory = () => {
    axios
      .get(`${API}/analyzer/analyzes`, {
        params: { limit: 1000 },
      })
      .then((response: any) => {
        if (response.data != '') {
          setHistory(response.data);
        }
      });
  };

  async function send(
    dataForResearch: {
      url: string;
      name: string;
      method: string;
      description: string;
      numberOfIterations: number;
    },
    weights: any,
  ) {
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
      setNumberOfIterationsProgress(0);
      for (let iteration = 0; iteration < dataForResearch.numberOfIterations; iteration++) {
        await axios
          .get(`${API}/analyzer`, {
            params: {
              url: dataForResearch.url,
              name: dataForResearch.name,
              method: dataForResearch.method,
              description: dataForResearch.description,
              ...weightsForRequest,
              clientId: socket.id,
            },
          })
          .then((response: any) => {
            setData(response.data);
            updateHistory();
          });
        setNumberOfIterationsProgress(iteration + 1);
      }
    }
  }

  useEffect(() => {
    updateHistory();

    const socketInstance = io(`${API}`);
    setSocket(socketInstance);

    socketInstance.on('info', (message: string) => {
      setLastMessage(message);

      // Находим соответствующий прогресс для текущего сообщения
      const matchedProgress = Object.keys(progressMapping).find(key => message.includes(key));

      if (matchedProgress !== undefined) {
        setProgress(progressMapping[matchedProgress]);
      }
    });
    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const chartOptions = {
    indexAxis: 'y' as const,
    elements: {
      bar: {
        borderWidth: 2,
      },
    },
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
      },
      title: {
        display: true,
        text: dictionary.page.compare_chart,
      },
    },
  };

  const handleChartDataset = () => {
    const backgroundColorList = [
      'rgba(255, 99, 132, 1)',
      'rgba(255, 205, 86, 1)',
      'rgba(54, 162, 235, 1)',
      'rgba(153, 102, 255, 1)',
      'rgba(255, 0, 234, 1)',
      'rgba(40, 199, 154, 1)',
      'rgba(255, 0, 43, 1)',
      'rgba(255, 247, 0, 1)',
      'rgba(0, 255, 60, 1)',
    ];
    const chartDataset = compareList.map((analysis, index) => {
      return {
        label: `${analysis.url} ${analysis.name} ${analysis.method}`,
        data: [
          analysis.analyzeScore,
          analysis.firstContentfulPaint,
          analysis.largestContentfulPaint,
          analysis.speedIndex,
          analysis.totalBlockingTime,
          analysis.maxPotentialFid,
          analysis.cumulativeLayoutShift * 10000,
          analysis.serverResponseTime,
          analysis.timeToInteractive,
          analysis.metrics,
        ],
        borderColor: 'rgb(0, 0, 0, 0)',
        backgroundColor: backgroundColorList[index],
      };
    });

    setChartDataset(chartDataset);
  };

  useEffect(() => {
    handleChartDataset();
  }, [compareList]);

  const handleAddToCompare = (id: string) => {
    const indexOfAnalysisToAdd = history.findIndex(analysis => analysis.id === id);
    let filteredCompareList = compareList.filter(analysis => analysis.id == id);
    if (JSON.stringify(filteredCompareList) == JSON.stringify([])) {
      setCompareList(compareList => [...compareList, history[indexOfAnalysisToAdd]]);
      let analysis = history[indexOfAnalysisToAdd];
      setData({
        analyzeScore: analysis.analyzeScore,
        measurement: {
          firstContentfulPaint: analysis.firstContentfulPaint,
          largestContentfulPaint: analysis.largestContentfulPaint,
          speedIndex: analysis.speedIndex,
          totalBlockingTime: analysis.totalBlockingTime,
          maxPotentialFid: analysis.maxPotentialFid,
          cumulativeLayoutShift: analysis.cumulativeLayoutShift,
          serverResponseTime: analysis.serverResponseTime,
          timeToInteractive: analysis.timeToInteractive,
          metrics: analysis.metrics,
        },
      });
      console.log(history);
    }
  };

  const handleDeleteFromCompare = (id: string) => {
    let filteredCompareList = compareList.filter(analysis => analysis.id !== id);
    setCompareList(filteredCompareList);
    setData({
      analyzeScore: 0,
      measurement: {
        firstContentfulPaint: 0,
        largestContentfulPaint: 0,
        speedIndex: 0,
        totalBlockingTime: 0,
        maxPotentialFid: 0,
        cumulativeLayoutShift: 0,
        serverResponseTime: 0,
        timeToInteractive: 0,
        metrics: 0,
      },
    });
  };

  const handleAddToAverage = (id: string) => {
    const indexOfAnalysisToAdd = history.findIndex(analysis => analysis.id === id);
    let filteredAverageList = compareList.filter(analysis => analysis.id == id);
    if (JSON.stringify(filteredAverageList) == JSON.stringify([])) {
      setAverageList(averageList => [...averageList, history[indexOfAnalysisToAdd]]);
      let analysis = history[indexOfAnalysisToAdd];
      setDataForAverage({
        url: analysis.url,
        name: analysis.name,
        method: analysis.method,
        description: analysis.description,
      });
    }
    console.log(averageList);
  };

  const handleDeleteFromAverage = (id: string) => {
    let filteredAverageList = averageList.filter(analysis => analysis.id !== id);
    setAverageList(filteredAverageList);
  };

  async function sendAverage(
    dataForAverage: {
      url: string;
      name: string;
      method: string;
      description: string;
    },
    averageList: IHistory[],
  ) {
    await axios
      .post(`${API}/analyzer/average`, {
        ids: averageList.map(item => item.id),
        url: dataForAverage.url,
        name: dataForAverage.name,
        method: dataForAverage.method,
        description: dataForAverage.description,
      })
      .then((response: any) => {
        updateHistory();
        setAverageList([]);
      });
  }

  const metricsTable = [
    {
      name: 'firstContentfulPaint',
      title: dictionary.page.firstContentfulPaint,
      measureValue: data.measurement.firstContentfulPaint,
      weights: weights.firstContentfulPaint,
    },
    {
      name: 'largestContentfulPaint',
      title: dictionary.page.largestContentfulPaint,
      measureValue: data.measurement.largestContentfulPaint,
      weights: weights.largestContentfulPaint,
    },
    {
      name: 'speedIndex',
      title: dictionary.page.speedIndex,
      measureValue: data.measurement.speedIndex,
      weights: weights.speedIndex,
    },
    {
      name: 'totalBlockingTime',
      title: dictionary.page.totalBlockingTime,
      measureValue: data.measurement.totalBlockingTime,
      weights: weights.totalBlockingTime,
    },
    {
      name: 'maxPotentialFid',
      title: dictionary.page.maxPotentialFid,
      measureValue: data.measurement.maxPotentialFid,
      weights: weights.maxPotentialFid,
    },
    {
      name: 'cumulativeLayoutShift',
      title: dictionary.page.cumulativeLayoutShift,
      measureValue: data.measurement.cumulativeLayoutShift,
      weights: weights.cumulativeLayoutShift,
    },
    {
      name: 'serverResponseTime',
      title: dictionary.page.serverResponseTime,
      measureValue: data.measurement.serverResponseTime,
      weights: weights.serverResponseTime,
    },
    {
      name: 'timeToInteractive',
      title: dictionary.page.timeToInteractive,
      measureValue: data.measurement.timeToInteractive,
      weights: weights.timeToInteractive,
    },
    {
      name: 'metrics',
      title: dictionary.page.metrics,
      measureValue: data.measurement.metrics,
      weights: weights.metrics,
    },
  ];

  const handleConvertToCSV = () => {
    exportToCSV(history, 'performance_metrics');
  };

  const exportToCSV = (data: any[], fileName: string) => {
    if (!data || !data.length) return;

    const headers = Object.keys(data[0]);

    const csvRows = [
      headers.join(','),
      ...data.map(row =>
        headers
          .map(header => JSON.stringify(row[header], (_, value) => (value === null ? '' : value)))
          .join(','),
      ),
    ];

    const csvContent = csvRows.join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', `${fileName}.csv`);
    link.click();
  };

  return (
    <>
      <div className="flex justify-end m-6 mb-0 gap-2">
        <LanguageSwitcher locale={locale} />
        <ModeToggle />
      </div>
      <main className="flex flex-col items-center justify-between">
        <div className="w-full items-center justify-between font-mono text-sm flex">
          <div className="md:w-[400px] mx-auto">
            <Label htmlFor="name">{dictionary.page.enter_nameOfTheSite}</Label>
            <Input
              id="name"
              placeholder={dictionary.page.enter_nameOfTheSite}
              value={dataForResearch.name}
              onChange={handleChange('name')}
              className="mb-2"
            ></Input>
            <Label htmlFor="method">{dictionary.page.enter_method}</Label>
            <Input
              id="method"
              placeholder={dictionary.page.enter_method}
              value={dataForResearch.method}
              onChange={handleChange('method')}
              className="mb-2"
            ></Input>
            <Label htmlFor="description">{dictionary.page.enter_description}</Label>
            <Input
              id="description"
              placeholder={dictionary.page.enter_description}
              value={dataForResearch.description}
              onChange={handleChange('description')}
              className="mb-2"
            ></Input>
            <Label htmlFor="numberOfIterations">{dictionary.page.enter_numberOfIterations}</Label>
            <Input
              id="numberOfIterations"
              placeholder={dictionary.page.enter_numberOfIterations}
              value={dataForResearch.numberOfIterations}
              onChange={handleChange('numberOfIterations')}
              className="mb-2"
            ></Input>
            <Label htmlFor="url">{dictionary.page.enter_url}</Label>
            <div className="flex justify-center align-center gap-2 mb-4">
              <Input
                id="url"
                placeholder={dictionary.page.enter_url}
                value={dataForResearch.url}
                onChange={handleChange('url')}
              ></Input>
              <Button onClick={() => send(dataForResearch, weights)}>
                <Send className="mr-2 h-4 w-4" />
                {dictionary.page.submit}
              </Button>
            </div>
            <div>
              <div className="mt-2">
                <h4 className="text-nowrap">
                  {dictionary.page.progress}:{lastMessage}
                </h4>
                <div
                  style={{
                    width: '100%',
                    backgroundColor: '#e0e0e0',
                    borderRadius: '5px',
                  }}
                >
                  <div
                    style={{
                      width: `${progress}%`,
                      backgroundColor: '#76c7c0',
                      height: '24px',
                      borderRadius: '5px',
                      transition: 'width 0.3s ease-in-out',
                    }}
                  ></div>
                </div>
                <p>{progress.toFixed(0)}%</p>
              </div>
            </div>

            <div>
              <div className="mt-2">
                <h4 className="text-nowrap">{dictionary.page.progressIterations}</h4>
                <div
                  style={{
                    width: '100%',
                    backgroundColor: '#e0e0e0',
                    borderRadius: '5px',
                  }}
                >
                  <div
                    style={{
                      width: `${
                        (numberOfIterationsProgress / dataForResearch.numberOfIterations) * 100
                      }%`,
                      backgroundColor: '#76c7c0',
                      height: '24px',
                      borderRadius: '5px',
                      transition: 'width 0.3s ease-in-out',
                    }}
                  ></div>
                </div>
                <p>
                  {numberOfIterationsProgress}/{dataForResearch.numberOfIterations}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-4 flex-col lg:flex-row">
          <div className="rounded-md border p-4">
            <h2 className="font-bold text-xl text-center">
              {dictionary.page.score} {data.analyzeScore}
            </h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-52">{dictionary.page.metric}</TableHead>
                  <TableHead>{dictionary.page.value}</TableHead>
                  <TableHead> {dictionary.page.weights}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {metricsTable.map((metricRow, index) => {
                  return (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{metricRow.title}</TableCell>
                      <TableCell>{metricRow.measureValue}</TableCell>
                      <TableCell className="text-right flex align-center">
                        <HoverCard>
                          <HoverCardTrigger>
                            {Number(metricRow.weights).toFixed(2)}
                          </HoverCardTrigger>
                          <HoverCardContent>
                            <Slider
                              defaultValue={[0.5]}
                              value={[metricRow.weights]}
                              max={1}
                              step={0.01}
                              onValueChange={handleRangeChange(metricRow.name)}
                            />
                          </HoverCardContent>
                        </HoverCard>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          <div className="rounded-md border p-4">
            <div className="flex justify-center gap-2">
              <h2 className="font-bold text-xl text-center">
                {dictionary.page.analysis_history}{' '}
                <Button onClick={() => handleConvertToCSV()}>
                  <Download className="mr-2 h-4 w-4" />
                  {dictionary.page.download_csv}
                </Button>
              </h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>{dictionary.page.computeAverages}</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{dictionary.page.averageCalculationPanel}</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-4 items-center gap-2">
                    <Label htmlFor="name">{dictionary.page.enter_nameOfTheSite}</Label>
                    <Input
                      id="name"
                      placeholder={dictionary.page.enter_nameOfTheSite}
                      value={dataForAverage.name}
                      onChange={handleChangeAverage('name')}
                      className="mb-2 col-span-3"
                    ></Input>
                    <Label htmlFor="method">{dictionary.page.enter_method}</Label>
                    <Input
                      id="method"
                      placeholder={dictionary.page.enter_method}
                      value={dataForAverage.method}
                      onChange={handleChangeAverage('method')}
                      className="mb-2 col-span-3"
                    ></Input>
                    <Label htmlFor="description">{dictionary.page.enter_description}</Label>
                    <Input
                      id="description"
                      placeholder={dictionary.page.enter_description}
                      value={dataForAverage.description}
                      onChange={handleChangeAverage('description')}
                      className="mb-2 col-span-3"
                    ></Input>
                    <Label htmlFor="url">{dictionary.page.enter_url}</Label>
                    <Input
                      id="url"
                      placeholder={dictionary.page.enter_url}
                      value={dataForAverage.url}
                      onChange={handleChangeAverage('url')}
                      className="mb-2 col-span-3"
                    ></Input>
                  </div>
                  <ScrollArea className="h-[300px] p-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{dictionary.page.url}</TableHead>
                          <TableHead>{dictionary.page.nameOfTheSite}</TableHead>
                          <TableHead>{dictionary.page.method}</TableHead>
                          <TableHead>{dictionary.page.description}</TableHead>
                          <TableHead>{dictionary.page.score_table}</TableHead>
                          <TableHead>{dictionary.page.timestamp}</TableHead>
                          <TableHead className="text-right">
                            {dictionary.page.selectForAveraging}
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {history.map((analysis, index) => {
                          let filteredAverageList = averageList.filter(
                            record => record.id == analysis.id,
                          );
                          let addButtonAverage = false;
                          if (JSON.stringify(filteredAverageList) == JSON.stringify([])) {
                            addButtonAverage = true;
                          }
                          return (
                            <TableRow key={index}>
                              <TableCell className="font-medium">{analysis.url}</TableCell>
                              <TableCell>{analysis.name}</TableCell>
                              <TableCell>{analysis.method}</TableCell>
                              <TableCell>{analysis.description}</TableCell>
                              <TableCell>{analysis.analyzeScore}</TableCell>
                              <TableCell>
                                {moment(analysis.createdAt).format('DD.MM.YYYY hh:mm:ss')}
                              </TableCell>

                              <TableCell className="text-right">
                                {addButtonAverage ? (
                                  <Button onClick={() => handleAddToAverage(analysis.id)}>
                                    {dictionary.page.select}
                                  </Button>
                                ) : (
                                  <Button
                                    variant="destructive"
                                    onClick={() => handleDeleteFromAverage(analysis.id)}
                                  >
                                    {dictionary.page.deselect}
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                  <DialogFooter>
                    <Button
                      type="submit"
                      onClick={() => {
                        sendAverage(dataForAverage, averageList);
                      }}
                    >
                      {dictionary.page.submit}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <ScrollArea className="h-[400px] p-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{dictionary.page.url}</TableHead>
                    <TableHead>{dictionary.page.nameOfTheSite}</TableHead>
                    <TableHead>{dictionary.page.method}</TableHead>
                    <TableHead>{dictionary.page.description}</TableHead>
                    <TableHead>{dictionary.page.score_table}</TableHead>
                    <TableHead>{dictionary.page.timestamp}</TableHead>
                    <TableHead className="text-right">{dictionary.page.compare}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((analysis, index) => {
                    let filteredCompareList = compareList.filter(
                      record => record.id == analysis.id,
                    );
                    let addButton = false;
                    if (JSON.stringify(filteredCompareList) == JSON.stringify([])) {
                      addButton = true;
                    }
                    return (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{analysis.url}</TableCell>
                        <TableCell>{analysis.name}</TableCell>
                        <TableCell>{analysis.method}</TableCell>
                        <TableCell>{analysis.description}</TableCell>
                        <TableCell>{analysis.analyzeScore}</TableCell>
                        <TableCell>
                          {moment(analysis.createdAt).format('DD.MM.YYYY hh:mm:ss')}
                        </TableCell>

                        <TableCell className="text-right">
                          {addButton ? (
                            <Button onClick={() => handleAddToCompare(analysis.id)}>
                              {dictionary.page.compare_button}
                            </Button>
                          ) : (
                            <Button
                              variant="destructive"
                              onClick={() => handleDeleteFromCompare(analysis.id)}
                            >
                              {dictionary.page.delete_button}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
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
