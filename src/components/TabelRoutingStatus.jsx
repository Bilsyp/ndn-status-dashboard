import React, { useState, useEffect } from "react";
import {
  Network,
  ArrowRightLeft,
  Database,
  CircleDollarSign,
  Flag,
  Clock,
  Search,
  ChevronDown,
} from "lucide-react";

const TabelRoutingStatus = () => {
  const [routes, setRoutes] = useState([]);
  const [cs, setCs] = useState(null);
  const [search, setSearch] = useState("");
  // Data dari input user (dimasukkan ke dalam array agar bisa di-render dalam tabel)
  useEffect(() => {
    const fetchData = () => {
      fetch("https://wss-bridge.ryvo.fun/api/routes")
        .then((res) => res.json())
        .then(setRoutes);

      fetch("https://wss-bridge.ryvo.fun/api/cs")
        .then((res) => res.json())
        .then(setCs);
    };

    fetchData(); // initial
    const interval = setInterval(fetchData, 2000);

    return () => clearInterval(interval);
  }, []);
  const filteredRoutes = routes.filter((r) =>
    r.prefix?.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Header Bagian Atas */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Network className="text-blue-600" />
              Informasi Rute NDN
            </h1>
            <p className="text-slate-500 mt-1">
              Daftar prefix dan status hop jaringan saat ini.
            </p>
          </div>

          {/* SEARCH */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Cari prefix..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64 transition-all"
            />
          </div>
        </div>

        {/* Kontainer Tabel */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Network size={14} /> Prefix
                    </div>
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <ArrowRightLeft size={14} /> Next Hop
                    </div>
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Database size={14} /> Origin
                    </div>
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider text-center">
                    <div className="flex items-center gap-2 justify-center">
                      <CircleDollarSign size={14} /> Cost
                    </div>
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Flag size={14} /> Flags
                    </div>
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Clock size={14} /> Expires
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredRoutes.map((item, index) => (
                  <tr
                    key={index}
                    className="hover:bg-blue-50/30 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <code className="text-xs bg-slate-100 text-slate-800 px-2 py-1 rounded border border-slate-200 font-mono group-hover:bg-white transition-colors">
                        {item.prefix}
                      </code>
                    </td>
                    <td className="px-6 py-4 font-medium text-blue-700">
                      #{item.nexthop}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          item.origin === "nlsr"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {item.origin.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="font-semibold text-slate-800">
                        {item.cost}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-emerald-50 text-emerald-700 rounded text-xs border border-emerald-100">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                        {item.flags}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {item.expires === "never" ? (
                        <span className="italic text-slate-400">Never</span>
                      ) : (
                        item.expires
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer Tabel / Paginasi Mockup */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-sm text-slate-500">
            <span>Menampilkan {routes.length} entri rute</span>
            <div className="flex gap-2">
              <button className="px-3 py-1 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors">
                Sebelumnya
              </button>
              <button className="px-3 py-1 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors text-blue-600 font-medium">
                Selanjutnya
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TabelRoutingStatus;
