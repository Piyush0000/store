"""Generate lightweight, original SVG demo artwork for Festival Storefront presets."""
from pathlib import Path
import os

ROOT = Path(__file__).resolve().parents[1]
DESTINATIONS = [ROOT / "public" / "festivals"]
if os.environ.get("ORBIT_FESTIVAL_ART_DIR"):
    DESTINATIONS.append(Path(os.environ["ORBIT_FESTIVAL_ART_DIR"]))

PALETTES = {
    "diwali": ("#4d092a", "#9c3c35", "#f7c76b"),
    "dhanteras": ("#172d2b", "#41665b", "#f0d398"),
    "holi": ("#44307b", "#d74f83", "#f7d365"),
    "raksha-bandhan": ("#773c58", "#c47872", "#f8d7a3"),
    "ganesh-chaturthi": ("#7b2f2b", "#ba6435", "#f8d57c"),
    "janmashtami": ("#172b60", "#277c86", "#d7c987"),
    "navratri": ("#57235e", "#bb4c68", "#e8af65"),
    "durga-puja": ("#742b36", "#b35149", "#f3d5a4"),
    "dussehra": ("#662e31", "#b65335", "#f4c179"),
    "pongal": ("#654233", "#b97947", "#f0d39d"),
    "makar-sankranti": ("#1d4f77", "#5b9bb6", "#f7d394"),
    "lohri": ("#312e52", "#9d4843", "#f4ba75"),
    "onam": ("#244d3f", "#6d9659", "#f6d68b"),
    "baisakhi": ("#5a4c2c", "#a98d45", "#f8dea1"),
    "bihu": ("#65383a", "#b35e57", "#f5d6a5"),
    "ugadi-gudi-padwa": ("#355446", "#a18c45", "#f3d895"),
    "ugadi": ("#355446", "#a18c45", "#f3d895"),
    "gudi-padwa": ("#4d4254", "#aa7955", "#f3d895"),
    "eid-al-fitr": ("#103f42", "#297c6c", "#dbd29c"),
    "eid-al-adha": ("#263d52", "#557d79", "#e7d6a6"),
    "christmas": ("#183f37", "#3d745d", "#e5c994"),
    "custom": ("#313e52", "#876c87", "#e5d2aa"),
}

MOTIFS = {
    "diwali": '<path d="M-130 75 Q0 195 130 75Z"/><path d="M-100 75 Q0 108 100 75"/><path d="M0 60 C-70 -35 0 -60 0 -135 C55 -55 68 5 0 60Z"/><circle cx="0" cy="-5" r="135" stroke-dasharray="4 15"/>',
    "dhanteras": '<circle cx="-55" cy="20" r="108"/><circle cx="-55" cy="20" r="76"/><path d="M-112 4 Q-55 -35 5 4 M-112 37 Q-55 76 5 37"/><path d="M70 -120 H145 L170 -80 L150 100 Q110 140 70 100 L50 -80Z"/><path d="M60 -72 Q110 -45 160 -72"/>',
    "holi": '<circle cx="-42" cy="-20" r="95"/><circle cx="95" cy="55" r="62"/><circle cx="-130" cy="100" r="34"/><path d="M-180 -120 L-145 -80 M55 -150 L76 -105 M160 -92 L130 -68 M-140 155 L-112 120 M20 148 L36 103"/>',
    "raksha-bandhan": '<path d="M-235 0 H-92 M92 0 H235"/><circle r="91"/><circle r="64"/><circle r="28"/><path d="M0 -142 V-92 M0 92 V142 M-142 0 H-92 M92 0 H142 M-100 -100 L-64 -64 M100 -100 L64 -64 M-100 100 L-64 64 M100 100 L64 64"/>',
    "ganesh-chaturthi": '<path d="M0 -135 C90 -70 100 15 55 105 Q0 148 -55 105 C-100 15 -90 -70 0 -135Z"/><path d="M-64 71 Q0 105 64 71 M0 -133 V-182"/><circle cx="-105" cy="-78" r="16"/><circle cx="105" cy="-78" r="16"/><circle cx="-120" cy="-7" r="14"/><circle cx="120" cy="-7" r="14"/>',
    "janmashtami": '<path d="M-100 -18 Q0 28 100 -18 L80 95 Q0 140 -80 95Z"/><path d="M-105 -26 H105 M-100 -45 Q0 -90 100 -45"/><path d="M-190 -123 L184 -72 M-120 -113 V-92 M-48 -103 V-82 M22 -93 V-72 M94 -83 V-62"/><circle cx="0" cy="61" r="19"/>',
    "navratri": '<path d="M-140 120 L130 -125 M-110 -125 L150 125" stroke-width="17"/><circle r="116" stroke-dasharray="6 22"/><path d="M-180 0 Q0 -210 180 0 M-180 0 Q0 210 180 0"/>',
    "durga-puja": '<path d="M-160 150 V-15 Q-160 -165 0 -165 Q160 -165 160 -15 V150Z"/><path d="M-118 150 V-15 Q-118 -118 0 -118 Q118 -118 118 -15 V150"/><circle cy="-15" r="58"/><path d="M-78 85 H78 M-90 115 H90"/>',
    "dussehra": '<path d="M-100 -150 Q90 0 -100 150"/><path d="M-100 -150 V150 M-150 0 H160 M120 -26 L160 0 L120 26"/><circle cx="-85" r="30"/><path d="M-185 -160 L-145 -120 M-185 160 L-145 120"/>',
    "pongal": '<path d="M-115 -45 H115 L95 110 Q0 160 -95 110Z"/><path d="M-120 -53 Q0 -100 120 -53 M-60 -110 Q-90 -155 -40 -185 M0 -112 Q-20 -155 18 -188 M58 -110 Q40 -155 85 -185"/><path d="M-145 78 Q0 120 145 78"/>',
    "makar-sankranti": '<path d="M0 -135 L115 -10 L0 115 L-115 -10Z M0 115 Q45 150 0 184 Q-50 218 0 240"/><path d="M0 -135 V115 M-115 -10 H115"/><path d="M115 90 L175 145 L115 200 L55 145Z"/>',
    "lohri": '<path d="M-90 105 L90 105 M-100 130 L100 130 M-80 155 L80 155"/><path d="M0 95 C-80 20 -30 -25 0 -125 C85 -38 78 24 0 95Z"/><path d="M0 70 C-33 25 0 -10 10 -50 C47 5 32 41 0 70Z"/>',
    "onam": '<circle r="132"/><circle r="92"/><circle r="48"/><circle r="16"/><path d="M0 -130 Q55 -75 0 -44 Q-55 -75 0 -130 M130 0 Q75 55 44 0 Q75 -55 130 0 M0 130 Q-55 75 0 44 Q55 75 0 130 M-130 0 Q-75 -55 -44 0 Q-75 55 -130 0"/>',
    "baisakhi": '<path d="M-45 155 Q-28 -10 -15 -150 M50 155 Q25 0 25 -145"/><path d="M-23 -120 Q-115 -150 -82 -82 Q-48 -58 -23 -120 M-20 -67 Q-105 -95 -75 -28 Q-38 -2 -20 -67 M-17 -18 Q-100 -40 -65 32 Q-28 45 -17 -18 M30 -110 Q125 -145 87 -70 Q48 -55 30 -110 M35 -55 Q120 -85 90 -18 Q55 4 35 -55 M43 5 Q125 -23 100 40 Q60 58 43 5"/>',
    "bihu": '<path d="M-165 -130 H165 M-165 130 H165 M-165 -130 V130 M165 -130 V130"/><path d="M0 -100 L100 0 L0 100 L-100 0Z M0 -60 L60 0 L0 60 L-60 0Z"/><path d="M-145 -105 L-105 -65 L-145 -25 M145 -105 L105 -65 L145 -25 M-145 25 L-105 65 L-145 105 M145 25 L105 65 L145 105"/>',
    "ugadi-gudi-padwa": '<path d="M-80 -155 V155 M-80 -155 Q15 -175 100 -115 L-80 -67Z"/><path d="M-100 150 Q0 90 110 150 M-70 95 Q-142 22 -92 -8 Q-37 10 -70 95 M-35 92 Q-60 0 0 -25 Q55 10 -35 92 M5 96 Q16 10 80 -13 Q113 47 5 96"/>',
    "ugadi": '<path d="M-155 115 Q0 40 155 115 M-140 140 Q0 70 140 140"/><path d="M-95 20 Q-170 -80 -110 -130 Q-20 -105 -95 20 M-5 10 Q-75 -88 0 -145 Q80 -83 -5 10 M85 20 Q25 -78 105 -130 Q170 -80 85 20"/><circle cx="0" cy="88" r="28"/>',
    "gudi-padwa": '<path d="M-35 -175 V170 M-35 -170 Q65 -195 145 -125 L-35 -75Z"/><path d="M-70 145 H20 M-80 -153 Q-35 -185 10 -153"/><circle cx="-35" cy="-175" r="25"/><path d="M-105 52 Q-35 6 40 52 M-90 96 Q-35 53 30 96"/>',
    "eid-al-fitr": '<path d="M55 -140 A148 148 0 1 0 125 105 A128 128 0 1 1 55 -140Z"/><path d="M124 -120 L137 -84 L173 -71 L137 -57 L124 -20 L111 -57 L75 -71 L111 -84Z"/><circle cx="144" cy="68" r="13"/>',
    "eid-al-adha": '<path d="M-125 155 V-42 Q-125 -100 0 -155 Q125 -100 125 -42 V155Z"/><path d="M-78 155 V-25 Q-78 -60 0 -105 Q78 -60 78 -25 V155"/><path d="M50 -135 A88 88 0 1 0 99 15 A72 72 0 1 1 50 -135Z"/>',
    "christmas": '<path d="M0 -160 L-95 -25 H-58 L-128 65 H-73 L-150 142 H150 L73 65 H128 L58 -25 H95Z"/><path d="M0 142 V175 M0 -215 L17 -177 L56 -172 L26 -145 L34 -108 L0 -128 L-34 -108 L-26 -145 L-56 -172 L-17 -177Z"/><circle cx="-18" cy="15" r="9"/><circle cx="31" cy="70" r="9"/>',
    "custom": '<circle r="125"/><path d="M0 -90 V90 M-90 0 H90 M-63 -63 L63 63 M63 -63 L-63 63"/><circle r="30"/>',
}

for destination in DESTINATIONS:
    destination.mkdir(parents=True, exist_ok=True)
    for name, (dark, mid, light) in PALETTES.items():
        motif = MOTIFS[name]
        svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 720" role="img" aria-label="{name.replace('-', ' ').title()} festival artwork">
<defs><linearGradient id="bg" x2="1" y2="1"><stop stop-color="{dark}"/><stop offset="1" stop-color="{mid}"/></linearGradient><radialGradient id="glow"><stop stop-color="{light}" stop-opacity=".28"/><stop offset="1" stop-color="{light}" stop-opacity="0"/></radialGradient><pattern id="dots" width="54" height="54" patternUnits="userSpaceOnUse"><circle cx="5" cy="5" r="1.4" fill="{light}" opacity=".32"/></pattern></defs>
<rect width="1440" height="720" fill="url(#bg)"/><rect width="1440" height="720" fill="url(#dots)"/><circle cx="1050" cy="345" r="350" fill="url(#glow)"/><circle cx="1060" cy="345" r="240" fill="none" stroke="{light}" opacity=".22"/><circle cx="1060" cy="345" r="270" fill="none" stroke="{light}" opacity=".13"/>
<g transform="translate(1060 345)" fill="none" stroke="{light}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">{motif}</g>
<path d="M0 660 Q360 600 720 660 T1440 660" fill="none" stroke="{light}" opacity=".15" stroke-width="2"/><circle cx="130" cy="100" r="4" fill="{light}" opacity=".7"/><circle cx="220" cy="590" r="3" fill="{light}" opacity=".6"/><circle cx="660" cy="110" r="2" fill="{light}" opacity=".6"/>
</svg>'''
        (destination / f"{name}.svg").write_text(svg, encoding="utf-8")
