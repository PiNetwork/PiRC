"""
Logo generator for Public/Private Key Demo
Philosophy: "Cryptographic Duality" — the interplay of lock and openness,
mathematical purity expressed through geometric precision.
"""

import math
import random
from PIL import Image, ImageDraw, ImageFont

FONT_DIR = "/mnt/skills/examples/canvas-design/canvas-fonts"

W, H = 1200, 630  # OG image / banner ratio

# ── Palette ──────────────────────────────────────────────────────────────────
BG          = (8, 9, 14)          # near-black deep navy
GRID        = (18, 22, 36)        # subtle grid
GOLD        = (212, 175, 83)      # private key gold
GOLD_DIM    = (100, 82, 35)
TEAL        = (29, 158, 117)      # public key teal
TEAL_DIM    = (14, 76, 57)
WHITE       = (235, 238, 245)
MUTED       = (90, 98, 120)
ACCENT_LINE = (50, 58, 85)

# ── Canvas ───────────────────────────────────────────────────────────────────
img  = Image.new("RGB", (W, H), BG)
draw = ImageDraw.Draw(img)

# ── Fonts ─────────────────────────────────────────────────────────────────────
def font(name, size):
    try:
        return ImageFont.truetype(f"{FONT_DIR}/{name}", size)
    except:
        return ImageFont.load_default()

f_mono_sm  = font("JetBrainsMono-Regular.ttf", 11)
f_mono_md  = font("JetBrainsMono-Regular.ttf", 14)
f_mono_lg  = font("JetBrainsMono-Bold.ttf", 18)
f_main     = font("Outfit-Bold.ttf", 54)
f_sub      = font("Outfit-Regular.ttf", 20)
f_label    = font("Jura-Light.ttf", 13)
f_label_md = font("Jura-Medium.ttf", 15)

# ── 1. Dot grid background ────────────────────────────────────────────────────
STEP = 32
for gx in range(0, W + STEP, STEP):
    for gy in range(0, H + STEP, STEP):
        draw.ellipse([gx-1, gy-1, gx+1, gy+1], fill=GRID)

# ── 2. Subtle horizontal scan lines ───────────────────────────────────────────
for y in range(0, H, 4):
    draw.line([(0, y), (W, y)], fill=(15, 17, 26), width=1)

# ── 3. Left panel — PRIVATE KEY zone (gold) ───────────────────────────────────
PX = 80   # panel left edge
PY = 100
PW = 340
PH = 430

# Panel glow aura
for i in range(18, 0, -1):
    alpha_r = int(100 * (i / 18) * 0.18)
    aura_col = (GOLD[0], GOLD[1] // 3, 0, alpha_r)
    draw.rectangle([PX - i, PY - i, PX + PW + i, PY + PH + i],
                   outline=(int(GOLD[0] * i/18 * 0.3), int(GOLD[1] * i/18 * 0.15), 0))

# Panel fill
draw.rectangle([PX, PY, PX + PW, PY + PH], fill=(12, 11, 8), outline=GOLD_DIM, width=1)

# Panel top accent bar
draw.rectangle([PX, PY, PX + PW, PY + 3], fill=GOLD)

# PRIVATE KEY label
draw.text((PX + 20, PY + 18), "PRIVATE KEY", font=f_label_md, fill=GOLD)
draw.line([(PX + 20, PY + 36), (PX + PW - 20, PY + 36)], fill=GOLD_DIM, width=1)

# Key hex rows
hex_lines = [
    "18e14a7b6a307f42",
    "6a94f8114701e7c8",
    "e774e7f9a47e2c20",
    "35db29a206321725",
]
y_cur = PY + 52
for i, line in enumerate(hex_lines):
    # color chars individually for visual depth
    x_cur = PX + 20
    for ch in line:
        brightness = random.randint(55, 100) / 100
        col = tuple(int(c * brightness) for c in GOLD)
        draw.text((x_cur, y_cur), ch, font=f_mono_md, fill=col)
        x_cur += 14
    y_cur += 22

# Separator
draw.line([(PX + 20, y_cur + 8), (PX + PW - 20, y_cur + 8)], fill=GOLD_DIM, width=1)
y_cur += 24

# Lock icon (hand drawn with PIL)
LCX = PX + PW // 2
LCY = y_cur + 70
# shackle arc
draw.arc([LCX-28, LCY-50, LCX+28, LCY+10], 200, 340, fill=GOLD, width=3)
# body
draw.rectangle([LCX - 34, LCY - 8, LCX + 34, LCY + 40],
               fill=(20, 16, 6), outline=GOLD, width=2)
# keyhole circle
draw.ellipse([LCX-10, LCY+6, LCX+10, LCY+26], fill=BG, outline=GOLD, width=2)
# keyhole notch
draw.rectangle([LCX-4, LCY+20, LCX+4, LCY+36], fill=BG)

y_cur += 155

# ECDSA label
draw.text((PX + 20, y_cur), "secp256k1  ·  ECDSA", font=f_label, fill=GOLD_DIM)
y_cur += 22
draw.text((PX + 20, y_cur), "256-bit entropy", font=f_label, fill=GOLD_DIM)
y_cur += 22
draw.text((PX + 20, y_cur), "SIGN(msg, privKey) → (r, s)", font=f_mono_sm, fill=(int(GOLD[0]*0.7), int(GOLD[1]*0.7), 0))

# ── 4. Right panel — PUBLIC KEY zone (teal) ───────────────────────────────────
RX = W - 80 - PW
RY = PY
RW = PW
RH = PH

# Glow
for i in range(18, 0, -1):
    draw.rectangle([RX - i, RY - i, RX + RW + i, RY + RH + i],
                   outline=(0, int(TEAL[1] * i/18 * 0.25), int(TEAL[2] * i/18 * 0.15)))

draw.rectangle([RX, RY, RX + RW, RY + RH], fill=(6, 12, 10), outline=TEAL_DIM, width=1)
draw.rectangle([RX, RY, RX + RW, RY + 3], fill=TEAL)

draw.text((RX + 20, RY + 18), "PUBLIC KEY", font=f_label_md, fill=TEAL)
draw.line([(RX + 20, RY + 36), (RX + RW - 20, RY + 36)], fill=TEAL_DIM, width=1)

pub_lines = [
    "04 50863ad64a87ae",
    "8a2fe83c1af1a840",
    "3cb53f53e486d851",
    "1dad8a04887e5b23",
    "522cd47024345 3a2",
    "99fa9e7723771610",
]
y_cur2 = RY + 52
for line in pub_lines:
    x_cur = RX + 20
    for ch in line:
        brightness = random.randint(50, 100) / 100
        col = tuple(int(c * brightness) for c in TEAL)
        draw.text((x_cur, y_cur2), ch, font=f_mono_md, fill=col)
        x_cur += 14
    y_cur2 += 22

draw.line([(RX + 20, y_cur2 + 8), (RX + RW - 20, y_cur2 + 8)], fill=TEAL_DIM, width=1)
y_cur2 += 24

# Open lock icon
RCX = RX + RW // 2
RCY = y_cur2 + 70
# shackle open (rotated up-right)
draw.arc([RCX - 28, RCY - 52, RCX + 28, RCY + 8], 200, 360, fill=TEAL, width=3)
draw.line([(RCX + 28, RCY - 22), (RCX + 38, RCY - 40)], fill=TEAL, width=3)
# body
draw.rectangle([RCX - 34, RCY - 8, RCX + 34, RCY + 40],
               fill=(6, 16, 12), outline=TEAL, width=2)
# keyhole
draw.ellipse([RCX-10, RCY+6, RCX+10, RCY+26], fill=BG, outline=TEAL, width=2)
draw.rectangle([RCX-4, RCY+20, RCX+4, RCY+36], fill=BG)

y_cur2 += 155
draw.text((RX + 20, y_cur2), "VERIFY(msg, sig, pubKey)", font=f_mono_sm, fill=(0, int(TEAL[1]*0.7), int(TEAL[2]*0.7)))
y_cur2 += 22
draw.text((RX + 20, y_cur2), "uncompressed  ·  04 prefix", font=f_label, fill=TEAL_DIM)
y_cur2 += 22
draw.text((RX + 20, y_cur2), "shareable  ·  blockchain addr", font=f_label, fill=TEAL_DIM)

# ── 5. Center — arrow / transform zone ────────────────────────────────────────
CX = W // 2
CY = H // 2

# Elliptic curve multiply label
draw.text((CX, CY - 80), "elliptic curve", font=f_label, fill=MUTED, anchor="mm")
draw.text((CX, CY - 62), "multiplication", font=f_label, fill=MUTED, anchor="mm")

# Arrow right (privKey → pubKey)
AY = CY - 20
draw.line([(PX + PW + 18, AY), (RX - 18, AY)], fill=WHITE, width=2)
# arrowhead
draw.polygon([(RX - 18, AY - 7), (RX - 18, AY + 7), (RX - 4, AY)], fill=WHITE)

# Arrow label
draw.text((CX, AY - 14), "×G", font=f_mono_lg, fill=WHITE, anchor="mm")

# SHA-256 hash indicator
draw.text((CX, CY + 20), "SHA-256", font=f_label_md, fill=MUTED, anchor="mm")
draw.text((CX, CY + 38), "↓", font=f_sub, fill=MUTED, anchor="mm")
draw.text((CX, CY + 60), "ECDSA sign", font=f_label, fill=MUTED, anchor="mm")

# Small secp256k1 curve sketch (abstract ellipse)
draw.arc([CX - 30, CY + 75, CX + 30, CY + 110], 0, 360, fill=ACCENT_LINE, width=1)
draw.arc([CX - 20, CY + 80, CX + 40, CY + 105], 10, 200, fill=MUTED, width=1)

# ── 6. Header / title ─────────────────────────────────────────────────────────
# Top thin line
draw.line([(60, 58), (W - 60, 58)], fill=ACCENT_LINE, width=1)

TITLE = "PUBLIC / PRIVATE KEY"
draw.text((CX, 30), TITLE, font=f_sub, fill=MUTED, anchor="mm")

# ── 7. Footer ─────────────────────────────────────────────────────────────────
draw.line([(60, H - 56), (W - 60, H - 56)], fill=ACCENT_LINE, width=1)

draw.text((80, H - 40), "Blockchain 101  ·  Key Pair Demo", font=f_label, fill=MUTED)
draw.text((W - 80, H - 40), "secp256k1  ·  ECDSA  ·  SHA-256", font=f_label, fill=MUTED, anchor="ra")

# ── 8. Hash string across bottom of panels (atmosphere) ───────────────────────
hash_str = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
x_off = 80
y_hash = H - 72
for i, ch in enumerate(hash_str[:60]):
    frac = i / 60
    # blend gold → muted → teal
    if frac < 0.5:
        t = frac * 2
        col = tuple(int(GOLD[j]*(1-t) + MUTED[j]*t) for j in range(3))
    else:
        t = (frac - 0.5) * 2
        col = tuple(int(MUTED[j]*(1-t) + TEAL[j]*t) for j in range(3))
    draw.text((x_off + i * 17, y_hash), ch, font=f_mono_sm, fill=col)

# ── 9. Corner decorations ─────────────────────────────────────────────────────
corner_size = 18
corners = [(60, 64), (W-60, 64), (60, H-60), (W-60, H-60)]
dirs     = [(1,1), (-1,1), (1,-1), (-1,-1)]
for (cx2, cy2), (dx, dy) in zip(corners, dirs):
    draw.line([(cx2, cy2), (cx2 + dx*corner_size, cy2)], fill=ACCENT_LINE, width=1)
    draw.line([(cx2, cy2), (cx2, cy2 + dy*corner_size)], fill=ACCENT_LINE, width=1)

# ── 10. Save ──────────────────────────────────────────────────────────────────
out = "/mnt/user-data/outputs/keypair_logo.png"
img.save(out, "PNG", dpi=(144, 144))
print(f"Saved: {out}  [{W}×{H}]")
