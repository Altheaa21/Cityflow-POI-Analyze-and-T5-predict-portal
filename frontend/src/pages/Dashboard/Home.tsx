import { useState } from "react";
import { Link } from "react-router";
import PageMeta from "../../components/common/PageMeta";

type CityKey = "sydney" | "tokyo" | "jakarta" | "bandung";
type BenchmarkCityKey = "nyc" | "sydney" | "tokyo" | "moscow";

const citySnapshots: Record<
  CityKey,
  {
    name: string;
    piMaxMean: string;
    highTailShare: string;
    profile: string;
  }
> = {
  sydney: {
    name: "Sydney",
    piMaxMean: "mean Πmax ≈ 0.47",
    highTailShare: "≈ 35–40% with Πmax > 0.8",
    profile:
      "High share of very predictable users with compact spatial range and strong weekly regularity → a “local & regular” city.",
  },
  tokyo: {
    name: "Tokyo",
    piMaxMean: "mean Πmax ≈ 0.54",
    highTailShare: "≈ 40–45% with Πmax > 0.8",
    profile:
      "Smaller valid-user sample and noisier predictability distribution; city-level conclusions should be treated cautiously → a “local & regular” city.",
  },
  jakarta: {
    name: "Jakarta",
    piMaxMean: "mean Πmax ≈ 0.39",
    highTailShare: "≈ 25–30% with Πmax > 0.8",
    profile:
      "Moderate Πmax with a non-trivial high-predictability tail, but mobility is more dispersed and less regular -> 'small / unstable sample' city.",
  },
  bandung: {
    name: "Bandung",
    piMaxMean: "mean Πmax ≈ 0.36",
    highTailShare: "≈ 20–25% with Πmax > 0.8",
    profile:
      "High share of very predictable users with compact spatial range and strong weekly regularity → a “local & regular” city.",
  },
};

const benchmarkSnapshots: Record<
  BenchmarkCityKey,
  {
    name: string;
    piMaxMean: string;
    sthgcn: string;
    llmMove: string;
    comment: string;
  }
> = {
  nyc: {
    name: "New York City",
    piMaxMean: "mean Πmax ≈ 0.35",
    sthgcn: "STHGCN Acc@1 ≈ 0.24",
    llmMove: "LLM-Move (Gemini) Acc@1 ≈ 0.26–0.28",
    comment:
      "Both STHGCN and LLM-Move capture only part of the upper bound but still benefit from relatively regular mobility.",
  },
  sydney: {
    name: "Sydney",
    piMaxMean: "mean Πmax ≈ 0.40+",
    sthgcn: "STHGCN Acc@1 ≈ 0.27",
    llmMove: "LLM-Move (Gemini) Acc@1 up to ≈ 0.30",
    comment:
      "High Πmax and strong models, yet Acc@1 still falls well below the theoretical limit suggested by user-level predictability.",
  },
  tokyo: {
    name: "Tokyo",
    piMaxMean: "mean Πmax ≈ 0.45",
    sthgcn: "STHGCN Acc@1 ≈ 0.26–0.28",
    llmMove: "LLM-Move (Gemini) Acc@1 ≈ 0.28–0.30",
    comment:
      "Very predictable mobility; next-POI models perform well but still leave a clear gap to Πmax.",
  },
  moscow: {
    name: "Moscow",
    piMaxMean: "mean Πmax ≈ 0.33",
    sthgcn: "STHGCN Acc@1 ≈ 0.20",
    llmMove: "LLM-Move (Gemini) Acc@1 ≈ 0.22",
    comment:
      "Lower recommendation accuracy relative to Πmax, likely reflecting cross-city distribution shift and sparser signals.",
  },
};

export default function Home() {
  const [selectedCity, setSelectedCity] = useState<CityKey>("sydney");
  const [selectedBenchCity, setSelectedBenchCity] =
    useState<BenchmarkCityKey>("sydney");

  const city = citySnapshots[selectedCity];
  const benchCity = benchmarkSnapshots[selectedBenchCity];

  return (
    <>
      <PageMeta
        title="CityFlow Predictability & Demand Dashboard"
        description="Overview of mobility predictability, POI recommendation benchmarks, and T5-based demand forecasting."
      />

      <div className="space-y-6">
        {/* Top heading */}
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-gray-50">
            CityFlow Predictability &amp; Demand Dashboard
          </h1>
          <p className="max-w-3xl text-base text-gray-600 dark:text-gray-300">
            This portal connects three layers of your thesis: individual-level
            mobility predictability, next-POI recommendation benchmarks, and a
            T5-based city-level demand forecaster. Use the tabs and cards below
            to navigate into each part of the story.
          </p>
        </div>

        {/* Metrics explanation card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 text-sm text-gray-700 shadow-theme-sm dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200">
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-50">
            Key metrics used in this portal
          </h2>
          <div className="mt-3 grid grid-cols-1 gap-x-6 gap-y-3 md:grid-cols-2">
            <div>
              <span className="font-semibold text-gray-900 dark:text-gray-50">
                q{" "}
              </span>
              <span>
                – sparsity / missing rate of each user&apos;s trajectory (higher q =
                sparser, less observed behaviour).
              </span>
            </div>
            <div>
              <span className="font-semibold text-gray-900 dark:text-gray-50">
                Πmax{" "}
              </span>
              <span>
                – entropy-based theoretical upper bound on next-POI accuracy,
                derived from Fano&apos;s inequality.
              </span>
            </div>
            <div>
              <span className="font-semibold text-gray-900 dark:text-gray-50">
                Rg (km){" "}
              </span>
              <span>
                – spatial dispersion (radius of gyration); larger values
                indicate more geographically dispersed mobility.
              </span>
            </div>
            <div>
              <span className="font-semibold text-gray-900 dark:text-gray-50">
                R{" "}
              </span>
              <span>
                – weekly regularity; higher values mean visits are concentrated
                in fewer hours-of-week.
              </span>
            </div>
            <div>
              <span className="font-semibold text-gray-900 dark:text-gray-50">
                Acc@1{" "}
              </span>
              <span>
                – fraction of test cases where the model&apos;s top-1 POI matches
                the true next POI.
              </span>
            </div>
          </div>
        </div>

        {/* Three summary cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Mobility Predictability */}
          <div className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="space-y-3">
              <h2 className="text-base font-semibold text-gray-900 dark:text-gray-50">
                Mobility Predictability
              </h2>
              <p className="text-3xl font-semibold text-gray-900 dark:text-gray-50">
                15{" "}
                <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                  cities · median Πmax ≈ 0.18
                </span>
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Median Πmax is surprisingly stable, but the share of highly
                predictable users and spatial/temporal regularity vary widely
                across cities.
              </p>
            </div>
            <div className="mt-4 flex justify-end">
              <Link
                to="/mobility-predictability"
                className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
              >
                View city profiles →
              </Link>
            </div>
          </div>

          {/* POI Benchmarks */}
          <div className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="space-y-3">
              <h2 className="text-base font-semibold text-gray-900 dark:text-gray-50">
                POI Recommendation Benchmarks
              </h2>
              <p className="text-3xl font-semibold text-gray-900 dark:text-gray-50">
                0.15–0.30{" "}
                <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                  Acc@1 range
                </span>
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Strong GNN and LLM-based models reach only a fraction of
                theoretical predictability; their accuracy does not increase
                monotonically with Πmax.
              </p>
            </div>
            <div className="mt-4 flex justify-end">
              <Link
                to="/poi-benchmarks"
                className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
              >
                Explore benchmarks →
              </Link>
            </div>
          </div>

          {/* T5 Forecast */}
          <div className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="space-y-3">
              <h2 className="text-base font-semibold text-gray-900 dark:text-gray-50">
                T5 Demand Forecast
              </h2>
              <p className="text-3xl font-semibold text-gray-900 dark:text-gray-50">
                3{" "}
                <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                  cities · 3 categories
                </span>
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Aggregate demand forecasting is very good at predicting zeros
                but struggles on non-zero demand and cross-city transfer,
                reinforcing the gap from Πmax.
              </p>
            </div>
            <div className="mt-4 flex justify-end">
              <Link
                to="/t5-forecast"
                className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
              >
                Open T5 chat →
              </Link>
            </div>
          </div>
        </div>

        {/* Snapshot cards */}
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {/* Cross-city predictability snapshot */}
          <div className="flex flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-50">
                  Cross-city predictability snapshot
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Select a representative city to see how Πmax and the
                  high-predictability tail shape its mobility profile.
                </p>
              </div>
              <select
                className="h-9 rounded-lg border border-gray-200 bg-transparent px-3 text-sm text-gray-700 focus:border-brand-400 focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value as CityKey)}
              >
                <option value="sydney">Sydney</option>
                <option value="tokyo">Tokyo</option>
                <option value="jakarta">Jakarta</option>
                <option value="bandung">Bandung</option>
              </select>
            </div>

            <div className="space-y-2 text-sm">
              <p className="font-semibold text-gray-900 dark:text-gray-50">
                {city.name}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                mean Πmax{" "}
                <span className="font-semibold text-gray-900 dark:text-gray-50">
                  {city.piMaxMean}
                </span>{" "}
                · high-Πmax users{" "}
                <span className="font-semibold text-gray-900 dark:text-gray-50">
                  {city.highTailShare}
                </span>
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-200">
                {city.profile}
              </p>
            </div>

            <div className="mt-4 flex justify-end">
              <Link
                to="/mobility-predictability"
                className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
              >
                View full mobility metrics →
              </Link>
            </div>
          </div>

          {/* Model performance snapshot */}
          <div className="flex flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-50">
                  Model performance snapshot
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Compare mean Πmax with Acc@1 of STHGCN and LLM-Move for key
                  cities.
                </p>
              </div>
              <select
                className="h-9 rounded-lg border border-gray-200 bg-transparent px-3 text-sm text-gray-700 focus:border-brand-400 focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                value={selectedBenchCity}
                onChange={(e) =>
                  setSelectedBenchCity(e.target.value as BenchmarkCityKey)
                }
              >
                <option value="nyc">New York City</option>
                <option value="sydney">Sydney</option>
                <option value="tokyo">Tokyo</option>
                <option value="moscow">Moscow</option>
              </select>
            </div>

            <div className="space-y-2 text-sm">
              <p className="font-semibold text-gray-900 dark:text-gray-50">
                {benchCity.name}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                mean Πmax{" "}
                <span className="font-semibold text-gray-900 dark:text-gray-50">
                  {benchCity.piMaxMean}
                </span>
                <br />
                STHGCN{" "}
                <span className="font-semibold text-gray-900 dark:text-gray-50">
                  {benchCity.sthgcn}
                </span>{" "}
                · LLM-Move (Gemini){" "}
                <span className="font-semibold text-gray-900 dark:text-gray-50">
                  {benchCity.llmMove}
                </span>
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-200">
                {benchCity.comment}
              </p>
            </div>

            <div className="mt-4 flex justify-end">
              <Link
                to="/poi-benchmarks"
                className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
              >
                Explore full benchmarks →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
