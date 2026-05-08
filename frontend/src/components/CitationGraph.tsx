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

interface Source {
  url: string;
  title: string;
  credibility_score: number;
}

interface SubTopic {
  question: string;
  sources: Source[];
}

interface CitationGraphProps {
  query: string;
  subTopics: SubTopic[];
}

export default function CitationGraph({ query, subTopics }: CitationGraphProps) {
  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    let yOffset = 0;

    // Root Node (Main Query)
    nodes.push({
      id: 'root',
      position: { x: 400, y: 50 },
      data: { label: <div className="font-bold text-center p-2 text-sm">{query}</div> },
      style: { backgroundColor: '#1e3a8a', color: '#fff', borderRadius: '12px', border: '1px solid #3b82f6', width: 250 },
    });

    // SubTopics Nodes
    subTopics.forEach((topic, i) => {
      const topicId = `topic_${i}`;
      nodes.push({
        id: topicId,
        position: { x: 100 + i * 300, y: 200 },
        data: { label: <div className="text-xs p-1">{topic.question}</div> },
        style: { backgroundColor: '#0f172a', color: '#cbd5e1', borderRadius: '8px', border: '1px solid #334155', width: 200 },
      });

      edges.push({
        id: `e_root_${topicId}`,
        source: 'root',
        target: topicId,
        animated: true,
        style: { stroke: '#3b82f6' },
      });

      // Sources for each Topic
      topic.sources.slice(0, 3).forEach((src, j) => {
        const srcId = `src_${i}_${j}`;
        nodes.push({
          id: srcId,
          position: { x: 50 + i * 300 + j * 70, y: 350 + (j % 2) * 50 },
          data: { label: <a href={src.url} target="_blank" className="text-[10px] truncate block max-w-[100px] text-blue-400 hover:text-blue-300">{src.title || new URL(src.url).hostname}</a> },
          style: { backgroundColor: '#020817', color: '#fff', borderRadius: '4px', border: '1px solid #1e293b', width: 120, padding: '4px' },
        });

        edges.push({
          id: `e_${topicId}_${srcId}`,
          source: topicId,
          target: srcId,
          style: { stroke: '#64748b' },
        });
      });
    });

    return { initialNodes: nodes, initialEdges: edges };
  }, [query, subTopics]);

  const [nodes, setNodes] = React.useState<Node[]>(initialNodes);
  const [edges, setEdges] = React.useState<Edge[]>(initialEdges);

  const onNodesChange = React.useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );
  const onEdgesChange = React.useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

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
