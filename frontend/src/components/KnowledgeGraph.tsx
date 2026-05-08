"use client";

import React, { useMemo } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  NodeChange,
  EdgeChange,
  Node,
  Edge
} from 'reactflow';
import 'reactflow/dist/style.css';

interface Relationship {
  source: string;
  target: string;
  label: string;
}

export default function KnowledgeGraph({ relationships }: { relationships: Relationship[] }) {
  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    const nodeSet = new Set<string>();

    relationships.forEach((rel) => {
      nodeSet.add(rel.source);
      nodeSet.add(rel.target);
    });

    const nodesArr = Array.from(nodeSet);
    const radius = 200;
    const centerX = 400;
    const centerY = 250;

    nodesArr.forEach((nodeName, i) => {
      const angle = (i / nodesArr.length) * 2 * Math.PI;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      nodes.push({
        id: nodeName,
        position: { x, y },
        data: { label: <div className="text-xs p-1 font-bold">{nodeName}</div> },
        style: { backgroundColor: '#0f172a', color: '#60a5fa', borderRadius: '8px', border: '1px solid #334155', minWidth: 100 },
      });
    });

    relationships.forEach((rel, i) => {
      edges.push({
        id: `e_${i}`,
        source: rel.source,
        target: rel.target,
        animated: true,
        label: rel.label,
        labelStyle: { fill: '#94a3b8', fontSize: 10, fontWeight: 700 },
        labelBgStyle: { fill: '#1e293b', fillOpacity: 0.8 },
        style: { stroke: '#3b82f6' },
      });
    });

    return { initialNodes: nodes, initialEdges: edges };
  }, [relationships]);

  const [nodes, setNodes] = React.useState<Node[]>(initialNodes);
  const [edges, setEdges] = React.useState<Edge[]>(initialEdges);

  React.useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges]);

  const onNodesChange = React.useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );
  const onEdgesChange = React.useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  if (!relationships || relationships.length === 0) {
    return <div className="p-10 text-center text-slate-500 glassmorphism rounded-2xl">No entity relationships extracted.</div>;
  }

  return (
    <div className="w-full h-[500px] rounded-2xl overflow-hidden border border-white/10 glassmorphism bg-slate-900/50">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
      >
        <Background color="#334155" gap={16} />
        <Controls />
      </ReactFlow>
    </div>
  );
}
