import TabelRoutingStatus from "./components/TabelRoutingStatus";
import TabelCsStatus from "./components/TabelCsStatus";
import React, { useState } from "react";
import NDNTopology from "./components/NDNTopology";
import TaskList from "./components/TaskList";
import {
  Network,
  ArrowRightLeft,
  Database,
  CircleDollarSign,
  Flag,
  Clock,
  Search,
  HardDrive,
  Activity,
  Target,
  XCircle,
  RefreshCcw,
  LayoutDashboard,
  Settings,
  Share2,
  BookCheck,
} from "lucide-react";
const App = () => {
  const [activeTab, setActiveTab] = useState("routing"); // 'routing' atau 'cs'
  const tabLabels = {
    routing: "Routing Status",
    cs: "Content Store Status",
    topology: "Network Topology",
    taskslist: "Task List",
  };
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Sidebar Navigasi Desktop / Header Mobile */}
      <div className="flex flex-col md:flex-row">
        {/* Navigation Bar */}
        <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-slate-200 p-6 md:min-h-screen">
          <div className="flex items-center gap-3 mb-10">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <LayoutDashboard className="text-white" size={24} />
            </div>
            <span className="font-bold text-xl tracking-tight">NDN Node</span>
          </div>

          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab("routing")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === "routing"
                  ? "bg-indigo-50 text-indigo-700 border-indigo-100 shadow-sm"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
              }`}
            >
              <Network size={18} />
              Routing Status
            </button>
            <button
              onClick={() => setActiveTab("cs")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === "cs"
                  ? "bg-indigo-50 text-indigo-700 border-indigo-100 shadow-sm"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
              }`}
            >
              <HardDrive size={18} />
              Content Store
            </button>
            <button
              onClick={() => setActiveTab("topology")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === "topology"
                  ? "bg-indigo-50 text-indigo-700 border-indigo-100 shadow-sm"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
              }`}
            >
              <Share2 size={18} />
              Network Topology
            </button>
            <button
              onClick={() => setActiveTab("taskslist")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === "taskslist"
                  ? "bg-indigo-50 text-indigo-700 border-indigo-100 shadow-sm"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
              }`}
            >
              <BookCheck size={18} />
              Task List
            </button>
          </nav>

          <div className="mt-auto pt-10 hidden md:block">
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
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-10">
          <header className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {tabLabels[activeTab] || "Dashboard"}
              </h1>
              <p className="text-slate-500">
                Monitor data real-time dari Named Data Networking node.
              </p>
            </div>
          </header>

          <div className="max-w-5xl">
            {activeTab === "routing" ? (
              <TabelRoutingStatus />
            ) : activeTab === "topology" ? (
              <NDNTopology />
            ) : activeTab == "taskslist" ? (
              <TaskList />
            ) : (
              <TabelCsStatus />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
