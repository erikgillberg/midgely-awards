#!/bin/sh
# Tells Bing (and other IndexNow engines) about every URL in the live sitemap. Run after publishing new teardowns.
# The key is public by design: it is served at https://backfireawards.com/34f800fffab53f61b785edfa1daeeb4f.txt
KEY=34f800fffab53f61b785edfa1daeeb4f
URLS=$(curl -s https://backfireawards.com/sitemap.xml | grep -o '<loc>[^<]*' | sed 's/<loc>//' | python3 -c 'import sys,json; print(json.dumps([l.strip() for l in sys.stdin if l.strip()]))')
curl -s -o /dev/null -w "IndexNow: %{http_code}\n" -X POST https://api.indexnow.org/indexnow -H "content-type: application/json; charset=utf-8" \
  -d "{\"host\":\"backfireawards.com\",\"key\":\"$KEY\",\"keyLocation\":\"https://backfireawards.com/$KEY.txt\",\"urlList\":$URLS}"
