const blogData = [
  {
    type: "folder",
    name: "Gambaran Umum",
    children: [
      {
        type: "file",
        name: "Introduction",
        path: "GambaranUmum/Introduction",
      },
    ],
  },
  {
    type: "folder",
    name: "Jurnal",
    children: [
      { type: "file", name: "Abstrak", path: "Jurnal/Abstrak" },
      { type: "file", name: "Related Works", path: "Jurnal/RelatedWorks" },

      {
        type: "file",
        name: "Proposed Framework",
        path: "Jurnal/ProposedFramework",
      },
      {
        type: "file",
        name: "Experimental Setup",
        path: "Jurnal/ExperimentalSetup",
      },
    ],
  },
  {
    type: "folder",
    name: "Metodology",
    children: [
      {
        type: "file",
        name: "Dataset Log Jaringan Untuk Pelatihan",
        path: "metodology/PelatihanModelVolatility-AwareHybridABR",
      },
      {
        type: "file",
        name: "Metodologi Pembangunan Environment dan Mekanisme RL",
        path: "metodology/Metodologi-Pembangunan-Environment",
      },
    ],
  },
];

export { blogData };
