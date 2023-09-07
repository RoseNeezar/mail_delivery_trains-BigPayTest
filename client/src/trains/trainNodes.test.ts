import {
  TrainNodes,
  PathSegment,
  Packages,
  TrainMoves,
  Trains,
  resolveTrainPath,
} from "./trainNodes";
import { describe, it, expect, beforeEach } from "vitest";

describe("TrainNodes", () => {
  let trainNetwork: TrainNodes;

  beforeEach(() => {
    trainNetwork = new TrainNodes();
    trainNetwork.addNode("A");
    trainNetwork.addNode("B");
    trainNetwork.addNode("C");
    trainNetwork.addEdge("E1", "A", "B", 2);
    trainNetwork.addEdge("E2", "B", "C", 3);
  });

  it("should find a valid path between two nodes", () => {
    const pathSegments: PathSegment[] = trainNetwork.findPath("A", "C");
    expect(pathSegments.length).toBe(2);

    expect(pathSegments[0].startNode).toBe("A");
    expect(pathSegments[0].endNode).toBe("B");
    expect(pathSegments[0].time).toBe(2);

    expect(pathSegments[1].startNode).toBe("B");
    expect(pathSegments[1].endNode).toBe("C");
    expect(pathSegments[1].time).toBe(3);
  });

  it("should return an empty array for unreachable nodes", () => {
    const pathSegments: PathSegment[] = trainNetwork.findPath("A", "D");

    // No path found
    expect(pathSegments.length).toBe(0);
  });

  it("should resolve the path when a package is successfully delivered", () => {
    const schedules = new Map<Trains, Packages>();

    const train1: Trains = {
      name: "Train1",
      capacity: 10,
      startingNode: "A",
    };

    const package1: Packages = {
      name: "Package1",
      capacity: 5,
      startingNode: "A",
      destinationNode: "B",
    };

    schedules.set(train1, package1);

    const graphNodes = new TrainNodes();
    graphNodes.addNode("A");
    graphNodes.addNode("B");
    graphNodes.addEdge("E1", "A", "B", 2);

    const moves: TrainMoves[] = resolveTrainPath(schedules, graphNodes);

    expect(moves.length).toBe(1);

    expect(moves[0].train).toBe("Train1");
    expect(moves[0].node1).toBe("A");
    expect(moves[0].node2).toBe("B");
    expect(moves[0].packages1).toEqual([]);
    expect(moves[0].packages2).toEqual(["Package1"]);
  });

  it("should handle the case when no path is found", () => {
    const schedules = new Map<Trains, Packages>();
    const train1: Trains = {
      name: "Train1",
      capacity: 10,
      startingNode: "A",
    };

    const package1: Packages = {
      name: "Package1",
      capacity: 5,
      startingNode: "C",
      destinationNode: "D",
    };

    schedules.set(train1, package1);

    const graphNodes = new TrainNodes();
    graphNodes.addNode("A");
    graphNodes.addNode("B");
    graphNodes.addEdge("E1", "A", "B", 2);

    const moves: TrainMoves[] = resolveTrainPath(schedules, graphNodes);

    // No move means no path found
    expect(moves.length).toBe(0);
  });

  it("should handle the case when a train no need to move", () => {
    const schedules = new Map<Trains, Packages>();

    const train1: Trains = {
      name: "Train1",
      capacity: 10,
      startingNode: "A",
    };

    const package1: Packages = {
      name: "Package1",
      capacity: 5,
      startingNode: "A",
      destinationNode: "A",
    };

    schedules.set(train1, package1);

    const graphNodes = new TrainNodes();
    graphNodes.addNode("A");

    const moves: TrainMoves[] = resolveTrainPath(schedules, graphNodes);

    expect(moves.length).toBe(0);
  });

  it("should resolve the path with a single package and three moves for delivery", () => {
    const schedules = new Map<Trains, Packages>();
    const train1: Trains = {
      name: "Train1",
      capacity: 10,
      startingNode: "A",
    };

    const package1: Packages = {
      name: "Package1",
      capacity: 5,
      startingNode: "A",
      destinationNode: "D",
    };

    schedules.set(train1, package1);

    const graphNodes = new TrainNodes();
    graphNodes.addNode("A");
    graphNodes.addNode("B");
    graphNodes.addNode("C");
    graphNodes.addNode("D");
    graphNodes.addEdge("E1", "A", "B", 2);
    graphNodes.addEdge("E2", "B", "C", 3);
    graphNodes.addEdge("E3", "C", "D", 2);

    const moves: TrainMoves[] = resolveTrainPath(schedules, graphNodes);

    expect(moves.length).toBe(3);

    expect(moves[0].packages1).toEqual(["Package1"]);
    expect(moves[0].packages2).toEqual([]);

    expect(moves[1].packages1).toEqual(["Package1"]);
    expect(moves[1].packages2).toEqual([]);

    expect(moves[2].packages1).toEqual([]);
    expect(moves[2].packages2).toEqual(["Package1"]);
  });
});
