import "@xyflow/react/dist/style.css";
import ELK, { ElkNode } from "elkjs/lib/elk.bundled.js";
import {
  ReactFlow,
  Background,
  Controls,
  useReactFlow,
  useNodesState,
  useEdgesState,
  Panel,
  Node,
  Edge,
  Position,
  Handle
} from "@xyflow/react";
import { useCallback, useEffect, useMemo } from "react";
import { IAgentWorkflow } from "../../types";
import { Button } from "@mantine/core";
import { cn } from "../../utils";

const elk = new ELK();

const defaultOptions = {
  "elk.algorithm": "org.eclipse.elk.mrtree",
  "elk.layered.spacing.nodeNodeBetweenLayers": 100,
  "elk.spacing.nodeNode": 80
};

const useLayoutedElements = () => {
  const { getNodes, setNodes, getEdges, fitView } = useReactFlow();

  const getLayoutedElements = useCallback(
    (options: ElkNode["layoutOptions"]) => {
      const layoutOptions = { ...defaultOptions, ...options };
      const graph = {
        id: "root",
        layoutOptions: layoutOptions,
        children: getNodes().map((node) => ({
          ...node,
          width: node?.measured?.width,
          height: node?.measured?.height
        })),
        edges: getEdges()
      };

      elk.layout(graph as unknown as ElkNode).then(({ children }) => {
        // By mutating the children in-place we saves ourselves from creating a
        // needless copy of the nodes array.
        const nodes =
          children?.map((node) => ({
            ...node,
            position: { x: node.x, y: node.y }
          })) ?? [];

        setNodes(nodes as Node[]);
        fitView({ duration: 1000 });
      });
    },
    [getNodes, getEdges, fitView, setNodes]
  );

  return { getLayoutedElements };
};

interface AgentNodeProps {
  data: {
    label: string;
    isActive: boolean;
    isVisited?: boolean | null;
  };
}

const AgentNode: React.FC<AgentNodeProps> = ({ data }) => {
  const isStartNode = useMemo(() => data.label === "__start__", [data.label]);
  const isEndNode = useMemo(() => data.label === "__end__", [data.label]);

  return (
    <div
      className={cn("border relative rounded p-2 bg-blue-700/20 w-full", {
        "bg-blue-700": data.isVisited,
        "bg-teal-600": isStartNode,
        "bg-emerald-600": isEndNode,
        "bg-green-600": data.isActive && (isStartNode || isEndNode),
        "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-pulse":
          data.isActive && !isEndNode && !isStartNode,
        "size-10 border-0 rounded-full flex items-center justify-center":
          isStartNode || isEndNode
      })}>
      {!isStartNode && <Handle type="target" position={Position.Top} />}

      {!isStartNode && !isEndNode ? (
        <p
          className={cn("text-xs", {
            "font-bold": data.isActive || data.isVisited
          })}>
          {data.label}
        </p>
      ) : null}

      {isStartNode ? (
        <p
          className={cn("text-xs", {
            "font-bold": data.isActive || data.isVisited
          })}>
          start
        </p>
      ) : null}

      {isEndNode ? (
        <p
          className={cn("text-xs", {
            "font-bold": data.isActive || data.isVisited
          })}>
          end
        </p>
      ) : null}

      {!isEndNode && <Handle type="source" position={Position.Bottom} id="a" />}
    </div>
  );
};

const nodeTypes = {
  schema: AgentNode,
  runnable: AgentNode
};

interface AgentGraphProps {
  graph: IAgentWorkflow["state"];
  visitedNodes?: string[];
}

const AgentGraph: React.FC<AgentGraphProps> = ({ graph, visitedNodes }) => {
  const { fitView } = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const { getLayoutedElements } = useLayoutedElements();

  useEffect(() => {
    const newNodes = graph.nodes
      .map((node, index) => {
        switch (node.type) {
          case "schema": {
            return {
              id: node.id,
              data: { label: node.data, isActive: false },
              position: { x: 0, y: 100 * index },
              type: "schema"
            };
          }
          case "runnable": {
            return {
              id: node.id,
              data: {
                label: node.data.name,
                isActive: false
              },
              position: { x: 0, y: 100 * index },
              type: "runnable"
            };
          }
          default:
            return null;
        }
      })
      .filter((node) => node !== null);

    const newEdges = graph.edges.map((edge) => ({
      id: `${edge.source}-${edge.target}`,
      source: edge.source,
      target: edge.target,
      animated: false
    }));

    setNodes(newNodes);
    setEdges(newEdges);

    setTimeout(() => {
      getLayoutedElements({
        "elk.algorithm": "org.eclipse.elk.mrtree"
      });
    }, 1000);
  }, [graph, fitView, setEdges, setNodes, getLayoutedElements]);

  useEffect(() => {
    if (visitedNodes) {
      setNodes((prev) => {
        return prev.map((node) => {
          return {
            ...node,
            data: {
              ...node.data,
              isActive: visitedNodes[visitedNodes.length - 1] === node.id,
              isVisited: visitedNodes.includes(node.id)
                ? true
                : node.data?.isVisited
            }
          };
        });
      });
    }
  }, [visitedNodes, setNodes]);

  // useEffect(() => console.log(nodes), [nodes]);

  return (
    <div className="w-full flex-1">
      <ReactFlow
        colorMode="dark"
        nodeTypes={nodeTypes}
        nodes={nodes}
        onNodesChange={onNodesChange}
        edges={edges}
        onEdgesChange={onEdgesChange}
        fitView>
        <Background />
        <Controls />

        <Panel position="top-right">
          <div className="flex gap-3">
            <Button
              size="compact-sm"
              onClick={() =>
                getLayoutedElements({
                  "elk.algorithm": "layered",
                  "elk.direction": "DOWN"
                })
              }>
              Vertical View
            </Button>
            <Button
              size="compact-sm"
              onClick={() =>
                getLayoutedElements({
                  "elk.algorithm": "layered",
                  "elk.direction": "RIGHT"
                })
              }>
              Horizontal View
            </Button>
            <Button
              size="compact-sm"
              onClick={() =>
                getLayoutedElements({
                  "elk.algorithm": "org.eclipse.elk.mrtree"
                })
              }>
              Tree View
            </Button>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
};

export default AgentGraph;
