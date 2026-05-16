import React, { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from "recharts";
import {
  Trophy,
  Network,
  Settings2,
  Plus,
  RotateCcw,
  Activity,
  Trash2,
  FileText,
  PieChart,
  ClipboardList,
} from "lucide-react";

const QoeExperimentDashboard = () => {
  // --- STATE KONFIGURASI ---
  const [algoNames, setAlgoNames] = useState("NDN_RL, BOLA, fastMPC");
  const [isConfigured, setIsConfigured] = useState(false);
  const [activeAlgo, setActiveAlgo] = useState("");

  // Data Structure: { [algoName]: [ { originalName, value, runId, traceName }, ... ] }
  const [experimentEntries, setExperimentEntries] = useState({});

  // Input Temp
  const [rawInput, setRawInput] = useState("");

  const parsedAlgos = useMemo(
    () =>
      algoNames
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s !== ""),
    [algoNames],
  );

  // --- LOGIKA PARSING NAMA LOG ---
  // Format: "NDN_RL (Named Data Networking)_run0_report_foot_0001.log : 0.14"
  const parseLogEntry = (inputLine) => {
    try {
      const parts = inputLine.split(":");
      if (parts.length < 2) return null;

      const fileName = parts[0].trim();
      const value = parseFloat(parts[1].trim());

      // Mencari run ID (misal: _run0_)
      const runMatch = fileName.match(/_run(\d+)_/);
      const runId = runMatch ? parseInt(runMatch[1]) : 0;

      // Mencari nama trace (bagian setelah _report_)
      const traceMatch = fileName.match(/_report_(.+)\.log/);
      const traceName = traceMatch ? traceMatch[1] : "Unknown Trace";

      return {
        originalName: fileName,
        value: isNaN(value) ? 0 : value,
        runId: runId,
        traceName: traceName,
      };
    } catch (e) {
      return null;
    }
  };

  const handleAddEntry = () => {
    const lines = rawInput.split("\n").filter((l) => l.trim() !== "");
    const newItems = lines
      .map((l) => parseLogEntry(l))
      .filter((item) => item !== null);

    if (newItems.length > 0) {
      setExperimentEntries((prev) => ({
        ...prev,
        [activeAlgo]: [...(prev[activeAlgo] || []), ...newItems],
      }));
      setRawInput("");
    }
  };

  const removeEntry = (idx) => {
    setExperimentEntries((prev) => ({
      ...prev,
      [activeAlgo]: prev[activeAlgo].filter((_, i) => i !== idx),
    }));
  };

  const handleSetup = () => {
    const initialData = {};
    parsedAlgos.forEach((a) => (initialData[a] = []));
    setExperimentEntries(initialData);
    setActiveAlgo(parsedAlgos[0]);
    setIsConfigured(true);
  };

  // --- LOGIKA FORMULA (Step-by-step dari .txt) ---
  const stats = useMemo(() => {
    if (!isConfigured || !experimentEntries[activeAlgo]) return null;

    const entries = experimentEntries[activeAlgo];

    // 1. Group by Trace (Avg QoE per trace)
    const traceGroups = {};
    entries.forEach((e) => {
      if (!traceGroups[e.traceName]) traceGroups[e.traceName] = [];
      traceGroups[e.traceName].push(e.value);
    });
    const avgPerTrace = Object.keys(traceGroups).map((name) => ({
      name,
      avg:
        traceGroups[name].reduce((a, b) => a + b, 0) / traceGroups[name].length,
    }));

    // 2. Group by Run (Avg QoE per run)
    const runGroups = {};
    entries.forEach((e) => {
      const label = `Run ${e.runId}`;
      if (!runGroups[label]) runGroups[label] = [];
      runGroups[label].push(e.value);
    });
    const avgPerRun = Object.keys(runGroups).map((name) => ({
      name,
      avg: runGroups[name].reduce((a, b) => a + b, 0) / runGroups[name].length,
    }));

    // 3. Final Comparison (Average of all entries per Algorithm)
    const finalComparison = parsedAlgos.map((algo) => {
      const algoEntries = experimentEntries[algo] || [];
      const avg =
        algoEntries.length > 0
          ? algoEntries.reduce((a, b) => a + b.value, 0) / algoEntries.length
          : 0;
      return { name: algo, avg: parseFloat(avg.toFixed(3)) };
    });

    return { avgPerTrace, avgPerRun, finalComparison };
  }, [experimentEntries, activeAlgo, isConfigured, parsedAlgos]);

  if (!isConfigured) {
    return (
      <div className="max-w-2xl mx-auto p-10 bg-white border border-slate-200 rounded-[3rem] shadow-2xl animate-in zoom-in duration-500">
        <div className="text-center mb-8">
          <div className="inline-flex p-4 bg-indigo-600 text-white rounded-3xl mb-4 shadow-xl shadow-indigo-100">
            <Settings2 size={32} />
          </div>
          <h2 className="text-3xl font-black text-slate-900">
            Inisialisasi Lab
          </h2>
          <p className="text-slate-400 font-medium">
            Masukkan algoritma yang akan diuji
          </p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">
              Daftar Algoritma (Pisahkan Koma)
            </label>
            <input
              value={algoNames}
              onChange={(e) => setAlgoNames(e.target.value)}
              className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-3xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 outline-none font-bold text-slate-700 transition-all"
              placeholder="NDN_RL, BOLA, fastMPC"
            />
          </div>
          <button
            onClick={handleSetup}
            className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-3xl font-black text-lg transition-all shadow-xl shadow-indigo-200 active:scale-95 flex items-center justify-center gap-3"
          >
            Mulai Eksperimen <Plus />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-700">
      {/* 1. SELECTOR & INPUT AREA */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white border border-slate-200 p-2 rounded-[2rem] flex flex-col gap-1 shadow-sm">
            {parsedAlgos.map((algo) => (
              <button
                key={algo}
                onClick={() => setActiveAlgo(algo)}
                className={`px-6 py-4 rounded-2xl text-left font-black transition-all flex items-center justify-between group ${
                  activeAlgo === algo
                    ? "bg-indigo-600 text-white shadow-lg"
                    : "hover:bg-slate-50 text-slate-400"
                }`}
              >
                {algo}
                <span
                  className={`text-[10px] px-2 py-1 rounded-lg ${activeAlgo === algo ? "bg-white/20" : "bg-slate-100 text-slate-400"}`}
                >
                  {experimentEntries[algo]?.length || 0} Logs
                </span>
              </button>
            ))}
            <button
              onClick={() => setIsConfigured(false)}
              className="mt-4 p-3 text-[10px] font-black text-slate-300 hover:text-rose-500 flex items-center justify-center gap-2"
            >
              <RotateCcw size={14} /> RESET SEMUA
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <ClipboardList size={20} />
            </div>
            <div>
              <h4 className="font-black text-slate-900 uppercase text-sm">
                Input Log Baru ({activeAlgo})
              </h4>
              <p className="text-[10px] text-slate-400 font-bold uppercase">
                Tempel baris log dan skor di sini
              </p>
            </div>
          </div>
          <textarea
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value)}
            className="w-full h-40 p-5 bg-slate-50 border-2 border-slate-100 rounded-3xl focus:border-indigo-500 outline-none font-mono text-xs text-slate-600 mb-4"
            placeholder={`Contoh:\nNDN_RL_run0_report_bicycle_0001.log : 0.14\nNDN_RL_run1_report_bicycle_0001.log : 0.25`}
          />
          <button
            onClick={handleAddEntry}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-black transition-all flex items-center justify-center gap-2"
          >
            <Plus size={18} /> Tambah ke {activeAlgo}
          </button>
        </div>
      </section>

      {/* 2. LOG LIST & TABLE ANALYSIS */}
      <section className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Detail Raw Logs */}
        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
          <h4 className="text-xs font-black text-slate-900 uppercase mb-6 flex items-center gap-2">
            <FileText size={16} className="text-indigo-500" /> Raw Logs:{" "}
            {activeAlgo}
          </h4>
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {experimentEntries[activeAlgo]?.map((entry, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl group border border-transparent hover:border-indigo-100 hover:bg-indigo-50/30 transition-all"
              >
                <div className="flex flex-col">
                  <span className="text-[10px] font-mono text-slate-400 truncate max-w-[250px]">
                    {entry.originalName}
                  </span>
                  <div className="flex gap-4 mt-1">
                    <span className="text-[9px] font-black text-indigo-600 bg-white px-2 py-0.5 rounded border border-indigo-50">
                      RUN {entry.runId}
                    </span>
                    <span className="text-[9px] font-black text-emerald-600 bg-white px-2 py-0.5 rounded border border-emerald-50">
                      {entry.traceName}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-lg font-black text-slate-900">
                    {entry.value.toFixed(2)}
                  </span>
                  <button
                    onClick={() => removeEntry(idx)}
                    className="p-2 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
            {(!experimentEntries[activeAlgo] ||
              experimentEntries[activeAlgo].length === 0) && (
              <p className="text-center py-10 text-slate-300 text-xs italic">
                Belum ada data
              </p>
            )}
          </div>
        </div>

        {/* Stats Results */}
        <div className="space-y-8">
          {/* Avg Per Trace */}
          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
            <h4 className="text-xs font-black text-slate-900 uppercase mb-6 flex items-center gap-2">
              <Network size={16} className="text-indigo-500" /> Avg QoE Per
              Trace
            </h4>
            <div className="grid grid-cols-2 gap-4">
              {stats?.avgPerTrace.map((t, i) => (
                <div
                  key={i}
                  className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100"
                >
                  <p className="text-[9px] font-black text-indigo-400 uppercase">
                    {t.name}
                  </p>
                  <p className="text-xl font-black text-indigo-700">
                    {t.avg.toFixed(3)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Avg Per Run */}
          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
            <h4 className="text-xs font-black text-slate-900 uppercase mb-6 flex items-center gap-2">
              <Activity size={16} className="text-emerald-500" /> Avg QoE Per
              Run
            </h4>
            <div className="grid grid-cols-2 gap-4">
              {stats?.avgPerRun.map((r, i) => (
                <div
                  key={i}
                  className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100"
                >
                  <p className="text-[9px] font-black text-emerald-400 uppercase">
                    {r.name}
                  </p>
                  <p className="text-xl font-black text-emerald-700">
                    {r.avg.toFixed(3)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. FINAL CHART (QOE SUMMARY) */}
      <section className="bg-white border border-slate-200 rounded-[3.5rem] p-12 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 rotate-12">
          <Trophy size={250} />
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 mb-3">
              <PieChart size={24} />
              <span className="text-xs font-black uppercase tracking-[0.2em]">
                Final Benchmark
              </span>
            </div>
            <h4 className="text-4xl font-black text-slate-900 tracking-tighter">
              Final Average QoE Score
            </h4>
            <p className="text-slate-500 mt-3 max-w-xl font-medium">
              Hasil perbandingan akhir berdasarkan rata-rata seluruh pengulangan
              dan skenario trace untuk setiap algoritma ABR yang diuji.
            </p>
          </div>

          <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] min-w-[240px] shadow-2xl">
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">
              Pemenang Eksperimen
            </p>
            <p className="text-3xl font-black">
              {stats?.finalComparison.length > 0
                ? [...stats.finalComparison].sort((a, b) => b.avg - a.avg)[0]
                    .name
                : "-"}
            </p>
          </div>
        </div>

        <div className="h-[500px] w-full relative z-10">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={stats?.finalComparison}
              margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f1f5f9"
              />
              <XAxis
                dataKey="name"
                fontSize={14}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#1e293b", fontWeight: 900 }}
                dy={20}
              />
              <YAxis
                fontSize={12}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8" }}
                domain={[0, "auto"]}
              />
              <Tooltip
                cursor={{ fill: "#f8fafc", radius: 20 }}
                content={<CustomTooltip />}
              />
              <Bar dataKey="avg" radius={[20, 20, 0, 0]} barSize={80}>
                {stats?.finalComparison.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={entry.name === activeAlgo ? "#6366f1" : "#e2e8f0"}
                    fillOpacity={1}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
};

// --- KOMPONEN TOOLTIP KUSTOM ---
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white p-6 rounded-[2rem] shadow-2xl border border-white/10">
        <p className="text-[10px] font-black text-indigo-400 uppercase mb-3 tracking-widest">
          {label}
        </p>
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-[8px] text-white/40 font-black uppercase">
              Final Average QoE
            </span>
            <span className="text-3xl font-black text-white">
              {payload[0].value.toFixed(3)}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export default QoeExperimentDashboard;
