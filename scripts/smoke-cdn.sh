#!/usr/bin/env bash
# Checks that a published version is live on the CDN. Usage: smoke-cdn.sh <version>
# BASE_URL overrides the CDN root, which lets the script be tested against a local server.
set -u

version="${1:?usage: smoke-cdn.sh <version>}"
base="${BASE_URL:-https://cdn.jsdelivr.net/npm}/community-stellar-badge@${version}"
attempts="${ATTEMPTS:-6}"
delay="${RETRY_DELAY:-10}"
work="$(mktemp -d)"

check() {
  local badge embed
  badge="$(curl -sS -o "$work/badge.svg" -w '%{http_code} %{content_type}' "$base/badges/dark.svg")" || return 1
  embed="$(curl -sS -o "$work/embed.js" -w '%{http_code}' "$base/dist/embed.js")" || return 1

  [ "${badge%% *}" = "200" ] || { echo "badge status: ${badge%% *}"; return 1; }
  case "${badge#* }" in
    image/svg+xml*) ;;
    *) echo "badge content type: ${badge#* }"; return 1 ;;
  esac
  [ "$(head -c 4 "$work/badge.svg")" = "<svg" ] || { echo "badge body does not start with <svg"; return 1; }

  [ "$embed" = "200" ] || { echo "embed status: $embed"; return 1; }
  grep -qF "/* community-stellar-badge v${version} */" "$work/embed.js" \
    || { echo "embed.js is missing the v${version} version comment"; return 1; }
}

for attempt in $(seq 1 "$attempts"); do
  if check; then
    echo "cdn smoke test passed for ${version} on attempt ${attempt}"
    exit 0
  fi
  echo "attempt ${attempt} of ${attempts} failed"
  [ "$attempt" -lt "$attempts" ] && sleep $((attempt * delay))
done

echo "::error::cdn smoke test failed for ${version}"
exit 1
