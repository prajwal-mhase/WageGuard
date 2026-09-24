"""
WageGuard backend integration tests.
Run with: python run_tests.py
Requires the backend server to be running on localhost:8000.
"""
import json
import urllib.request
import urllib.error

BASE = "http://localhost:8000"


def req(method, path, body=None, token=None):
    data = json.dumps(body).encode() if body else None
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    r = urllib.request.Request(f"{BASE}{path}", data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(r) as resp:
            return resp.status, json.loads(resp.read())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read())


def test(name, condition, detail=""):
    status = "PASS" if condition else "FAIL"
    print(f"  [{status}] {name}" + (f" — {detail}" if detail else ""))
    return condition


passed = failed = 0

print("\n=== WageGuard Backend Tests ===\n")

# Health
print("Health check")
s, b = req("GET", "/health")
r = test("GET /health returns 200", s == 200)
r = test("health scope correct", "Maharashtra" in b.get("scope", ""))
passed += 2 if r else 0

# Rates (public)
print("\nReference rates")
s, b = req("GET", "/rates")
r = test("GET /rates returns 200", s == 200)
r = test("rates has 3 entries", len(b) == 3)
tiers = {row["skill_tier"] for row in b}
r = test("all skill tiers present", tiers == {"unskilled", "semi-skilled", "skilled"})
r = test("unskilled daily=850", any(row["skill_tier"] == "unskilled" and row["daily_equivalent"] == 850 for row in b))
r = test("semi-skilled daily=891", any(row["skill_tier"] == "semi-skilled" and row["daily_equivalent"] == 891 for row in b))
r = test("skilled daily=950", any(row["skill_tier"] == "skilled" and row["daily_equivalent"] == 950 for row in b))

# Guest session
print("\nGuest session")
s, b = req("GET", "/auth/guest")
r = test("GET /auth/guest returns 201", s == 201)
r = test("guest token present", "access_token" in b)
r = test("guest is_guest flag", b.get("user", {}).get("is_guest") is True)
guest_token = b.get("access_token", "")

# Auth: signup
print("\nAuthentication")
import time
email = f"test_{int(time.time())}@example.com"
s, b = req("POST", "/auth/signup", {"email": email, "password": "testpass123"})
r = test("POST /auth/signup returns 201", s == 201)
r = test("signup returns token", "access_token" in b)
user_token = b.get("access_token", "")
user_id = b.get("user", {}).get("id", "")

# Auth: login
s, b = req("POST", "/auth/login", {"email": email, "password": "testpass123"})
r = test("POST /auth/login returns 200", s == 200)
r = test("login returns token", "access_token" in b)

# Auth: duplicate signup
s, b = req("POST", "/auth/signup", {"email": email, "password": "testpass123"})
r = test("duplicate signup returns 409", s == 409)

# Auth: wrong password
s, b = req("POST", "/auth/login", {"email": email, "password": "wrongpassword"})
r = test("wrong password returns 401", s == 401)

# Auth: invalid email format
s, b = req("POST", "/auth/signup", {"email": "notanemail", "password": "testpass123"})
r = test("invalid email returns 422", s == 422)

# Auth: short password
s, b = req("POST", "/auth/signup", {"email": "valid@example.com", "password": "abc"})
r = test("short password returns 422", s == 422)

# Entries: no auth
print("\nAuthorization")
s, b = req("GET", "/entries")
r = test("GET /entries without token returns 401", s == 401)

s, b = req("POST", "/entries", {"job_date": "2026-03-15", "zone": "Zone I", "skill_tier": "semi-skilled", "amount_paid": 750})
r = test("POST /entries without token returns 401", s == 401)

# Entries: create (authenticated)
print("\nEntry creation")
s, b = req("POST", "/entries", {"job_date": "2026-03-15", "zone": "Zone I", "skill_tier": "semi-skilled", "amount_paid": 750}, user_token)
r = test("create entry returns 201", s == 201)
r = test("entry has correct gap (891-750=141)", b.get("potential_gap") == 141.0)
r = test("entry status is below_reference", b.get("status") == "below_reference")
r = test("entry has reference_rate", "reference_rate" in b)
entry_id = b.get("id")

# At/above reference
s, b = req("POST", "/entries", {"job_date": "2026-03-15", "zone": "Zone I", "skill_tier": "unskilled", "amount_paid": 900}, user_token)
r = test("at/above reference status correct", b.get("status") == "at_or_above_reference")
r = test("at/above gap is negative (850-900=-50)", b.get("potential_gap") == -50.0)

# Zero payment
s, b = req("POST", "/entries", {"job_date": "2026-03-15", "zone": "Zone I", "skill_tier": "unskilled", "amount_paid": 0}, user_token)
r = test("zero payment accepted", s == 201)
r = test("zero payment gap = daily_equivalent", b.get("potential_gap") == 850.0)

# Negative amount
s, b = req("POST", "/entries", {"job_date": "2026-03-15", "zone": "Zone I", "skill_tier": "unskilled", "amount_paid": -100}, user_token)
r = test("negative amount rejected (422)", s == 422)

# Future date
s, b = req("POST", "/entries", {"job_date": "2027-01-01", "zone": "Zone I", "skill_tier": "unskilled", "amount_paid": 500}, user_token)
r = test("future date rejected (422)", s == 422)

# Out-of-range date (no rate coverage)
s, b = req("POST", "/entries", {"job_date": "2025-06-01", "zone": "Zone I", "skill_tier": "unskilled", "amount_paid": 500}, user_token)
r = test("out-of-range date returns 422 (no rate)", s == 422)

# Invalid skill tier
s, b = req("POST", "/entries", {"job_date": "2026-03-15", "zone": "Zone I", "skill_tier": "expert", "amount_paid": 500}, user_token)
r = test("invalid skill tier rejected (422)", s == 422)

# Hours validation
s, b = req("POST", "/entries", {"job_date": "2026-03-15", "zone": "Zone I", "skill_tier": "unskilled", "amount_paid": 500, "hours_worked": 25}, user_token)
r = test("hours > 24 rejected (422)", s == 422)

s, b = req("POST", "/entries", {"job_date": "2026-03-15", "zone": "Zone I", "skill_tier": "unskilled", "amount_paid": 500, "hours_worked": -1}, user_token)
r = test("negative hours rejected (422)", s == 422)

# Boundary dates
s, b = req("POST", "/entries", {"job_date": "2026-01-01", "zone": "Zone I", "skill_tier": "unskilled", "amount_paid": 500}, user_token)
r = test("boundary date 2026-01-01 accepted", s == 201)

s, b = req("POST", "/entries", {"job_date": "2026-06-30", "zone": "Zone I", "skill_tier": "unskilled", "amount_paid": 500}, user_token)
r = test("boundary date 2026-06-30 accepted", s == 201)

# List entries
print("\nEntry listing & detail")
s, b = req("GET", "/entries", token=user_token)
r = test("GET /entries returns 200", s == 200)
r = test("entries list is non-empty", len(b) > 0)

# Get specific entry
s, b = req("GET", f"/entries/{entry_id}", token=user_token)
r = test(f"GET /entries/{entry_id} returns 200", s == 200)
r = test("entry detail has reference_rate", "reference_rate" in b)

# IDOR: user cannot access another user's entry
s2, b2 = req("GET", "/auth/guest")
other_token = b2.get("access_token", "")
s, b = req("GET", f"/entries/{entry_id}", token=other_token)
r = test("IDOR: other user cannot access entry (404)", s == 404)

# Summary
print("\nLedger summary")
s, b = req("GET", "/entries/summary", token=user_token)
r = test("GET /entries/summary returns 200", s == 200)
r = test("summary has total_jobs", "total_jobs" in b)
r = test("summary has potential_cumulative_gap", "potential_cumulative_gap" in b)
r = test("total_jobs > 0", b.get("total_jobs", 0) > 0)

# Report
print("\nReport export")
# Report returns HTML/PDF, not JSON — use raw urllib
import urllib.request, urllib.error
try:
    rr = urllib.request.Request(f"{BASE}/entries/{entry_id}/report", headers={"Authorization": f"Bearer {user_token}"})
    with urllib.request.urlopen(rr) as resp:
        report_status = resp.status
        ct = resp.headers.get("content-type", "")
        body_bytes = resp.read()
except urllib.error.HTTPError as e:
    report_status = e.code
    ct = ""
    body_bytes = b""
test("GET /entries/{id}/report returns 200", report_status == 200)
test("report content-type is html or pdf", "html" in ct or "pdf" in ct)
test("report body non-empty", len(body_bytes) > 100)
test("report contains WageGuard", b"WageGuard" in body_bytes)

# Report without auth
try:
    rr2 = urllib.request.Request(f"{BASE}/entries/{entry_id}/report")
    with urllib.request.urlopen(rr2) as resp:
        no_auth_status = resp.status
except urllib.error.HTTPError as e:
    no_auth_status = e.code
test("report without auth returns 401", no_auth_status == 401)

print("\n=== Tests complete ===\n")
