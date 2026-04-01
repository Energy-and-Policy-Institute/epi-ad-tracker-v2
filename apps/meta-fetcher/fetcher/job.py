from __future__ import annotations

from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import date
from typing import Any

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

from fetcher.config import get_int_env, get_page_ids, get_required_env

GRAPH_API_URL = "https://graph.facebook.com/v5.0/ads_archive"
AD_FIELDS = (
    "id,ad_delivery_start_time,ad_delivery_stop_time,ad_snapshot_url,bylines,"
    "delivery_by_region,demographic_distribution,impressions,publisher_platforms,"
    "spend,ad_creative_bodies,ad_creative_link_captions,"
    "ad_creative_link_descriptions,ad_creative_link_titles,page_name,page_id"
)
PAGE_NAME_REPLACEMENTS = {
    "Natural Gas: Limitless Opportunity": "Save Our Stoves",
    "Cooperative Action Network": "Voices for Cooperative Power",
}


def build_session() -> requests.Session:
    retry = Retry(
        total=3,
        backoff_factor=1,
        status_forcelist=[429, 500, 502, 503, 504],
        allowed_methods=["GET", "POST"],
    )
    adapter = HTTPAdapter(max_retries=retry)
    session = requests.Session()
    session.mount("https://", adapter)
    session.mount("http://", adapter)
    return session


def parse_int(value: Any, default: int = 0) -> int:
    if value in (None, ""):
        return default

    return int(value)


def normalize_page_name(name: str) -> str:
    return PAGE_NAME_REPLACEMENTS.get(name, name)


def normalize_bylines(bylines: Any) -> str:
    if isinstance(bylines, list):
        bylines = " ".join(str(item) for item in bylines if item)

    if bylines is None:
        return ""

    return str(bylines).title()


def normalize_ad(raw_ad: dict[str, Any]) -> dict[str, Any] | None:
    ad_id = str(raw_ad.get("id") or "").strip()
    page_id = str(raw_ad.get("page_id") or "").strip()

    if not ad_id or not page_id:
        return None

    impressions = raw_ad.get("impressions") or {}
    spend = raw_ad.get("spend") or {}
    ad_delivery_start_time = str(raw_ad.get("ad_delivery_start_time") or "")
    ad_delivery_stop_time = str(raw_ad.get("ad_delivery_stop_time") or "")

    ad_start_month = (
        parse_int(ad_delivery_start_time.split("-")[1])
        if ad_delivery_start_time and "-" in ad_delivery_start_time
        else 0
    )
    ad_start_year = (
        parse_int(ad_delivery_start_time.split("-")[0])
        if ad_delivery_start_time and "-" in ad_delivery_start_time
        else 0
    )

    return {
        "id": ad_id,
        "ad_delivery_start_time": ad_delivery_start_time,
        "ad_delivery_stop_time": ad_delivery_stop_time,
        "ad_snapshot_url": str(raw_ad.get("ad_snapshot_url") or ""),
        "bylines": normalize_bylines(raw_ad.get("bylines")),
        "delivery_by_region": raw_ad.get("delivery_by_region") or [],
        "demographic_distribution": raw_ad.get("demographic_distribution") or [],
        "publisher_platforms": raw_ad.get("publisher_platforms") or [],
        "ad_creative_bodies": raw_ad.get("ad_creative_bodies") or [],
        "ad_creative_link_captions": raw_ad.get("ad_creative_link_captions") or [],
        "ad_creative_link_descriptions": raw_ad.get("ad_creative_link_descriptions")
        or [],
        "ad_creative_link_titles": raw_ad.get("ad_creative_link_titles") or [],
        "page_name": normalize_page_name(str(raw_ad.get("page_name") or "")),
        "page_id": page_id,
        "impressions_lower_bound": parse_int(impressions.get("lower_bound")),
        "impressions_upper_bound": parse_int(impressions.get("upper_bound")),
        "spend_lower_bound": parse_int(spend.get("lower_bound")),
        "spend_upper_bound": parse_int(spend.get("upper_bound")),
        "ad_start_month": ad_start_month,
        "ad_start_year": ad_start_year,
    }


def fetch_page_ads(page_id: str, access_token: str) -> list[dict[str, Any]]:
    session = build_session()
    params = {
        "access_token": access_token,
        "ad_type": "POLITICAL_AND_ISSUE_ADS",
        "ad_active_status": "ALL",
        "search_page_ids": page_id,
        "ad_reached_countries": ["US"],
        "ad_delivery_date_min": "2018-05-07",
        "ad_delivery_date_max": date.today().isoformat(),
        "fields": AD_FIELDS,
    }

    ads: list[dict[str, Any]] = []
    next_url: str | None = GRAPH_API_URL
    next_params: dict[str, Any] | None = params

    while next_url:
        response = session.get(next_url, params=next_params, timeout=(10, 90))
        response.raise_for_status()
        payload = response.json()
        ads.extend(payload.get("data", []))
        next_url = payload.get("paging", {}).get("next")
        next_params = None

    print(f"Fetched {len(ads)} ads for page {page_id}")
    return ads


def fetch_all_ads(page_ids: list[str], access_token: str) -> list[dict[str, Any]]:
    raw_ads: list[dict[str, Any]] = []
    max_workers = min(len(page_ids), max(get_int_env("FETCH_CONCURRENCY", 4), 1))

    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = {
            executor.submit(fetch_page_ads, page_id, access_token): page_id
            for page_id in page_ids
        }

        for future in as_completed(futures):
            page_id = futures[future]
            try:
                raw_ads.extend(future.result())
            except Exception as exc:
                raise RuntimeError(f"Failed to fetch ads for page {page_id}") from exc

    print(f"Fetched {len(raw_ads)} raw ads in total")
    return raw_ads


def dedupe_and_normalize(raw_ads: list[dict[str, Any]]) -> list[dict[str, Any]]:
    normalized_ads: dict[str, dict[str, Any]] = {}

    for raw_ad in raw_ads:
        normalized = normalize_ad(raw_ad)
        if normalized is None:
            continue
        normalized_ads[normalized["id"]] = normalized

    records = list(normalized_ads.values())
    print(f"Normalized {len(records)} unique ads")
    return records


def summarize_top_ads(records: list[dict[str, Any]]) -> dict[str, list[str]]:
    top_ads_by_page: defaultdict[str, list[dict[str, Any]]] = defaultdict(list)

    for record in records:
        top_ads_by_page[record["page_name"]].append(record)

    summary: dict[str, list[str]] = {}

    for page_name, page_ads in top_ads_by_page.items():
        top_ten = sorted(
            page_ads,
            key=lambda ad: ad["spend_upper_bound"],
            reverse=True,
        )[:10]
        summary[page_name] = [ad["id"] for ad in top_ten]

    return summary


def post_batches(records: list[dict[str, Any]]) -> int:
    ingest_url = get_required_env("INGEST_API_URL")
    ingest_secret = get_required_env("INGEST_API_SECRET")
    batch_size = max(get_int_env("FETCH_BATCH_SIZE", 200), 1)
    session = build_session()
    headers = {
        "Authorization": f"Bearer {ingest_secret}",
        "Content-Type": "application/json",
    }

    batches_sent = 0
    for start_index in range(0, len(records), batch_size):
        batch = records[start_index : start_index + batch_size]
        response = session.post(
            ingest_url,
            json=batch,
            headers=headers,
            timeout=(10, 90),
        )
        response.raise_for_status()
        batches_sent += 1
        print(
            f"Ingested batch {batches_sent} containing {len(batch)} ads "
            f"({start_index + len(batch)}/{len(records)})"
        )

    return batches_sent


def run_job() -> dict[str, Any]:
    access_token = get_required_env("META_ACCESS_TOKEN")
    page_ids = get_page_ids()
    raw_ads = fetch_all_ads(page_ids, access_token)
    records = dedupe_and_normalize(raw_ads)

    if not records:
        return {
            "batches_sent": 0,
            "pages_processed": len(page_ids),
            "top_ads_by_page": {},
            "total_ads": 0,
        }

    batches_sent = post_batches(records)
    top_ads_by_page = summarize_top_ads(records)

    return {
        "batches_sent": batches_sent,
        "pages_processed": len(page_ids),
        "top_ads_by_page": top_ads_by_page,
        "total_ads": len(records),
    }
