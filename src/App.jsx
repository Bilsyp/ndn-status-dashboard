import TabelRoutingStatus from "./components/TabelRoutingStatus";
import TabelCsStatus from "./components/TabelCsStatus";
import NDNTopology from "./components/NDNTopology";
import TaskList from "./components/TaskList";
import ReportBlogs from "./components/ReportBlogs";
import AbrExperimentCalculator from "./components/AbrExperimentCalculator";
import QoeAnalytics from "./components/QoeAnalytics";
import NdnDataAnalytics from "./components/NDNDataAnalytics";
import QoeExperimentDashboard from "./components/QoeExperimentDashboard";
import CatalogContent from "./components/CatalogContent";

import "katex/dist/katex.min.css";
import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
  Navigate,
} from "react-router-dom";
import {
  Network,
  HardDrive,
  LayoutDashboard,
  Share2,
  BookCheck,
  MessageCircleWarning,
  Menu,
  ChevronLeft,
  Calculator,
  FileText, // Mengganti CardSim yang tidak valid
  ChartArea,
} from "lucide-react";

// --- KOMPONEN NAVIGASI ---
const NavButton = ({ item, isSidebarOpen }) => {
  const location = useLocation();
  const Icon = item.icon;
  const isActive = location.pathname === item.path;

  return (
    <Link
      to={item.path}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
        isActive
          ? "bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-sm"
          : "text-slate-500 hover:bg-slate-50 hover:text-slate-700 border border-transparent"
      }`}
    >
      <Icon size={18} className="shrink-0" />
      {isSidebarOpen && <span>{item.label}</span>}
    </Link>
  );
};

const AppContent = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();

  const navItems = [
    {
      id: "routing",
      label: "Routing Status",
      path: "/routing",
      icon: Network,
      component: <TabelRoutingStatus />,
    },
    {
      id: "cs",
      label: "Content Store",
      path: "/cs",
      icon: HardDrive,
      component: <TabelCsStatus />,
    },
    {
      id: "topology",
      label: "Network Topology",
      path: "/topology",
      icon: Share2,
      component: <NDNTopology />,
    },
    {
      id: "tasks",
      label: "Task List",
      path: "/tasks",
      icon: BookCheck,
      component: <TaskList />,
    },
    {
      id: "laporan",
      label: "Laporan",
      path: "/laporan",
      icon: FileText,
      component: <ReportBlogs />,
    },
    {
      id: "abr",
      label: "ABR Calculator",
      path: "/abr-calculator",
      icon: Calculator,
      component: <AbrExperimentCalculator />,
    },
    {
      id: "ndn-analytics",
      label: "NDN Analytics",
      path: "/ndn-analytics",
      icon: ChartArea,
      component: <NdnDataAnalytics />,
    },
    {
      id: "qoe-analytics",
      label: "QoE Analytics",
      path: "/qoe-analytics",
      icon: ChartArea,
      component: <QoeAnalytics />,
    },
    {
      id: "qoe-dashboard",
      label: "QoE Dashboard",
      path: "/qoe-dashboard",
      icon: ChartArea,
      component: <QoeExperimentDashboard />,
    },
    {
      id: "catalog",
      label: "Content Catalog",
      path: "/catalog",
      icon: MessageCircleWarning,
      component: <CatalogContent />,
    },
  ];

  const currentItem = navItems.find((item) => item.path === location.pathname);
  const pageTitle = currentItem ? currentItem.label : "Dashboard";

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css";
    document.head.appendChild(link);
    return () => {
      if (document.head.contains(link)) document.head.removeChild(link);
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col md:flex-row overflow-x-hidden">
      <aside
        className={`bg-white border-r border-slate-200 transition-all duration-300 ease-in-out flex flex-col sticky top-0 h-screen
          ${isSidebarOpen ? "w-full md:w-64" : "w-0 md:w-0 overflow-hidden"}`}
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-10 overflow-hidden">
            <div className="bg-indigo-600 p-2 rounded-lg shrink-0">
              <LayoutDashboard className="text-white" size={24} />
            </div>
            {isSidebarOpen && (
              <span className="font-bold text-xl tracking-tight whitespace-nowrap">
                NDN Node
              </span>
            )}
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavButton
                key={item.id}
                item={item}
                isSidebarOpen={isSidebarOpen}
              />
            ))}
          </nav>

          {isSidebarOpen && (
            <div className="mt-10 hidden md:block">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-xs font-semibold text-slate-400 uppercase mb-2">
                  Status Sistem
                </p>
                <div className="flex items-center gap-2 text-xs text-emerald-600 font-medium">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  Node Online
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-20 p-4 flex items-center gap-4">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 shadow-sm transition-all"
          >
            {isSidebarOpen ? <ChevronLeft size={20} /> : <Menu size={20} />}
          </button>

          <div className="flex flex-col">
            <h2 className="text-lg font-bold text-slate-900 leading-none">
              {pageTitle}
            </h2>
            <span className="text-xs text-slate-400 mt-1 hidden sm:block">
              NDN Research Lab Environment
            </span>
          </div>
        </header>

        <div className="p-4 md:p-10 flex-1">
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {pageTitle}
            </h1>
            <p className="text-slate-500 mt-1">
              Pantau data real-time dari node Named Data Networking Anda.
            </p>
          </div>

          <div className="w-full">
            <Routes>
              <Route path="/" element={<Navigate to="/routing" replace />} />
              {navItems.map((item) => (
                <Route
                  key={item.id}
                  path={item.path}
                  element={item.component}
                />
              ))}
              <Route
                path="*"
                element={
                  <div className="text-center p-20">
                    <h3 className="text-xl font-bold text-slate-400">
                      404 - Halaman Tidak Ditemukan
                    </h3>
                    <Link
                      to="/"
                      className="text-indigo-600 hover:underline mt-4 inline-block"
                    >
                      Kembali ke Beranda
                    </Link>
                  </div>
                }
              />
            </Routes>
          </div>
        </div>
      </main>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
