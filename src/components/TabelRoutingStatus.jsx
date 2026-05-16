import React, { useState, useEffect } from "react";
import {
  Network,
  ArrowRightLeft,
  Database,
  CircleDollarSign,
  Flag,
  Clock,
  Search,
  Server, // Icon tambahan untuk Node
  ChevronDown,
  RefreshCw,
} from "lucide-react";

const TabelRoutingStatus = () => {
  const [routes, setRoutes] = useState([]);
  const [cs, setCs] = useState(null);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Konfigurasi Multi-Node
  const nodes = [
    {
      id: "node-1",
      name: "Node 1 (Indonesia)",
      baseUrl: "https://node-1.ryvo.fun/api",
    },
    {
      id: "node bridge",
      name: "Node Bridge (Indonesia)",
      baseUrl: "https://bridge.ryvo.fun/api/", // Ganti dengan URL asli Anda
    },
  ];

  // State untuk node yang sedang aktif
  const [selectedNode, setSelectedNode] = useState(nodes[0]);

  useEffect(() => {
    let interval;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [routesRes, csRes] = await Promise.all([
          fetch(`${selectedNode.baseUrl}/routes`),
          fetch(`${selectedNode.baseUrl}/cs`),
        ]);

        const routesData = await routesRes.json();
        const csData = await csRes.json();

        setRoutes(routesData);
        setCs(csData);
      } catch (error) {
        console.error("Gagal mengambil data dari " + selectedNode.name, error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData(); // Ambil data segera saat node berubah
    interval = setInterval(fetchData, 5000); // Polling setiap 5 detik

    return () => clearInterval(interval);
  }, [selectedNode]); // Effect berjalan ulang jika selectedNode berubah

  const filteredRoutes = routes.filter((r) =>
    r.prefix?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Kontrol Navigasi & Node Switcher */}
        <div className="mb-8 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <Network className="text-blue-600" />
                Monitoring Node NDN
              </h1>
              <p className="text-slate-500 mt-1">
                Pantau rute dan status hop secara real-time dari berbagai
                server.
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
                    setRoutes([]); // Reset data sementara saat pindah node
                  }}
                  className="w-full appearance-none bg-white border border-slate-200 text-slate-700 py-2 px-4 pr-10 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer font-medium"
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
              {isLoading && (
                <RefreshCw size={18} className="text-blue-500 animate-spin" />
              )}
            </div>
          </div>

          {/* SEARCH BOX */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Filter berdasarkan prefix..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-80 transition-all"
            />
          </div>
        </div>

        {/* Tabel Utama */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Prefix
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Next Hop
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Origin
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">
                    Cost
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRoutes.length > 0 ? (
                  filteredRoutes.map((item, index) => (
                    <tr
                      key={index}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <code className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md border border-indigo-100 font-mono">
                          {item.prefix}
                        </code>
                      </td>
                      <td className="px-6 py-4">
                        <span className="flex items-center gap-2 font-medium text-slate-700">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                          #{item.nexthop}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight ${
                            item.origin === "nlsr"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {item.origin}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center font-semibold text-slate-800">
                        {item.cost}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-emerald-50 text-emerald-700 rounded-md text-xs font-medium border border-emerald-100">
                          {item.flags}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-20 text-center text-slate-400"
                    >
                      {isLoading
                        ? "Menghubungkan ke server..."
                        : "Tidak ada data rute ditemukan."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-200 flex items-center justify-between text-xs font-medium text-slate-500 uppercase">
            <span>Server Terhubung: {selectedNode.name}</span>
            <span>Total: {routes.length} Entri</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TabelRoutingStatus;
