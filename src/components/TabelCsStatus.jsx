import React, { useState, useEffect } from "react";
import {
  HardDrive,
  Activity,
  Database,
  Zap,
  Target,
  XCircle,
  RefreshCcw,
  CheckCircle2,
} from "lucide-react";
function TabelCsStatus() {
  const [cs, setCs] = useState(null);
  useEffect(() => {
    const fetchData = () => {
      fetch("https://wss-bridge.ryvo.fun/api/cs")
        .then((res) => res.json())
        .then(setCs);
    };
    fetchData(); // initial
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, []);
  const usagePercentage = ((cs?.nEntries / cs?.capacity) * 100).toFixed(1);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <HardDrive className="text-indigo-600" />
            Statistik Content Store (CS)
          </h1>
          <p className="text-slate-500 mt-1">
            Metrik performa penyimpanan konten pada node lokal.
          </p>
        </div>

        {/* Visual Summary Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-medium text-slate-500 uppercase">
                Penggunaan Kapasitas
              </span>
              <span className="text-sm font-bold text-indigo-600">
                {usagePercentage}%
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3 mb-2">
              <div
                className="bg-indigo-500 h-3 rounded-full transition-all duration-1000"
                style={{ width: `${usagePercentage}%` }}
              ></div>
            </div>
            <p className="text-xs text-slate-400">
              {cs?.nEntries?.toLocaleString()} dari{" "}
              {cs?.capacity?.toLocaleString()} slot terpakai.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex justify-around items-center">
            <div className="text-center">
              <div className="text-xs text-slate-500 uppercase mb-1">
                Admit Strategy
              </div>
              <div className="flex items-center gap-1 justify-center">
                <div
                  className={`w-2 h-2 rounded-full ${cs?.admit === "on" ? "bg-emerald-500" : "bg-red-500"}`}
                ></div>
                <span className="font-bold uppercase tracking-wider">
                  {cs?.admit}
                </span>
              </div>
            </div>
            <div className="w-px h-10 bg-slate-200"></div>
            <div className="text-center">
              <div className="text-xs text-slate-500 uppercase mb-1">
                Serve Strategy
              </div>
              <div className="flex items-center gap-1 justify-center">
                <div
                  className={`w-2 h-2 rounded-full ${cs?.serve === "on" ? "bg-emerald-500" : "bg-red-500"}`}
                ></div>
                <span className="font-bold uppercase tracking-wider">
                  {cs?.serve}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Detail Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-semibold text-slate-600 uppercase">
                  Parameter Metrik
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-600 uppercase text-right">
                  Nilai
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-600 uppercase text-right hidden sm:table-cell">
                  Deskripsi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {/* Entries */}
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                    <Database size={18} />
                  </div>
                  <span className="font-medium text-slate-700">
                    Jumlah Entri
                  </span>
                </td>
                <td className="px-6 py-4 text-right font-mono font-semibold text-blue-700">
                  {cs?.nEntries?.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-right text-sm text-slate-400 hidden sm:table-cell">
                  Objek data yang saat ini disimpan
                </td>
              </tr>

              {/* Hits */}
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 flex items-center gap-3">
                  <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                    <Target size={18} />
                  </div>
                  <span className="font-medium text-slate-700">Cache Hits</span>
                </td>
                <td className="px-6 py-4 text-right font-mono font-semibold text-emerald-700">
                  {cs?.nHits?.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-right text-sm text-slate-400 hidden sm:table-cell">
                  Permintaan yang berhasil dilayani
                </td>
              </tr>

              {/* Misses */}
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 flex items-center gap-3">
                  <div className="p-2 bg-rose-50 rounded-lg text-rose-600">
                    <XCircle size={18} />
                  </div>
                  <span className="font-medium text-slate-700">
                    Cache Misses
                  </span>
                </td>
                <td className="px-6 py-4 text-right font-mono font-semibold text-rose-700">
                  {cs?.nMisses?.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-right text-sm text-slate-400 hidden sm:table-cell">
                  Permintaan yang diteruskan ke upstream
                </td>
              </tr>

              {/* Total Throughput (Computed example) */}
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 flex items-center gap-3">
                  <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                    <Activity size={18} />
                  </div>
                  <span className="font-medium text-slate-700">
                    Total Lookup
                  </span>
                </td>
                <td className="px-6 py-4 text-right font-mono font-semibold text-amber-700">
                  {(cs?.nHits + cs?.nMisses)?.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-right text-sm text-slate-400 hidden sm:table-cell">
                  Akumulasi pengecekan cache
                </td>
              </tr>
            </tbody>
          </table>

          {/* Footer Info */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <RefreshCcw size={14} className="animate-spin-slow" />
              Terakhir diperbarui: Baru saja
            </div>
            <button className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
              RESET STATISTIK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TabelCsStatus;
