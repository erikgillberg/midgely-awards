#!/bin/zsh
# Copies the Turnstile widget's secret straight into the Pages project (staging and production),
# so nobody has to paste it. Never prints the secret.
set -e
source ~/code/.secrets/machine.env
python3 - <<'EOF'
import os, json, urllib.request, urllib.parse
tok = os.environ["CLOUDFLARE_API_TOKEN"]; acct = os.environ["CLOUDFLARE_ACCOUNT_ID"]
def call(method, path, body=None):
    req = urllib.request.Request("https://api.cloudflare.com/client/v4" + path, method=method,
        data=json.dumps(body).encode() if body else None,
        headers={"Authorization": "Bearer " + tok, "content-type": "application/json"})
    return json.load(urllib.request.urlopen(req))
secret = call("GET", f"/accounts/{acct}/challenges/widgets/0x4AAAAAAFZEGSwBqUr89o7c")["result"]["secret"]
check = json.load(urllib.request.urlopen(urllib.request.Request(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    data=urllib.parse.urlencode({"secret": secret, "response": "test"}).encode())))
print("Widget secret is valid:", "invalid-input-secret" not in check.get("error-codes", []))
v = {"TURNSTILE_SECRET": {"type": "secret_text", "value": secret}}
res = call("PATCH", f"/accounts/{acct}/pages/projects/midgley-awards",
           {"deployment_configs": {"preview": {"env_vars": v}, "production": {"env_vars": v}}})
print("Saved to staging and production:", res["success"])
EOF
