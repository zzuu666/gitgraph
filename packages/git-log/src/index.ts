#!/usr/bin/env node

import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { program } from 'commander';
import { getGitLog } from './command';

program
  .name('gglog')
  .description('Git log to JSON converter')
  .option('-p, --path <path>', 'repository path', process.cwd())
  .option('-o, --output <path>', 'output file path', './commits.json')
  .parse();

const options = program.opts();

const main = async () => {
  try {
    const commits = await getGitLog(options.path);

    // Ensure output path is absolute
    const outputPath = path.resolve(options.output);

    // Create output directory if it doesn't exist
    await fs.mkdir(path.dirname(outputPath), { recursive: true });

    // Write to file
    await fs.writeFile(outputPath, JSON.stringify(commits, null, 2), 'utf-8');

    console.log(`Successfully wrote git log to ${outputPath}`);
  } catch (error) {
    console.error(
      'Error:',
      error instanceof Error ? error.message : String(error),
    );
    process.exit(1);
  }
};

main();
