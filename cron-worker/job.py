"""The scheduled job. CLI runs `python job.py` on the template's schedule (hourly by default).

Replace the body of run() with your own work. Anything it prints shows up in the cron run's output
in the dashboard; a non-zero exit marks the run as failed and alerts you.
"""
import os
import sys
from datetime import datetime, timezone

import requests


def run() -> None:
    url = os.environ.get("CHECK_URL") or "https://clicloud.app"
    r = requests.get(url, timeout=10)
    print(f"{datetime.now(timezone.utc).isoformat()} {url} answered {r.status_code} in {r.elapsed.total_seconds():.2f}s")
    if r.status_code >= 500:
        sys.exit(1)


if __name__ == "__main__":
    run()
