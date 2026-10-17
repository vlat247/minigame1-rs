import './styles/style.css';
import { mountGame } from './ui/game-controller';

const app = document.querySelector<HTMLDivElement>('#app');

if (app === null) {
  throw new Error('The application root was not found.');
}

const dispose = mountGame(app);
import.meta.hot?.dispose(dispose);
