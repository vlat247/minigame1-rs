export function renderSetupScreen(container: HTMLElement): void {
  const main = document.createElement('main');
  const title = document.createElement('h1');
  const description = document.createElement('p');

  title.textContent = "Alchemist's Cauldron";
  description.textContent = 'The game is being prepared.';

  main.append(title, description);
  container.replaceChildren(main);
}
