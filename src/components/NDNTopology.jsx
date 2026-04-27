import React, { useCallback } from "react";
import {
  addEdge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  ReactFlow,
  Handle,
  Position,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
// 🔥 Custom Node buat AI Server
const AIServerNode = ({ data }) => {
  return (
    <div
      style={{
        background: "#6366f1",
        color: "#fff",
        padding: "10px",
        borderRadius: "8px",
        fontSize: "12px",
        border: "2px solid #4338ca",
        textAlign: "center",
        minWidth: "120px",
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: "#fff" }}
      />
      <div>
        <strong>{data.label}</strong>
        <div style={{ fontSize: "10px", marginTop: "4px", opacity: 0.8 }}>
          AI Processing
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: "#fff" }}
      />
    </div>
  );
};

const nodeTypes = {
  aiNode: AIServerNode,
};

// =====================
// NODES (NDN TOPOLOGY)
// =====================
const initialNodes = [
  // CLIENTS
  { id: "c1", data: { label: "💻 Client 1" }, position: { x: 0, y: 300 } },
  { id: "c2", data: { label: "💻 Client 2" }, position: { x: 250, y: 300 } },
  { id: "c3", data: { label: "💻 Client 3" }, position: { x: 500, y: 300 } },

  // ROUTERS (NDN NODES)
  {
    id: "r1",
    data: { label: "📡 Router 1" },
    position: { x: 0, y: 150 },
    style: { background: "#ecfeff", border: "1px solid #06b6d4" },
  },
  {
    id: "r2",
    data: { label: "📡 Router 2" },
    position: { x: 250, y: 150 },
    style: { background: "#ecfeff", border: "1px solid #06b6d4" },
  },
  {
    id: "r3",
    data: { label: "📡 Router 3" },
    position: { x: 500, y: 150 },
    style: { background: "#ecfeff", border: "1px solid #06b6d4" },
  },

  // BRIDGE
  {
    id: "b1",
    data: { label: "🌉 Bridge" },
    position: { x: 250, y: 50 },
    style: { background: "#fef9c3", border: "1px solid #eab308" },
  },

  // AI SERVER
  {
    id: "ai",
    type: "aiNode",
    data: { label: "🧠 AI Server" },
    position: { x: 250, y: -50 },
  },
];

// =====================
// EDGES (KONEKSI)
// =====================
const initialEdges = [
  // Client → Router
  { id: "c1-r1", source: "c1", target: "r1", animated: true },
  { id: "c2-r2", source: "c2", target: "r2", animated: true },
  { id: "c3-r3", source: "c3", target: "r3", animated: true },

  // Router → Bridge
  { id: "r1-b1", source: "r1", target: "b1" },
  { id: "r2-b1", source: "r2", target: "b1" },
  { id: "r3-b1", source: "r3", target: "b1" },

  { id: "r1-r2", source: "r1", target: "r2" },
  { id: "r2-r3", source: "r2", target: "r3" },
  { id: "r3-r1", source: "r3", target: "r1" },

  // Bridge → AI Server
  {
    id: "b1-ai",
    source: "b1",
    target: "ai",
    type: "smoothstep",
    label: "NDN Data Flow",
  },
];

// =====================
// MAIN COMPONENT
// =====================
const NDNTopology = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#f1f5f9" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background variant="dots" gap={20} size={1} />
        <Controls />
        <MiniMap
          nodeColor={(n) => {
            if (n.type === "aiNode") return "#6366f1";
            if (n.id.startsWith("r")) return "#06b6d4";
            if (n.id.startsWith("c")) return "#94a3b8";
            if (n.id === "b1") return "#eab308";
            return "#cbd5e1";
          }}
        />

        {/* Title */}
        <div
          style={{
            position: "absolute",
            top: 20,
            left: 20,
            zIndex: 4,
            background: "rgba(255,255,255,0.9)",
            padding: "10px 20px",
            borderRadius: "8px",
            fontFamily: "sans-serif",
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
          }}
        >
          <h3 style={{ margin: 0 }}>NDN Topology v1.0</h3>
          <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>
            3 Router • 1 Bridge • 1 AI Server • 3 Clients
          </p>
        </div>
      </ReactFlow>
    </div>
  );
};

export default NDNTopology;
