# Contributing to Easy Fashion

We follow a strict Git workflow and commit message convention.

## Commit Message Convention

We enforce [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) using `commitlint` and a Husky `commit-msg` hook.

### Format

```text
<type>: <subject>
```

- **Subject Length**: Maximum 72 characters.
- **Type Case**: Must be lowercase.

### Allowed Types

- **`feat`**: A new feature (e.g., `feat: implement login page`)
- **`fix`**: A bug fix (e.g., `fix: resolve crash on checkout`)
- **`chore`**: Maintenance, build process, dev tooling (e.g., `chore: add commitlint config`)
- **`docs`**: Documentation only changes (e.g., `docs: update README with setup instructions`)
- **`refactor`**: Code change that neither fixes a bug nor adds a feature (e.g., `refactor: simplify button component`)
- **`test`**: Adding missing tests or correcting existing tests (e.g., `test: add unit tests for user API`)
- **`style`**: Changes that do not affect the meaning of the code (formatting, whitespace, etc.) (e.g., `style: format with prettier`)
- **`perf`**: A code change that improves performance (e.g., `perf: improve query execution time`)
- **`ci`**: Changes to CI configuration (e.g., `ci: configure github actions`)
- **`build`**: Changes that affect the build system or external dependencies (e.g., `build: update next.js to v14`)
