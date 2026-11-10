# HAKIKI v1

**Scan. Scratch. Hakiki.**

> HAKIKI does not authenticate QR codes. HAKIKI authenticates individual physical products.

The QR is only a way to *find* the product record. SMS is only another channel. The unique,
hidden, centrally controlled unit identity is the actual product.

---

## The three identities on every unit

| Element | Visible? | Purpose |
| --- | --- | --- |
| Serial `HK-7K9M-2PXQ` | Yes | Human-readable identity for support calls |
| QR public token | Yes | Opens that unit's HAKIKI page — proves nothing |
| Scratch code | **Hidden** | The only thing that actually proves authenticity |

Scanning the QR never says "genuine". It says *"I claim to be product HK-7K9M-2PXQ."*
Only the scratch code says *"I hold the credential issued for it."*

---

## Surfaces

| URL | Who | What |
| --- | --- | --- |
| `/verify` | Customer | Enter a code (and optionally a phone number) |
| `/verify/<token>` | Customer | QR landing — names the product, then asks for the code |
| `/verify-admin` | Operator | Console login |
| `/verify-admin/dashboard` | Operator | Live activity, 30-day trend, open alerts |
| `/verify-admin/batches` | Operator | Generate → print → reconcile → activate |
| `/verify-admin/alerts` | Operator | Fraud investigation queue |

The console is mobile-first: sidebar on desktop, bottom tab bar on phones, because it
gets used walking a production line, not at a desk.

---

## Running a production batch

1. **Create the product** — `/verify-admin/products`.
2. **Create the batch** — quantity, dates, and the scratch-code length (see below).
3. **Generate codes** — runs in chunks with a live progress bar. 50,000 units takes
   about 20 chunked calls.
4. **Download the print file** — CSV of serial, QR URL and scratch code, for the
   security printer's variable-data press. ADMIN role only, hashed and audited.
5. **Apply the labels.** Nothing verifies as genuine yet.
   Order 200 labels more than the production quantity (5,000 bottles → 5,200
   labels). Bottles and cans get damaged on the line, and the packed ones are
   the ones paid for, so the spare labels are the room for error.
6. **Reconcile and activate** — 50,000 printed, maybe 49,873 actually reached a
   bottle. Activate by count or by pasting scanned serials. Then **void the remainder**.

Step 6 is the one that matters. Codes that were printed but never confirmed onto a
product stay inert, so a stolen label roll authenticates nothing.

**Activate before the product reaches a shelf, not after.** The gate that stops a
stolen label roll is the same gate that stops a genuine bottle: a unit that is not
`ACTIVE` answers `NOT_ACTIVATED` — "haijaidhinishwa kwa mauzo rasmi" — and raises a
HIGH fraud alert. Ship 20,000 bottles before activating their batch and every honest
customer is told their product was never approved for sale, while the console fills
with 20,000 alerts. This is the single most expensive mistake available in the
workflow, and nothing in the system can distinguish it from the theft it is designed
to catch.

### Printing a run

A 20,000 unit batch is 40 PDFs and 840 A4 pages. Two failures showed up doing
this for real, and both are now guarded in `hakiki-print-sheet.mjs`:

- **Chrome writes short PDFs without saying so.** Twice it returned a
  perfectly valid document for a 21 page layout that contained 14, or 17,
  pages — labels quietly absent from a file whose name promised a range of
  500, with the CSV still listing every one of them. The page count is now
  read back out of the finished file and a shortfall is retried like any
  other error. Never trust the count the generator *meant* to write.
- **A long run gets interrupted.** `--resume` keeps files already on disk,
  but only after checking their page count — "the file exists" is worthless
  as a test when the failure mode is a valid file with pages missing.

Verify a run before it goes anywhere:

1. Distinct serials, tokens and code hashes all equal the unit count.
2. `hakiki-verify-printfile.mjs` — every CSV row's code hashes to the
   `secret_code_hmac` stored for that serial, and its QR carries that unit's
   token. All rows, not a sample.
3. Page counts per file, and that every label index is covered exactly once
   across the whole folder — no gaps, no overlaps.
4. One real label end to end against production, then reset that unit
   (`verification_count = 0`, delete its events) so the label is not burned.

Each split file is self-contained, so its last page is short — 500 labels is
20 full pages of 24 plus a 21st carrying 20. That is why 20,000 units come out
as 840 pages rather than 834. Tell the printer, or they will read it as a fault.

### Label artwork

`scripts/hakiki-print-sheet.mjs` lays labels out 45 x 40 mm, **4 across by 6 down,
24 to an A4 page**, and renders the PDF with headless Chrome.

Three things on that artwork are load-bearing and must not be "tidied up":

- **The scratch instruction sits above the panel, never inside it.** The dashed box is
  the silver ink footprint. Anything printed inside it disappears under the coating,
  including the words telling the customer to scratch.
- **The QR is a 20 mm box: 33 data modules plus a two module quiet zone, 0.54 mm per
  module.** Below roughly 0.5 mm a module stops surviving ink spread on coated stock
  and the code goes from "scans every time" to "scans on the third try".
- **The QR is 100% K, not the brand near-black.** #1B1A17 separates into a four colour
  build; a tenth of a millimetre of registration drift fattens every module with
  coloured fringes and the symbol stops decoding.

---

## Scratch-code length — answering "is 6 digits enough?"

No. Not for this design, and the console shows why while you choose.

A counterfeiter does not break any cryptography. They print invented digits and let
customers discover that some of them come back "genuine". The only defence is a
keyspace far larger than the issued set.

At **50,000 units**:

| Digits | An invented code verifies as real | Verdict |
| ---: | --- | --- |
| 6 | **1 in 18** — about 5.6% of guesses work | Defeats the system |
| 8 | 1 in 1,800 | Still far too loose |
| **10** | **1 in 180,000** | **Default. Safe, and only 10 keypresses** |
| 12 | 1 in 18,000,000 | Safest, more to type |

Codes are numeric (a feature-phone keypad in Kigoma, not a QWERTY keyboard), grouped
in fours on screen, and never start with 0 — people drop leading zeros when retyping,
and a code that fails for that reason teaches customers to distrust the system.

Length is stored per batch, so you can raise it later without touching what is already
in the market.

---

## The fraud engine

Deterministic rules, no model. Every alert can be read back and defended.

| Signal | Result |
| --- | --- |
| First ever verification | Genuine |
| Same person re-submits within 10 seconds | The first answer, replayed — nothing counted |
| 2nd+ verification of one code, however few people | Code already used → warning, with the support number |
| 4th+ verification, or 3+ *different* people | Alert raised for the company |
| 3+ *different* people verify one code | Suspicious → alert |
| 5+ verifications / 5+ people | HIGH |
| 10+ | CRITICAL |
| 3 wrong codes against one QR | Brute-force alert |
| Verified before the batch was activated | HIGH — stolen label stock |
| Revoked or recalled credential | Blocked + alert |

Two separate shapes of counterfeiting, so two separate rules. **Distinct verifiers**
catches a code copied across a region — one credential surfacing in many different
hands. **Raw count** catches the same code copied across a single carton and sold from
one stall, where every check comes from the same phone or the same shop wifi and the
distinct-verifier rule never fires.

A scratch code is a **one-time credential**. It sits under foil, so the person who
reveals and submits it is the buyer; anyone checking it afterwards is holding either
that same bottle or a copy of it. So the second check and every one after it returns
`CHECKED_MANY_TIMES`: the credential is real and we still say so, but the customer is
shown the count, told the product may not be genuine, and given the number to call.

What the customer is told and what the company is alerted about are deliberately two
different thresholds. A buyer who scans their own bottle twice is warned, because they
cannot know whether the earlier check was theirs — but that is not evidence of
anything, so no alert is raised until the old bar is crossed: 4+ checks, or 3+
different people.

An accidental double tap, or a retry after a request that looked like it failed,
would otherwise turn a genuine first scan into a counterfeit warning, so a re-submit
by the same verifier identity within **10 seconds** replays the previous answer and
counts nothing.

Ten seconds, not sixty. That window covers one accident and nothing else. At sixty it
had quietly become a product rule: scanning a label and entering its code twice in a
row — what anyone does when testing, and what a suspicious customer does in a shop —
answered "HALISI, hii ni mara ya kwanza" both times, and hid genuine duplicate use for
a full minute. A real second check, however quickly it follows, is now counted and
warned about.

The whole decision runs as one Postgres transaction with a row lock on the unit
(`hakiki_verify`). That matters: a counterfeiter submitting one stolen code from 20
phones in parallel must still be counted as 20 distinct people. Doing the
read-decide-write in application code would let those requests interleave and each
read `verification_count = 0`.

A "verifier identity" is the phone number for SMS, otherwise the IP — both stored only
as HMACs, under a different pepper from the code hashes so the two spaces cannot be
correlated.

---

## Security

- Scratch codes are **never** stored in plain text. Postgres holds an HMAC (peppered
  with a server secret) for lookups, plus an AES-256-GCM ciphertext so labels can be
  legitimately reprinted. Both keys live in the environment, so a database dump alone
  does not let anyone mint working codes.
- Every table has **RLS enabled with no policies** for `anon`/`authenticated`, and the
  sensitive tables have their grants revoked outright. The browser cannot read
  `auth_units` at all. Everything goes through server routes holding the service key.
- Rate limited per phone (20/hour) and per IP (30/10 min), atomically in Postgres.
- `INVALID_CODE` never tells the customer "FAKE" — they may simply have mistyped, and
  accusing a genuine buyer of holding a counterfeit is its own harm.
- The console sets `robots: noindex`.

---

## SMS

Implemented against *MobiShastra API Integration v1.3*.

### Sending

`GET https://mshastra.com/sendurl.aspx` — the single-message PUSH API — with
`ShowError=C` so the gateway answers with numeric codes instead of prose.

**Success is confirmed positively, never inferred.** Several documented failures
contain no error-like word at all:

```
No More Credits        Submission Stops        Country not activated
Enter text message     Enter Mobile Number.
```

A keyword filter would score all of those as delivered. The parser in
`lib/hakiki/mobishastra-codes.ts` instead requires `000` / "Send Successful" and maps
every documented failure — 26 parser cases, all passing. Anything unrecognised counts
as a failure, because a message we cannot confirm was sent must not be logged as sent.

| Code | Meaning | | Code | Meaning |
| --- | --- | --- | --- | --- |
| 000 | Send Successful | | 008 | Empty receiver |
| 001 | Invalid receiver | | 009 | Profile blocked |
| 003 | Invalid message | | 010 | Invalid profile ID |
| 005 | Authorization failed | | 011 | Profile ID expired |
| 006 | DND number | | 012 | Sender ID > 13 chars |
| 007 | Cannot extract country code | | 013 | Server error |

`MIKENOVA` is 8 characters, comfortably inside the 13-character sender limit. Numbers
are normalised to full international form (`255XXXXXXXXX`) and sent with
`CountryCode=ALL`; the doc's "must start with 5 / min 9 digits" note is UAE-specific.

### Credit balance

`GET /balance.aspx?user=…&pwd=…`, surfaced on the dashboard. **"No More Credits" is a
silent killer** — on-screen verification keeps succeeding while every SMS receipt
quietly fails. The console shows remaining credit, sent/failed counts, and whether the
relay is configured, so this is visible before a 50,000 unit batch ships.


**Mobishastra enforces an IP allowlist, and only `164.92.205.5` is on it.** Verified:

```
$ curl "https://mshastra.com/balance.aspx?user=DRIFTMARK&pwd=..."
IP address not allowed.
```

Vercel functions have no static egress IP, so **SMS will not work from Vercel until one
of these is done**:

1. **Run the relay** (recommended) — deploy `scripts/mobishastra-proxy.mjs` on
   `164.92.205.5`, put it behind HTTPS, then set `MOBISHASTRA_PROXY_URL` and
   `MOBISHASTRA_PROXY_SECRET`. The relay accepts only `{to, text}`, never a target URL,
   so it cannot be abused as an open proxy, and the gateway password never leaves that box.
2. Ask Mobishastra to disable the IP restriction on the DRIFTMARK account.

Until then everything else works — the result still displays on screen; only the SMS
receipt is skipped.

**Flow today** (web-initiated): the customer enters their number on `/verify`, and
HAKIKI texts them the verdict. This also gives the fraud engine a phone identity, which
is what makes duplicate detection work.

**Flow later** (true two-way): Mobishastra calls this the **PULL API**. It sends a
plain GET to a URL you host, with `shortcode`, `mobileno`, `keyword` and `message`:

```
https://www.mikenovagroup.co.tz/api/hakiki/sms/inbound/?key=<HAKIKI_WEBHOOK_SECRET>
```

**The trailing slash is required.** The site runs `trailingSlash: true`, so the
slash-less URL answers `308` and some gateways will not follow a redirect. Verified:

```
POST /api/hakiki/sms/inbound?key=…   -> 308 redirect
GET  /api/hakiki/sms/inbound/?key=…  -> 200 {"ok":true,"result":"GENUINE_FIRST"}
POST /api/hakiki/sms/inbound/?key=x  -> 401 {"error":"Unauthorised"}
```

With a keyword shortcode the gateway splits `HAKIKI 4827193652` into `keyword=HAKIKI`
and `message=4827193652`, so the route joins both fields before extracting digits —
the code is found whichever way it arrives. Other providers' field names
(`from`/`msisdn`/`text`/`body`) are accepted too.

**The PULL API sends no message id.** That removes the natural idempotency key, and a
retried callback would otherwise record a second verification — telling a customer who
texted once that they have checked the product twice, and corrupting the counts the
fraud engine reasons about. HAKIKI synthesises a deterministic key instead:

```
sha256(shortcode | phone | text | floor(now / 10 min))
```

A retry inside ten minutes collapses onto the original verification; a genuine
re-check later still counts. Verified: three identical inbound calls, two events
recorded, `verification_count` = 2.

SMS copy is deliberately plain ASCII — a single ✓ or ⚠ pushes the message out of GSM-7
into UCS-2, cutting the segment from 160 characters to 70 and doubling the cost.

---

## Scripts

```bash
# Apply a migration
node scripts/run-sql.mjs supabase/migrations/0007_purchase_place.sql

# Pre-print self check. Creates a throwaway batch, drives every path through
# the real HTTP API, asserts the answers, deletes everything it made. Run this
# against production before committing to any print run.
node --env-file=.env.local scripts/hakiki-selfcheck.mjs
node --env-file=.env.local scripts/hakiki-selfcheck.mjs --url=https://www.mikenovagroup.co.tz

# Every SMS a customer can receive, rendered by the real composer, with the
# GSM-7 segment count for each. --send=<number> actually texts them.
node --experimental-strip-types --env-file=.env.local scripts/hakiki-sms-preview.mjs

# Create a real production batch. Leaves it CODES_GENERATED, never activated.
node --env-file=.env.local scripts/hakiki-create-batch.mjs \
  --batch=Q4-2026-GG-OIL --product=GG-OIL --quantity=20000 \
  --notes="Q4 Batch 2026 Goddess Glow Body Oil"

# Add units to a batch that is not activated yet. Existing units are untouched.
node --env-file=.env.local scripts/hakiki-create-batch.mjs --batch=Q4-2026-MELOURA-300 --add=200
# then print with the --topup-since it reports, so the old PDFs stay identical
# and the new units come out as the last file(s)

# Label sheets: 45 x 40 mm, 4 across x 6 down, 24 to an A4 page, PDF included.
node scripts/hakiki-print-sheet.mjs --specimen              # printer trial, nothing registered
node --env-file=.env.local scripts/hakiki-print-sheet.mjs --test        # 24 LIVE labels, one page
node --env-file=.env.local scripts/hakiki-print-sheet.mjs --batch=Q4-2026-GG-OIL --pages=1   # proof one page
node --env-file=.env.local scripts/hakiki-print-sheet.mjs --batch=Q4-2026-GG-OIL \
  --split=500 --resume --out="print/final print/goddess-glow-body-oil/pdf"

# Does the file the press merges from actually match the database?
node --env-file=.env.local scripts/hakiki-verify-printfile.mjs \
  --batch=Q4-2026-GG-OIL --csv="print/final print/goddess-glow-body-oil/Q4-2026-GG-OIL.csv"

# The old nine-up pilot sheet, superseded by hakiki-print-sheet.mjs above.
node --env-file=.env.local scripts/hakiki-pilot-labels.mjs --live

# Create the company, first ADMIN and product catalogue
node --env-file=.env.local scripts/hakiki-seed.mjs <email> [password]

# The 100-label proof of concept, end to end over HTTP
node --env-file=.env.local scripts/hakiki-pilot-test.mjs

# Remove the pilot test data
node --env-file=.env.local scripts/hakiki-reset-pilot.mjs
```

---

## Deliberately not in v1

Multi-company signup, billing, distributors, retailer accounts, USSD, WhatsApp,
loyalty, AI fraud scoring, NFC, factory APIs, customs integration — and **no
blockchain**. Postgres proves whether a credential exists and records its history
perfectly well.

`company_id` is on every business record from day one, so multi-tenancy later is a
policy change rather than a migration.

---

## Proving it works

`scripts/hakiki-pilot-test.mjs` runs the spec's 100-label test against the live system
over real HTTP: 70 genuine units, 10 codes copied across many people, 10 mismatched
QR/code pairs, 5 invented codes, 5 units from an unactivated batch. It asserts the
engine separates genuine / suspicious / invalid / not-activated correctly, that fraud
alerts are raised, and that the anon key cannot read `auth_units`.

Before a real production run: print 100 labels, mix them exactly this way, hand them to
the team without saying which is which, and test by both QR and SMS. Then 1,000. Then
10,000. Then 50,000.
