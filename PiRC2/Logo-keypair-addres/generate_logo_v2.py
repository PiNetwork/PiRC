"""
Logo generator v2 — Public/Private Key Demo
Refined for museum-quality craftsmanship.
"""

import math
import random
from PIL import Image, ImageDraw, ImageFont, ImageFilter

random.seed(42)

FONT_DIR = "/mnt/skills/examples/canvas-design/canvas-fonts"

W, H = 1200, 630

# ── Palette ──────────────────────────────────────────────────────────────────
BG       = (7, 8, 13)
GOLD     = (210, 172, 70)
GOLD_MID = (130, 100, 38)
GOLD_DIM = (55, 42, 14)
TEAL     = (32, 168, 124)
TEAL_MID = (18, 96, 70)
TEAL_DIM = (10, 42, 30)
WHITE    = (230, 234, 244)
MUTED    = (80, 90, 112)
DIM      = (28, 32, 48)
LINE     = (36, 42, 62)

img  = Image.new("RGB", (W, H), BG)
draw = ImageDraw.Draw(img)

def font(name, size):
    try:
        return ImageFont.truetype(f"{FONT_DIR}/{name}", size)
    except:
        return ImageFont.load_default()

f_jet_sm  = font("JetBrainsMono-Regular.ttf", 12)
f_jet_md  = font("JetBrainsMono-Regular.ttf", 15)
f_jet_b   = font("JetBrainsMono-Bold.ttf", 22)
f_jura    = font("Jura-Light.ttf", 13)
f_jura_m  = font("Jura-Medium.ttf", 15)
f_outfit  = font("Outfit-Bold.ttf", 44)
f_out_sm  = font("Outfit-Regular.ttf", 17)
f_work_b  = font("WorkSans-Bold.ttf", 11)

# ── Dot grid ─────────────────────────────────────────────────────────────────
for gx in range(0, W + 28, 28):
    for gy in range(0, H + 28, 28):
        col = (14, 16, 24)
        draw.ellipse([gx-1, gy-1, gx+1, gy+1], fill=col)

# ── Scanlines ─────────────────────────────────────────────────────────────────
for y in range(0, H, 3):
    draw.line([(0, y), (W, y)], fill=(10, 11, 18), width=1)

# ── Diagonal accent lines (atmosphere) ───────────────────────────────────────
for i in range(10):
    x1 = random.randint(0, W)
    draw.line([(x1, 0), (x1 + 60, H)], fill=(16, 18, 28), width=1)

# ─────────────────────────────────────────────────────────────────────────────
# HELPER: draw a refined lock icon
# ─────────────────────────────────────────────────────────────────────────────
def draw_lock_closed(cx, cy, color, col_dim, size=1.0):
    s = size
    # shackle
    draw.arc([int(cx-26*s), int(cy-46*s), int(cx+26*s), int(cy+8*s)],
             195, 345, fill=color, width=3)
    # body outer
    draw.rounded_rectangle([int(cx-32*s), int(cy-6*s), int(cx+32*s), int(cy+38*s)],
                            radius=4, fill=(12, 10, 6), outline=color, width=2)
    # inner body panel
    draw.rounded_rectangle([int(cx-26*s), int(cy), int(cx+26*s), int(cy+32*s)],
                            radius=2, fill=(18, 14, 6), outline=col_dim, width=1)
    # keyhole oval
    draw.ellipse([int(cx-8*s), int(cy+6*s), int(cx+8*s), int(cy+20*s)],
                 fill=BG, outline=color, width=2)
    # keyhole slot
    draw.rectangle([int(cx-4*s), int(cy+16*s), int(cx+4*s), int(cy+30*s)], fill=BG)

def draw_lock_open(cx, cy, color, col_dim, size=1.0):
    s = size
    # shackle open (lifted left side)
    draw.arc([int(cx-26*s), int(cy-48*s), int(cx+26*s), int(cy+6*s)],
             200, 360, fill=color, width=3)
    # lifted right tip
    draw.line([int(cx+26*s), int(cy-21*s), int(cx+26*s), int(cy-52*s)], fill=color, width=3)
    draw.ellipse([int(cx+22*s), int(cy-56*s), int(cx+30*s), int(cy-48*s)],
                 fill=color)
    # body
    draw.rounded_rectangle([int(cx-32*s), int(cy-6*s), int(cx+32*s), int(cy+38*s)],
                            radius=4, fill=(6, 14, 10), outline=color, width=2)
    draw.rounded_rectangle([int(cx-26*s), int(cy), int(cx+26*s), int(cy+32*s)],
                            radius=2, fill=(8, 18, 13), outline=col_dim, width=1)
    # keyhole
    draw.ellipse([int(cx-8*s), int(cy+6*s), int(cx+8*s), int(cy+20*s)],
                 fill=BG, outline=color, width=2)
    draw.rectangle([int(cx-4*s), int(cy+16*s), int(cx+4*s), int(cy+30*s)], fill=BG)

# ─────────────────────────────────────────────────────────────────────────────
# LEFT PANEL — PRIVATE KEY
# ─────────────────────────────────────────────────────────────────────────────
PX, PY, PW, PH = 52, 88, 348, 450

# Outer glow layers
for i in range(20, 0, -1):
    intensity = i / 20
    r = int(GOLD[0] * intensity * 0.22)
    g = int(GOLD[1] * intensity * 0.10)
    draw.rectangle([PX-i, PY-i, PX+PW+i, PY+PH+i],
                   outline=(max(r,0), max(g,0), 0))

# Panel
draw.rectangle([PX, PY, PX+PW, PY+PH], fill=(10, 9, 5), outline=GOLD_DIM, width=1)
# Top bar
draw.rectangle([PX, PY, PX+PW, PY+4], fill=GOLD)
# Inner inset line
draw.rectangle([PX+8, PY+12, PX+PW-8, PY+12], fill=GOLD_DIM)

# Label row
draw.text((PX+20, PY+18), "PRIVATE KEY", font=f_work_b, fill=GOLD)
# 3 dots (terminal indicator)
for d in range(3):
    draw.ellipse([PX+PW-30+d*10, PY+22, PX+PW-24+d*10, PY+28], fill=GOLD_DIM)

draw.line([(PX+20, PY+38), (PX+PW-20, PY+38)], fill=GOLD_DIM, width=1)

# Hex key bytes — staggered brightness
rows = [
    "18 e1 4a 7b 6a 30 7f 42",
    "6a 94 f8 11 47 01 e7 c8",
    "e7 74 e7 f9 a4 7e 2c 20",
    "35 db 29 a2 06 32 17 25",
]
y_hex = PY + 52
for row in rows:
    x_hex = PX + 20
    for ch in row:
        if ch == ' ':
            x_hex += 8
            continue
        bright = random.uniform(0.45, 1.0)
        col = tuple(int(c * bright) for c in GOLD)
        draw.text((x_hex, y_hex), ch, font=f_jet_md, fill=col)
        x_hex += 13
    y_hex += 24

draw.line([(PX+20, y_hex+4), (PX+PW-20, y_hex+4)], fill=GOLD_DIM, width=1)

# Lock icon centered
LOCK_CX = PX + PW//2
LOCK_CY = y_hex + 100
draw_lock_closed(LOCK_CX, LOCK_CY, GOLD, GOLD_DIM)

# Technical annotations
y_ann = LOCK_CY + 68
draw.line([(PX+20, y_ann), (PX+PW-20, y_ann)], fill=GOLD_DIM, width=1)
y_ann += 12
draw.text((PX+20, y_ann), "curve    secp256k1", font=f_jura, fill=GOLD_MID)
y_ann += 20
draw.text((PX+20, y_ann), "entropy  256 bit", font=f_jura, fill=GOLD_MID)
y_ann += 20
draw.text((PX+20, y_ann), "op       SIGN(msg, k) → σ", font=f_jet_sm, fill=GOLD_DIM)

# ─────────────────────────────────────────────────────────────────────────────
# RIGHT PANEL — PUBLIC KEY
# ─────────────────────────────────────────────────────────────────────────────
RX = W - 52 - PW
RY, RW, RH = PY, PW, PH

for i in range(20, 0, -1):
    intensity = i / 20
    g2 = int(TEAL[1] * intensity * 0.22)
    b2 = int(TEAL[2] * intensity * 0.12)
    draw.rectangle([RX-i, RY-i, RX+RW+i, RY+RH+i],
                   outline=(0, max(g2,0), max(b2,0)))

draw.rectangle([RX, RY, RX+RW, RY+RH], fill=(5, 10, 8), outline=TEAL_DIM, width=1)
draw.rectangle([RX, RY, RX+RW, RY+4], fill=TEAL)
draw.rectangle([RX+8, RY+12, RX+RW-8, RY+12], fill=TEAL_DIM)

draw.text((RX+20, RY+18), "PUBLIC KEY", font=f_work_b, fill=TEAL)
for d in range(3):
    draw.ellipse([RX+RW-30+d*10, RY+22, RX+RW-24+d*10, RY+28], fill=TEAL_DIM)

draw.line([(RX+20, RY+38), (RX+RW-20, RY+38)], fill=TEAL_DIM, width=1)

pub_rows = [
    "04 50 86 3a d6 4a 87 ae",
    "8a 2f e8 3c 1a f1 a8 40",
    "3c b5 3f 53 e4 86 d8 51",
    "1d ad 8a 04 88 7e 5b 23",
    "52 2c d4 70 24 34 53 a2",
    "99 fa 9e 77 23 77 16 10",
]
y_hex2 = RY + 52
for row in pub_rows:
    x_hex = RX + 20
    for ch in row:
        if ch == ' ':
            x_hex += 8
            continue
        bright = random.uniform(0.45, 1.0)
        col = tuple(int(c * bright) for c in TEAL)
        draw.text((x_hex, y_hex2), ch, font=f_jet_md, fill=col)
        x_hex += 13
    y_hex2 += 22

draw.line([(RX+20, y_hex2+4), (RX+RW-20, y_hex2+4)], fill=TEAL_DIM, width=1)

RLOCK_CX = RX + RW//2
RLOCK_CY = y_hex2 + 80
draw_lock_open(RLOCK_CX, RLOCK_CY, TEAL, TEAL_DIM)

y_ann2 = RLOCK_CY + 68
draw.line([(RX+20, y_ann2), (RX+RW-20, y_ann2)], fill=TEAL_DIM, width=1)
y_ann2 += 12
draw.text((RX+20, y_ann2), "format   04 + x + y (65 B)", font=f_jura, fill=TEAL_MID)
y_ann2 += 20
draw.text((RX+20, y_ann2), "usage    shareable address", font=f_jura, fill=TEAL_MID)
y_ann2 += 20
draw.text((RX+20, y_ann2), "op       VERIFY(msg, σ, Q)", font=f_jet_sm, fill=TEAL_DIM)

# ─────────────────────────────────────────────────────────────────────────────
# CENTER — Transform zone
# ─────────────────────────────────────────────────────────────────────────────
CX = W // 2
CY = H // 2

# Background center glow (very subtle)
for r in range(90, 0, -5):
    alpha = int(3 * (1 - r/90))
    draw.ellipse([CX-r, CY-r, CX+r, CY+r], fill=(10+alpha, 12+alpha, 20+alpha))

# Horizontal arrow
AY = CY - 10
arrow_x1 = PX + PW + 22
arrow_x2 = RX - 22

# Arrow line with gradient effect — draw segments
segs = 30
for i in range(segs):
    t = i / segs
    x_a = int(arrow_x1 + (arrow_x2 - arrow_x1) * t)
    x_b = int(arrow_x1 + (arrow_x2 - arrow_x1) * (i+1)/segs)
    if t < 0.5:
        s = t * 2
        col = tuple(int(GOLD[j]*(1-s) + WHITE[j]*s) for j in range(3))
    else:
        s = (t - 0.5) * 2
        col = tuple(int(WHITE[j]*(1-s) + TEAL[j]*s) for j in range(3))
    draw.line([(x_a, AY), (x_b, AY)], fill=col, width=2)

# Arrowhead (teal)
draw.polygon([(arrow_x2, AY-8), (arrow_x2, AY+8), (arrow_x2+14, AY)], fill=TEAL)

# ×G multiplication symbol
draw.text((CX, AY - 24), "× G", font=f_jet_b, fill=WHITE, anchor="mm")

# Dotted vertical dividers on arrow
for xd in [CX - 60, CX + 60]:
    for yd in range(AY - 18, AY + 20, 5):
        draw.ellipse([xd, yd, xd+2, yd+2], fill=LINE)

# SHA-256 + ECDSA stacked
y_mid = AY + 30
draw.text((CX, y_mid), "SHA-256", font=f_jura_m, fill=MUTED, anchor="mm")
y_mid += 18
draw.line([(CX-22, y_mid), (CX+22, y_mid)], fill=LINE, width=1)
y_mid += 12
draw.text((CX, y_mid), "ECDSA", font=f_jura_m, fill=MUTED, anchor="mm")
y_mid += 18
draw.line([(CX-22, y_mid), (CX+22, y_mid)], fill=LINE, width=1)

# Abstract elliptic curve arc
EY = y_mid + 30
# y² = x³ + 7  — sketch a couple arcs
draw.arc([CX-38, EY, CX+38, EY+50], 200, 340, fill=LINE, width=2)
draw.arc([CX-22, EY+8, CX+52, EY+42], 10, 170, fill=LINE, width=2)
# Point on curve
draw.ellipse([CX+24, EY+14, CX+32, EY+22], fill=MUTED)
# tangent line through point
draw.line([(CX+4, EY+30), (CX+48, EY+6)], fill=DIM, width=1)

# ─────────────────────────────────────────────────────────────────────────────
# HEADER
# ─────────────────────────────────────────────────────────────────────────────
draw.line([(52, 54), (W-52, 54)], fill=LINE, width=1)

# Corner brackets top
for cx2, dx in [(52, 1), (W-52, -1)]:
    draw.line([(cx2, 54), (cx2+dx*20, 54)], fill=MUTED, width=1)
    draw.line([(cx2, 54), (cx2, 54+12)], fill=MUTED, width=1)

title = "PUBLIC / PRIVATE KEY"
draw.text((CX, 30), title, font=f_out_sm, fill=MUTED, anchor="mm")

# ─────────────────────────────────────────────────────────────────────────────
# FOOTER
# ─────────────────────────────────────────────────────────────────────────────
FOOTER_Y = H - 54
draw.line([(52, FOOTER_Y), (W-52, FOOTER_Y)], fill=LINE, width=1)

# Corner brackets bottom
for cx2, dx in [(52, 1), (W-52, -1)]:
    draw.line([(cx2, FOOTER_Y), (cx2+dx*20, FOOTER_Y)], fill=MUTED, width=1)
    draw.line([(cx2, FOOTER_Y), (cx2, FOOTER_Y-12)], fill=MUTED, width=1)

draw.text((72, FOOTER_Y + 12), "Blockchain 101  ·  Key Pair Demo", font=f_jura, fill=MUTED)
draw.text((W-72, FOOTER_Y + 12), "secp256k1  ·  ECDSA  ·  SHA-256", font=f_jura, fill=MUTED, anchor="ra")

# Hash strip (gold→teal gradient)
HASH = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
x_h = 72
y_h = FOOTER_Y - 18
for i, ch in enumerate(HASH[:54]):
    frac = i / 54
    if frac < 0.45:
        t = frac / 0.45
        col = tuple(int(GOLD_MID[j]*(1-t) + MUTED[j]*t) for j in range(3))
    else:
        t = (frac - 0.45) / 0.55
        col = tuple(int(MUTED[j]*(1-t) + TEAL_MID[j]*t) for j in range(3))
    draw.text((x_h + i*19, y_h), ch, font=f_jet_sm, fill=col)

# ─────────────────────────────────────────────────────────────────────────────
# SAVE
# ─────────────────────────────────────────────────────────────────────────────
out = "/mnt/user-data/outputs/keypair_logo.png"
img.save(out, "PNG", dpi=(144, 144))
print(f"Saved: {out}  [{W}×{H}]")

# ─────────────────────────────────────────────────────────────────────────────
# SQUARE ICON VERSION (512×512)
# ─────────────────────────────────────────────────────────────────────────────
IS = 512
icon = Image.new("RGB", (IS, IS), BG)
id2  = ImageDraw.Draw(icon)

# dot grid
for gx in range(0, IS+24, 24):
    for gy in range(0, IS+24, 24):
        id2.ellipse([gx-1, gy-1, gx+1, gy+1], fill=(14,16,24))

# scanlines
for y in range(0, IS, 3):
    id2.line([(0,y),(IS,y)], fill=(10,11,18), width=1)

ICX = IS//2
ICY = IS//2

# left half — gold
LP = 28
id2.rectangle([LP, LP, ICX-12, IS-LP], fill=(10,9,5), outline=GOLD_DIM, width=1)
id2.rectangle([LP, LP, ICX-12, LP+3], fill=GOLD)

# right half — teal
id2.rectangle([ICX+12, LP, IS-LP, IS-LP], fill=(5,10,8), outline=TEAL_DIM, width=1)
id2.rectangle([ICX+12, LP, IS-LP, LP+3], fill=TEAL)

# left lock
f2_jura = font("Jura-Light.ttf", 11)
f2_work = font("WorkSans-Bold.ttf", 10)
f2_jet  = font("JetBrainsMono-Regular.ttf", 11)

id2.text((LP+14, LP+10), "PRIVATE", font=f2_work, fill=GOLD)

# hex rows left
hrows2 = ["18 e1 4a 7b", "6a 94 f8 11", "e7 74 e7 f9", "35 db 29 a2"]
yh2 = LP + 32
for row in hrows2:
    xh2 = LP + 14
    for ch in row:
        if ch == ' ':
            xh2 += 7; continue
        b = random.uniform(0.45, 1.0)
        id2.text((xh2, yh2), ch, font=f2_jet, fill=tuple(int(c*b) for c in GOLD))
        xh2 += 11
    yh2 += 18

# closed lock left
LCX2 = LP + (ICX-12-LP)//2
draw_lock_closed.__wrapped__ = False

# manual mini-lock for icon
def mini_lock_closed(d, cx, cy, color):
    d.arc([cx-20, cy-36, cx+20, cy+4], 198, 342, fill=color, width=2)
    d.rounded_rectangle([cx-24, cy-4, cx+24, cy+28], radius=3, fill=(12,10,6), outline=color, width=2)
    d.ellipse([cx-6, cy+4, cx+6, cy+16], fill=BG, outline=color, width=2)
    d.rectangle([cx-3, cy+13, cx+3, cy+25], fill=BG)

def mini_lock_open(d, cx, cy, color):
    d.arc([cx-20, cy-38, cx+20, cy+2], 200, 360, fill=color, width=2)
    d.line([cx+20, cy-18, cx+20, cy-44], fill=color, width=2)
    d.ellipse([cx+17, cy-48, cx+23, cy-40], fill=color)
    d.rounded_rectangle([cx-24, cy-4, cx+24, cy+28], radius=3, fill=(6,14,10), outline=color, width=2)
    d.ellipse([cx-6, cy+4, cx+6, cy+16], fill=BG, outline=color, width=2)
    d.rectangle([cx-3, cy+13, cx+3, cy+25], fill=BG)

mini_lock_closed(id2, LCX2, yh2+50, GOLD)

# right panel content
id2.text((ICX+26, LP+10), "PUBLIC", font=f2_work, fill=TEAL)

prows2 = ["04 50 86 3a", "8a 2f e8 3c", "3c b5 3f 53", "1d ad 8a 04", "52 2c d4 70", "99 fa 9e 77"]
yh3 = LP + 32
for row in prows2:
    xh3 = ICX + 26
    for ch in row:
        if ch == ' ': xh3 += 7; continue
        b = random.uniform(0.45, 1.0)
        id2.text((xh3, yh3), ch, font=f2_jet, fill=tuple(int(c*b) for c in TEAL))
        xh3 += 11
    yh3 += 17

RCX2 = ICX + 12 + (IS-LP - ICX-12)//2
mini_lock_open(id2, RCX2, yh3+44, TEAL)

# Center arrow
AY2 = IS//2 + 20
for i in range(20):
    t = i/20
    x_a = ICX - 10 + i*1
    col = tuple(int(GOLD[j]*(1-t)+TEAL[j]*t) for j in range(3))
    id2.ellipse([x_a, AY2, x_a+3, AY2+3], fill=col)

# ×G
f2_b = font("JetBrainsMono-Bold.ttf", 18)
id2.text((ICX, AY2-24), "×G", font=f2_b, fill=WHITE, anchor="mm")

# Dividing line
id2.line([(ICX, LP+6), (ICX, IS-LP-6)], fill=LINE, width=1)

# Bottom strip
id2.line([(LP, IS-LP-20), (IS-LP, IS-LP-20)], fill=LINE, width=1)
id2.text((ICX, IS-LP-10), "secp256k1", font=f2_jura, fill=MUTED, anchor="mm")

icon_out = "/mnt/user-data/outputs/keypair_icon.png"
icon.save(icon_out, "PNG", dpi=(144,144))
print(f"Icon saved: {icon_out}  [512×512]")
