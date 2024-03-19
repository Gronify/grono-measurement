
'use client'
import axios from "axios";
import Image from "next/image";
import { useState } from "react";

export default function Home() {
  const [url, setUrl] = useState('')
  const [data, setData] = useState({
    firstContentfulPaint: 0,
    largestContentfulPaint: 0,
    firstMeaningfulPaint: 0,
    speedIndex: 0,
    totalBlockingTime: 0,
    maxPotentialFid: 0,
    cumulativeLayoutShift: 0,
    serverResponseTime: 0,
    timeToInteractive: 0,
    metrics: 0
  })
  const handleChange = (prop: any) => (event: any) => {
    setUrl(event.target.value);
  };
  function send(url: string) {
    axios.get("http://localhost:5000/measurement", {
      params: { url: url },
    }
    ).then((response: any) => {
      setData(response.data)
    })

  }
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">

        <div className="max-w-xl mx-auto">

          <div className="flex justify-center gap-2">

            <div className="mb-4">
              <label className="block text-gray-700 font-bold mb-2">Enter URL:</label>
              <input type="text" id="url" name="url" placeholder="Enter URL" className="w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline" value={url} onChange={handleChange("2")} />
            </div>


            <button id="submitBtn"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold  px-4 rounded focus:outline-none focus:shadow-outline"
              onClick={() => send(url)}
            >
              Submit
            </button>
          </div>


          <div className="overflow-x-auto">
            <table className="w-full bg-white border rounded-lg">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-gray-600 font-bold border">Metric</th>
                  <th className="px-4 py-2 text-gray-600 font-bold border">Value</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-4 py-2 border">firstContentfulPaint</td>
                  <td className="px-4 py-2 border">{data.firstContentfulPaint}</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 border">largestContentfulPaint</td>
                  <td className="px-4 py-2 border">{data.largestContentfulPaint}</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 border">firstMeaningfulPaint</td>
                  <td className="px-4 py-2 border">{data.firstMeaningfulPaint}</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 border">speedIndex</td>
                  <td className="px-4 py-2 border">{data.speedIndex}</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 border">totalBlockingTime</td>
                  <td className="px-4 py-2 border">{data.totalBlockingTime}</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 border">maxPotentialFid</td>
                  <td className="px-4 py-2 border">{data.maxPotentialFid}</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 border">cumulativeLayoutShift</td>
                  <td className="px-4 py-2 border">{data.cumulativeLayoutShift}</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 border">serverResponseTime</td>
                  <td className="px-4 py-2 border">{data.serverResponseTime}</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 border">timeToInteractive</td>
                  <td className="px-4 py-2 border">{data.timeToInteractive}</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 border">metrics</td>
                  <td className="px-4 py-2 border">{data.metrics}</td>
                </tr>

              </tbody>
            </table>
          </div>

        </div>
      </div>
    </main>
  );
}
