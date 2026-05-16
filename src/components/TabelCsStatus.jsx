import { useState, useEffect } from "react";
import {
  HardDrive,
  Activity,
  Database,
  Target,
  XCircle,
  RefreshCcw,
  Server,
  ChevronDown,
} from "lucide-react";

function TabelCsStatus() {
  const [cs, setCs] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Konfigurasi Multi-Node
  const nodes = [
    {
      id: "node-1",
      name: "Node 1 (Indoesia)",
      baseUrl: "https://node-1.ryvo.fun/api",
    },
    {
      id: "node bridge",
      name: "Node Bridge (Bandung)",
      baseUrl: "https://bridge.ryvo.fun/api", // Ganti dengan URL asli Anda
    },
  ];

  // State untuk node yang sedang aktif
  const [selectedNode, setSelectedNode] = useState(nodes[0]);

  useEffect(() => {
    let interval;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${selectedNode.baseUrl}/cs`);
        const data = await res.json();
        setCs(data);
      } catch (error) {
        console.error(
          "Gagal mengambil data CS dari " + selectedNode.name,
          error,
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchData(); // Ambil data segera saat node berubah
    interval = setInterval(fetchData, 2000); // Polling setiap 2 detik

    return () => clearInterval(interval);
  }, [selectedNode]);

  const usagePercentage = cs
    ? ((cs.nEntries / cs.capacity) * 100).toFixed(1)
    : 0;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900">
      <div className="max-w-4xl mx-auto">
        {/* Header & Node Selector Section */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <HardDrive className="text-indigo-600" />
                Statistik Content Store (CS)
              </h1>
              <p className="text-slate-500 mt-1">
                Metrik performa penyimpanan konten pada node lokal.
              </p>
            </div>

            {/* NODE SELECTOR */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <label className="text-sm font-semibold text-slate-600 flex items-center gap-2">
                <Server size={16} /> Pilih Server:
              </label>
              <div className="relative w-full sm:w-72">
                <select
                  value={selectedNode.id}
                  onChange={(e) => {
                    const node = nodes.find((n) => n.id === e.target.value);
                    setSelectedNode(node);
                    setCs(null); // Reset data saat pindah node
                  }}
                  className="w-full appearance-none bg-white border border-slate-200 text-slate-700 py-2 px-4 pr-10 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer font-medium"
                >
                  {nodes.map((node) => (
                    <option key={node.id} value={node.id}>
                      {node.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                  <ChevronDown size={18} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {cs ? (
          <>
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

                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                        <Target size={18} />
                      </div>
                      <span className="font-medium text-slate-700">
                        Cache Hits
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-semibold text-emerald-700">
                      {cs?.nHits?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-slate-400 hidden sm:table-cell">
                      Permintaan yang berhasil dilayani
                    </td>
                  </tr>

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
                  <RefreshCcw
                    size={14}
                    className={isLoading ? "animate-spin" : ""}
                  />
                  Server: <span className="font-bold">{selectedNode.name}</span>
                </div>
                <button className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
                  RESET STATISTIK
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 p-20 text-center">
            <RefreshCcw
              size={40}
              className="mx-auto text-slate-300 animate-spin mb-4"
            />
            <p className="text-slate-500">
              Menghubungkan ke {selectedNode.name}...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default TabelCsStatus;
