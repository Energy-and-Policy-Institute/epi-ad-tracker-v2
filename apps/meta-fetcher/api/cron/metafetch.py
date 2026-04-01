from __future__ import annotations

import os

from fastapi import FastAPI, Header, HTTPException

from fetcher.job import run_job

app = FastAPI()


@app.get("/")
def trigger_meta_fetch(authorization: str | None = Header(default=None)):
    expected_secret = os.getenv("CRON_SECRET")
    if not expected_secret:
        raise HTTPException(status_code=500, detail="CRON_SECRET is not configured")

    if authorization != f"Bearer {expected_secret}":
        raise HTTPException(status_code=401, detail="Unauthorized")

    result = run_job()
    return {"ok": True, "result": result}


@app.get("/health")
def healthcheck():
    return {"ok": True}
