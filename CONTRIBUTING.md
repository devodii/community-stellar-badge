# Contributing

## Setup

Node 22 and pnpm.

```sh
pnpm install
pnpm test
pnpm build
```

`src/generated/` is never edited by hand. Rerun `pnpm generate` and commit the result. CI runs `pnpm check:generated` and fails if the files drift.

## Commits

Commits follow Conventional Commits, enforced by commitlint on a `commit-msg` hook and again in CI for every commit in a PR.

- Format: `type(scope): subject`, for example `feat(M3): add render function`.
- One logical change per commit, and every commit builds and passes tests.
- Lowercase subject, imperative mood, no trailing period.

## Changesets

Any PR that touches `src/`, `scripts/` or `brand/` needs a changeset. Run `pnpm changeset`, choose the bump, and commit the generated file with the change.

- patch: fixes that do not change how a badge looks (metadata, embed bugs).
- minor: visual tweaks (spacing, weight) and new presets or options. The snapshot diff in the PR shows exactly what changes for users.
- major: anything that renames or removes a badge file, a URL path, an option or an option value. This breaks existing READMEs, so avoid it.

## How a release flows

```
feature PR (with a changeset)
  -> ci.yml must pass -> rebase merge to main
  -> release.yml opens or updates a "Version Packages" PR
  -> merge the Version Packages PR
  -> release.yml: build, npm publish with provenance,
     git tag vX.Y.Z, GitHub Release with changelog notes
  -> purge jsDelivr @major and @latest URLs
  -> smoke test the live CDN URLs
```

There are no manual publish steps once the settings below are in place.

## Repo settings

These live in GitHub and npm, not in the repo, so they have to be set once by a maintainer.

### Branch protection on `main`

- Require the `checks` job from `ci.yml` to pass before merging.
- Require the `commitlint` and `changeset` jobs for pull requests.
- Allow rebase merge only. Squash merging would collapse atomic commits into one.

### Actions permissions

Under Settings, Actions, General:

- Workflow permissions: read and write.
- Enable "Allow GitHub Actions to create and approve pull requests", so `release.yml` can open the "Version Packages" PR.

### npm trusted publishing

Configure a trusted publisher for the `community-stellar-badge` package on npmjs.com:

- Owner: `devodii`
- Repository: `community-stellar-badge`
- Workflow filename: `release.yml`

`release.yml` publishes over GitHub OIDC with provenance, so no long-lived npm token needs to be stored.

npm only lets you attach a trusted publisher to a package that already exists. The very first publish therefore needs a one-time bootstrap: add an `NPM_TOKEN` repository secret (an automation token), let the first release publish with it, configure the trusted publisher, then delete the secret. `release.yml` already reads `NPM_TOKEN` as a fallback and ignores it when it is unset.
