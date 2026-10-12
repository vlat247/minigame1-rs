import './styles/style.css';
import { renderSetupScreen } from './ui/setup-screen';

const app = document.querySelector<HTMLDivElement>('#app');

if (app === null) {
  throw new Error('The application root was not found.');
}

renderSetupScreen(app);
