"""Unduh fixture data asli dari REST Countries API v5 untuk pengujian.

Mengikuti pola bin/verify.py pada konektor custom.restcountries:
key asli tidak pernah muncul di file ini, di argumen, atau di log.
dynamic_credentials.py menaruh surrogate yang ditukar runtime dengan
key asli hanya pada request ke host terdaftar.

Isi fixture: 9 negara pertama dari endpoint list (field lengkap) +
1 negara detail (Indonesia, kode alpha-3 IDN). Total 10 negara.
Disimpan ke tests/fixtures/countries.json.
"""
import json
import sys
import urllib.request
from datetime import datetime, timezone

sys.path.insert(0, "/opt/muse/skills/custom-connector-setup/bin")
from dynamic_credentials import add_surrogate_to_request, read_json_response

BROWSER_UA = (
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
)


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *args):
        raise RuntimeError("redirect refused, verify the endpoint")


def fetch(url):
    request = urllib.request.Request(url)
    request.add_header("User-Agent", BROWSER_UA)
    add_surrogate_to_request(
        request, "custom.restcountries", allowed_hosts=["api.restcountries.com"]
    )
    with urllib.request.build_opener(NoRedirect()).open(
        request, timeout=30
    ) as response:
        print("HTTP", response.status, url)
        return read_json_response(response)


def main():
    list_response = fetch(
        "https://api.restcountries.com/countries/v5?limit=9"
    )
    detail_response = fetch(
        "https://api.restcountries.com/countries/v5/codes.alpha_3/IDN"
    )
    fixture = {
        "fetched_at": datetime.now(timezone.utc).isoformat(),
        "source": (
            "GET https://api.restcountries.com/countries/v5?limit=9 "
            "dan GET /countries/v5/codes.alpha_3/IDN "
            "(live, via konektor custom.restcountries)"
        ),
        "list_response": list_response,
        "detail_idn_response": detail_response,
    }
    out_path = "tests/fixtures/countries.json"
    with open(out_path, "w", encoding="utf-8") as fh:
        json.dump(fixture, fh, indent=2, ensure_ascii=False)
    names = [c["names"]["common"] for c in list_response["data"]["objects"]]
    print("list:", len(names), "negara ->", ", ".join(names))
    print("detail:", detail_response["data"]["objects"][0]["names"]["common"])
    print("disimpan:", out_path)


if __name__ == "__main__":
    main()
