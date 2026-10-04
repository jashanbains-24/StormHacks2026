import { getFloors } from "../core/runtime/floorRegistry";
import type { FloorPreviewState } from "../core/contracts";
import type { SimulationState } from "../sim/types";

export interface FloorHarnessOptions {
  floorOrder: number;
  healthState: FloorPreviewState;
  enabled: boolean;
}

export const getFloorHarnessOptions = (
  search = window.location.search,
): FloorHarnessOptions => {
  const parameters = new URLSearchParams(search);
  const requestedFloor = parameters.get("floor");
  const requestedState = parameters.get("state");
  const floors = getFloors();
  const floorOrder =
    floors.find(
      (floor) =>
        floor.module.id === requestedFloor ||
        String(floor.order) === requestedFloor,
    )?.order ?? floors[0].order;
  const healthState: FloorPreviewState = [
    "calm",
    "strained",
    "down",
    "fixed",
  ].includes(requestedState ?? "")
    ? (requestedState as FloorPreviewState)
    : "calm";
  return {
    floorOrder,
    healthState,
    enabled: requestedFloor !== null,
  };
};

const mockState = (
  state: FloorPreviewState,
): Pick<
  SimulationState,
  | "incomingRps"
  | "droppedRequests"
  | "errorRate"
  | "greenSeconds"
  | "outcome"
  | "servers"
> => {
  switch (state) {
    case "strained":
      return {
        incomingRps: 180,
        droppedRequests: 70,
        errorRate: 0.39,
        greenSeconds: 0,
        outcome: "running",
        servers: [
          {
            id: "preview-server",
            health: "strained",
            loadRps: 180,
            overloadSeconds: 4,
            injectedFailure: false,
          },
        ],
      };
    case "down":
      return {
        incomingRps: 180,
        droppedRequests: 180,
        errorRate: 1,
        greenSeconds: 0,
        outcome: "failed",
        servers: [
          {
            id: "preview-server",
            health: "crashed",
            loadRps: 0,
            overloadSeconds: 8,
            injectedFailure: true,
          },
        ],
      };
    case "fixed":
      return {
        incomingRps: 100,
        droppedRequests: 0,
        errorRate: 0,
        greenSeconds: 30,
        outcome: "canonical",
        servers: [
          {
            id: "preview-server",
            health: "healthy",
            loadRps: 50,
            overloadSeconds: 0,
            injectedFailure: false,
          },
        ],
      };
    default:
      return {
        incomingRps: 100,
        droppedRequests: 0,
        errorRate: 0,
        greenSeconds: 8,
        outcome: "running",
        servers: [
          {
            id: "preview-server",
            health: "healthy",
            loadRps: 40,
            overloadSeconds: 0,
            injectedFailure: false,
          },
        ],
      };
  }
};

export const getFloorHarnessSimulation = (
  state: FloorPreviewState,
): SimulationState => {
  const values = mockState(state);
  return {
    elapsedSeconds: 10,
    phaseId: `preview-${state}`,
    phaseProgress: 0.5,
    totalRequests: values.incomingRps * 10,
    injectedFailureOccurred: state === "down",
    ...values,
  };
};

export const mountFloorHarnessControls = (
  options: FloorHarnessOptions,
): void => {
  if (!options.enabled || document.getElementById("floor-harness")) return;

  const controls = document.createElement("aside");
  controls.id = "floor-harness";
  controls.setAttribute("aria-label", "Floor preview controls");
  Object.assign(controls.style, {
    position: "fixed",
    zIndex: "1000",
    left: "12px",
    bottom: "12px",
    display: "flex",
    gap: "8px",
    padding: "8px",
    borderRadius: "8px",
    background: "rgba(31, 41, 51, 0.92)",
    color: "#ffffff",
    font: "600 13px system-ui, sans-serif",
  });

  const addSelect = (
    label: string,
    values: { value: string; label: string }[],
    selected: string,
    parameter: string,
  ): void => {
    const wrapper = document.createElement("label");
    wrapper.textContent = `${label} `;
    const select = document.createElement("select");
    select.setAttribute("aria-label", label);
    for (const value of values) {
      const option = document.createElement("option");
      option.value = value.value;
      option.textContent = value.label;
      option.selected = value.value === selected;
      select.append(option);
    }
    select.addEventListener("change", () => {
      const url = new URL(window.location.href);
      url.searchParams.set(parameter, select.value);
      window.location.assign(url);
    });
    wrapper.append(select);
    controls.append(wrapper);
  };

  const floors = getFloors();
  addSelect(
    "Floor",
    floors.map(({ order, module }) => ({
      value: module.id,
      label: `${order}: ${module.category}`,
    })),
    floors.find(({ order }) => order === options.floorOrder)?.module.id ??
      floors[0].module.id,
    "floor",
  );
  addSelect(
    "State",
    ["calm", "strained", "down", "fixed"].map((state) => ({
      value: state,
      label: state[0].toUpperCase() + state.slice(1),
    })),
    options.healthState,
    "state",
  );
  document.body.append(controls);
};
