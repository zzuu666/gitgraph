import simpleGit, { type SimpleGit } from "simple-git";

interface CommitInfo {
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

const EOL_REGEX = /\r\n|\r|\n/g;
const GIT_LOG_SEPARATOR = "XX7Nal-YARtTpjCikii9nJxER19D6diSyk-AWkPb";

export async function getGitLog(repoPath: string): Promise<CommitInfo[]> {
  const git: SimpleGit = simpleGit(repoPath);

  // Custom format with special delimiter for parsing
  const format = [
    "%H", // hash
    "%P", // parent hashes
    "%an", // author name
    "%ae", // author email
    "%ai", // author date
    "%cn", // committer name
    "%ce", // committer email
    "%ci", // committer date
    "%s", // subject
  ].join(GIT_LOG_SEPARATOR);

  const logOutput = await git.raw([
    "log",
    "--topo-order",
    "--max-count=100",
    `--format=${format}`,
  ]);

  return parseGitLog(logOutput);
}

function parseGitLog(logOutput: string): CommitInfo[] {
  const commits = logOutput.split(EOL_REGEX);

  const result: CommitInfo[] = [];

  for (let i = 0; i < commits.length; i++) {
    const line = commits[i].split(GIT_LOG_SEPARATOR);

    if (line.length !== 9) {
      break;
    }

    const [
      hash,
      parentHashes,
      author,
      authorEmail,
      authorDate,
      committer,
      committerEmail,
      commitDate,
      subject,
    ] = line;

    result.push({
      hash,
      parentHashes: parentHashes.split(" ").filter(Boolean),
      author,
      authorEmail,
      authorDate,
      committer,
      committerEmail,
      commitDate,
      subject,
    });
  }

  return result;
}
