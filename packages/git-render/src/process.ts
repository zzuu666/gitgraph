import { lineColors } from "./color";
import type { CommitViewModel, GitCommit, Swimlane } from "./interface";

export function deepClone<T>(obj: T): T {
  if (!obj || typeof obj !== "object") {
    return obj;
  }
  if (obj instanceof RegExp) {
    return obj;
  }
  const result: any = Array.isArray(obj) ? [] : {};
  Object.entries(obj).forEach(([key, value]) => {
    result[key] = value && typeof value === "object" ? deepClone(value) : value;
  });
  return result;
}

export function rot(index: number, modulo: number): number {
  return (modulo + (index % modulo)) % modulo;
}

/**
 *
 * @param commits output of `git log --topo-order`
 * @returns
 */
export const processGitCommits = (commits: GitCommit[]): CommitViewModel[] => {
  const viewModels: CommitViewModel[] = [];
  let colorIndex = -1;

  for (let i = 0, len = commits.length; i < len; i++) {
    const commit = commits[i];

    const outputSwimlanesFromPreviousItem =
      viewModels.at(-1)?.outputSwimlanes ?? [];
    /** 把 viewModels 最后一个的 outputSwimlanes 当作当前这个 inputSwimlanes */
    const inputSwimlanes = outputSwimlanesFromPreviousItem.map((i) =>
      deepClone(i)
    );
    /** 生成新的 outputSwimlanes */
    const outputSwimlanes: Swimlane[] = [];

    let firstParentAdded = false;

    // Add first parent to the output
    /**
     * 这一步是为了把每个 commit 之前的线都画好
     * 比如
     *     *     a
     *     | \
     *     |  *  b
     *     | /
     *     *     c
     */
    if (commit.parentHashes.length > 0) {
      for (const node of inputSwimlanes) {
        // 如果是相同的 commit 就绘制相同的颜色
        if (node.id === commit.hash) {
          if (!firstParentAdded) {
            outputSwimlanes.push({
              id: commit.parentHashes[0],
              color: node.color,
            });
            firstParentAdded = true;
          }

          continue;
        }

        outputSwimlanes.push(deepClone(node));
      }

      // Add unprocessed parent(s) to the output
      for (
        let i = firstParentAdded ? 1 : 0;
        i < commit.parentHashes.length;
        i++
      ) {
        colorIndex = rot(colorIndex + 1, lineColors.length);
        const colorIdentifier = lineColors[colorIndex];

        outputSwimlanes.push({
          id: commit.parentHashes[i],
          color: colorIdentifier,
        });
      }
    }

    viewModels.push({
      commit,
      inputSwimlanes,
      outputSwimlanes,
    });
  }

  return viewModels;
};
