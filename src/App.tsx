import { BrowserRouter as Router, Routes, Route } from "react-router";

import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";

// Dashboard 首页
import Home from "./pages/Dashboard/Home";

// 你要新建的三个页面（先做占位组件也可以）
import T5Forecast from "./pages/T5Forecast";
import MobilityPredictability from "./pages/MobilityPredictability";
import POIBenchmarks from "./pages/POIBenchmarks";

// 404 页面
import NotFound from "./pages/OtherPage/NotFound";

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* 主布局：左侧菜单 + 顶部栏 */}
        <Route element={<AppLayout />}>
          {/* Dashboard 总览首页 */}
          <Route index path="/" element={<Home />} />

          {/* T5 Forecast 页面 */}
          <Route path="/t5-forecast" element={<T5Forecast />} />

          {/* Mobility Predictability 页面 */}
          <Route
            path="/mobility-predictability"
            element={<MobilityPredictability />}
          />

          {/* POI Benchmarks 页面 */}
          <Route path="/poi-benchmarks" element={<POIBenchmarks />} />
        </Route>

        {/* 兜底 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}