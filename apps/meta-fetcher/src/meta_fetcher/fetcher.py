from __future__ import annotations

import json
import os
from dataclasses import dataclass
from pathlib import Path
from tempfile import TemporaryDirectory
from typing import Any, Iterable

import boto3
import numpy as np
import pandas as pd
import requests
from botocore.exceptions import ClientError, NoCredentialsError
from dotenv import load_dotenv
from selenium import webdriver

load_dotenv()

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

DEFAULT_DATE_MIN = os.getenv("META_FETCHER_DATE_MIN", "2018-05-07")
DEFAULT_DATE_MAX = os.getenv("META_FETCHER_DATE_MAX", "2024-06-14")
DEFAULT_POST_URL = os.getenv(
    "META_FETCHER_API_URL",
    "https://epi-ad-tracker-v2-epi.vercel.app/api/addads",
)
DEFAULT_SCREENSHOT_BUCKET = os.getenv("META_FETCHER_S3_BUCKET", "epi-ad-screenshot")
DEFAULT_BATCH_SIZE = int(os.getenv("META_FETCHER_BATCH_SIZE", "200"))
REQUEST_TIMEOUT_SECONDS = 60

PAGE_NAME_RENAMES = {
    "Natural Gas: Limitless Opportunity": "Save Our Stoves",
    "Cooperative Action Network": "Voices for Cooperative Power",
}


@dataclass(frozen=True)
class Settings:
    access_token: str
    aws_access_key_id: str
    aws_secret_access_key: str
    api_url: str
    screenshot_bucket: str
    date_min: str
    date_max: str
    batch_size: int


def require_env(name: str) -> str:
    value = os.getenv(name)
    if not value:
        raise RuntimeError(f"Missing required environment variable: {name}")
    return value


def build_settings(
    *,
    api_url: str = DEFAULT_POST_URL,
    batch_size: int = DEFAULT_BATCH_SIZE,
    date_max: str = DEFAULT_DATE_MAX,
    date_min: str = DEFAULT_DATE_MIN,
    screenshot_bucket: str = DEFAULT_SCREENSHOT_BUCKET,
) -> Settings:
    return Settings(
        access_token=require_env("META_ACCESS_TOKEN"),
        aws_access_key_id=require_env("AWS_ACCESS_KEY_ID"),
        aws_secret_access_key=require_env("AWS_SECRET_ACCESS_KEY"),
        api_url=api_url,
        screenshot_bucket=screenshot_bucket,
        date_min=date_min,
        date_max=date_max,
        batch_size=batch_size,
    )


def convert_to_json_serializable(value: Any) -> Any:
    if isinstance(value, np.integer):
        return int(value)
    if isinstance(value, np.floating):
        return float(value)
    if value is pd.NA:
        return None
    return value


def get_s3_client(settings: Settings):
    return boto3.client(
        "s3",
        aws_access_key_id=settings.aws_access_key_id,
        aws_secret_access_key=settings.aws_secret_access_key,
    )


def upload_to_s3(local_file: Path, bucket: str, object_name: str, settings: Settings) -> bool:
    s3 = get_s3_client(settings)

    try:
        s3.upload_file(
            str(local_file),
            bucket,
            object_name,
            ExtraArgs={"ContentType": "image/png"},
        )
        print(f"File {local_file} uploaded to {bucket} as {object_name}")
        return True
    except FileNotFoundError:
        print(f"The file was not found: {local_file}")
        return False
    except NoCredentialsError:
        print("Credentials not available")
        return False


def file_exists_in_s3(bucket: str, object_name: str, settings: Settings) -> bool:
    s3 = get_s3_client(settings)

    try:
        s3.head_object(Bucket=bucket, Key=object_name)
        print(f"File {object_name} exists in {bucket}")
        return True
    except ClientError as exc:
        if exc.response["Error"]["Code"] == "404":
            print(f"File {object_name} does not exist in {bucket}")
            return False
        raise


def take_screenshot(url: str, destination: Path) -> None:
    options = webdriver.ChromeOptions()
    options.add_argument("--headless")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")

    driver = webdriver.Chrome(options=options)
    try:
        driver.get(url)
        driver.save_screenshot(str(destination))
    finally:
        driver.quit()

    print(f"Screenshot saved as {destination}.")


def fetch_page_ads(page_id: str, settings: Settings) -> list[dict[str, Any]]:
    print(page_id)
    response = requests.get(
        "https://graph.facebook.com/v5.0/ads_archive",
        params={
            "access_token": settings.access_token,
            "ad_type": "POLITICAL_AND_ISSUE_ADS",
            "ad_active_status": "ALL",
            "search_page_ids": page_id,
            "ad_reached_countries": ["US"],
            "ad_delivery_date_min": settings.date_min,
            "ad_delivery_date_max": settings.date_max,
            "fields": (
                "id, ad_delivery_start_time, ad_delivery_stop_time, ad_snapshot_url, "
                "bylines, delivery_by_region, demographic_distribution, impressions, "
                "publisher_platforms, spend, ad_creative_bodies, "
                "ad_creative_link_captions, ad_creative_link_descriptions, "
                "ad_creative_link_titles, page_name, page_id"
            ),
        },
        timeout=REQUEST_TIMEOUT_SECONDS,
    )
    response.raise_for_status()

    body = response.json()
    records = list(body.get("data", []))
    next_link = body.get("paging", {}).get("next")

    while next_link:
        print(".", end="", flush=True)
        response = requests.get(next_link, timeout=REQUEST_TIMEOUT_SECONDS)
        response.raise_for_status()
        body = response.json()
        records.extend(body.get("data", []))
        next_link = body.get("paging", {}).get("next")

    print()
    return records


def build_dataframe(settings: Settings, page_ids: Iterable[str]) -> pd.DataFrame:
    records: list[dict[str, Any]] = []

    for page_id in page_ids:
        records.extend(fetch_page_ads(page_id, settings))

    if not records:
        return pd.DataFrame()

    frame = pd.json_normalize(records)
    frame = frame.drop_duplicates(subset="id")
    frame = frame.replace({np.nan: None})
    frame["ad_start_month"] = frame["ad_delivery_start_time"].str.split("-").str[1].astype(int)
    frame["ad_start_year"] = frame["ad_delivery_start_time"].str.split("-").str[0].astype(int)
    frame["spend.lower_bound"] = frame["spend.lower_bound"].astype("int")
    frame["spend.upper_bound"] = frame["spend.upper_bound"].astype("int").round(-2)
    frame["bylines"] = frame["bylines"].fillna("").str.title()
    frame["page_name"] = frame["page_name"].replace(PAGE_NAME_RENAMES)
    return frame


def print_page_summary(frame: pd.DataFrame) -> None:
    page_names = (
        frame.groupby("page_name")
        .size()
        .reset_index(name="ads")
        .rename(columns={"page_name": "name"})
        .sort_values(by="ads", ascending=False)
        .reset_index(drop=True)
        .to_dict(orient="records")
    )
    print(json.dumps(page_names, indent=2))


def get_top_ten_ids(frame: pd.DataFrame) -> set[str]:
    top_ten = (
        frame.groupby("page_name", group_keys=False)
        .apply(lambda group: group.nlargest(10, "spend.upper_bound"))
        .reset_index(drop=True)
    )
    return set(top_ten["id"].tolist())


def payload_from_row(row: pd.Series) -> dict[str, Any]:
    return {
        "id": convert_to_json_serializable(row["id"]),
        "ad_delivery_start_time": convert_to_json_serializable(row["ad_delivery_start_time"]),
        "ad_delivery_stop_time": convert_to_json_serializable(row["ad_delivery_stop_time"]),
        "ad_snapshot_url": convert_to_json_serializable(row["ad_snapshot_url"]),
        "bylines": convert_to_json_serializable(row["bylines"]),
        "delivery_by_region": convert_to_json_serializable(row["delivery_by_region"]),
        "demographic_distribution": convert_to_json_serializable(
            row["demographic_distribution"]
        ),
        "publisher_platforms": convert_to_json_serializable(row["publisher_platforms"]),
        "ad_creative_bodies": convert_to_json_serializable(row["ad_creative_bodies"]),
        "ad_creative_link_captions": convert_to_json_serializable(
            row["ad_creative_link_captions"]
        ),
        "ad_creative_link_descriptions": convert_to_json_serializable(
            row["ad_creative_link_descriptions"]
        ),
        "ad_creative_link_titles": convert_to_json_serializable(
            row["ad_creative_link_titles"]
        ),
        "page_name": convert_to_json_serializable(row["page_name"]),
        "page_id": convert_to_json_serializable(row["page_id"]),
        "impressions_lower_bound": convert_to_json_serializable(
            row["impressions.lower_bound"]
        ),
        "impressions_upper_bound": convert_to_json_serializable(
            row["impressions.upper_bound"]
        ),
        "spend_lower_bound": convert_to_json_serializable(row["spend.lower_bound"]),
        "spend_upper_bound": convert_to_json_serializable(row["spend.upper_bound"]),
        "ad_start_month": convert_to_json_serializable(row["ad_start_month"]),
        "ad_start_year": convert_to_json_serializable(row["ad_start_year"]),
    }


def maybe_attach_screenshot(
    payload: dict[str, Any],
    row: pd.Series,
    *,
    settings: Settings,
    temp_dir: Path,
    top_ten_ids: set[str],
) -> dict[str, Any]:
    if row["id"] not in top_ten_ids:
        return payload

    screenshot_name = f"{row['id']}.png"
    screenshot_path = temp_dir / screenshot_name

    if not file_exists_in_s3(settings.screenshot_bucket, screenshot_name, settings):
        take_screenshot(str(row["ad_snapshot_url"]), screenshot_path)
        upload_to_s3(
            screenshot_path,
            settings.screenshot_bucket,
            screenshot_name,
            settings,
        )
        if screenshot_path.exists():
            screenshot_path.unlink()

    screenshot_url = (
        f"https://{settings.screenshot_bucket}.s3.us-east-2.amazonaws.com/{screenshot_name}"
    )
    print(screenshot_url)
    return {**payload, "ad_screenshot_url": screenshot_url}


def post_batches(frame: pd.DataFrame, settings: Settings) -> None:
    top_ten_ids = get_top_ten_ids(frame)
    items = frame.to_dict(orient="records")
    print(len(items))

    with TemporaryDirectory() as temp_dir_name:
        temp_dir = Path(temp_dir_name)
        for batch_index, start in enumerate(range(0, len(items), settings.batch_size)):
            print(
                f"processing batch {batch_index} of {max(len(items) // settings.batch_size, 1)}"
            )
            batch = items[start : start + settings.batch_size]
            batch_data: list[dict[str, Any]] = []

            for raw_row in batch:
                row = pd.Series(raw_row)
                payload = payload_from_row(row)
                payload = maybe_attach_screenshot(
                    payload,
                    row,
                    settings=settings,
                    temp_dir=temp_dir,
                    top_ten_ids=top_ten_ids,
                )
                batch_data.append(payload)

            json_payload = json.dumps(batch_data, indent=2)

            try:
                response = requests.post(
                    settings.api_url,
                    data=json_payload,
                    headers={"Content-Type": "application/json"},
                    timeout=REQUEST_TIMEOUT_SECONDS,
                )
                response.raise_for_status()
                if response.status_code == 200:
                    print("success")
                else:
                    print("Request failed with status code:", response.status_code)
                    print(response.text)
            except requests.exceptions.RequestException as exc:
                print(f"Error: {exc}\n\n{json_payload}")


def run_fetch(settings: Settings, *, page_ids: Iterable[str] = DEFAULT_PAGE_IDS) -> None:
    frame = build_dataframe(settings, page_ids)
    if frame.empty:
        print("No ad data returned from the Meta archive query.")
        return

    print_page_summary(frame)
    post_batches(frame, settings)
