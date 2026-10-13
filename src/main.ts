import './styles/style.css';
import { mountGameDraft } from './ui/draft-controller';

const app = document.querySelector<HTMLDivElement>('#app');

if (app === null) {
  throw new Error('The application root was not found.');
}

const dispose = mountGameDraft(app);
import.meta.hot?.dispose(dispose);
