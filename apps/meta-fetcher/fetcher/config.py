from __future__ import annotations

import os

DEFAULT_PAGE_IDS = [
    "106039214814684",
    "102281724942742",
    "738063612887865",
    "341751646428117",
    "591566840920364",
    "105502284969626",
    "49560242814",
    "101691091213750",
    "292970844058835",
    "100801038449520",
    "108095672108380",
    "111394533709201",
    "107500120800840",
    "101242238726088",
    "237209147160346",
    "110124925319299",
    "396341921119746",
    "108203188195224",
    "106656845034469",
    "47710973068",
    "482100658584410",
]


def get_required_env(name: str) -> str:
    value = os.getenv(name)
    if not value:
        raise RuntimeError(f"Missing required environment variable: {name}")
    return value


def get_page_ids() -> list[str]:
    raw_value = os.getenv("META_PAGE_IDS", "").strip()
    if not raw_value:
        return DEFAULT_PAGE_IDS

    return [page_id.strip() for page_id in raw_value.split(",") if page_id.strip()]


def get_int_env(name: str, default: int) -> int:
    raw_value = os.getenv(name)
    if not raw_value:
        return default

    try:
        return int(raw_value)
    except ValueError as exc:
        raise RuntimeError(f"Invalid integer value for {name}: {raw_value}") from exc
