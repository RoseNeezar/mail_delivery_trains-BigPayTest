import { useStore } from "zustand";
import useTrainStore from "./hooks/useTrainHook";
import ReactFlow, { Background, useNodesState, useEdgesState } from "reactflow";
import { useState } from "react";
import { Modal } from "./components/Modal";
import TrainForm from "./components/Form";
import { Packages, Trains, createNetwork } from "./trains/trainNodes";

type Node = {
  id: string;
  data: {
    label: string;
  };
  position: {
    x: number;
    y: number;
  };
};

type Edge = {
  id: string;
  source: string;
  target: string;
  animated: boolean;
  label: string;
};

const convertToNodesAndEdges = (
  adjacencyList: Record<string, any>
): {
  initialNodes: Node[];
  initialEdges: Edge[];
} => {
  const initialNodes: Node[] = [];
  const initialEdges: Edge[] = [];
  let posX = 100;
  let posY = 100;

  for (const node1 in adjacencyList) {
    posX += 200;
    posY += 100;
    const nodeData = adjacencyList[node1];

    initialNodes.push({
      id: node1,
      data: {
        label: `Station ${node1}`,
      },
      position: {
        x: posX,
        y: posY,
      },
    });

    // Create edge objects
    for (const edge of nodeData) {
      initialEdges.push({
        id: `e${node1}-${edge.node2}-${Math.random() * 100}`,
        source: node1,
        target: edge.node2,
        animated: true,
        label: edge.time.toString() + " minutes",
      });
    }
  }

  return {
    initialNodes,
    initialEdges,
  };
};

const RenderGraph = ({ adjacencyList }: { adjacencyList: any }) => {
  const { initialNodes, initialEdges } = convertToNodesAndEdges(adjacencyList);
  const [nodes, label, onNodesChange] = useNodesState(initialNodes);
  const [edges, _, onEdgesChange] = useEdgesState(initialEdges);
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      fitView
    >
      <Background />
    </ReactFlow>
  );
};

const App = () => {
  const useTrain = useStore(useTrainStore);
  const [openForm, setOpenForm] = useState(false);
  const [trainXpackage, setTrainXpackage] = useState<{
    trains: Trains[];
    packages: Packages[];
  }>({
    packages: [
      {
        name: "K1",
        capacity: 5,
        startingNode: "A",
        destinationNode: "C",
      },
    ],
    trains: [
      {
        name: "Q1",
        capacity: 6,
        startingNode: "B",
      },
    ],
  });

  return (
    <div className="h-screen bg-slate-950 relative">
      <div className="absolute left-1/2 top-20 z-10">
        {useTrain.trains.length > 0 && (
          <div
            className="btn-error text-white font-bold btn mr-3"
            onClick={() => setOpenForm(true)}
          >
            Change Data
          </div>
        )}
      </div>
      <Modal open={openForm} onClose={() => setOpenForm(false)}>
        <TrainForm setOpenForm={setOpenForm} setData={setTrainXpackage} />
      </Modal>
      {useTrain.logger.length > 0 && (
        <div className="absolute left-10 bottom-10">
          {useTrain.logger.map((x, i) => (
            <h1 className="font-bold m-2 text-2xl" key={i.toString()}>
              {x}
            </h1>
          ))}
        </div>
      )}
      {useTrain.logger.length === 0 && (
        <div className="absolute left-1/2 top-1/2 m-auto">
          <button
            onClick={() => {
              createNetwork();
            }}
            className="btn bg-primary mr-auto text-white"
          >
            Start with default input
          </button>
        </div>
      )}
      {useTrain.logger.length > 0 && trainXpackage.trains.length > 0 && (
        <div className="absolute left-1/3 top-52 z-10">
          <span className="text-2xl font-bold text-white">Trains</span>
          <div className="flex ">
            {trainXpackage.trains.map((t, i) => {
              return (
                <div className="m-3" key={t.capacity.toString()}>
                  <button className="btn btn-secondary rounded-full h-36 w-36 flex flex-col  text-xl">
                    <span>{t.name}</span>
                    <span className="text-sm">{t.startingNode} - starting</span>
                    <span>{t.capacity}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {useTrain.logger.length > 0 && trainXpackage.packages.length > 0 && (
        <div className="absolute right-0 top-52 z-10">
          <span className="text-2xl font-bold text-white">
            Packages to deliver
          </span>
          <div className="flex ">
            {trainXpackage.packages.map((p, i) => {
              return (
                <div className="m-3" key={i.toString()}>
                  <button className="btn btn-info rounded-full h-36 w-36 flex flex-col  text-xl">
                    <span>{p.name}</span>
                    <span>{p.capacity}</span>
                    <span className="text-sm">{p.startingNode} - starting</span>
                    <span>{p.destinationNode}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {useTrain.graphNodes ? (
        <RenderGraph adjacencyList={useTrain.graphNodes.adjacencyList} />
      ) : null}
    </div>
  );
};

export default App;
