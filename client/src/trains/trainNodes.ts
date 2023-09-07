import { toast } from "react-hot-toast";
import useTrainStore from "../hooks/useTrainHook";

export type Edge = {
  edgeName: string;
  node1: string;
  node2: string;
  time: number;
};

export type PathSegment = {
  startNode: string;
  endNode: string;
  time: number;
};

export type Trains = {
  name: string;
  capacity: number;
  startingNode: string;
};

export type Packages = {
  name: string;
  capacity: number;
  startingNode: string;
  destinationNode: string;
};

export type Edges = {
  name: string;
  startingNode: string;
  destinationNode: string;
  time: number;
};

export class TrainMoves {
  public time: number;
  public train: string;
  public node1: string;
  public packages1: string[];
  public node2: string;
  public packages2: string[];
  public journeyTime: number;

  constructor(
    time: number,
    train: string,
    node1: string,
    packages1: string[],
    node2: string,
    packages2: string[],
    journeyTime: number
  ) {
    this.time = time;
    this.train = train;
    this.node1 = node1;
    this.packages1 = packages1;
    this.node2 = node2;
    this.packages2 = packages2;
    this.journeyTime = journeyTime;
  }
}

export class TrainNodes {
  private adjacencyList: { [key: string]: Edge[] };

  constructor() {
    this.adjacencyList = {};
  }

  public addNode(node: string): void {
    if (!this.adjacencyList[node]) {
      this.adjacencyList[node] = [];
    }
  }

  public addEdge(
    edgeName: string,
    node1: string,
    node2: string,
    time: number
  ): void {
    if (this.adjacencyList[node1] && this.adjacencyList[node2]) {
      this.adjacencyList[node1].push({ edgeName, node1, node2, time });
      this.adjacencyList[node2].push({ edgeName, node2, node1, time });
    }
  }

  public findPath(startNode: string, endNode: string): PathSegment[] {
    const visited = new Set<string>();
    const parent: { [key: string]: string } = {};
    const timeTaken: { [key: string]: number } = {};
    const pathSegments: PathSegment[] = [];

    if (!this.adjacencyList[startNode] || !this.adjacencyList[endNode]) {
      return pathSegments;
    }

    this.dfs(startNode, endNode, visited, parent, timeTaken, pathSegments);

    if (!parent[endNode]) {
      // No path
      return pathSegments;
    }

    let currentNode = endNode;

    while (currentNode !== startNode) {
      const parentNode = parent[currentNode];
      const time = timeTaken[currentNode];
      const newPath: PathSegment = {
        startNode: parentNode,
        endNode: currentNode,
        time,
      };
      pathSegments.unshift(newPath);
      currentNode = parentNode;
    }

    return pathSegments;
  }

  private dfs(
    currentNode: string,
    endNode: string,
    visited: Set<string>,
    parent: { [key: string]: string },
    timeTaken: { [key: string]: number },
    pathSegments: PathSegment[]
  ): void {
    visited.add(currentNode);

    if (currentNode === endNode) {
      return;
    }

    for (const edge of this.adjacencyList[currentNode]) {
      if (!visited.has(edge.node2)) {
        parent[edge.node2] = currentNode;
        timeTaken[edge.node2] = edge.time;
        this.dfs(edge.node2, endNode, visited, parent, timeTaken, pathSegments);
      } else if (edge.node2 === endNode && !parent[endNode]) {
        const newPath: PathSegment = {
          startNode: currentNode,
          endNode: edge.node2,
          time: edge.time,
        };

        pathSegments.push(newPath);
      }
    }
  }
}

export const resolveTrainPath = (
  schedules: Map<Trains, Packages>,
  graphNodes: TrainNodes
): TrainMoves[] => {
  const moves: TrainMoves[] = [];

  schedules.forEach((p, train) => {
    let journeyTime = 0;

    if (train.startingNode !== p.startingNode) {
      const paths = graphNodes.findPath(train.startingNode, p.startingNode);

      if (paths.length <= 0) {
        return;
      }

      paths.forEach((path) => {
        journeyTime += path.time;

        moves.push(
          new TrainMoves(
            path.time,
            train.name,
            path.startNode,
            [],
            path.endNode,
            [],
            journeyTime
          )
        );
      });
    }

    train.startingNode = p.startingNode;

    const destinationPaths = graphNodes.findPath(
      train.startingNode,
      p.destinationNode
    );

    destinationPaths.forEach((destinationPath) => {
      if (destinationPath.endNode !== p.destinationNode) {
        journeyTime += destinationPath.time;

        moves.push(
          new TrainMoves(
            destinationPath.time,
            train.name,
            destinationPath.startNode,
            [p.name],
            destinationPath.endNode,
            [],
            journeyTime
          )
        );
      } else {
        journeyTime += destinationPath.time;

        moves.push(
          new TrainMoves(
            destinationPath.time,
            train.name,
            destinationPath.startNode,
            [],
            destinationPath.endNode,
            [p.name],
            journeyTime
          )
        );
      }
    });
  });

  return moves;
};

export const getAssignedSchedule = (
  graphNodes: TrainNodes,
  trains: Trains[],
  packages: Packages[]
) => {
  const assignSchedules = new Map<Trains, Packages>();

  packages.forEach((p) => {
    const timeTakenForTrain: [string, number, number][] = [];

    trains.forEach((train) => {
      const paths = graphNodes.findPath(train.startingNode, p.startingNode);

      timeTakenForTrain.push([
        train.name,
        paths.reduce((sum, x) => sum + x.time, 0),
        train.capacity,
      ]);
    });

    const eligibleTrain = timeTakenForTrain
      .filter((x) => x[2] >= p.capacity)
      .sort((a, b) => a[1] - b[1])
      .shift();

    if (eligibleTrain) {
      const selectedTrain = trains.find(
        (train) => train.name === eligibleTrain[0]
      );

      if (selectedTrain) {
        assignSchedules.set(selectedTrain, p);
      }
    }
  });

  return assignSchedules;
};

type ICreateNetwork = {
  trainsInput: Trains[];
  stationsInput: string[];
  packagesInput: Packages[];
  edgesInput: Edges[];
};

export const createNetwork = (data?: ICreateNetwork) => {
  const { edgesInput, packagesInput, stationsInput, trainsInput } = data || {};
  console.log({ data });
  const trains: Trains[] = trainsInput ?? [
    {
      name: "Q1",
      capacity: 6,
      startingNode: "B",
    },
  ];

  const packages: Packages[] = packagesInput ?? [
    {
      name: "K1",
      capacity: 5,
      startingNode: "A",
      destinationNode: "C",
    },
  ];

  const graphNodes = new TrainNodes();

  if (stationsInput && stationsInput?.length > 0) {
    stationsInput.forEach((s) => {
      graphNodes.addNode(s);
    });
  } else {
    // Stations
    graphNodes.addNode("A");
    graphNodes.addNode("B");
    graphNodes.addNode("C");
  }

  if (edgesInput && edgesInput?.length > 0) {
    edgesInput.forEach((s) => {
      graphNodes.addEdge(s.name, s.startingNode, s.destinationNode, s.time);
    });
  } else {
    // Edges
    graphNodes.addEdge("E1", "A", "B", 30);
    graphNodes.addEdge("E1", "B", "A", 30);
    graphNodes.addEdge("E2", "B", "C", 10);
    graphNodes.addEdge("E2", "C", "B", 10);
  }

  const assignSchedules = getAssignedSchedule(graphNodes, trains, packages);

  const moves = resolveTrainPath(assignSchedules, graphNodes);

  console.log({ trains, packages, graphNodes, assignSchedules, moves });

  useTrainStore.setState({
    trains,
    packages,
    graphNodes,
    assignSchedules,
    moves,
  });

  if (moves.length > 0) {
    const groupedMoves = new Map<string, TrainMoves[]>();

    moves.forEach((move) => {
      const trainName = move.train;
      if (!groupedMoves.has(trainName)) {
        groupedMoves.set(trainName, []);
      }
      groupedMoves.get(trainName)!.push(move);
    });

    groupedMoves.forEach((moves, trainName) => {
      console.log(`Train Name: ${trainName}`);
      const logs: string[] = [];

      moves.forEach((move) => {
        logs.push(
          `W=${move.time}, T=${move.train}, N1=${
            move.node1
          }, P1=${move.packages1.join(", ")}, N2=${
            move.node2
          }, P2=${move.packages2.join(", ")}, JourneyTime=${move.journeyTime}`
        );
        console.log(
          `W=${move.time}, T=${move.train}, N1=${
            move.node1
          }, P1=${move.packages1.join(", ")}, N2=${
            move.node2
          }, P2=${move.packages2.join(", ")}, JourneyTime=${move.journeyTime}`
        );
      });

      useTrainStore.setState({
        logger: logs,
      });
    });
  } else {
    toast.error("No moves found.", {
      position: "top-right",
    });
  }
};
