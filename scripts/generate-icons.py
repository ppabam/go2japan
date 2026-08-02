#!/usr/bin/env python3
"""PWA 아이콘 생성기.

manifest 가 참조하는 아이콘 파일들을 public/ 에 만든다.
결과물은 저장소에 커밋되어 있으므로 평소에는 실행할 필요가 없다.
아이콘 디자인을 바꿀 때만 다시 돌린다.

    python3 scripts/generate-icons.py

일본어 글리프가 있는 폰트(Noto Sans CJK JP 등)가 설치돼 있어야 한다.
"""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"

GLYPH = "あ"
BG_TOP = (42, 53, 64)  # #2a3540
BG_BOTTOM = (15, 20, 23)  # #0f1417 - App.css 의 배경 그라디언트 끝값
ACCENT = (255, 71, 87)  # #ff4757 - --primary-color
GLYPH_COLOR = (255, 255, 255)

FONT_CANDIDATES = [
    ("/usr/share/fonts/opentype/noto/NotoSansCJK-Black.ttc", 0),
    ("/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc", 0),
    ("/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc", 0),
    ("/usr/share/fonts/truetype/noto/NotoSansCJKjp-Bold.otf", 0),
    ("/System/Library/Fonts/ヒラギノ角ゴシック W6.ttc", 0),
]


def find_font(size):
    for path, index in FONT_CANDIDATES:
        if Path(path).exists():
            return ImageFont.truetype(path, size, index=index)
    raise SystemExit(
        "일본어 글리프를 가진 폰트를 찾지 못했습니다. "
        "FONT_CANDIDATES 에 설치된 폰트 경로를 추가하세요."
    )


def gradient(size):
    image = Image.new("RGB", (size, size))
    draw = ImageDraw.Draw(image)
    for y in range(size):
        ratio = y / max(size - 1, 1)
        draw.line(
            [(0, y), (size, y)],
            fill=tuple(
                round(top + (bottom - top) * ratio)
                for top, bottom in zip(BG_TOP, BG_BOTTOM)
            ),
        )
    return image


def draw_glyph(image, glyph_ratio):
    size = image.width
    draw = ImageDraw.Draw(image)
    font = find_font(round(size * glyph_ratio))

    left, top, right, bottom = draw.textbbox((0, 0), GLYPH, font=font)
    position = (
        (size - (right - left)) / 2 - left,
        (size - (bottom - top)) / 2 - top,
    )

    # 붉은 그림자를 살짝 어긋나게 깔아 앱의 강조색을 드러낸다.
    offset = max(round(size * 0.018), 1)
    draw.text((position[0] + offset, position[1] + offset), GLYPH, font=font, fill=ACCENT)
    draw.text(position, GLYPH, font=font, fill=GLYPH_COLOR)
    return image


def rounded(image, radius_ratio=0.22):
    size = image.width
    mask = Image.new("L", (size, size), 0)
    ImageDraw.Draw(mask).rounded_rectangle(
        [(0, 0), (size - 1, size - 1)], radius=round(size * radius_ratio), fill=255
    )
    output = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    output.paste(image, (0, 0), mask)
    return output


def build(size, glyph_ratio=0.62, round_corners=True):
    icon = draw_glyph(gradient(size), glyph_ratio)
    return rounded(icon) if round_corners else icon.convert("RGBA")


def main():
    PUBLIC.mkdir(exist_ok=True)

    build(192).save(PUBLIC / "pwa-192x192.png")
    build(512).save(PUBLIC / "pwa-512x512.png")
    # maskable 은 안드로이드가 임의 모양으로 잘라내므로 여백을 넉넉히 둔다.
    build(512, glyph_ratio=0.42, round_corners=False).save(
        PUBLIC / "pwa-maskable-512x512.png"
    )
    # iOS 는 자체적으로 모서리를 둥글게 깎으므로 사각형 그대로 둔다.
    build(180, round_corners=False).save(PUBLIC / "apple-touch-icon.png")

    favicon = build(256)
    favicon.save(PUBLIC / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])

    for path in sorted(PUBLIC.glob("*")):
        print(f"  {path.relative_to(ROOT)}  {path.stat().st_size:,} bytes")


if __name__ == "__main__":
    main()
