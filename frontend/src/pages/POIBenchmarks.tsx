// src/pages/POIBenchmarks.tsx

import { useMemo, useState } from "react";
import ReactApexChart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import PageMeta from "../components/common/PageMeta";

type AxisSeries = {
  name: string;
  type?: "column" | "line" | "area";
  data: number[];
}[];

type CityKey =
  | "bandung"
  | "beijing"
  | "istanbul"
  | "jakarta"
  | "kuwait_city"
  | "melbourne"
  | "moscow"
  | "new_york_city"
  | "palembang"
  | "petaling_jaya"
  | "sao_paulo"
  | "shanghai"
  | "sydney"
  | "tangerang"
  | "tokyo";

type ModelKey =
  | "FPMC"
  | "RNN"
  | "LSTPM"
  | "DeepMove"
  | "GETNext"
  | "STHGCN"
  | "UniMove";

const CITY_ORDER: CityKey[] = [
  "bandung",
  "beijing",
  "istanbul",
  "jakarta",
  "kuwait_city",
  "melbourne",
  "moscow",
  "new_york_city",
  "palembang",
  "petaling_jaya",
  "sao_paulo",
  "shanghai",
  "sydney",
  "tangerang",
  "tokyo",
];

const MODEL_ORDER: ModelKey[] = [
  "FPMC",
  "RNN",
  "LSTPM",
  "DeepMove",
  "GETNext",
  "STHGCN",
  "UniMove",
];

interface CityMetrics {
  name: string;
  usersTotal: number;
  usersValid: number;
  qMedian: number;
  piMaxMean: number;
  piMaxMedian: number;
  shareHighPiMax: number; // fraction, e.g. 0.231 = 23.1%
  rgMedianKm: number;
  rMedian: number;
}

const cityMetrics: Record<CityKey, CityMetrics> = {
  bandung: {
    name: "Bandung",
    usersTotal: 3177,
    usersValid: 52,
    qMedian: 0.517,
    piMaxMean: 0.367,
    piMaxMedian: 0.2,
    shareHighPiMax: 0.231,
    rgMedianKm: 1.581,
    rMedian: 0.8,
  },
  beijing: {
    name: "Beijing",
    usersTotal: 52,
    usersValid: 1,
    qMedian: 0.211,
    piMaxMean: 0.2,
    piMaxMedian: 0.2,
    shareHighPiMax: 0.0,
    rgMedianKm: 1.443,
    rMedian: 0.2,
  },
  istanbul: {
    name: "Istanbul",
    usersTotal: 21096,
    usersValid: 246,
    qMedian: 0.412,
    piMaxMean: 0.348,
    piMaxMedian: 0.2,
    shareHighPiMax: 0.207,
    rgMedianKm: 2.367,
    rMedian: 0.8,
  },
  jakarta: {
    name: "Jakarta",
    usersTotal: 7914,
    usersValid: 110,
    qMedian: 0.471,
    piMaxMean: 0.392,
    piMaxMedian: 0.2,
    shareHighPiMax: 0.264,
    rgMedianKm: 2.036,
    rMedian: 0.732,
  },
  kuwait_city: {
    name: "Kuwait City",
    usersTotal: 8596,
    usersValid: 70,
    qMedian: 0.333,
    piMaxMean: 0.407,
    piMaxMedian: 0.2,
    shareHighPiMax: 0.271,
    rgMedianKm: 2.636,
    rMedian: 0.8,
  },
  melbourne: {
    name: "Melbourne",
    usersTotal: 583,
    usersValid: 26,
    qMedian: 0.437,
    piMaxMean: 0.258,
    piMaxMedian: 0.167,
    shareHighPiMax: 0.115,
    rgMedianKm: 1.114,
    rMedian: 0.817,
  },
  moscow: {
    name: "Moscow",
    usersTotal: 3954,
    usersValid: 66,
    qMedian: 0.255,
    piMaxMean: 0.312,
    piMaxMedian: 0.2,
    shareHighPiMax: 0.167,
    rgMedianKm: 1.025,
    rMedian: 0.667,
  },
  new_york_city: {
    name: "New York City",
    usersTotal: 6223,
    usersValid: 341,
    qMedian: 0.472,
    piMaxMean: 0.269,
    piMaxMedian: 0.167,
    shareHighPiMax: 0.126,
    rgMedianKm: 2.237,
    rMedian: 0.8,
  },
  palembang: {
    name: "Palembang",
    usersTotal: 252,
    usersValid: 2,
    qMedian: 0.369,
    piMaxMean: 0.183,
    piMaxMedian: 0.183,
    shareHighPiMax: 0.0,
    rgMedianKm: 3.321,
    rMedian: 0.817,
  },
  petaling_jaya: {
    name: "Petaling Jaya",
    usersTotal: 14245,
    usersValid: 331,
    qMedian: 0.419,
    piMaxMean: 0.319,
    piMaxMedian: 0.2,
    shareHighPiMax: 0.178,
    rgMedianKm: 1.781,
    rMedian: 0.778,
  },
  sao_paulo: {
    name: "São Paulo",
    usersTotal: 5436,
    usersValid: 122,
    qMedian: 0.43,
    piMaxMean: 0.339,
    piMaxMedian: 0.2,
    shareHighPiMax: 0.205,
    rgMedianKm: 2.004,
    rMedian: 0.683,
  },
  shanghai: {
    name: "Shanghai",
    usersTotal: 259,
    usersValid: 12,
    qMedian: 0.454,
    piMaxMean: 0.251,
    piMaxMedian: 0.2,
    shareHighPiMax: 0.083,
    rgMedianKm: 1.715,
    rMedian: 0.8,
  },
  sydney: {
    name: "Sydney",
    usersTotal: 679,
    usersValid: 30,
    qMedian: 0.495,
    piMaxMean: 0.476,
    piMaxMedian: 0.2,
    shareHighPiMax: 0.367,
    rgMedianKm: 1.264,
    rMedian: 0.775,
  },
  tangerang: {
    name: "Tangerang",
    usersTotal: 1276,
    usersValid: 19,
    qMedian: 0.444,
    piMaxMean: 0.385,
    piMaxMedian: 0.2,
    shareHighPiMax: 0.263,
    rgMedianKm: 1.216,
    rMedian: 0.6,
  },
  tokyo: {
    name: "Tokyo",
    usersTotal: 647,
    usersValid: 20,
    qMedian: 0.44,
    piMaxMean: 0.547,
    piMaxMedian: 0.2,
    shareHighPiMax: 0.45,
    rgMedianKm: 3.768,
    rMedian: 0.6,
  },
};

// Acc@1 from your Table “full-poi-bench”
const modelAccByCity: Record<CityKey, Record<ModelKey, number>> = {
  bandung: {
    FPMC: 0.048,
    RNN: 0.062,
    LSTPM: 0.11,
    DeepMove: 0.107,
    GETNext: 0.179,
    STHGCN: 0.219,
    UniMove: 0.007,
  },
  beijing: {
    FPMC: 0.0,
    RNN: 0.085,
    LSTPM: 0.127,
    DeepMove: 0.106,
    GETNext: 0.433,
    STHGCN: 0.453,
    UniMove: 0.036,
  },
  istanbul: {
    FPMC: 0.026,
    RNN: 0.077,
    LSTPM: 0.142,
    DeepMove: 0.15,
    GETNext: 0.146,
    STHGCN: 0.241,
    UniMove: 0.015,
  },
  jakarta: {
    FPMC: 0.029,
    RNN: 0.049,
    LSTPM: 0.099,
    DeepMove: 0.103,
    GETNext: 0.155,
    STHGCN: 0.197,
    UniMove: 0.004,
  },
  kuwait_city: {
    FPMC: 0.021,
    RNN: 0.087,
    LSTPM: 0.18,
    DeepMove: 0.179,
    GETNext: 0.175,
    STHGCN: 0.225,
    UniMove: 0.023,
  },
  melbourne: {
    FPMC: 0.062,
    RNN: 0.059,
    LSTPM: 0.091,
    DeepMove: 0.083,
    GETNext: 0.1,
    STHGCN: 0.168,
    UniMove: 0.008,
  },
  moscow: {
    FPMC: 0.059,
    RNN: 0.075,
    LSTPM: 0.151,
    DeepMove: 0.143,
    GETNext: 0.175,
    STHGCN: 0.223,
    UniMove: 0.009,
  },
  new_york_city: {
    FPMC: 0.032,
    RNN: 0.061,
    LSTPM: 0.099,
    DeepMove: 0.097,
    GETNext: 0.134,
    STHGCN: 0.146,
    UniMove: 0.004,
  },
  palembang: {
    FPMC: 0.102,
    RNN: 0.049,
    LSTPM: 0.114,
    DeepMove: 0.084,
    GETNext: 0.158,
    STHGCN: 0.246,
    UniMove: 0.009,
  },
  petaling_jaya: {
    FPMC: 0.026,
    RNN: 0.064,
    LSTPM: 0.099,
    DeepMove: 0.112,
    GETNext: 0.139,
    STHGCN: 0.174,
    UniMove: 0.008,
  },
  sao_paulo: {
    FPMC: 0.03,
    RNN: 0.097,
    LSTPM: 0.158,
    DeepMove: 0.16,
    GETNext: 0.202,
    STHGCN: 0.25,
    UniMove: 0.002,
  },
  shanghai: {
    FPMC: 0.084,
    RNN: 0.055,
    LSTPM: 0.099,
    DeepMove: 0.085,
    GETNext: 0.115,
    STHGCN: 0.193,
    UniMove: 0.0,
  },
  sydney: {
    FPMC: 0.075,
    RNN: 0.08,
    LSTPM: 0.141,
    DeepMove: 0.129,
    GETNext: 0.181,
    STHGCN: 0.227,
    UniMove: 0.015,
  },
  tangerang: {
    FPMC: 0.104,
    RNN: 0.087,
    LSTPM: 0.154,
    DeepMove: 0.145,
    GETNext: 0.224,
    STHGCN: 0.293,
    UniMove: 0.001,
  },
  tokyo: {
    FPMC: 0.176,
    RNN: 0.133,
    LSTPM: 0.225,
    DeepMove: 0.201,
    GETNext: 0.18,
    STHGCN: 0.25,
    UniMove: 0.032,
  },
};

const modelDisplayName: Record<ModelKey, string> = {
  FPMC: "FPMC",
  RNN: "RNN",
  LSTPM: "LSTPM",
  DeepMove: "DeepMove",
  GETNext: "GETNext",
  STHGCN: "STHGCN",
  UniMove: "UniMove",
};

const POIBenchmarks: React.FC = () => {
  const [selectedCity, setSelectedCity] = useState<CityKey>("bandung");

  const city = cityMetrics[selectedCity];
  const cityModelAcc = modelAccByCity[selectedCity];

  const { bestModelKey, bestAcc } = useMemo(() => {
    let bestKey: ModelKey = MODEL_ORDER[0];
    let bestVal = cityModelAcc[bestKey];

    for (const m of MODEL_ORDER) {
      if (cityModelAcc[m] > bestVal) {
        bestVal = cityModelAcc[m];
        bestKey = m;
      }
    }
    return { bestModelKey: bestKey, bestAcc: bestVal };
  }, [cityModelAcc]);

  const piMax = city.piMaxMean;
  const utilization = piMax > 0 ? bestAcc / piMax : 0;
  const gap = Math.max(piMax - bestAcc, 0);

  const mainSeries: AxisSeries = useMemo(
    () => [
      {
        name: "Acc@1",
        type: "column",
        data: MODEL_ORDER.map((m) => cityModelAcc[m]),
      },
      {
        name: "Πmax (mean)",
        type: "line",
        data: MODEL_ORDER.map(() => piMax),
      },
    ],
    [cityModelAcc, piMax]
  );

  const mainChartOptions: ApexOptions = useMemo(
    () => ({
      chart: {
        type: "line",
        toolbar: { show: false },
        animations: {
          enabled: true,
          easing: "easeinout",
          speed: 500,
        },
      },
      stroke: {
        width: [0, 3],
        curve: "smooth",
      },
      plotOptions: {
        bar: {
          columnWidth: "45%",
          borderRadius: 6,
        },
      },
      dataLabels: {
        enabled: false,
      },
      xaxis: {
        categories: MODEL_ORDER.map((m) => modelDisplayName[m]),
        labels: {
          style: {
            fontSize: "11px",
          },
        },
      },
      yaxis: {
        min: 0,
        max: 0.6,
        tickAmount: 6,
        labels: {
          formatter: (val) => val.toFixed(2),
          style: {
            fontSize: "11px",
          },
        },
      },
      grid: {
        strokeDashArray: 4,
      },
      tooltip: {
        shared: true,
        intersect: false,
        y: {
          formatter: (val?: number) =>
            val === undefined ? "" : val.toFixed(3),
        },
      },
      legend: {
        position: "top",
        fontSize: "11px",
      },
      colors: ["#6366F1", "#F97316"],
    }),
    []
  );

  const gapSeries: AxisSeries = useMemo(
    () => [
      {
        name: "STHGCN Acc@1 / Πmax(mean)",
        data: CITY_ORDER.map((c) => {
          const cm = cityMetrics[c];
          const acc = modelAccByCity[c].STHGCN;
          return cm.piMaxMean > 0 ? acc / cm.piMaxMean : 0;
        }),
      },
    ],
    []
  );

  const gapChartOptions: ApexOptions = useMemo(
    () => ({
      chart: {
        type: "line",
        toolbar: { show: false },
        animations: {
          enabled: true,
          easing: "easeinout",
          speed: 500,
        },
      },
      stroke: {
        width: 3,
        curve: "smooth",
      },
      dataLabels: {
        enabled: false,
      },
      xaxis: {
        categories: CITY_ORDER.map((c) => cityMetrics[c].name),
        labels: {
          rotate: -30,
          style: {
            fontSize: "10px",
          },
        },
      },
      yaxis: {
        min: 0,
        max: 1.4,
        tickAmount: 7,
        labels: {
          formatter: (val) => val.toFixed(1),
          style: {
            fontSize: "11px",
          },
        },
      },
      grid: {
        strokeDashArray: 4,
      },
      tooltip: {
        y: {
          formatter: (val?: number) =>
            val === undefined ? "" : `${(val * 100).toFixed(1)}% of Πmax`,
        },
      },
      colors: ["#22C55E"],
    }),
    []
  );

  return (
    <>
      <PageMeta
        title="POI Recommendation Benchmarks | CityFlow Dashboard"
        description="Compare classic sequence/graph models against the theoretical predictability limit Πmax on Massive-STEPS POI recommendation benchmarks."
      />

      <div className="space-y-6">
        {/* 顶部标题 + 城市选择 */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-50">
              POI Recommendation Benchmarks
            </h1>
            <p className="max-w-3xl text-sm text-gray-500 dark:text-gray-400">
              This page reuses the full Massive-STEPS POI benchmark table: for
              each city, it shows Acc@1 of classic recommendation models and the
              theoretical upper bound Πmax(mean). Use the selector to change
              city; the cards and charts update accordingly.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              City
            </span>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value as CityKey)}
              className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 shadow-theme-xs focus:border-brand-400 focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-50"
            >
              {CITY_ORDER.map((key) => (
                <option key={key} value={key}>
                  {cityMetrics[key].name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 指标说明卡片 */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4 text-xs text-gray-600 shadow-theme-sm dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
          <p>
            <span className="font-semibold text-gray-900 dark:text-gray-50">
              Acc@1
            </span>{" "}
            – top-1 POI recommendation accuracy for each model on the
            Massive-STEPS test set.{" "}
            <span className="font-semibold text-gray-900 dark:text-gray-50">
              Πmax
            </span>{" "}
            – entropy-based theoretical upper bound on individual next-POI
            accuracy, derived from each user&apos;s mobility sequence. The goal
            is not to beat Πmax, but to understand how closely models approach
            this limit in different cities.
          </p>
        </div>

        {/* 顶部：当前城市的摘要卡片 */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-theme-sm dark:border-gray-800 dark:bg-gray-900">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Πmax (mean)
            </p>
            <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-50">
              {piMax.toFixed(3)}
            </p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Theoretical upper bound on next-POI Acc@1 aggregated over valid
              users in {city.name}.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-theme-sm dark:border-gray-800 dark:bg-gray-900">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Best model Acc@1
            </p>
            <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-50">
              {bestAcc.toFixed(3)}
            </p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Achieved by{" "}
              <span className="font-semibold">{bestModelKey}</span> on the POI
              benchmark for {city.name}.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-theme-sm dark:border-gray-800 dark:bg-gray-900">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Gap to Πmax
            </p>
            <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-50">
              {gap.toFixed(3)}
            </p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Best model reaches{" "}
              <span className="font-semibold">
                {(utilization * 100).toFixed(1)}%
              </span>{" "}
              of Πmax; the remaining gap reflects information not captured by
              current models.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-theme-sm dark:border-gray-800 dark:bg-gray-900">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Users (valid / total)
            </p>
            <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-50">
              {city.usersValid} / {city.usersTotal}
            </p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Benchmark and Πmax statistics are computed on valid users only;
              small valid samples should be interpreted cautiously.
            </p>
          </div>
        </div>

        {/* 中间主图：当前城市中，各模型 Acc@1 vs Πmax */}
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <div className="xl:col-span-2 rounded-2xl border border-gray-200 bg-white p-4 shadow-theme-sm dark:border-gray-800 dark:bg-gray-900">
            <h2 className="text-sm font-medium text-gray-900 dark:text-gray-50">
              {city.name}: model Acc@1 vs Πmax(mean)
            </h2>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Bars show Acc@1 for each POI recommendation model; the orange line
              marks Πmax(mean). No model exceeds this theoretical limit; instead,
              we compare how close different architectures get to it.
            </p>
            <div className="mt-4">
              <ReactApexChart
                type="line"
                height={260}
                options={mainChartOptions}
                series={mainSeries}
              />
            </div>
          </div>

          {/* 右侧解释卡片 */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4 text-sm shadow-theme-sm dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50">
              How well do models use predictability in {city.name}?
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-gray-600 dark:text-gray-300">
              In {city.name}, Πmax(mean) is {piMax.toFixed(3)}, meaning that even
              an ideal next-POI predictor cannot exceed this value on average.
              The best benchmark model ({bestModelKey}) achieves Acc@1 ={" "}
              {bestAcc.toFixed(3)}, which corresponds to roughly{" "}
              {(utilization * 100).toFixed(1)}% of the theoretical limit.
            </p>
            <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">
              This mirrors the thesis finding that strong GNN and sequence models
              close a substantial part of the gap to Πmax, but still leave clear
              headroom for future architectures – especially in highly
              predictable &quot;local and regular&quot; cities.
            </p>
          </div>
        </div>

        {/* 底部：跨城市 STHGCN / Πmax 比值 */}
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <div className="xl:col-span-2 rounded-2xl border border-gray-200 bg-white p-4 shadow-theme-sm dark:border-gray-800 dark:bg-gray-900">
            <h2 className="text-sm font-medium text-gray-900 dark:text-gray-50">
              Cross-city utilisation of Πmax by STHGCN
            </h2>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              For each city, the line shows the ratio STHGCN Acc@1 /
              Πmax(mean). Values closer to 1 indicate that the model is close to
              the theoretical limit; lower values highlight room for improvement
              even in highly predictable cities.
            </p>
            <div className="mt-4">
              <ReactApexChart
                type="line"
                height={260}
                options={gapChartOptions}
                series={gapSeries}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 text-sm shadow-theme-sm dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50">
              Cross-city benchmark story
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-gray-600 dark:text-gray-300">
              STHGCN is consistently the strongest classic model across
              Massive-STEPS cities, but its Acc@1 curves stay below Πmax in all
              cases. Local &quot;compact and regular&quot; cities often reach
              higher utilisation ratios, while small-sample or more dispersed
              cities show more variability and larger gaps.

              For cities with extremely few valid users (e.g., Beijing, Palembang), 
              both Πₘₐₓ and Acc@1 are highly noisy. In these cases, Acc@1 may slightly exceed the estimated Πₘₐₓ(mean) due to finite-sample estimation error; their profiles should therefore be interpreted as anecdotal rather than statistically robust.
            </p>
            <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">
              The dashboard therefore visualises exactly the same quantities as
              in the POI benchmark tables: city-level Πmax statistics and
              Acc@1 of standard models, with an additional normalised ratio
              (Acc@1 / Πmax) that makes the &quot;distance to the theoretical
              ceiling&quot; more interpretable.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default POIBenchmarks;