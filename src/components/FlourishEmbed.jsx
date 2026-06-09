import React, { useEffect, useRef } from "react";

const FlourishEmbed = ({ dataSrc }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    // 1. Cek apakah script utama Flourish sudah ada di dokumen, jika belum kita buat
    let script = document.querySelector(
      'script[src="https://public.flourish.studio/resources/embed.js"]',
    );

    if (!script) {
      script = document.createElement("script");
      script.src = "https://public.flourish.studio/resources/embed.js";
      script.async = true;
      document.body.appendChild(script);
    }

    // 2. Fungsi pemicu agar Flourish merender ulang div yang baru muncul di layar (Sangat penting untuk React SPAs)
    const renderFlourish = () => {
      if (window.Flourish && typeof window.Flourish.loadEmbed === "function") {
        window.Flourish.loadEmbed(containerRef.current);
      }
    };

    // Panggil langsung atau tunggu sampai script selesai dimuat
    if (window.Flourish) {
      renderFlourish();
    } else {
      script.addEventListener("load", renderFlourish);
    }

    return () => {
      script.removeEventListener("load", renderFlourish);
    };
  }, [dataSrc]);

  return (
    <div
      ref={containerRef}
      className="flourish-embed flourish-chart my-6 w-full"
      data-src={dataSrc}
    />
  );
};

export default FlourishEmbed;
