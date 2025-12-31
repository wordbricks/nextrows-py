from __future__ import annotations

from dataclasses import dataclass
from typing import Optional

import requests

from nextrows.api.apps import run_app_json, run_app_table
from nextrows.api.credits import get_credits
from nextrows.api.extract import extract
from nextrows.types import (
    ExtractRequest,
    ExtractResponse,
    GetCreditsResponse,
    RunAppJsonRequest,
    RunAppJsonResponse,
    RunAppTableRequest,
    RunAppTableResponse,
)

BASE_URL = "https://api.nextrows.com"


@dataclass(frozen=True)
class NextrowsOptions:
    api_key: str
    base_url: str = BASE_URL
    timeout: float = 30.0


class Nextrows:
    def __init__(
        self,
        api_key: str,
        base_url: str = BASE_URL,
        timeout: float = 30.0,
        session: Optional[requests.Session] = None,
    ) -> None:
        self.api_key = api_key
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout
        self.session = session or requests.Session()
        self.session.headers.update(
            {
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            }
        )

    def extract(self, request: ExtractRequest) -> ExtractResponse:
        return extract(self.session, self.base_url, request, self.timeout)

    def get_credits(self) -> GetCreditsResponse:
        return get_credits(self.session, self.base_url, self.timeout)

    def run_app_json(self, request: RunAppJsonRequest) -> RunAppJsonResponse:
        return run_app_json(self.session, self.base_url, request, self.timeout)

    def run_app_table(self, request: RunAppTableRequest) -> RunAppTableResponse:
        return run_app_table(self.session, self.base_url, request, self.timeout)

    def close(self) -> None:
        self.session.close()

    def __enter__(self) -> "Nextrows":
        return self

    def __exit__(self, exc_type, exc, tb) -> None:
        self.close()
