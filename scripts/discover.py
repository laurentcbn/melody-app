#!/usr/bin/env python3
"""Cherche des plugins audio gratuits (VST3 / CLAP) avec une version Mac, Windows ou Linux
sur GitHub, les fusionne avec la sélection de Melody et écrit plugins.json.

Chaque plugin porte `downloads` : le meilleur fichier par système ("mac", "windows",
"linux"). `download` reprend le fichier Mac pour les versions 0.3 de Melody.

Lancé chaque jour par .github/workflows/plugins.yml. Variable GITHUB_TOKEN requise.
Usage : discover.py [sortie.json]
"""
import json
import os
import re
import sys
import time
import urllib.parse
import urllib.request
from datetime import datetime, timedelta, timezone

API = "https://api.github.com"
HERE = os.path.dirname(os.path.abspath(__file__))

# Recherches de dépôts : plugins audio, triés par étoiles.
QUERIES = [
    "topic:vst3",
    "topic:clap-plugin",
    "topic:vst3-plugin",
    "topic:audio-plugin",
    "topic:clap",
    "topic:vst topic:synthesizer",
    "topic:juce topic:plugin",
    "topic:nih-plug",
    "topic:dpf",
]
MIN_STARS = 40
MAX_AGE_DAYS = 3 * 365
MAX_PLUGINS = 120
# Dépôts trouvés par la recherche qui ne sont pas des plugins (logiciels, outils).
BLOCKLIST = {"giada", "owlplug", "clap-validator", "effetune", "camomile", "magda-core", "audiogridder"}

MAC = re.compile(r"(mac|macos|osx|darwin|apple|universal)", re.I)
NOT_MAC = re.compile(r"(win|windows|linux|ubuntu|\.deb|\.rpm|x86_64-linux|aarch64-linux|source|src|debug|\.sig|\.sha)", re.I)
INSTRUMENT = re.compile(r"(synth|instrument|sampler|drum|piano|organ|rompler|wavetable|fm\b|modular)", re.I)
EFFECT = re.compile(r"(reverb|delay|eq\b|equali[sz]er|compressor|distortion|saturat|chorus|flanger|phaser|filter|limiter|effect|fx\b|amp\b|tape|echo)", re.I)
NOT_PLUGIN = re.compile(r"(framework|sdk|library|template|example|wrapper|bindings|host\b|daw\b|tutorial|validator|plugin manager)", re.I)
BAD_TOPICS = {"daw", "plugin-manager", "plugin-host", "framework", "sdk"}


def get(path, params=None):
    url = API + path
    if params:
        url += "?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={
        "Accept": "application/vnd.github+json",
        "Authorization": "Bearer " + os.environ.get("GITHUB_TOKEN", ""),
        "User-Agent": "melody-plugins",
    })
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=30) as r:
                return json.load(r)
        except urllib.error.HTTPError as e:
            if e.code in (403, 429) and attempt < 2:
                time.sleep(30)
                continue
            if e.code == 404:
                return None
            raise
    return None


WIN = re.compile(r"(win|msvc)", re.I)
LINUX = re.compile(r"(linux|ubuntu|debian|x86_64-linux|aarch64-linux)", re.I)
SKIP = re.compile(r"(source|src|debug|\.sig|\.sha|symbols|pdb)", re.I)
# Types de fichiers que Melody sait installer, du plus simple au moins simple.
RANK = {
    "mac": {"zip": 0, "dmg": 1, "pkg": 2},
    "windows": {"zip": 0, "exe": 1, "msi": 2},
    "linux": {"zip": 0},
}


def system_of(name):
    """Système visé par un fichier de release, d'après son nom et son extension."""
    low = name.lower()
    ext = low.rsplit(".", 1)[-1]
    if ext in ("dmg", "pkg"):
        return "mac"
    if ext in ("exe", "msi"):
        return "windows"
    rest = MAC.sub("", name)
    is_mac = bool(MAC.search(name))
    is_linux = bool(LINUX.search(rest))
    is_win = bool(WIN.search(LINUX.sub("", rest)))
    if is_mac + is_linux + is_win != 1:
        return None
    return "mac" if is_mac else "linux" if is_linux else "windows"


def best_assets(assets):
    """Meilleur fichier de chaque système dans une release."""
    best = {}
    for a in assets:
        name = a["name"]
        low = name.lower()
        ext = low.rsplit(".", 1)[-1]
        system = system_of(name)
        if not system or ext not in RANK[system] or SKIP.search(low):
            continue
        # versions de développement, et paquets Audio Unit seuls (Melody lit VST3 et CLAP)
        if "nightly" in low or ((re.search(r"(^|[^a-z])au([^a-z]|$)", low)) and "vst" not in low and "clap" not in low):
            continue
        cand = (RANK[system][ext], -a.get("download_count", 0), {
            "url": a["browser_download_url"],
            "name": name,
            "size": a.get("size", 0),
            "type": ext,
        })
        if system not in best or cand[:2] < best[system][:2]:
            best[system] = cand
    return {k: v[2] for k, v in best.items()}


def mac_asset(assets):
    """Meilleur fichier Mac d'une release (zip, sinon dmg, sinon pkg)."""
    return best_assets(assets).get("mac")


def formats(text):
    t = text.lower()
    out = [f for f, k in (("VST3", "vst3"), ("CLAP", "clap"), ("AU", " au")) if k in " " + t]
    return out or ["VST3"]


def kind(repo):
    text = " ".join([repo.get("name", ""), repo.get("description") or "", " ".join(repo.get("topics", []))])
    if INSTRUMENT.search(text):
        return "instrument"
    if EFFECT.search(text):
        return "effect"
    return "effect"


def pretty(name):
    n = re.sub(r"[-_]", " ", name)
    return n if any(c.isupper() for c in n) else n.title()


def discover():
    seen, found = set(), []
    cutoff = datetime.now(timezone.utc) - timedelta(days=MAX_AGE_DAYS)
    for q in QUERIES:
        for page in (1, 2):
            res = get("/search/repositories", {"q": q + f" stars:>={MIN_STARS}", "sort": "stars", "per_page": 50, "page": page})
            items = (res or {}).get("items", [])
            for r in items:
                full = r["full_name"]
                if full in seen or r.get("archived") or r.get("fork"):
                    continue
                seen.add(full)
                pushed = datetime.fromisoformat(r["pushed_at"].replace("Z", "+00:00"))
                if pushed < cutoff or NOT_PLUGIN.search((r.get("description") or "") + " " + r["name"]):
                    continue
                if r["name"].lower() in BLOCKLIST or BAD_TOPICS & set(r.get("topics", [])):
                    continue
                rel = get(f"/repos/{full}/releases/latest")
                if not rel or rel.get("prerelease") or rel.get("draft"):
                    continue
                files = best_assets(rel.get("assets", []))
                if not files:
                    continue
                lic = (r.get("license") or {}).get("spdx_id")
                found.append({
                    "name": pretty(r["name"]),
                    "vendor": r["owner"]["login"],
                    "kind": kind(r),
                    "about": (r.get("description") or "").strip()[:160],
                    "url": r.get("homepage") or r["html_url"],
                    "repo": full,
                    "stars": r["stargazers_count"],
                    "license": None if lic in (None, "NOASSERTION") else lic,
                    "version": rel.get("tag_name"),
                    "download": files.get("mac"),
                    "downloads": files,
                    "formats": formats(" ".join(a["name"] for a in rel.get("assets", [])) + " " + " ".join(r.get("topics", []))),
                    "source": "github",
                })
            if len(items) < 50:
                break
    found.sort(key=lambda p: -p["stars"])
    return found[:MAX_PLUGINS]


def release_of(full):
    """Dernière release d'un dépôt de la sélection (absent des résultats de recherche)."""
    try:
        r = get(f"/repos/{full}")
        rel = get(f"/repos/{full}/releases/latest")
    except Exception as e:  # noqa: BLE001
        print(f"{full} : {e}")
        return None
    if not r or not rel:
        return None
    files = best_assets(rel.get("assets", []))
    if not files:
        return None
    lic = (r.get("license") or {}).get("spdx_id")
    return {
        "stars": r["stargazers_count"],
        "license": None if lic in (None, "NOASSERTION") else lic,
        "version": rel.get("tag_name"),
        "download": files.get("mac"),
        "downloads": files,
    }


def merge(curated, found):
    """La sélection garde ses textes ; GitHub complète (lien de téléchargement, étoiles) et ajoute le reste."""
    by_repo = {p["repo"]: p for p in found}
    out = []
    for c in curated:
        p = dict(c, source="curated")
        g = by_repo.pop(c.get("repo"), None) if c.get("repo") else None
        if g is None and c.get("repo"):
            g = release_of(c["repo"])
        if g:
            for k in ("license", "version", "download", "downloads"):
                p[k] = g[k]
        out.append(p)
    names = {c["name"].lower().replace(" ", "").replace("-", "") for c in curated}
    for g in by_repo.values():
        key = g["name"].lower().replace(" ", "").replace("-", "")
        if key in names or any(key.startswith(n) or n.startswith(key) for n in names if len(n) > 3 and len(key) > 3):
            continue
        out.append(g)
    return out


def main():
    out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "..", "plugins.json")
    with open(os.path.join(HERE, "curated.json"), encoding="utf-8") as f:
        curated = json.load(f)
    found = discover()
    data = {
        "updated": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "plugins": merge(curated, found),
    }
    with open(out, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=1)
    print(f"{len(data['plugins'])} plugins ({len(found)} trouvés sur GitHub)")


if __name__ == "__main__":
    main()
