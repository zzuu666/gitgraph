import './index.css';
import { renderViewModel } from './render'
import { processGitCommits } from './process'
import commits from './commits/merge.json'

const svgs = processGitCommits(commits).map(viewModel => renderViewModel(viewModel))

document.querySelector('#root')!.innerHTML = ``;

document.querySelector('#root')!.append(...svgs)