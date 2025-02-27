import type { Swimlane, TopologyViewModel } from "./interface";

export const SWIMLANE_HEIGHT = 22;
export const SWIMLANE_WIDTH = 11;
const SWIMLANE_CURVE_RADIUS = 5;
const CIRCLE_RADIUS = 4;
const CIRCLE_STROKE_WIDTH = 2;

const UNKNOWN_CIRCLE_COLOR = "#fff";

export function asCssVariable(color: string): string {
  return color;
}

function createPath(colorIdentifier: string): SVGPathElement {
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("fill", "none");
  path.setAttribute("stroke-width", "1px");
  path.setAttribute("stroke-linecap", "round");
  path.style.stroke = asCssVariable(colorIdentifier);

  return path;
}

function drawVerticalLine(
  x1: number,
  y1: number,
  y2: number,
  color: string
): SVGPathElement {
  const path = createPath(color);
  path.setAttribute("d", `M ${x1} ${y1} V ${y2}`);

  return path;
}

function findLastIndex(nodes: Swimlane[], id: string): number {
  for (let i = nodes.length - 1; i >= 0; i--) {
    if (nodes[i].id === id) {
      return i;
    }
  }

  return -1;
}

function drawCircle(
  index: number,
  radius: number,
  strokeWidth: number,
  colorIdentifier?: string
): SVGCircleElement {
  const circle = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "circle"
  );
  circle.setAttribute("cx", `${SWIMLANE_WIDTH * (index + 1)}`);
  circle.setAttribute("cy", `${SWIMLANE_WIDTH}`);
  circle.setAttribute("r", `${radius}`);

  circle.style.strokeWidth = `${strokeWidth}px`;
  if (colorIdentifier) {
    circle.style.fill = asCssVariable(colorIdentifier);
  }

  return circle;
}

export const renderViewModel = (
  viewModel: TopologyViewModel,
  isCurrent: boolean
): SVGSVGElement => {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.classList.add("graph");

  const historyItem = viewModel.item;
  const inputSwimlanes = viewModel.inputSwimlanes;
  const outputSwimlanes = viewModel.outputSwimlanes;

  // Find the history item in the input swimlanes
  const inputIndex = inputSwimlanes.findIndex(
    (node) => node.id === historyItem.id
  );

  // Circle index - use the input swimlane index if present, otherwise add it to the end
  const circleIndex = inputIndex !== -1 ? inputIndex : inputSwimlanes.length;

  const circleColor =
    circleIndex < outputSwimlanes.length
      ? outputSwimlanes[circleIndex].color
      : circleIndex < inputSwimlanes.length
      ? inputSwimlanes[circleIndex].color
      : UNKNOWN_CIRCLE_COLOR;

  let outputSwimlaneIndex = 0;

  for (let index = 0; index < inputSwimlanes.length; index++) {
    const color = inputSwimlanes[index].color;

    // Current commit
    if (inputSwimlanes[index].id === historyItem.id) {
      // Base commit
      if (index !== circleIndex) {
        const d: string[] = [];
        const path = createPath(color);

        // Draw /
        d.push(`M ${SWIMLANE_WIDTH * (index + 1)} 0`);
        d.push(
          `A ${SWIMLANE_WIDTH} ${SWIMLANE_WIDTH} 0 0 1 ${
            SWIMLANE_WIDTH * index
          } ${SWIMLANE_WIDTH}`
        );

        // Draw -
        d.push(`H ${SWIMLANE_WIDTH * (circleIndex + 1)}`);

        path.setAttribute("d", d.join(" "));
        svg.append(path);
      } else {
        outputSwimlaneIndex++;
      }
    } else {
      // Not the current commit
      if (
        outputSwimlaneIndex < outputSwimlanes.length &&
        inputSwimlanes[index].id === outputSwimlanes[outputSwimlaneIndex].id
      ) {
        if (index === outputSwimlaneIndex) {
          // Draw |
          const path = drawVerticalLine(
            SWIMLANE_WIDTH * (index + 1),
            0,
            SWIMLANE_HEIGHT,
            color
          );
          svg.append(path);
        } else {
          const d: string[] = [];
          const path = createPath(color);

          // Draw |
          d.push(`M ${SWIMLANE_WIDTH * (index + 1)} 0`);
          d.push(`V 6`);

          // Draw /
          d.push(
            `A ${SWIMLANE_CURVE_RADIUS} ${SWIMLANE_CURVE_RADIUS} 0 0 1 ${
              SWIMLANE_WIDTH * (index + 1) - SWIMLANE_CURVE_RADIUS
            } ${SWIMLANE_HEIGHT / 2}`
          );

          // Draw -
          d.push(
            `H ${
              SWIMLANE_WIDTH * (outputSwimlaneIndex + 1) + SWIMLANE_CURVE_RADIUS
            }`
          );

          // Draw /
          d.push(
            `A ${SWIMLANE_CURVE_RADIUS} ${SWIMLANE_CURVE_RADIUS} 0 0 0 ${
              SWIMLANE_WIDTH * (outputSwimlaneIndex + 1)
            } ${SWIMLANE_HEIGHT / 2 + SWIMLANE_CURVE_RADIUS}`
          );

          // Draw |
          d.push(`V ${SWIMLANE_HEIGHT}`);

          path.setAttribute("d", d.join(" "));
          svg.append(path);
        }

        outputSwimlaneIndex++;
      }
    }
  }

  // Add remaining parent(s)
  for (let i = 1; i < historyItem.parentIds.length; i++) {
    const parentOutputIndex = findLastIndex(
      outputSwimlanes,
      historyItem.parentIds[i]
    );
    if (parentOutputIndex === -1) {
      continue;
    }

    // Draw -\
    const d: string[] = [];
    const path = createPath(outputSwimlanes[parentOutputIndex].color);

    // Draw \
    d.push(`M ${SWIMLANE_WIDTH * parentOutputIndex} ${SWIMLANE_HEIGHT / 2}`);
    d.push(
      `A ${SWIMLANE_WIDTH} ${SWIMLANE_WIDTH} 0 0 1 ${
        SWIMLANE_WIDTH * (parentOutputIndex + 1)
      } ${SWIMLANE_HEIGHT}`
    );

    // Draw -
    d.push(`M ${SWIMLANE_WIDTH * parentOutputIndex} ${SWIMLANE_HEIGHT / 2}`);
    d.push(`H ${SWIMLANE_WIDTH * (circleIndex + 1)} `);

    path.setAttribute("d", d.join(" "));
    svg.append(path);
  }

  // Draw | to *
  if (inputIndex !== -1) {
    const path = drawVerticalLine(
      SWIMLANE_WIDTH * (circleIndex + 1),
      0,
      SWIMLANE_HEIGHT / 2,
      inputSwimlanes[inputIndex].color
    );
    svg.append(path);
  }

  // Draw | from *
  if (historyItem.parentIds.length > 0) {
    const path = drawVerticalLine(
      SWIMLANE_WIDTH * (circleIndex + 1),
      SWIMLANE_HEIGHT / 2,
      SWIMLANE_HEIGHT,
      circleColor
    );
    svg.append(path);
  }

  if (isCurrent) {
    // HEAD
    const outerCircle = drawCircle(
      circleIndex,
      CIRCLE_RADIUS + 3,
      CIRCLE_STROKE_WIDTH,
      circleColor
    );
    svg.append(outerCircle);

    const innerCircle = drawCircle(
      circleIndex,
      CIRCLE_STROKE_WIDTH,
      CIRCLE_RADIUS
    );
    svg.append(innerCircle);
  } else {
    if (historyItem.parentIds.length > 1) {
      // Multi-parent node
      const circleOuter = drawCircle(
        circleIndex,
        CIRCLE_RADIUS + 2,
        CIRCLE_STROKE_WIDTH,
        circleColor
      );
      svg.append(circleOuter);

      const circleInner = drawCircle(
        circleIndex,
        CIRCLE_RADIUS - 1,
        CIRCLE_STROKE_WIDTH,
        circleColor
      );
      svg.append(circleInner);
    } else {
      // Node
      const circle = drawCircle(
        circleIndex,
        CIRCLE_RADIUS + 1,
        CIRCLE_STROKE_WIDTH,
        circleColor
      );
      svg.append(circle);
    }
  }

  return svg;
};
