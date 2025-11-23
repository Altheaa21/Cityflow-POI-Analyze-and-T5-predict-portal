import { useMemo, useState } from "react";
import ReactApexChart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import PageMeta from "../components/common/PageMeta";

type CityKey =
  | "bandung"
  | "beijing"
  | "istanbul"
  | "jakarta"
  | "kuwaitCity"
  | "melbourne"
  | "moscow"
  | "newYorkCity"
  | "palembang"
  | "petalingJaya"
  | "shanghai"
  | "sydney"
  | "saoPaulo"
  | "tangerang"
  | "tokyo";

interface CityMetrics {
  name: string;
  usersTotal: number;
  usersValid: number;
  qMedian: number;
  piMaxMean: number;
  piMaxMedian: number;
  shareHighPiMax: number; // 0–1, e.g. 0.231 = 23.1%
  rgMedianKm: number;
  rMedian: number;
  group: 1 | 2 | 3;
  profile: string;
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
    group: 1,
    profile:
      "Compact activity spaces, high weekly regularity and a noticeable minority of highly predictable users embedded in otherwise sparse data.",
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
    group: 3,
    profile:
      "Only one valid user; statistics are essentially anecdotal and city-level conclusions should not be over-interpreted.",
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
    group: 2,
    profile:
      "Broader spatial dispersion and more mixed temporal regularity; Πmax is centred around 0.2 with a less pronounced high-predictability tail.",
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
    group: 2,
    profile:
      "Users roam over wider areas with moderately strong weekly regularity and a visible but not dominant share of highly predictable users.",
  },
  kuwaitCity: {
    name: "Kuwait City",
    usersTotal: 8596,
    usersValid: 70,
    qMedian: 0.333,
    piMaxMean: 0.407,
    piMaxMedian: 0.2,
    shareHighPiMax: 0.271,
    rgMedianKm: 2.636,
    rMedian: 0.8,
    group: 1,
    profile:
      "Relatively compact activity spaces and high weekly regularity, with a noticeable minority of highly predictable users.",
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
    group: 1,
    profile:
      "Local activity patterns with strong weekly rhythms and a non-trivial share of high-Πmax users despite sparse trajectories.",
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
    group: 2,
    profile:
      "Broader spatial dispersion and lower / more variable weekly regularity; Πmax distribution has a modest high-predictability tail.",
  },
  newYorkCity: {
    name: "New York City",
    usersTotal: 6223,
    usersValid: 341,
    qMedian: 0.472,
    piMaxMean: 0.269,
    piMaxMedian: 0.167,
    shareHighPiMax: 0.126,
    rgMedianKm: 2.237,
    rMedian: 0.8,
    group: 1,
    profile:
      "Compact-to-moderate activity spaces with strong weekly regularity and a clear but not dominant cluster of highly predictable users.",
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
    group: 3,
    profile:
      "Only two valid users and relatively extreme metric values; mobility profile should be interpreted with great caution.",
  },
  petalingJaya: {
    name: "Petaling Jaya",
    usersTotal: 14245,
    usersValid: 331,
    qMedian: 0.419,
    piMaxMean: 0.319,
    piMaxMedian: 0.2,
    shareHighPiMax: 0.178,
    rgMedianKm: 1.781,
    rMedian: 0.778,
    group: 1,
    profile:
      "Compact activity spaces and strong weekly regularity with a solid minority of highly predictable users.",
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
    group: 3,
    profile:
      "Moderate sparsity and regularity but only 12 valid users; overall profile remains uncertain due to sample size.",
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
    group: 1,
    profile:
      "Compact spatial range, strong weekly regularity and a relatively large fraction of highly predictable users — a “local & regular” city.",
  },
  saoPaulo: {
    name: "São Paulo",
    usersTotal: 5436,
    usersValid: 122,
    qMedian: 0.43,
    piMaxMean: 0.339,
    piMaxMedian: 0.2,
    shareHighPiMax: 0.205,
    rgMedianKm: 2.004,
    rMedian: 0.683,
    group: 2,
    profile:
      "Larger activity spaces and mixed weekly regularity; Πmax distribution is centred around 0.2 with a modest high tail.",
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
    group: 3,
    profile:
      "Relatively large Rg with moderate R and a high share of high-Πmax users; small sample size makes the profile more heterogeneous.",
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
    group: 3,
    profile:
      "Very high theoretical predictability with wide-ranging activity spaces; a small but very regular subset of users stands out.",
  },
};

const radarMetricLabels = [
  "q (sparsity)",
  "Πmax (mean)",
  "Πmax (median)",
  "Share (Πmax > 0.8)",
  "R (weekly regularity)",
];

const groupLabels: Record<CityMetrics["group"], string> = {
  1: "Type I — local & regular",
  2: "Type II — dispersed & mixed",
  3: "Type III — small / unstable sample",
};

const MobilityPredictability: React.FC = () => {
  const [selectedCity, setSelectedCity] = useState<CityKey>("sydney");
  const [comparisonCities, setComparisonCities] = useState<CityKey[]>([]);

  const city = cityMetrics[selectedCity];

  const chartSeries = useMemo(() => {
    const mainKey = selectedCity;
    const allKeys: CityKey[] = [
      mainKey,
      ...comparisonCities.filter((k) => k !== mainKey),
    ];

    return allKeys.map((key) => {
      const c = cityMetrics[key];
      return {
        name: c.name,
        data: [
          c.qMedian,
          c.piMaxMean,
          c.piMaxMedian,
          c.shareHighPiMax,
          c.rMedian,
        ],
      };
    });
  }, [selectedCity, comparisonCities]);

  const chartOptions: ApexOptions = useMemo(
    () => ({
      chart: {
        type: "radar",
        toolbar: { show: false },
        animations: {
          enabled: true,
          easing: "easeinout",
          speed: 500,
        },
      },
      stroke: {
        width: 2,
      },
      fill: {
        opacity: 0.2,
      },
      markers: {
        size: 3,
      },
      dataLabels: {
        enabled: false,
      },
      xaxis: {
        categories: radarMetricLabels,
        labels: {
          style: {
            fontSize: "11px",
          },
        },
      },
      yaxis: {
        min: 0,
        max: 1,
        tickAmount: 5,
        labels: {
          style: {
            fontSize: "10px",
          },
          formatter: (val) => val.toFixed(1),
        },
      },
      legend: {
        show: true,
        position: "bottom",
        fontSize: "11px",
        itemMargin: {
          horizontal: 8,
          vertical: 4,
        },
      },
      tooltip: {
        y: {
          formatter: (val: number, opts) => {
            const axisIndex = opts.dataPointIndex;
            // 对 shareHighPiMax 这一轴做百分比格式
            if (axisIndex === 3) {
              return `${(val * 100).toFixed(1)}%`;
            }
            return val.toFixed(3);
          },
        },
      },
      grid: {
        show: true,
      },
      theme: {
        mode: "light",
      },
    }),
    []
  );

  const handleToggleComparison = (key: CityKey) => {
    // 主城市不在对比列表里 toggle
    if (key === selectedCity) return;
    setComparisonCities((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleClearComparisons = () => {
    setComparisonCities([]);
  };

  return (
    <>
      <PageMeta
        title="Mobility Predictability | CityFlow Dashboard"
        description="Explore city-level mobility predictability metrics (q, Πmax, Rg, R) across Massive-STEPS cities."
      />

      <div className="space-y-6">
        {/* 顶部标题 + 城市选择 */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-50">
              Mobility Predictability
            </h1>
            <p className="max-w-3xl text-sm text-gray-500 dark:text-gray-400">
              Inspect how sparsity (q), theoretical upper bound (Πmax), spatial
              dispersion (Rg) and weekly regularity (R) vary across cities. Use
              the selector to switch between cities; the cards and radar chart
              update dynamically.
            </p>
          </div>

          {/* 城市下拉 */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              City
            </span>
            <select
              value={selectedCity}
              onChange={(e) => {
                const newKey = e.target.value as CityKey;
                setSelectedCity(newKey);
              }}
              className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 shadow-theme-xs focus:border-brand-400 focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-50"
            >
              {Object.entries(cityMetrics).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 本页指标简要说明 */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4 text-xs text-gray-600 shadow-theme-sm dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
          <div className="grid grid-cols-1 gap-y-2 gap-x-6 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <span className="font-semibold text-gray-900 dark:text-gray-50">
                Users (total){" "}
              </span>
              – all users with at least one check-in in this city.
            </div>
            <div>
              <span className="font-semibold text-gray-900 dark:text-gray-50">
                Users (valid){" "}
              </span>
              – users that pass the filtering rules and are used in the
              predictability analysis.
            </div>
            <div>
              <span className="font-semibold text-gray-900 dark:text-gray-50">
                q{" "}
              </span>
              – sparsity / missing rate of each user&apos;s trajectory (higher
              q = sparser, more missing hours).
            </div>
            <div>
              <span className="font-semibold text-gray-900 dark:text-gray-50">
                Πmax (mean){" "}
              </span>
              – average entropy-based theoretical upper bound on individual
              next-POI accuracy.
            </div>
            <div>
              <span className="font-semibold text-gray-900 dark:text-gray-50">
                Πmax (median){" "}
              </span>
              – median of the same theoretical upper bound, less sensitive to
              outliers.
            </div>
            <div>
              <span className="font-semibold text-gray-900 dark:text-gray-50">
                Share (Πmax &gt; 0.8){" "}
              </span>
              – fraction of valid users whose Πmax is above 0.8, i.e. the
              “very predictable” tail.
            </div>
            <div>
              <span className="font-semibold text-gray-900 dark:text-gray-50">
                Rg (km){" "}
              </span>
              – radius of gyration; larger values indicate more spatially
              dispersed mobility.
            </div>
            <div>
              <span className="font-semibold text-gray-900 dark:text-gray-50">
                R{" "}
              </span>
              – weekly regularity; higher values mean check-ins are concentrated
              in fewer hours-of-week.
            </div>
          </div>
        </div>


        {/* 上：当前城市的四个核心指标卡片 */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-theme-sm dark:border-gray-800 dark:bg-gray-900">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Sparsity q (median)
            </p>
            <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-50">
              {city.qMedian.toFixed(3)}
            </p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Higher q means fewer observed check-ins and more missing hours.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-theme-sm dark:border-gray-800 dark:bg-gray-900">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Mean Πmax
            </p>
            <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-50">
              {city.piMaxMean.toFixed(3)}
            </p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Entropy-based theoretical upper bound on next-POI predictions.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-theme-sm dark:border-gray-800 dark:bg-gray-900">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Rg (km, median)
            </p>
            <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-50">
              {city.rgMedianKm.toFixed(3)}
            </p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Spatial dispersion; larger values indicate users roam further.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-theme-sm dark:border-gray-800 dark:bg-gray-900">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Weekly regularity R (median)
            </p>
            <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-50">
              {city.rMedian.toFixed(3)}
            </p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Higher R means behaviour is concentrated in a small subset of
              hours-of-week.
            </p>
          </div>
        </div>

        {/* 补充指标卡片：样本规模 / 高 Πmax 比例 / 分组 */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-theme-sm dark:border-gray-800 dark:bg-gray-900">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Users (valid / total)
            </p>
            <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-50">
              {city.usersValid}{" "}
              <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                / {city.usersTotal}
              </span>
            </p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Valid users are those with sufficient check-ins to compute all
              mobility metrics.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-theme-sm dark:border-gray-800 dark:bg-gray-900">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Πmax (median)
            </p>
            <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-50">
              {city.piMaxMedian.toFixed(3)}
            </p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Typical individual-level theoretical upper bound on next-POI
              accuracy.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-theme-sm dark:border-gray-800 dark:bg-gray-900">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Share (Πmax &gt; 0.8)
            </p>
            <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-50">
              {(city.shareHighPiMax * 100).toFixed(1)}%
            </p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Fraction of users with near-deterministic mobility patterns.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-theme-sm dark:border-gray-800 dark:bg-gray-900">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Profile group
            </p>
            <p className="mt-2 text-base font-semibold text-gray-900 dark:text-gray-50">
              {groupLabels[city.group]}
            </p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Grouping follows the three qualitative city types in the thesis
              (local &amp; regular, dispersed &amp; mixed, or small / unstable
              sample).
            </p>
          </div>
        </div>

        {/* 中：雷达图 + 对比城市选择 */}
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <div className="xl:col-span-2 rounded-2xl border border-gray-200 bg-white p-4 shadow-theme-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-sm font-medium text-gray-900 dark:text-gray-50">
                  {city.name}: radar profile (q, Πmax, share, R)
                </h2>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Radar axes show sparsity q, mean / median Πmax, share of
                  high-Πmax users, and weekly regularity R. Add other cities
                  below to compare shapes.
                </p>
              </div>

              <button
                type="button"
                onClick={handleClearComparisons}
                className="mt-2 inline-flex h-8 items-center justify-center rounded-full border border-gray-200 px-3 text-xs font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 sm:mt-0"
              >
                Clear comparisons
              </button>
            </div>

            {/* 对比城市按钮 */}
            <div className="mt-3 flex flex-wrap gap-2">
              {(
                Object.entries(cityMetrics) as [CityKey, CityMetrics][]
              ).map(([key, value]) => {
                if (key === selectedCity) return null;
                const active = comparisonCities.includes(key);
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleToggleComparison(key)}
                    className={`inline-flex items-center rounded-full border px-3 py-1 text-xs ${
                      active
                        ? "border-brand-500 bg-brand-50 text-brand-700 dark:border-brand-400 dark:bg-brand-950/40 dark:text-brand-200"
                        : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
                    }`}
                  >
                    {value.name}
                  </button>
                );
              })}
            </div>

            {/* 雷达图 */}
            <div className="mt-4">
              <ReactApexChart
                type="radar"
                height={320}
                options={chartOptions}
                series={chartSeries}
              />
            </div>
          </div>

          {/* 右侧：该城市的文字 profile */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4 text-sm shadow-theme-sm dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50">
              {city.name} mobility profile
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-gray-600 dark:text-gray-300">
              {city.profile}
            </p>
            <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">
              These descriptions mirror the qualitative groupings in the thesis
              (e.g., “local &amp; regular”, “more dispersed &amp; mixed
              regularity”, or “small / unstable sample” cities).
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobilityPredictability;