#!/bin/zsh
# Promotes staging to production (midgleyawards.com). Run it yourself; agents can't change production.
#   1. turns on scores and categories in production, matching staging
#   2. copies the Turnstile secret into both environments (never printed)
#   3. fast-forwards main to staging and pushes, which deploys production and redeploys staging
set -e
cd "$(dirname "$0")/.."
source ~/code/.secrets/machine.env
curl -sf -X PATCH -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" -H "content-type: application/json" \
  "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/pages/projects/midgley-awards" \
  -d '{"deployment_configs":{"production":{"env_vars":{"FEATURE_SCORES":{"type":"plain_text","value":"1"},"FEATURE_CATEGORIES":{"type":"plain_text","value":"1"}}}}}' >/dev/null
echo "Production flags on."
zsh tools/sync-turnstile-secret.sh
git fetch -q origin
git push origin origin/staging:main
gh workflow run deploy.yml --ref staging >/dev/null && echo "Staging redeploy started, so it picks up the secret."
echo "Production deploy started: https://github.com/erikgillberg/midgely-awards/actions"
