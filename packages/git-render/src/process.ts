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

const TEMP_COLOR = "#bdeefe";

/**
 *
 * @param commits output of `git log --topo-order`
 * @returns
 */
export const processGitCommits = (commits: GitCommit[]): CommitViewModel[] => {
  const viewModels: CommitViewModel[] = [];

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
              color: TEMP_COLOR,
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
        // Color index (label -> next color)
        let colorIdentifier: string | undefined;

        // 如果不是第一个 parent 设置 colorIdentifier
        if (i === 0) {
          colorIdentifier = TEMP_COLOR;
        } else {
          // TODO: 实现颜色计算逻辑
        }

        outputSwimlanes.push({
          id: commit.parentHashes[i],
          color: TEMP_COLOR,
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
