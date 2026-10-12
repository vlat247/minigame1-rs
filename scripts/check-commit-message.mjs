import { readFileSync } from 'node:fs';

const conventionUrl = 'https://rs.school/docs/git-convention';
const messagePath = process.argv[2];

function reject(reason) {
  console.error(`Invalid commit message: ${reason}`);
  console.error('Use: type(optional-scope): description');
  console.error('Example: feat(shelf): add ingredient stock badges');
  console.error('Use a lowercase type and a description in the imperative present tense.');
  console.error(`RS School guidelines: ${conventionUrl}`);
  process.exitCode = 1;
}

function validateMessage(message) {
  const lines = message
    .replace(/\r\n?/gu, '\n')
    .split('\n')
    .filter((line) => !line.startsWith('#'));

  // Git removes comments and blank outer lines when it cleans an edited message.
  while (lines.length > 0 && lines[0].trim() === '') {
    lines.shift();
  }
  while (lines.length > 0 && lines.at(-1).trim() === '') {
    lines.pop();
  }

  const subject = lines[0] ?? '';
  const header = /^([a-z][a-z0-9-]*)(?:\(([^()\n]+)\))?(!)?: (.+)$/u.exec(subject);

  if (!header) {
    return 'the subject must have a lowercase type, an optional scope or !, a colon, a space, and a description.';
  }

  const scope = header[2];
  const description = header[4];
  const controlCharacter = /\p{Cc}/u;

  if (scope !== undefined && (scope.trim() !== scope || controlCharacter.test(scope))) {
    return 'the optional scope must contain readable text without outer whitespace.';
  }

  if (description.trim() !== description || controlCharacter.test(description)) {
    return 'the description must contain readable text without outer whitespace.';
  }

  if (lines.length > 1 && lines[1] !== '') {
    return 'separate the optional body or footer from the subject with a blank line.';
  }

  // Grammar cannot reliably prove intent or tense; review those in the subject.
  return null;
}

if (!messagePath) {
  reject('a commit message file is required.');
} else {
  try {
    const error = validateMessage(readFileSync(messagePath, 'utf8'));
    if (error !== null) {
      reject(error);
    }
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    reject(`the message file could not be read: ${detail}`);
  }
}
