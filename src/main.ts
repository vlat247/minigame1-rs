import './styles/style.css';
import { renderGameDraft } from './ui/game-draft';

const app = document.querySelector<HTMLDivElement>('#app');

if (app === null) {
  throw new Error('The application root was not found.');
}

renderGameDraft(app, { started: false, paused: false });
