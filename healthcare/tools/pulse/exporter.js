continue
by_day[d].append(r)


last_n = 30
days = sorted(by_day.keys())[-last_n:]
series = {"dates":[], "avg_wait_minutes":[], "no_show_rate":[], "cancellations":[], "visits":[]}


sum_wait = 0; n_wait = 0; no_shows=0; cancels=0; visits=0; fcr_yes=0; fcr_total=0


for d in days:
day_rows = by_day[d]
day_waits = []
day_visits = 0; day_nos = 0; day_canc = 0; day_fcr_yes=0; day_fcr_total=0
for r in day_rows:
status = (r.get('status') or '').strip().lower()
if status == 'completed':
day_visits += 1
arr = parse_t(r.get('arrival_time','') or '')
seen = parse_t(r.get('seen_time','') or '')
w = minutes_between(arr, seen)
if w is not None and w >= 0 and w < 8*60:
day_waits.append(w)
sum_wait += w; n_wait += 1
elif status == 'no_show':
day_nos += 1; no_shows += 1
elif status == 'cancelled':
day_canc += 1; cancels += 1
# FCR
cr = (r.get('contact_resolved') or '').strip().lower()
if cr in ('yes','no'):
day_fcr_total += 1
if cr == 'yes':
day_fcr_yes += 1
# finalize day
series["dates"].append(d.isoformat())
series["avg_wait_minutes"].append( sum(day_waits)/len(day_waits) if day_waits else 0 )
total_appts = day_visits + day_nos + day_canc
series["no_show_rate"].append( (day_nos/total_appts) if total_appts else 0 )
series["cancellations"].append(day_canc)
series["visits"].append(day_visits)
visits += day_visits
fcr_yes += day_fcr_yes; fcr_total += day_fcr_total


summary = {
"avg_wait_minutes": (sum_wait/n_wait) if n_wait else 0,
"no_show_rate": (no_shows/(visits+no_shows+cancels)) if (visits+no_shows+cancels) else 0,
"cancellation_rate": (cancels/(visits+no_shows+cancels)) if (visits+no_shows+cancels) else 0,
"first_contact_resolution": (fcr_yes/fcr_total) if fcr_total else 0
}


out_obj = {"generated_at": dt.datetime.utcnow().isoformat()+"Z", "summary": summary, "timeseries": series}


with open(out, 'w') as f:
json.dump(out_obj, f, indent=2)


print(f"Wrote {out}")
