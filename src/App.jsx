import TabelRoutingStatus from "./components/TabelRoutingStatus";
import TabelCsStatus from "./components/TabelCsStatus";
import { useState, useEffect } from "react";
import NDNTopology from "./components/NDNTopology";
import TaskList from "./components/TaskList";
import ReportBlogs from "./components/ReportBlogs";
import {
  Network,
  HardDrive,
  LayoutDashboard,
  Share2,
  BookCheck,
  MessageCircleWarning,
  Menu, // Icon untuk buka
  ChevronLeft, // Icon untuk tutup
  CardSim,
} from "lucide-react";
import CatalogContent from "./components/CatalogContent";
import "katex/dist/katex.min.css";
const App = () => {
  const tabLabels = {
    routing: "Routing Status",
    cs: "Content Store Status",
    topology: "Network Topology",
    taskslist: "Task List",
    Catalog: "Catalog Content",
    Laporan: "Laporan",
  };

  const tabComponents = {
    routing: <TabelRoutingStatus />,
    cs: <TabelCsStatus />,
    topology: <NDNTopology />,
    taskslist: <TaskList />,
    Laporan: <ReportBlogs />,
    ContentCatalog: <CatalogContent />,
  };

  const navItems = [
    { id: "routing", label: "Routing Status", icon: Network },
    { id: "cs", label: "Content Store", icon: HardDrive },
    { id: "topology", label: "Network Topology", icon: Share2 },
    { id: "taskslist", label: "Task List", icon: BookCheck },

    { id: "Laporan", label: "Laporan", icon: CardSim },
    {
      id: "ContentCatalog",
      label: "ContentCatalog",
      icon: MessageCircleWarning,
    },
  ];

  // State untuk Tab Aktif
  const [activeTab, setActiveTab] = useState(() => {
    const savedTab = localStorage.getItem("activeTab");
    return savedTab || "routing";
  });

  // State untuk Sidebar Toggle (Default: true/tampil)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    localStorage.setItem("activeTab", activeTab);
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col md:flex-row overflow-x-hidden">
      {/* Sidebar Navigasi */}
      <aside
        className={`bg-white border-r border-slate-200 transition-all duration-300 ease-in-out flex flex-col
          ${isSidebarOpen ? "w-full md:w-64" : "w-0 md:w-0 overflow-hidden opacity-0 border-none"}`}
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-10">
            <div className="bg-indigo-600 p-2 rounded-lg shrink-0">
              <LayoutDashboard className="text-white" size={24} />
            </div>
            <span className="font-bold text-xl tracking-tight whitespace-nowrap">
              NDN Node
            </span>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700 border-indigo-100 shadow-sm"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                  }`}
                >
                  <Icon size={18} className="shrink-0" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="mt-10 hidden md:block">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-xs font-semibold text-slate-400 uppercase mb-2">
                System Status
              </p>
              <div className="flex items-center gap-2 text-xs text-emerald-600 font-medium">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                Node Online
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        {/* Top Header with Toggle Button */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10 p-4 flex items-center gap-4">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 shadow-sm transition-all"
            title={isSidebarOpen ? "Tutup Sidebar" : "Buka Sidebar"}
          >
            {isSidebarOpen ? <ChevronLeft size={20} /> : <Menu size={20} />}
          </button>

          <div className="flex flex-col">
            <h2 className="text-lg font-bold text-slate-900 leading-none">
              {tabLabels[activeTab] || "Dashboard"}
            </h2>
            <span className="text-xs text-slate-400 mt-1 hidden sm:block">
              NDN Research Lab Environment
            </span>
          </div>
        </header>

        <div className="p-4 md:p-10">
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {tabLabels[activeTab]}
            </h1>
            <p className="text-slate-500 mt-1">
              Monitor data real-time dari Named Data Networking node.
            </p>
          </div>

          <div
            className={`transition-all duration-300 ${isSidebarOpen ? "max-w-5xl" : "max-w-full"}`}
          >
            {tabComponents[activeTab] || <TabelRoutingStatus />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
