import { createStore } from "zustand";
import { Packages, Trains } from "../trains/trainNodes";

export interface Root {
  trains: Trains[];
  packages: Packages[];
  graphNodes?: any;
  assignSchedules: Record<string, any>;
  moves: MoveData[];
  logger: string[];
}

interface MoveData {
  time: number;
  train: string;
  node1: string;
  packages1: string[];
  node2: string;
  packages2: string[];
  journeyTime: number;
}

const useTrainStore = createStore<Root>(() => ({
  assignSchedules: [],
  graphNodes: undefined,
  moves: [],
  packages: [],
  trains: [],
  logger: [],
}));

export default useTrainStore;
