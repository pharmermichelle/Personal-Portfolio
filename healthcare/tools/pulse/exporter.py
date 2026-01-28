#!/usr/bin/env python3
"""
Usage:
  python exporter.py input.csv data/metrics.json

Input CSV columns (header required):
  appointment_date, scheduled_time, arrival_time, seen_time, status, contact_resolved
- appointment_date: YYYY-MM-DD
- times: HH:MM (24h) or empty
- status: completed | no_show | cancelled
- contact_resolved: yes | no

Computes ~last 30 days of metrics and writes JSON used by the static dashboard.
"""
import csv, json, sys, datetime as dt
from collections import defaultdict

if len(sys.argv) < 3:
    print("Usage: python exporter.py input.csv data/metrics.json")
    sys.exit(1)

src, out = sys.argv[1], sys.argv[2]

def parse_date(s):
    return dt.datetime.strptime(s, "%Y-%m-%d").date()

def parse_time(s):
    return dt.datetime.strptime(s, "%H:%M").time() if s else None

def minutes_between(a, b):
    if not a or not b:
        return None
    today = dt.date(2000, 1, 1)  # anchor day; only diff matters
    delta = dt.datetime.combine(today, b) - dt.datetime.combine(today, a)
    return int(delta.total_seconds() // 60)

rows = []
with open(src, newline='') as f:
    r = csv.DictReader(f)
    for row in r:
        if not row.get("appointment_date"):
            continue
        try:
            row["_date"] = parse_date(row["appointment_date"])
        except Exception:
            continue
        rows.append(row)

by_day = defaultdict(list)
for r in rows:
    by_day[r["_date"]].append(r)

days = sorted(by_day.keys())[-30:]  # last 30 days
series = {
    "dates": [],
    "avg_wait_minutes": [],
    "no_show_rate": [],
    "cancellations": [],
    "visits": [],
}

sum_wait = 0
n_wait = 0
no_shows = 0
cancels = 0
visits_total = 0
fcr_yes = 0
fcr_total = 0

for d in days:
    day_rows = by_day[d]
    waits = []
    visits = 0
    nos = 0
    canc = 0
    fcr_y = 0
    fcr_t = 0

    for r in day_rows:
        status = (r.get("status") or "").strip().lower()
        if status == "completed":
            visits += 1
            arr = parse_time((r.get("arrival_time") or "").strip() or None)
            seen = parse_time((r.get("seen_time") or "").strip() or None)
            w = minutes_between(arr, seen)
            if w is not None and 0 <= w < 8 * 60:
                waits.append(w)
                sum_wait += w
                n_wait += 1
        elif status == "no_show":
            nos += 1
        elif status == "cancelled":
            canc += 1

        cr = (r.get("contact_resolved") or "").strip().lower()
        if cr in ("yes", "no"):
            fcr_t += 1
            if cr == "yes":
                fcr_y += 1

    total_appts = visits + nos + canc
    day_avg_wait = (sum(waits) / len(waits)) if waits else 0
    day_no_show_rate = (nos / total_appts) if total_appts else 0

    series["dates"].append(d.isoformat())
    series["avg_wait_minutes"].append(round(day_avg_wait, 2))
    series["no_show_rate"].append(round(day_no_show_rate, 4))
    series["cancellations"].append(canc)
    series["visits"].append(visits)

    visits_total += visits
    no_shows += nos
    cancels += canc
    fcr_yes += fcr_y
    fcr_total += fcr_t

summary = {
    "avg_wait_minutes": round((sum_wait / n_wait), 2) if n_wait else 0,
    "no_show_rate": round((no_shows / (visits_total + no_shows + cancels)), 4)
                     if (visits_total + no_shows + cancels) else 0,
    "cancellation_rate": round((cancels / (visits_total + no_shows + cancels)), 4)
                         if (visits_total + no_shows + cancels) else 0,
    "first_contact_resolution": round((fcr_yes / fcr_total), 4) if fcr_total else 0
}

out_obj = {
    "generated_at": dt.datetime.utcnow().isoformat() + "Z",
    "summary": summary,
    "timeseries": series
}

with open(out, "w") as f:
    json.dump(out_obj, f, indent=2)

print(f"Wrote {out}")
