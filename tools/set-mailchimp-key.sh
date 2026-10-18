#!/bin/zsh
# Saves a Mailchimp API key as a secret in the Pages project (staging and production), then
# redeploys staging so it takes effect. The key is read from the prompt and never printed.
# Make the key in Mailchimp: Profile > Extras > API keys > Create A Key.
set -e
cd "$(dirname "$0")/.."
source ~/code/.secrets/machine.env
read -s "MC?Paste the Mailchimp API key (it won't show): "; echo
[[ "$MC" == *-us* ]] || { echo "That doesn't look like a Mailchimp key (it ends in -us<number>)."; exit 1; }
MC="$MC" python3 - <<'PY'
import os, json, urllib.request
tok, acct, key = os.environ["CLOUDFLARE_API_TOKEN"], os.environ["CLOUDFLARE_ACCOUNT_ID"], os.environ["MC"]
v = {"MAILCHIMP_API_KEY": {"type": "secret_text", "value": key}}
req = urllib.request.Request(f"https://api.cloudflare.com/client/v4/accounts/{acct}/pages/projects/midgley-awards", method="PATCH",
    data=json.dumps({"deployment_configs": {"preview": {"env_vars": v}, "production": {"env_vars": v}}}).encode(),
    headers={"Authorization": "Bearer " + tok, "content-type": "application/json"})
print("Saved to staging and production:", json.load(urllib.request.urlopen(req))["success"])
PY
gh workflow run deploy.yml --ref staging >/dev/null && echo "Staging redeploy started. Production picks it up on the next promotion."
