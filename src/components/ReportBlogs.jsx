import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { blogData } from "../lib/BlogData.js";
function ReportBlogs() {
  const [selectedFile, setSelectedFile] = useState(() => {
    return localStorage.getItem("selectedMarkdown") || null;
  });
  const [content, setContent] = useState("");

  useEffect(() => {
    if (selectedFile) {
      localStorage.setItem("selectedMarkdown", selectedFile);
      // Asumsi path di public/blog/path-ke-file.md
      fetch(`/blog/${selectedFile}.md`)
        .then((res) => {
          if (!res.ok) throw new Error("File tidak ditemukan");
          return res.text();
        })
        .then((text) => setContent(text))
        .catch(() =>
          setContent(
            "## 404 \n Gagal memuat konten. Pastikan file ada di `/public/blog/`",
          ),
        );
    } else {
      localStorage.removeItem("selectedMarkdown");
    }
  }, [selectedFile]);

  // KOMPONEN REKURSIF UNTUK FOLDER
  const FolderView = ({ items }) => {
    return (
      <div className="grid gap-3">
        {items.map((item, index) => {
          if (item.type === "file") {
            return (
              <button
                key={index}
                onClick={() => setSelectedFile(item.path)}
                className="text-left p-4 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 transition-all flex items-center gap-3 group"
              >
                <span className="text-xl">📄</span>
                <div>
                  <h3 className="font-semibold text-slate-700 group-hover:text-indigo-700">
                    {item.name}
                  </h3>
                </div>
              </button>
            );
          }

          if (item.type === "folder") {
            return (
              <div
                key={index}
                className="border border-dashed border-slate-300 rounded-xl p-4 bg-slate-50/50"
              >
                <div className="flex items-center gap-2 mb-3 text-slate-500 font-bold uppercase text-xs tracking-wider">
                  <span>📂</span> {item.name}
                </div>
                {/* Panggil diri sendiri jika ada children (Rekursif) */}
                <div className="pl-4 border-l-2 border-slate-200 ml-2">
                  <FolderView items={item.children} />
                </div>
              </div>
            );
          }
          return null;
        })}
      </div>
    );
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {!selectedFile ? (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold mb-6 text-slate-800">
            Daftar Dokumentasi
          </h2>
          <FolderView items={blogData} />
        </div>
      ) : (
        <div>
          <button
            onClick={() => setSelectedFile(null)}
            className="mb-6 px-4 py-2 rounded-lg bg-slate-100 text-sm text-slate-600 hover:bg-indigo-100 hover:text-indigo-700 transition-colors flex items-center gap-2"
          >
            ← Kembali ke Daftar
          </button>
          <article className="prose prose-indigo lg:prose-xl max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          </article>
        </div>
      )}
    </div>
  );
}

export default ReportBlogs;
