#!/bin/zsh
# Connects the site's Weekly Oops sign-ups to a Mailchimp audience.
# Asks for a Mailchimp API key (never printed), finds the audience ("The Weekly Oops", or the only one),
# saves the key and the audience ID to the Pages project for staging and production, and redeploys both.
# Make the key in Mailchimp: profile picture > Profile > Extras > API keys > Create A Key.
set -e
cd "$(dirname "$0")/.."
source ~/code/.secrets/machine.env
read -s "MC?Paste the Mailchimp API key (it won't show): "; echo
[[ "$MC" == *-us* ]] || { echo "That doesn't look like a Mailchimp key (it ends in -us<number>)."; exit 1; }
MC="$MC" python3 - <<'PY'
import os, json, base64, urllib.request
tok, acct, key = os.environ["CLOUDFLARE_API_TOKEN"], os.environ["CLOUDFLARE_ACCOUNT_ID"], os.environ["MC"]
dc = key.split("-")[-1]
auth = "Basic " + base64.b64encode(("site:" + key).encode()).decode()
lists = json.load(urllib.request.urlopen(urllib.request.Request(
    f"https://{dc}.api.mailchimp.com/3.0/lists?count=100&fields=lists.id,lists.name,lists.campaign_defaults",
    headers={"Authorization": auth})))["lists"]
print("Audiences in this Mailchimp account:")
for l in lists: print(f"  {l['name']}  (id {l['id']}, sends as {l['campaign_defaults']['from_name']} <{l['campaign_defaults']['from_email']}>)")
pick = [l for l in lists if l["name"].strip().lower() == "the weekly oops"] or (lists if len(lists) == 1 else [])
if not pick: raise SystemExit("No audience named 'The Weekly Oops', and more than one audience. Rename one and run this again.")
aud = pick[0]
print(f"Using: {aud['name']} ({aud['id']})")
v = {"MAILCHIMP_API_KEY": {"type": "secret_text", "value": key}, "MAILCHIMP_AUDIENCE_ID": {"type": "plain_text", "value": aud["id"]}}
req = urllib.request.Request(f"https://api.cloudflare.com/client/v4/accounts/{acct}/pages/projects/midgley-awards", method="PATCH",
    data=json.dumps({"deployment_configs": {"preview": {"env_vars": v}, "production": {"env_vars": v}}}).encode(),
    headers={"Authorization": "Bearer " + tok, "content-type": "application/json"})
print("Saved to staging and production:", json.load(urllib.request.urlopen(req))["success"])
PY
gh workflow run deploy.yml --ref staging >/dev/null && gh workflow run deploy.yml --ref main >/dev/null && echo "Redeploying staging and production so the new key takes effect."
