import { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  FileUp,
  Activity,
  BarChart3,
  Zap,
  AlertCircle,
  Clock,
  Database,
  Plus,
  Trash2,
  MousePointer2,
  BarChart as BarChartIcon,
} from "lucide-react";

const COLORS = {
  qoe: "#6366f1", // Indigo-500
  bitrate: "#10b981", // Emerald-500
  rebuff: "#f43f5e", // Rose-500
  stall: "#f59e0b", // Amber-500
  switch: "#8b5cf6", // Violet-500
  chartPalette: [
    "#6366f1",
    "#10b981",
    "#f59e0b",
    "#f43f5e",
    "#8b5cf6",
    "#06b6d4",
  ],
};

const QoeAnalytics = () => {
  const [mode, setMode] = useState("csv"); // 'csv' atau 'manual'
  const [data, setData] = useState(null);
  const [fileName, setFileName] = useState("");

  // State untuk Manual Input
  const [manualData, setManualData] = useState([]);
  const [newEntry, setNewEntry] = useState({ name: "", score: "" });

  // --- LOGIKA CSV ---
  const parseCSV = (text) => {
    const lines = text.split(/\r?\n/).filter((line) => line.trim() !== "");
    if (lines.length < 2) return [];
    const headers = lines[0].split(",").map((h) => h.trim());
    return lines.slice(1).map((line) => {
      const values = line.split(",").map((v) => v.trim());
      const row = {};
      headers.forEach((header, i) => {
        let val = values[i];
        if (val === undefined || val === "") val = null;
        else if (!isNaN(val) && val.trim() !== "") val = Number(val);
        row[header] = val;
      });
      return row;
    });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const parsedData = parseCSV(event.target.result);
      setData(parsedData);
    };
    reader.readAsText(file);
  };

  const stats = useMemo(() => {
    if (!data || data.length === 0) return null;
    const lastRow = data[data.length - 1];
    const avgQoE =
      data.reduce((acc, curr) => acc + (Number(curr.qoe_score) || 0), 0) /
      data.length;
    const maxBitrate = Math.max(
      ...data.map((d) => Number(d.avg_bitrate_mbps) || 0),
    );
    return {
      avgQoE,
      maxBitrate,
      totalSwitches: Number(lastRow.switch_count) || 0,
      totalStall: Number(lastRow.total_stall_sec) || 0,
      count: data.length,
    };
  }, [data]);

  // --- LOGIKA MANUAL ---
  const handleAddManual = () => {
    if (newEntry.name && newEntry.score !== "") {
      setManualData([
        ...manualData,
        { name: newEntry.name, score: Number(newEntry.score) },
      ]);
      setNewEntry({ name: "", score: "" });
    }
  };

  const removeManualEntry = (index) => {
    setManualData(manualData.filter((_, i) => i !== index));
  };

  const formatTime = (ts) => {
    if (!ts) return "";
    try {
      const d = new Date(ts);
      return d.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch (e) {
      return ts;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Mode Switcher */}
      <div className="flex p-1 bg-slate-100 rounded-xl w-fit">
        <button
          onClick={() => setMode("csv")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${mode === "csv" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
        >
          <Database size={16} />
          CSV Report
        </button>
        <button
          onClick={() => setMode("manual")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${mode === "manual" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
        >
          <MousePointer2 size={16} />
          Manual Input
        </button>
      </div>

      {mode === "csv" ? (
        // --- VIEW CSV ---
        !data ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed border-slate-200 rounded-3xl bg-white p-10 text-center">
            <div className="bg-indigo-50 p-4 rounded-full mb-4 text-indigo-600">
              <FileUp size={40} />
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              Upload Data QoE
            </h3>
            <p className="text-slate-500 max-w-xs mt-2 mb-6">
              Pilih file CSV laporan QoE untuk melihat analisis grafik lengkap.
            </p>
            <label className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-md flex items-center gap-2">
              <Database size={18} /> Pilih File CSV
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-100 text-emerald-600 p-2 rounded-lg">
                  <Activity size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">{fileName}</h4>
                  <p className="text-xs text-slate-400">
                    Total {stats.count} data point
                  </p>
                </div>
              </div>
              <button
                onClick={() => setData(null)}
                className="text-xs font-medium text-slate-500 hover:text-indigo-600"
              >
                Ganti File
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatCard
                label="Avg QoE"
                value={stats.avgQoE.toFixed(2)}
                icon={<Zap size={18} />}
                color="text-indigo-600"
                bg="bg-indigo-50"
              />
              <StatCard
                label="Peak Bitrate"
                value={`${stats.maxBitrate.toFixed(2)} Mbps`}
                icon={<BarChart3 size={18} />}
                color="text-emerald-600"
                bg="bg-emerald-50"
              />
              <StatCard
                label="Quality Switches"
                value={stats.totalSwitches}
                icon={<AlertCircle size={18} />}
                color="text-violet-600"
                bg="bg-violet-50"
              />
              <StatCard
                label="Total Stall"
                value={`${stats.totalStall.toFixed(2)}s`}
                icon={<Clock size={18} />}
                color="text-amber-600"
                bg="bg-amber-50"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartContainer
                title="QoE Score Trend"
                subtitle="Stabilitas kualitas"
              >
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={data}>
                    <defs>
                      <linearGradient id="colorQoe" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor={COLORS.qoe}
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor={COLORS.qoe}
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f1f5f9"
                    />
                    <XAxis
                      dataKey="timestamp"
                      tickFormatter={formatTime}
                      fontSize={10}
                      tick={{ fill: "#94a3b8" }}
                      axisLine={false}
                    />
                    <YAxis
                      fontSize={10}
                      tick={{ fill: "#94a3b8" }}
                      axisLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="qoe_score"
                      stroke={COLORS.qoe}
                      fill="url(#colorQoe)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>

              <ChartContainer
                title="Bitrate vs Stall"
                subtitle="Korelasi performa"
              >
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f1f5f9"
                    />
                    <XAxis
                      dataKey="timestamp"
                      tickFormatter={formatTime}
                      fontSize={10}
                      tick={{ fill: "#94a3b8" }}
                      axisLine={false}
                    />
                    <YAxis
                      fontSize={10}
                      tick={{ fill: "#94a3b8" }}
                      axisLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend verticalAlign="top" height={36} />
                    <Line
                      type="monotone"
                      dataKey="avg_bitrate_mbps"
                      name="Bitrate"
                      stroke={COLORS.bitrate}
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="stepAfter"
                      dataKey="total_stall_sec"
                      name="Stall"
                      stroke={COLORS.stall}
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </div>
        )
      ) : (
        // --- VIEW MANUAL INPUT ---
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Input */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4">
                Input Data Skor
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">
                    Nama Algoritma / Skenario
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: BOLA-Basic"
                    value={newEntry.name}
                    onChange={(e) =>
                      setNewEntry({ ...newEntry, name: e.target.value })
                    }
                    className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">
                    QoE Score (0-100)
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={newEntry.score}
                    onChange={(e) =>
                      setNewEntry({ ...newEntry, score: e.target.value })
                    }
                    className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
                <button
                  onClick={handleAddManual}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold text-sm shadow-md shadow-indigo-100 flex items-center justify-center gap-2 transition-all"
                >
                  <Plus size={18} /> Tambah Data
                </button>
              </div>
            </div>

            {/* List Data */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm max-h-[300px] overflow-y-auto">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-3">
                Daftar Data
              </h4>
              <div className="space-y-2">
                {manualData.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-xl group"
                  >
                    <div>
                      <p className="text-sm font-bold text-slate-700">
                        {item.name}
                      </p>
                      <p className="text-xs text-indigo-600 font-semibold">
                        Score: {item.score}
                      </p>
                    </div>
                    <button
                      onClick={() => removeManualEntry(idx)}
                      className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                {manualData.length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-4 italic">
                    Belum ada data
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Chart Perbandingan */}
          <div className="lg:col-span-2">
            <ChartContainer
              title="Perbandingan QoE Score"
              subtitle="Visualisasi skor antar skenario (Bar Chart)"
            >
              {manualData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart
                    data={manualData}
                    margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f1f5f9"
                    />
                    <XAxis
                      dataKey="name"
                      fontSize={11}
                      tick={{ fill: "#64748b", fontWeight: 600 }}
                      axisLine={false}
                      tickLine={false}
                      dy={10}
                    />
                    <YAxis
                      fontSize={11}
                      tick={{ fill: "#94a3b8" }}
                      axisLine={false}
                      tickLine={false}
                      domain={[0, 100]}
                    />
                    <Tooltip
                      cursor={{ fill: "#f8fafc" }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-xl">
                              <p className="text-xs font-bold text-slate-900 mb-1">
                                {payload[0].payload.name}
                              </p>
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-indigo-500" />
                                <span className="text-xs text-slate-500">
                                  Skor:
                                </span>
                                <span className="text-xs font-bold text-indigo-600">
                                  {payload[0].value}
                                </span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="score" radius={[8, 8, 0, 0]} barSize={50}>
                      {manualData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            COLORS.chartPalette[
                              index % COLORS.chartPalette.length
                            ]
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[400px] flex flex-col items-center justify-center text-slate-400">
                  <BarChartIcon size={48} className="mb-2 opacity-20" />
                  <p className="text-sm">Masukkan data untuk melihat grafik</p>
                </div>
              )}
            </ChartContainer>
          </div>
        </div>
      )}
    </div>
  );
};

// Sub-komponen Card Statistik
const StatCard = ({ label, value, icon, color, bg }) => (
  <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
    <div
      className={`w-10 h-10 ${bg} ${color} rounded-xl flex items-center justify-center mb-3`}
    >
      {icon}
    </div>
    <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">
      {label}
    </p>
    <div className="text-2xl font-extrabold text-slate-900 mt-1">{value}</div>
  </div>
);

// Sub-komponen Container Grafik
const ChartContainer = ({ title, subtitle, children }) => (
  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm h-full">
    <div className="mb-6">
      <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
        {title}
      </h4>
      <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
    </div>
    {children}
  </div>
);

// Custom Tooltip CSV
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 backdrop-blur-md border border-slate-200 p-3 rounded-xl shadow-xl">
        <p className="text-[10px] font-bold text-slate-400 mb-2">
          {new Date(label).toLocaleString()}
        </p>
        <div className="space-y-1">
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-3">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-xs font-medium text-slate-600">
                {entry.name}:
              </span>
              <span className="text-xs font-bold text-slate-900">
                {Number(entry.value).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export default QoeAnalytics;
