export interface TopologyItem {
    id: string;
    parentIds: string[];
}

export interface TopologyViewModel {
    item: TopologyItem;
    inputSwimlanes: Swimlane[];
    outputSwimlanes: Swimlane[];
}

export interface GitCommit {
  hash: string;
  parentHashes: string[];
  author: string;
  authorEmail: string;
  authorDate: string;
  committer: string;
  committerEmail: string;
  commitDate: string;
  subject: string;
}

export interface CommitViewModel {
    commit: GitCommit
    inputSwimlanes: Swimlane[]
    outputSwimlanes: Swimlane[]
}

export interface Swimlane {
    id: string
    color: string
}