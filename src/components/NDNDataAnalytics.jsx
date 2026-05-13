import React, { useState, useMemo } from "react";
import {
  ScatterChart,
  Scatter,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from "recharts";
import {
  Activity,
  Database,
  FileUp,
  Cpu,
  Clock,
  Layers,
  Trash2,
  AlertCircle,
  Zap,
  Info,
  TrendingUp,
  ArrowRightLeft,
} from "lucide-react";

const COLORS = {
  ndn: "#6366f1", // Indigo-500
  ai: "#f59e0b", // Amber-500
  hit: "#10b981", // Emerald-500
  miss: "#f43f5e", // Rose-500
  grid: "#f1f5f9",
};

const NdnDataAnalytics = () => {
  const [latencyData, setLatencyData] = useState(null);
  const [memoData, setMemoData] = useState(null);
  const [latencyFile, setLatencyFile] = useState("");
  const [memoFile, setMemoFile] = useState("");

  const parseCSV = (text) => {
    const lines = text.split(/\r?\n/).filter((line) => line.trim() !== "");
    if (lines.length < 2) return [];

    const cleanStr = (s) => (s ? s.trim().replace(/^"|"$/g, "") : "");
    const rawHeaders = lines[0].split(",").map((h) => cleanStr(h));
    const normalizedHeaders = rawHeaders.map((h) =>
      h.toLowerCase().replace(/[^a-z0-9]/g, ""),
    );

    return lines.slice(1).map((line, index) => {
      const values = line.split(",").map((v) => cleanStr(v));
      const row = { id: index, seq: index };

      rawHeaders.forEach((header, i) => {
        let val = values[i];
        if (val === undefined) return;

        let cleanNum = val.replace(/[^\d.-]/g, "");
        let numVal =
          cleanNum !== "" && !isNaN(cleanNum) ? Number(cleanNum) : null;

        const normKey = normalizedHeaders[i];
        const finalVal = numVal !== null ? numVal : val;

        row[header] = val;
        row[normKey] = finalVal;

        if (["type", "category"].some((k) => normKey.includes(k)))
          row.type = String(val).toUpperCase();
        if (["duration", "delay", "latency"].some((k) => normKey.includes(k)))
          row.delay = finalVal;
        if (["ratio", "used", "hitrate"].some((k) => normKey.includes(k))) {
          row.hitRatio = finalVal;
          row.missRatio = Math.max(0, 100 - finalVal);
        }
        if (["time", "timestamp"].some((k) => normKey.includes(k)))
          row.displayTime = val;
        if (["ishit", "status"].some((k) => normKey.includes(k)))
          row.status = String(val).toUpperCase();
      });

      return row;
    });
  };

  const handleFileUpload = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    if (type === "latency") setLatencyFile(file.name);
    else setMemoFile(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const parsed = parseCSV(event.target.result);
      if (type === "latency") setLatencyData(parsed);
      else setMemoData(parsed);
    };
    reader.readAsText(file);
  };

  // Statistik Terhitung
  const stats = useMemo(() => {
    const s = {
      ndnAvg: 0,
      aiAvg: 0,
      avgHit: 0,
      avgMiss: 0,
      countNdn: 0,
      countAi: 0,
    };

    if (latencyData?.length) {
      const ndnVals = latencyData
        .filter((d) => d.type === "NDN")
        .map((d) => Number(d.delay) || 0);
      const aiVals = latencyData
        .filter((d) => d.type === "AI")
        .map((d) => Number(d.delay) || 0);

      s.countNdn = ndnVals.length;
      s.countAi = aiVals.length;
      if (ndnVals.length)
        s.ndnAvg = ndnVals.reduce((a, b) => a + b, 0) / ndnVals.length;
      if (aiVals.length)
        s.aiAvg = aiVals.reduce((a, b) => a + b, 0) / aiVals.length;
    }

    if (memoData?.length) {
      const hits = memoData.map((d) => Number(d.hitRatio) || 0);
      const misses = memoData.map((d) => Number(d.missRatio) || 0);
      s.avgHit = hits.reduce((a, b) => a + b, 0) / hits.length;
      s.avgMiss = misses.reduce((a, b) => a + b, 0) / misses.length;
    }

    return s;
  }, [latencyData, memoData]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Upload Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UploadCard
          title="Latency Report (NDN vs AI)"
          filename={latencyFile}
          onUpload={(e) => handleFileUpload(e, "latency")}
          onClear={() => {
            setLatencyData(null);
            setLatencyFile("");
          }}
          hasData={!!latencyData}
          icon={<ArrowRightLeft className="text-indigo-600" />}
          description="Membandingkan tipe 'NDN' dan 'AI'"
        />
        <UploadCard
          title="Cache Report (Hit vs Miss)"
          filename={memoFile}
          onUpload={(e) => handleFileUpload(e, "memo")}
          onClear={() => {
            setMemoData(null);
            setMemoFile("");
          }}
          hasData={!!memoData}
          icon={<Layers className="text-emerald-600" />}
          description="Visualisasi perbandingan Hit & Miss"
        />
      </div>

      {/* Latency Comparison Section */}
      {latencyData && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-400">
              <Clock size={16} />
              <h3 className="text-xs font-bold uppercase tracking-wider">
                Perbandingan Latensi: NDN vs AI
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StatCard
              label="NDN Avg Latency"
              value={`${stats.ndnAvg.toFixed(2)}ms`}
              icon={<Zap size={18} />}
              color="text-indigo-600"
              bg="bg-indigo-50"
            />
            <StatCard
              label="AI Avg Latency"
              value={`${stats.aiAvg.toFixed(2)}ms`}
              icon={<Activity size={18} />}
              color="text-amber-600"
              bg="bg-amber-50"
            />
          </div>

          <ChartContainer
            title="Scatter Comparison"
            subtitle="Sebaran latensi paket NDN vs AI Skenario"
          >
            <ResponsiveContainer width="100%" height={350}>
              <ScatterChart
                margin={{ top: 20, right: 30, bottom: 20, left: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke={COLORS.grid}
                />
                <XAxis
                  type="number"
                  dataKey="seq"
                  name="No"
                  fontSize={10}
                  axisLine={false}
                  tick={{ fill: "#94a3b8" }}
                />
                <YAxis
                  type="number"
                  dataKey="delay"
                  name="Duration"
                  unit="ms"
                  fontSize={10}
                  axisLine={false}
                  tick={{ fill: "#94a3b8" }}
                />
                <Tooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  content={<CustomTooltip />}
                />
                <Legend verticalAlign="top" height={36} />
                <Scatter
                  name="NDN Type"
                  data={latencyData.filter((d) => d.type === "NDN")}
                  fill={COLORS.ndn}
                  shape="circle"
                />
                <Scatter
                  name="AI Type"
                  data={latencyData.filter((d) => d.type === "AI")}
                  fill={COLORS.ai}
                  shape="diamond"
                />
              </ScatterChart>
            </ResponsiveContainer>
          </ChartContainer>
        </section>
      )}

      {/* Cache Comparison Section */}
      {memoData && (
        <section className="space-y-6">
          <div className="flex items-center gap-2 text-slate-400">
            <Cpu size={16} />
            <h3 className="text-xs font-bold uppercase tracking-wider">
              Analisis Cache: Hit vs Miss
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StatCard
              label="Avg Hit Ratio"
              value={`${stats.avgHit.toFixed(2)}%`}
              icon={<TrendingUp size={18} />}
              color="text-emerald-600"
              bg="bg-emerald-50"
            />
            <StatCard
              label="Avg Miss Ratio"
              value={`${stats.avgMiss.toFixed(2)}%`}
              icon={<AlertCircle size={18} />}
              color="text-rose-600"
              bg="bg-rose-50"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartContainer
              title="Hit vs Miss Trend"
              subtitle="Perbandingan trend Hit Ratio dan Miss Ratio"
            >
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={memoData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke={COLORS.grid}
                  />
                  <XAxis dataKey="id" hide />
                  <YAxis
                    fontSize={10}
                    axisLine={false}
                    tick={{ fill: "#94a3b8" }}
                    domain={[0, 100]}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="top" height={36} />
                  <Area
                    type="monotone"
                    dataKey="hitRatio"
                    name="Hit Ratio"
                    stroke={COLORS.hit}
                    fill={COLORS.hit}
                    fillOpacity={0.1}
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="missRatio"
                    name="Miss Ratio"
                    stroke={COLORS.miss}
                    fill={COLORS.miss}
                    fillOpacity={0.1}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>

            <ChartContainer
              title="Hit/Miss Comparison"
              subtitle="Visualisasi komposisi rata-rata keseluruhan"
            >
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={[
                    {
                      name: "Cache Performance",
                      hit: stats.avgHit,
                      miss: stats.avgMiss,
                    },
                  ]}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke={COLORS.grid}
                  />
                  <XAxis dataKey="name" hide />
                  <YAxis fontSize={10} axisLine={false} />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="hit"
                    name="Avg Hit %"
                    fill={COLORS.hit}
                    radius={[6, 6, 0, 0]}
                  />
                  <Bar
                    dataKey="miss"
                    name="Avg Miss %"
                    fill={COLORS.miss}
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </section>
      )}

      {/* Empty State */}
      {!latencyData && !memoData && (
        <div className="flex flex-col items-center justify-center min-h-[300px] border-2 border-dashed border-slate-200 rounded-3xl bg-white p-10 text-center">
          <div className="bg-slate-50 p-4 rounded-full mb-4">
            <Database size={40} className="text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            Analisis Perbandingan NDN
          </h3>
          <p className="text-slate-500 max-w-xs mt-2 text-sm leading-relaxed">
            Unggah file CSV untuk membandingkan performa antara tipe NDN/AI dan
            komposisi Cache Hit/Miss.
          </p>
        </div>
      )}
    </div>
  );
};

// --- Sub-Komponen ---

const UploadCard = ({
  title,
  filename,
  onUpload,
  onClear,
  hasData,
  icon,
  description,
}) => (
  <div
    className={`bg-white border p-6 rounded-3xl transition-all shadow-sm ${hasData ? "border-indigo-100 ring-4 ring-indigo-500/5" : "border-slate-200 hover:border-slate-300"}`}
  >
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-slate-50 rounded-lg">{icon}</div>
        <div>
          <h4 className="font-bold text-slate-900 text-sm">{title}</h4>
          <p className="text-[10px] text-slate-400 mt-0.5">{description}</p>
        </div>
      </div>
      {hasData && (
        <button
          onClick={onClear}
          className="text-slate-400 hover:text-rose-500 transition-colors p-1"
        >
          <Trash2 size={16} />
        </button>
      )}
    </div>
    {!hasData ? (
      <label className="flex items-center justify-center w-full py-4 border-2 border-dashed border-slate-100 rounded-2xl hover:border-indigo-300 hover:bg-indigo-50 transition-all cursor-pointer group">
        <div className="flex items-center gap-2 text-slate-400 group-hover:text-indigo-600 font-medium text-sm">
          <FileUp size={16} /> Pilih File CSV
        </div>
        <input
          type="file"
          accept=".csv"
          onChange={onUpload}
          className="hidden"
        />
      </label>
    ) : (
      <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-xl">
        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
        <span className="text-xs font-medium text-emerald-700 truncate max-w-[200px]">
          {filename}
        </span>
      </div>
    )}
  </div>
);

const StatCard = ({ label, value, icon, color, bg }) => (
  <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all">
    <div
      className={`w-10 h-10 ${bg} ${color} rounded-xl flex items-center justify-center mb-3`}
    >
      {icon}
    </div>
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
      {label}
    </p>
    <div className="text-xl font-extrabold text-slate-900 mt-1">{value}</div>
  </div>
);

const ChartContainer = ({ title, subtitle, children }) => (
  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
    <div className="mb-6">
      <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
        {title}
      </h4>
      <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
    </div>
    <div className="w-full">{children}</div>
  </div>
);

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white/95 backdrop-blur-sm border border-slate-200 p-3 rounded-xl shadow-xl border-t-4 border-t-indigo-500 min-w-[150px]">
        <p className="text-[10px] font-bold text-slate-400 mb-2">
          {data.displayTime || `Index: ${data.id}`}
        </p>
        <div className="space-y-2">
          {payload.map((entry, index) => (
            <div
              key={index}
              className="flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: entry.color || entry.fill }}
                />
                <span className="text-[11px] font-medium text-slate-500">
                  {entry.name}:
                </span>
              </div>
              <span className="text-[11px] font-bold text-slate-900">
                {typeof entry.value === "number"
                  ? entry.value.toFixed(2)
                  : entry.value}
              </span>
            </div>
          ))}
          {data.type && (
            <div className="pt-1 border-t border-slate-100 mt-1 flex justify-between items-center">
              <span className="text-[10px] text-slate-400">Type:</span>
              <span className="text-[10px] font-bold text-indigo-600">
                {data.type}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

export default NdnDataAnalytics;
