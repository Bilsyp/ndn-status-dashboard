import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase";

import {
  Plus,
  Calendar,
  Tag,
  AlignLeft,
  Type,
  ChevronDown,
  List,
  CheckCircle2,
  AlertCircle,
  Trash2,
  X,
  LayoutDashboard,
  Circle,
} from "lucide-react";

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({
    title: "",
    desc: "",
    priority: "medium",
    date: "",
  });
  const [toast, setToast] = useState(null); // { message: string, type: 'success' | 'error' }
  const [view, setView] = useState("list"); // 'form' or 'list'
  // 🔥 ambil data realtime dari firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "tasks"), (snapshot) => {
      const data = snapshot.docs.map((docItem) => ({
        id: docItem.id,
        ...docItem.data(),
      }));
      setTasks(data);
    });

    return () => unsubscribe();
  }, []);
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);
  const handleDeleteTask = async (id) => {
    const confirmDelete = confirm("Yakin hapus task?");
    if (!confirmDelete) return;

    await deleteDoc(doc(db, "tasks", id));
  };

  const handleEditTask = async (id) => {
    const newTitle = prompt("Edit title:");
    if (!newTitle) return;

    const ref = doc(db, "tasks", id);
    await updateDoc(ref, {
      title: newTitle,
    });
  };
  const handleAddTask = async () => {
    if (!newTask.title) return;

    await addDoc(collection(db, "tasks"), {
      ...newTask,
      status: "pending",
      createdAt: new Date(),
    });

    setNewTask({
      title: "",
      desc: "",
      priority: "medium",
      date: "",
    });
  };
  // 🔥 toggle status + update ke firestore
  const toggleTask = async (id, currentStatus) => {
    const nextStatus = currentStatus === "completed" ? "pending" : "completed";

    try {
      const ref = doc(db, "tasks", id);
      await updateDoc(ref, {
        status: nextStatus,
      });
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="text-emerald-500" size={20} />;
      case "in-progress":
        return <Clock className="text-amber-500 animate-pulse" size={20} />;
      default:
        return <Circle className="text-slate-300" size={20} />;
    }
  };

  const completedCount = tasks.filter((t) => t.status === "completed").length;
  const progress = tasks.length
    ? Math.round((completedCount / tasks.length) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300 ${
            toast.type === "success"
              ? "bg-emerald-600 text-white"
              : "bg-rose-600 text-white"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 size={20} />
          ) : (
            <AlertCircle size={20} />
          )}
          <span className="font-medium">{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="ml-2 hover:opacity-70"
          >
            <X size={18} />
          </button>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        {/* Navigation Switcher */}
        <div className="flex justify-center mb-8">
          <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200 flex gap-1">
            <button
              onClick={() => setView("list")}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                view === "list"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100"
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              <List size={18} /> Daftar Task
            </button>
            <button
              onClick={() => setView("form")}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                view === "form"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100"
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              <Plus size={18} /> Buat Baru
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Content Area */}
          <div className="lg:col-span-8">
            {view === "form" ? (
              /* FORM VIEW */
              <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-100 border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="bg-indigo-600 p-8 pb-12">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <div className="bg-white/20 p-2 rounded-xl">
                      <Plus size={24} className="text-white" />
                    </div>
                    Buat Task Baru
                  </h2>
                  <p className="text-indigo-100 mt-2 text-sm">
                    Organisir harimu dengan lebih teratur.
                  </p>
                </div>
                <div className="p-8 -mt-8 bg-white rounded-t-[2.5rem] space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1 flex items-center gap-2">
                      <Type size={14} /> Judul Task
                    </label>
                    <input
                      type="text"
                      value={newTask.title}
                      onChange={(e) =>
                        setNewTask({ ...newTask, title: e.target.value })
                      }
                      placeholder="Apa yang ingin dikerjakan?"
                      className="w-full bg-slate-50 border-none ring-1 ring-slate-200 rounded-2xl px-4 py-4 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all placeholder:text-slate-400 text-slate-700 font-medium"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1 flex items-center gap-2">
                      <AlignLeft size={14} /> Deskripsi
                    </label>
                    <textarea
                      value={newTask.desc}
                      onChange={(e) =>
                        setNewTask({ ...newTask, desc: e.target.value })
                      }
                      placeholder="Tambahkan detail jika perlu..."
                      rows="3"
                      className="w-full bg-slate-50 border-none ring-1 ring-slate-200 rounded-2xl px-4 py-4 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all placeholder:text-slate-400 text-slate-700 resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1 flex items-center gap-2">
                        <Calendar size={14} /> Tanggal
                      </label>
                      <input
                        type="date"
                        value={newTask.date}
                        onChange={(e) =>
                          setNewTask({ ...newTask, date: e.target.value })
                        }
                        className="w-full bg-slate-50 border-none ring-1 ring-slate-200 rounded-2xl px-4 py-4 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all text-slate-600"
                      />
                    </div>
                    <div className="space-y-1.5 relative">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1 flex items-center gap-2">
                        <Tag size={14} /> Prioritas
                      </label>
                      <div className="relative">
                        <select
                          value={newTask.priority}
                          onChange={(e) =>
                            setNewTask({ ...newTask, priority: e.target.value })
                          }
                          className="w-full bg-slate-50 border-none ring-1 ring-slate-200 rounded-2xl px-4 py-4 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all text-slate-700 appearance-none cursor-pointer font-medium capitalize"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                        <ChevronDown
                          size={18}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                        />
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleAddTask}
                    className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-bold py-5 rounded-2xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 group"
                  >
                    <span>Simpan Task</span>
                    <Plus
                      size={20}
                      className="group-hover:rotate-90 transition-transform duration-300"
                    />
                  </button>
                </div>
              </div>
            ) : (
              /* LIST VIEW */
              <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-500">
                <div className="flex items-center justify-between mb-6 px-2">
                  <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    Daftar Pekerjaan
                    <span className="bg-slate-200 text-slate-600 text-xs px-2.5 py-1 rounded-full">
                      {tasks.length}
                    </span>
                  </h3>
                </div>
                {tasks.length === 0 ? (
                  <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2rem] p-12 text-center">
                    <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <List className="text-slate-300" size={32} />
                    </div>
                    <p className="text-slate-500 font-medium">
                      Belum ada task. Mulai dengan membuat yang baru!
                    </p>
                  </div>
                ) : (
                  tasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => toggleTask(task.id)}
                      className={`p-6 rounded-[2rem] border transition-all cursor-pointer flex items-start gap-5 group relative ${
                        task.status === "completed"
                          ? "bg-emerald-50/40 border-emerald-100 opacity-80"
                          : "bg-white border-slate-200 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-50"
                      }`}
                    >
                      <div className="mt-1 transition-transform group-hover:scale-110">
                        {getStatusIcon(task.status)}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1.5">
                          <h4
                            className={`font-bold text-base transition-all ${
                              task.status === "completed"
                                ? "line-through text-slate-400"
                                : "text-slate-800"
                            }`}
                          >
                            {task.title}
                          </h4>
                          <span
                            className={`text-[10px] font-black uppercase px-3 py-1 rounded-full border tracking-wider ${
                              task.priority === "high"
                                ? "bg-rose-50 text-rose-600 border-rose-100"
                                : task.priority === "medium"
                                  ? "bg-amber-50 text-amber-600 border-amber-100"
                                  : "bg-slate-50 text-slate-600 border-slate-100"
                            }`}
                          >
                            {task.priority}
                          </span>
                        </div>
                        <p
                          className={`text-sm leading-relaxed mb-3 ${task.status === "completed" ? "text-slate-400" : "text-slate-500"}`}
                        >
                          {task.desc || "Tidak ada deskripsi."}
                        </p>
                        <div className="flex items-center gap-4">
                          <p className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                            <Calendar size={12} /> {task.date || "Kapan saja"}
                          </p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTask(task.id);
                            }}
                            className="text-[11px] font-bold text-rose-500 hover:text-rose-700 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"
                          >
                            <Trash2 size={12} /> Hapus
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Sidebar / Stats Section */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
              <div className="relative z-10">
                <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <LayoutDashboard size={14} /> Progress Pengujian
                </h3>

                <div className="flex items-end gap-3 mb-5">
                  <span className="text-6xl font-black tracking-tighter transition-all group-hover:scale-110 origin-left inline-block">
                    {progress}%
                  </span>
                  <span className="text-xs text-slate-400 mb-2 font-bold uppercase italic tracking-widest">
                    Selesai
                  </span>
                </div>

                <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden mb-6">
                  <div
                    className="bg-indigo-500 h-full transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(99,102,241,0.5)]"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>

                <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/10">
                  <div>
                    <p className="text-xs text-slate-400 uppercase font-bold mb-1">
                      Status
                    </p>
                    <p className="text-sm font-medium">
                      {completedCount} / {tasks.length} Skenario
                    </p>
                  </div>
                  <div className="bg-indigo-500/20 p-2 rounded-xl">
                    <CheckCircle2 size={24} className="text-indigo-400" />
                  </div>
                </div>
              </div>

              {/* Background Decoration */}
              <div className="absolute -bottom-10 -right-10 text-white opacity-[0.03] rotate-12 transition-transform group-hover:scale-125 group-hover:rotate-0 duration-700">
                <CheckCircle2 size={240} />
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <AlertCircle size={14} className="text-amber-500" />
                Catatan Penting
              </h3>
              <ul className="space-y-4">
                {[
                  "Gunakan NFD versi terbaru (NDN-0.7+).",
                  "Pastikan kunci publik telah disebar ke semua router.",
                  "Verifikasi integritas data sebelum publikasi.",
                ].map((note, i) => (
                  <li
                    key={i}
                    className="text-[12px] text-slate-600 flex gap-3 leading-relaxed"
                  >
                    <span className="flex-shrink-0 w-1.5 h-1.5 bg-indigo-500 rounded-full mt-1.5" />
                    {note}
                  </li>
                ))}
              </ul>
              {/* Subtle accent */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50/50 rounded-bl-[4rem] -z-10" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskList;
