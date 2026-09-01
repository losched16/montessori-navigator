# Build a polished rollout PDF + a CSV of schools & codes from schools.json.
import json, csv, os
from reportlab.lib.pagesizes import letter, landscape
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, Table,
                                TableStyle, ListFlowable, ListItem)

SRC = r"C:\Users\thelo\AppData\Local\Temp\claude\C--mn-montessori-navigator-v7-montessori-navigator\7c4fd995-c685-485e-87a9-79f51c9e978f\scratchpad\schools.json"
PDF = r"C:\Users\thelo\Downloads\MFA 26_27 School Memberships - Rollout.pdf"
CSV = r"C:\Users\thelo\Downloads\MFA 26_27 School Codes.csv"

rows = json.load(open(SRC, encoding="utf-8"))
total_users = sum((r.get("users") or 0) for r in rows)
total_seats = sum((r.get("seats") or 0) for r in rows)

# ---------- CSV ----------
with open(CSV, "w", newline="", encoding="utf-8-sig") as f:
    w = csv.writer(f)
    w.writerow(["School Name", "Contact", "Email", "Paid Users", "Seats (incl. +20 staff)", "Unique Code"])
    for r in rows:
        w.writerow([r["school"], r.get("contact", ""), r.get("email", ""),
                    r.get("users", ""), r.get("seats", ""), r["code"]])
print("Wrote CSV:", CSV)

# ---------- PDF ----------
PLUM = colors.HexColor("#2d1b4e")
TERRA = colors.HexColor("#b4661f")
INK = colors.HexColor("#211636")
SOFT = colors.HexColor("#5f5470")
ZEBRA = colors.HexColor("#f6f2fb")
LINE = colors.HexColor("#e0d8ec")

def esc(s):
    return str(s or "").replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

styles = getSampleStyleSheet()
title = ParagraphStyle("t", parent=styles["Title"], textColor=PLUM, fontSize=22, leading=25, spaceAfter=2, alignment=0)
kicker = ParagraphStyle("k", fontName="Helvetica-Bold", fontSize=8, textColor=TERRA, spaceAfter=3, leading=10)
lede = ParagraphStyle("l", fontSize=10.5, textColor=SOFT, leading=15, spaceAfter=10)
h2 = ParagraphStyle("h2", fontName="Helvetica-Bold", fontSize=13, textColor=PLUM, spaceBefore=12, spaceAfter=6, leading=15)
body = ParagraphStyle("b", fontSize=9.5, textColor=INK, leading=14, spaceAfter=3)
cell = ParagraphStyle("c", fontSize=7.6, textColor=INK, leading=9.5)
cellb = ParagraphStyle("cb", fontSize=7.6, textColor=INK, leading=9.5, fontName="Helvetica-Bold")
cellsoft = ParagraphStyle("cs", fontSize=7.3, textColor=SOFT, leading=9)
code_st = ParagraphStyle("code", fontName="Courier-Bold", fontSize=7.6, textColor=colors.HexColor("#3a2568"), leading=9.5)
hdr = ParagraphStyle("hdr", fontName="Helvetica-Bold", fontSize=8, textColor=colors.white, leading=10)

doc = SimpleDocTemplate(PDF, pagesize=landscape(letter),
                        leftMargin=0.5*inch, rightMargin=0.5*inch,
                        topMargin=0.5*inch, bottomMargin=0.5*inch,
                        title="MFA 26/27 School Memberships - Rollout")
story = []
story.append(Paragraph("IMPLEMENTATION &middot; THE MONTESSORI FOUNDATION", kicker))
story.append(Paragraph("MFA 26/27 School Memberships &mdash; Codes &amp; Rollout", title))
story.append(Spacer(1, 6))
story.append(Paragraph(
    "Each partner school below has a <b>unique, single-use code</b> for <b>free access</b> to Montessori "
    "Family Alliance for 26/27 &mdash; <b>no credit card required</b>. This document is the source of truth for the rollout.",
    lede))
story.append(Paragraph(
    f"<b>{len(rows)}</b> partner schools&nbsp;&nbsp;&bull;&nbsp;&nbsp;<b>{total_users:,}</b> paid family users"
    f"&nbsp;&nbsp;&bull;&nbsp;&nbsp;<b>{total_seats:,}</b> total seats (incl. +20 staff each)"
    f"&nbsp;&nbsp;&bull;&nbsp;&nbsp;<b>100% off</b>, no card", body))

story.append(Paragraph("How each school redeems", h2))
steps = [
    "Go to <b>familyalliance.montessori.org/for-schools/pricing</b>",
    "Enter the school&rsquo;s <b>number of family users</b> (the &ldquo;Paid Users&rdquo; value)",
    "Click <b>Add promotion code</b> and enter the school&rsquo;s <b>Unique Code</b>",
    "Total drops to <b>$0</b> &mdash; <b>no credit card is requested</b>",
    "The admin account is created &mdash; they can invite up to <b>Seats</b> (users + 20 staff)",
]
story.append(ListFlowable([ListItem(Paragraph(s, body), leftIndent=6) for s in steps],
                          bulletType="1", start="1", leftIndent=14))

story.append(Paragraph("Notes for the team", h2))
notes = [
    "<b>Single-use:</b> each code works exactly once &mdash; it can&rsquo;t be shared or reused.",
    "<b>Free, no card, no auto-charge:</b> 100% off ongoing, so nobody is auto-billed. The subscription stays free until you convert it &mdash; <b>27/28 renewals are handled manually</b> by your team.",
    "<b>+20 staff buffer is automatic:</b> &ldquo;Seats&rdquo; already includes 20 staff on top of paid users; the school only enters its paid-user count.",
    "<b>Check flagged emails</b> (shown in red below, e.g. a <i>.coma</i> typo) before sending.",
    "<b>Tracking:</b> Stripe &rarr; Products &rarr; Coupons &rarr; &ldquo;MFA 26/27 School Membership Free&rdquo; &rarr; Promotion codes.",
]
story.append(ListFlowable([ListItem(Paragraph(n, body), leftIndent=6, value="disc") for n in notes],
                          bulletType="bullet", leftIndent=14))

story.append(Paragraph("Schools &amp; codes", h2))

# table
data = [[Paragraph("#", hdr), Paragraph("School", hdr), Paragraph("Contact", hdr),
         Paragraph("Email", hdr), Paragraph("Paid Users", hdr), Paragraph("Seats", hdr),
         Paragraph("Unique Code", hdr)]]
flagged = []
for i, r in enumerate(rows, 1):
    bad = (".coma" in (r.get("email") or "")) or ("@" not in (r.get("email") or ""))
    if bad: flagged.append(i)
    email_style = ParagraphStyle("bad", parent=cellsoft, textColor=colors.HexColor("#b4541f")) if bad else cellsoft
    data.append([
        Paragraph(str(i), cellsoft),
        Paragraph(esc(r["school"]), cellb),
        Paragraph(esc(r.get("contact", "")), cell),
        Paragraph(esc(r.get("email", "")), email_style),
        Paragraph(str(r.get("users", "")), cell),
        Paragraph(str(r.get("seats", "")), cellb),
        Paragraph(esc(r["code"]), code_st),
    ])

col_w = [0.3*inch, 2.2*inch, 1.5*inch, 2.5*inch, 0.7*inch, 0.55*inch, 2.25*inch]
t = Table(data, colWidths=col_w, repeatRows=1)
ts = [
    ("BACKGROUND", (0, 0), (-1, 0), PLUM),
    ("TOPPADDING", (0, 0), (-1, -1), 4),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ("LEFTPADDING", (0, 0), (-1, -1), 5),
    ("RIGHTPADDING", (0, 0), (-1, -1), 5),
    ("LINEBELOW", (0, 0), (-1, -1), 0.4, LINE),
    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ("ALIGN", (4, 0), (5, -1), "RIGHT"),
]
for ri in range(1, len(data)):
    if ri % 2 == 0:
        ts.append(("BACKGROUND", (0, ri), (-1, ri), ZEBRA))
t.setStyle(TableStyle(ts))
story.append(t)
story.append(Spacer(1, 8))
story.append(Paragraph(
    "Codes are live in Stripe. Seats = paid users + 20 staff buffer. Generated from the MFA 26/27 School Memberships sheet.",
    ParagraphStyle("f", fontSize=7.5, textColor=SOFT, leading=10)))

doc.build(story)
print("Wrote PDF:", PDF)
print("Schools:", len(rows), "| flagged emails at rows:", flagged)
