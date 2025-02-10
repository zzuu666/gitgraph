import './index.css';
import { renderViewModel } from './render'
import { processGitCommits } from './process'
import commits from './commits/merge.json'

const svgs = processGitCommits(commits).map(viewModel => renderViewModel(viewModel, viewModel.item.id === '55d710858cb5c4d2dd2dbc987fcdbae4b0784d5d'))

document.querySelector('#root')!.innerHTML = ``;

document.querySelector('#root')!.append(...svgs)