#!/bin/zsh
# Turns on Goat, the AI comment moderator. Asks for an Anthropic API key (never printed), checks it works,
# saves it to the Pages project for staging and production, and redeploys both.
# Make the key at https://console.anthropic.com > Settings > API keys > Create Key.
set -e
cd "$(dirname "$0")/.."
source ~/code/.secrets/machine.env
read -s "AK?Paste the Anthropic API key (it won't show): "; echo
[[ "$AK" == sk-ant-* ]] || { echo "That doesn't look like an Anthropic key (it starts with sk-ant-)."; exit 1; }
AK="$AK" python3 - <<'PY'
import os, json, urllib.request, urllib.error
tok, acct, key = os.environ["CLOUDFLARE_API_TOKEN"], os.environ["CLOUDFLARE_ACCOUNT_ID"], os.environ["AK"]
try:
    urllib.request.urlopen(urllib.request.Request("https://api.anthropic.com/v1/models/claude-opus-5-5",
        headers={"x-api-key": key, "anthropic-version": "2023-06-01"}))
    print("Key works.")
except urllib.error.HTTPError as e:
    raise SystemExit(f"Anthropic rejected the key (HTTP {e.code}). Nothing was saved.")
v = {"ANTHROPIC_API_KEY": {"type": "secret_text", "value": key}}
req = urllib.request.Request(f"https://api.cloudflare.com/client/v4/accounts/{acct}/pages/projects/midgley-awards", method="PATCH",
    data=json.dumps({"deployment_configs": {"preview": {"env_vars": v}, "production": {"env_vars": v}}}).encode(),
    headers={"Authorization": "Bearer " + tok, "content-type": "application/json"})
print("Saved to staging and production:", json.load(urllib.request.urlopen(req))["success"])
PY
gh workflow run deploy.yml --ref staging >/dev/null && gh workflow run deploy.yml --ref main >/dev/null && echo "Redeploying staging and production so Goat starts reading comments."
