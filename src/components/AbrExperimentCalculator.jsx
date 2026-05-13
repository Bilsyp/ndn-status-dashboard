import { useState, useMemo } from "react";
import {
  Settings,
  Timer,
  RotateCcw,
  AlertTriangle,
  Clock,
  PlayCircle,
  Info,
} from "lucide-react";

const AbrExperimentCalculator = () => {
  // State untuk input
  const [inputs, setInputs] = useState({
    algo: 4,
    runtime: 280,
    repeat: 10,
    retryPct: 0,
  });

  // Handler perubahan input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs((prev) => ({
      ...prev,
      [name]: parseFloat(value) || 0,
    }));
  };

  // Logika format waktu
  const formatDuration = (min) => {
    if (min < 60) return `${min.toFixed(1)} menit`;
    if (min < 60 * 24) return `${(min / 60).toFixed(1)} jam`;
    return `${(min / (60 * 24)).toFixed(2)} hari`;
  };

  // Perhitungan hasil (Memoized)
  const stats = useMemo(() => {
    const { algo, runtime, repeat, retryPct } = inputs;

    const totalRun = algo * repeat;
    const cleanMin = (totalRun * runtime) / 60;
    const retryFactor = 1 + retryPct / 100;
    const retryMin = cleanMin * retryFactor;

    // Baris tabel rincian
    const tableRows = [1, 2, 3, 5, 10, 20, repeat]
      .filter((v, i, a) => a.indexOf(v) === i)
      .sort((a, b) => a - b)
      .map((r) => {
        const run = r * algo;
        const m = (run * runtime) / 60;
        return {
          repeat: r,
          run,
          min: m.toFixed(1),
          jam: (m / 60).toFixed(2),
          hari: (m / 1440).toFixed(2),
          isActive: r === repeat,
        };
      });

    return { totalRun, cleanMin, retryMin, tableRows };
  }, [inputs]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Parameter Input Grid */}
      <section>
        <div className="flex items-center gap-2 mb-4 text-slate-400">
          <Settings size={16} />
          <h3 className="text-xs font-bold uppercase tracking-wider">
            Parameter Eksperimen
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <InputBox
            label="Jumlah Algoritma"
            name="algo"
            value={inputs.algo}
            onChange={handleChange}
            unit="ABR (MPC, BOLA, dll)"
            icon={<PlayCircle size={18} className="text-indigo-500" />}
          />
          <InputBox
            label="Runtime per Run"
            name="runtime"
            value={inputs.runtime}
            onChange={handleChange}
            unit="Detik per run"
            icon={<Timer size={18} className="text-indigo-500" />}
          />
          <InputBox
            label="Repeat Time"
            name="repeat"
            value={inputs.repeat}
            onChange={handleChange}
            unit="Kali pengulangan"
            icon={<RotateCcw size={18} className="text-indigo-500" />}
          />
          <InputBox
            label="Estimasi Retry"
            name="retryPct"
            value={inputs.retryPct}
            onChange={handleChange}
            unit="% Kemungkinan gagal"
            icon={<AlertTriangle size={18} className="text-amber-500" />}
          />
        </div>
      </section>

      {/* Result Cards */}
      <section>
        <div className="flex items-center gap-2 mb-4 text-slate-400">
          <Clock size={16} />
          <h3 className="text-xs font-bold uppercase tracking-wider">
            Hasil Perhitungan
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ResultCard
            label="Total Eksekusi"
            value={stats.totalRun}
            sub="Jumlah seluruh run"
            variant="indigo"
          />
          <ResultCard
            label="Total Waktu Bersih"
            value={
              stats.cleanMin < 60
                ? `${stats.cleanMin.toFixed(1)} m`
                : `${(stats.cleanMin / 60).toFixed(2)} j`
            }
            sub={`≈ ${formatDuration(stats.cleanMin)}`}
            variant="emerald"
          />
          <ResultCard
            label="Estimasi + Retry"
            value={
              inputs.retryPct === 0
                ? "—"
                : stats.retryMin < 60
                  ? `${stats.retryMin.toFixed(1)} m`
                  : `${(stats.retryMin / 60).toFixed(2)} j`
            }
            sub={
              inputs.retryPct === 0
                ? "Tanpa faktor kegagalan"
                : `≈ ${formatDuration(stats.retryMin)}`
            }
            variant="amber"
          />
        </div>
      </section>

      {/* Rincian Table */}
      <section>
        <div className="overflow-hidden bg-white border border-slate-200 rounded-2xl shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200">
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase">
                  Repeat
                </th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase">
                  Total Run
                </th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase">
                  Menit
                </th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase">
                  Jam
                </th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase">
                  Hari
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats.tableRows.map((row, idx) => (
                <tr
                  key={idx}
                  className={`transition-colors ${row.isActive ? "bg-indigo-50/50 font-semibold" : "hover:bg-slate-50"}`}
                >
                  <td className="p-4 text-sm text-slate-700">
                    {row.repeat}{" "}
                    {row.isActive && (
                      <span className="ml-2 text-[10px] bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">
                        AKTIF
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-sm text-slate-600">{row.run}</td>
                  <td className="p-4 text-sm text-slate-600">{row.min}</td>
                  <td className="p-4 text-sm text-slate-600">{row.jam}</td>
                  <td className="p-4 text-sm text-slate-600">
                    {parseFloat(row.hari) < 1 ? "< 1" : row.hari}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Note Box */}
      <div className="bg-indigo-50 border-l-4 border-indigo-500 p-5 rounded-r-xl flex gap-4">
        <div className="mt-1">
          <Info size={20} className="text-indigo-600" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-indigo-900 mb-1">
            Panduan RUN_TIME
          </h4>
          <p className="text-sm text-indigo-800/80 leading-relaxed">
            Setiap eksperimen ABR diberikan batas waktu{" "}
            <strong>{inputs.runtime} detik</strong>. Sistem akan membuka
            browser, memilih algoritma, dan merekam data streaming. Pastikan
            durasi ini mencukupi agar video dapat melewati fase{" "}
            <em>startup buffering</em> sehingga log data yang dihasilkan
            bersifat representatif untuk analisis.
          </p>
        </div>
      </div>
    </div>
  );
};

// Sub-komponen InputBox
const InputBox = ({ label, name, value, onChange, unit, icon }) => (
  <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
    <div className="flex justify-between items-start mb-2">
      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">
        {label}
      </label>
      {icon}
    </div>
    <input
      type="number"
      name={name}
      value={value}
      onChange={onChange}
      className="w-full bg-transparent border-none outline-none text-2xl font-bold text-slate-900 p-0 mb-1"
    />
    <p className="text-[10px] text-slate-400">{unit}</p>
  </div>
);

// Sub-komponen ResultCard
const ResultCard = ({ label, value, sub, variant }) => {
  const styles = {
    indigo: "bg-indigo-50 border-indigo-100 text-indigo-700",
    emerald: "bg-emerald-50 border-emerald-100 text-emerald-700",
    amber: "bg-amber-50 border-amber-100 text-amber-700",
  };

  return (
    <div className={`p-5 rounded-2xl border ${styles[variant]} shadow-sm`}>
      <p className="text-[11px] font-bold opacity-70 uppercase mb-1">{label}</p>
      <div className="text-2xl font-extrabold mb-1">{value}</div>
      <p className="text-[10px] opacity-60 font-medium">{sub}</p>
    </div>
  );
};

export default AbrExperimentCalculator;
