import simpleGit, { type SimpleGit } from 'simple-git';

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
  body: string;
}

export async function getGitLog(repoPath: string): Promise<CommitInfo[]> {
  const git: SimpleGit = simpleGit(repoPath);

  // Custom format with special delimiter for parsing
  const format = [
    '%H', // hash
    '%P', // parent hashes
    '%an', // author name
    '%ae', // author email
    '%ai', // author date
    '%cn', // committer name
    '%ce', // committer email
    '%ci', // committer date
    '%s', // subject
    '%b', // body
  ].join('|:|');

  const logOutput = await git.raw([
    'log',
    '--topo-order',
    `--pretty=format:${format}`,
  ]);

  return parseGitLog(logOutput);
}

function parseGitLog(logOutput: string): CommitInfo[] {
  const commits = logOutput.trim().split('\n');

  return commits.map((commit) => {
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
      body,
    ] = commit.split('|:|');

    return {
      hash,
      parentHashes: parentHashes.split(' ').filter(Boolean),
      author,
      authorEmail,
      authorDate,
      committer,
      committerEmail,
      commitDate,
      subject,
      body: body.trim(),
    };
  });
}
