import { Box, Timer, FileText, Clock } from "lucide-react";
import { useEffect, useState } from "react";
const CatalogContent = () => {
  const [catalogData, setCatalog] = useState(null);
  useEffect(() => {
    const fetchData = () => {
      fetch("http://192.168.1.43:8181/api/ndn/debug-store")
        .then((res) => res.json())
        .then(setCatalog);
    };
    fetchData(); // initial
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, []);
  return (
    <div className="animate-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 flex-1 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
            <Box size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Total Objects
            </p>
            <p className="text-2xl font-black text-slate-900">
              {catalogData?.total}
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 flex-1 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
            <Timer size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Last Updated
            </p>
            <p className="text-sm font-bold text-slate-700">
              {new Date(catalogData?.timestamp).toLocaleTimeString()}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
                Content Name
              </th>
              <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em] text-center">
                Chunks
              </th>
              <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
                Freshness
              </th>
              <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em] text-right">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {catalogData?.data.map((item) => (
              <tr
                key={item?.id}
                className="hover:bg-slate-50 transition-colors group"
              >
                <td className="px-8 py-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 rounded-lg text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                      <FileText size={16} />
                    </div>
                    <code className="text-[11px] font-mono font-bold text-slate-600 group-hover:text-indigo-700">
                      {item?.name}
                    </code>
                  </div>
                </td>
                <td className="px-8 py-6 text-center">
                  <span
                    className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-black text-xs ${
                      item?.content === "0"
                        ? "bg-slate-100 text-slate-400"
                        : "bg-indigo-50 text-indigo-700"
                    }`}
                  >
                    {item?.content}
                  </span>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                    <Clock size={14} className="text-slate-300" />
                    {item?.freshness}
                  </div>
                </td>
                <td className="px-8 py-6 text-right">
                  <button className="text-[10px] font-black text-indigo-600 hover:text-indigo-800 uppercase tracking-widest p-2 hover:bg-indigo-50 rounded-xl transition-all">
                    Fetch Data
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CatalogContent;
