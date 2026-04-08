import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import Landing from "./pages/Landing";
import YearView from "./pages/YearView";
import Timetable from "./pages/Timetable";
import DashboardLayout from "./components/DashboardLayout";
import NotFound from "./pages/NotFound";
import {Analytics} from "@vercel/analytics/react";
const App = () => (
  <>
    <Toaster />
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route element={<DashboardLayout />}>
          <Route path="/year-view" element={<YearView />} />
          <Route path="/timetable" element={<Timetable />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
    <Analytics />
  </>
);

export default App;