#!/usr/bin/env bash
# TRIGGER_SIDE selects the driving repo: `front` (front-end) or
# `back` (back-end), default front. The sibling PR on the other
# side is matched by exact branch name; the missing side falls back
# to the staging parent app. Idempotent: safe to rerun.
#
# Usage:
#   TRIGGER_SIDE=front bash .scripts/review-app.sh [PR] [BRANCH]
#   TRIGGER_SIDE=back  bash .scripts/review-app.sh [PR] [BRANCH]
set -euo pipefail

trigger="${TRIGGER_SIDE:-front}"
parent_front="${PARENT_FRONT:-mobilic-staging}"
parent_back="${PARENT_BACK:-mobilic-api-staging}"
front_repo="${FRONT_REPO:-MTES-MCT/mobilic}"
back_repo="${BACK_REPO:-MTES-MCT/mobilic-api}"
region="${SCALINGO_REGION:-osc-fr1}"

for cli in gh scalingo; do
  command -v "$cli" >/dev/null 2>&1 || {
    echo "ERR: $cli CLI not found. See docs/review-apps.md." >&2
    exit 1
  }
done
gh auth status >/dev/null 2>&1 || {
  echo "ERR: gh not authenticated (export GH_TOKEN or run 'gh auth login')." >&2
  exit 1
}
scalingo self >/dev/null 2>&1 || {
  echo "ERR: scalingo not authenticated (scalingo login --api-token ...)." >&2
  exit 1
}

trigger_pr="${1:-$(gh pr view --json number --jq .number 2>/dev/null || true)}"
branch="${2:-$(gh pr view --json headRefName --jq .headRefName 2>/dev/null || true)}"
[[ -n "$trigger_pr" ]] && [[ -n "$branch" ]] || {
  echo "ERR: PR/branch not detected." >&2
  exit 1
}

if [[ "$trigger" = "front" ]]; then
  front_pr="$trigger_pr"
  sibling_repo="$back_repo"
else
  back_pr="$trigger_pr"
  sibling_repo="$front_repo"
fi

sibling_pr=$(gh pr list --repo "$sibling_repo" --head "$branch" --state open \
  --json number --jq '.[0].number // empty')

if [[ "$trigger" = "front" ]]; then
  back_pr="$sibling_pr"
else
  front_pr="$sibling_pr"
fi

echo "trigger=$trigger front_pr=${front_pr:-none} back_pr=${back_pr:-none} branch=$branch"

if [[ -n "${front_pr:-}" ]]; then
  front_app="${parent_front}-pr${front_pr}"
  front_url="https://${front_app}.${region}.scalingo.io"
else
  front_app=""
  front_url="https://${parent_front}.${region}.scalingo.io"
fi

if [[ -n "${back_pr:-}" ]]; then
  back_app="${parent_back}-pr${back_pr}"
  back_url="https://${back_app}.${region}.scalingo.io"
else
  back_app=""
  back_url="https://${parent_back}.${region}.scalingo.io"
fi

if [[ -n "$front_app" ]] && ! scalingo --region "$region" --app "$front_app" apps-info >/dev/null 2>&1; then
  echo "creating front-end review app $front_app"
  scalingo --region "$region" --app "$parent_front" \
    integration-link-manual-review-app "$front_pr"
fi

if [[ -n "$back_app" ]] && ! scalingo --region "$region" --app "$back_app" apps-info >/dev/null 2>&1; then
  echo "creating back-end review app $back_app"
  scalingo --region "$region" --app "$parent_back" \
    integration-link-manual-review-app "$back_pr"
fi

if [[ -n "$front_app" ]]; then
  current=$(scalingo --region "$region" --app "$front_app" \
    env-get REACT_APP_API_HOST 2>/dev/null || true)
  if [[ "$current" != "$back_url" ]]; then
    echo "set REACT_APP_API_HOST=$back_url + redeploy front (build-time)"
    scalingo --region "$region" --app "$front_app" \
      env-set "REACT_APP_API_HOST=$back_url"
    scalingo --region "$region" --app "$front_app" \
      integration-link-manual-deploy "$branch"
  fi
fi

if [[ -n "$back_app" ]]; then
  current=$(scalingo --region "$region" --app "$back_app" \
    env-get FRONTEND_URL 2>/dev/null || true)
  if [[ "$current" != "$front_url" ]]; then
    echo "set FRONTEND_URL=$front_url (runtime, no redeploy)"
    scalingo --region "$region" --app "$back_app" \
      env-set "FRONTEND_URL=$front_url"
  fi
fi

marker="<!-- review-app-link -->"
if [[ "$trigger" = "front" ]]; then
  pr_repo_arg=""
else
  pr_repo_arg="--repo $back_repo"
fi
current_body=$(gh pr view $pr_repo_arg "$trigger_pr" --json body --jq .body || echo "")
if ! echo "$current_body" | grep -q "$marker"; then
  front_line="- Front : ${front_url}$([[ -z "$front_app" ]] && echo " (fallback staging, pas de PR front sur \`${branch}\`)" || true)"
  back_line="- Back : ${back_url}$([[ -z "$back_app" ]] && echo " (fallback staging, pas de PR back sur \`${branch}\`)" || true)"
  new_body=$(printf '%s\n**Review apps** (déploiement Scalingo, quelques minutes)\n%s\n%s\n\n---\n\n%s\n' \
    "$marker" "$front_line" "$back_line" "$current_body")
  gh pr edit $pr_repo_arg "$trigger_pr" --body "$new_body"
fi

echo "OK front=$front_url back=$back_url"
