"""Генерация PDF-сертификата в фирменном стиле CodeMentor."""
from __future__ import annotations

from io import BytesIO

# Палитра сайта (frontend index.css)
COLOR_TOP = (238, 242, 255)       # #eef2ff
COLOR_MID = (253, 244, 255)       # #fdf4ff
COLOR_BOTTOM = (236, 254, 255)    # #ecfeff
COLOR_TEXT = (30, 27, 75)         # #1e1b4b
COLOR_MUTED = (100, 116, 139)     # #64748b
COLOR_ACCENT = (99, 102, 241)     # #6366f1
COLOR_VIOLET = (139, 92, 246)     # #8b5cf6
COLOR_BORDER = (224, 231, 255)    # #e0e7ff
COLOR_WHITE = (255, 255, 255)


def _lerp(a: tuple[int, int, int], b: tuple[int, int, int], t: float) -> tuple[int, int, int]:
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


def _load_font(size: int):
    from PIL import ImageFont

    candidates = [
        'C:/Windows/Fonts/segoeuib.ttf',
        'C:/Windows/Fonts/segoeui.ttf',
        'C:/Windows/Fonts/arialbd.ttf',
        'C:/Windows/Fonts/arial.ttf',
        '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
        '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
        'arial.ttf',
    ]
    for path in candidates:
        try:
            return ImageFont.truetype(path, size)
        except OSError:
            continue
    return ImageFont.load_default()


def _draw_gradient_background(draw, width: int, height: int) -> None:
    steps = 256
    for i in range(steps):
        y0 = i * height // steps
        y1 = (i + 1) * height // steps
        t = i / max(steps - 1, 1)
        if t < 0.45:
            color = _lerp(COLOR_TOP, COLOR_MID, t / 0.45)
        else:
            color = _lerp(COLOR_MID, COLOR_BOTTOM, (t - 0.45) / 0.55)
        draw.rectangle([0, y0, width, y1], fill=color)


def _apply_decor_overlay(img):
    from PIL import Image, ImageDraw

    width, height = img.size
    overlay = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    odraw = ImageDraw.Draw(overlay)
    accents = [
        (120, 180, COLOR_ACCENT, 90),
        (width - 140, 200, COLOR_VIOLET, 70),
        (width - 200, height - 160, COLOR_ACCENT, 110),
        (160, height - 140, COLOR_VIOLET, 80),
    ]
    for cx, cy, color, r in accents:
        odraw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(*color, 40))
    return Image.alpha_composite(img.convert('RGBA'), overlay).convert('RGB')


def render_certificate_pdf(*, holder_name: str, course_title: str, issued_at: str, certificate_number: str) -> bytes:
    from PIL import Image, ImageDraw

    width, height = 1654, 1169
    img = Image.new('RGB', (width, height), COLOR_TOP)
    draw = ImageDraw.Draw(img)
    _draw_gradient_background(draw, width, height)
    img = _apply_decor_overlay(img)
    draw = ImageDraw.Draw(img)

    margin = 56
    inner = margin + 18
    card_margin = margin + 36

    draw.rounded_rectangle(
        [margin, margin, width - margin, height - margin],
        radius=28,
        outline=COLOR_VIOLET,
        width=4,
    )
    draw.rounded_rectangle(
        [inner, inner, width - inner, height - inner],
        radius=22,
        outline=COLOR_BORDER,
        width=3,
    )
    draw.rounded_rectangle(
        [card_margin, card_margin, width - card_margin, height - card_margin],
        radius=18,
        fill=COLOR_WHITE,
        outline=COLOR_BORDER,
        width=2,
    )

    brand_font = _load_font(36)
    title_font = _load_font(64)
    name_font = _load_font(52)
    text_font = _load_font(32)
    course_font = _load_font(36)
    small_font = _load_font(26)
    seal_font = _load_font(22)

    cx = width // 2

    draw.text((cx, card_margin + 52), 'CodeMentor', fill=COLOR_ACCENT, anchor='mm', font=brand_font)

    line_w = 220
    draw.line([(cx - line_w, card_margin + 78), (cx + line_w, card_margin + 78)], fill=COLOR_VIOLET, width=4)

    draw.text((cx, card_margin + 130), 'CERTIFICATE OF COMPLETION', fill=COLOR_TEXT, anchor='mm', font=title_font)
    draw.text((cx, card_margin + 210), 'This certifies that', fill=COLOR_MUTED, anchor='mm', font=text_font)
    draw.text((cx, card_margin + 300), holder_name, fill=COLOR_ACCENT, anchor='mm', font=name_font)
    draw.text(
        (cx, card_margin + 380),
        'has successfully passed the final exam for',
        fill=COLOR_MUTED,
        anchor='mm',
        font=text_font,
    )

    course_line = f'Module: {course_title}'
    if len(course_line) > 52:
        draw.text((cx, card_margin + 450), 'Module:', fill=COLOR_MUTED, anchor='mm', font=text_font)
        draw.text((cx, card_margin + 500), course_title, fill=COLOR_TEXT, anchor='mm', font=course_font)
        date_y = card_margin + 580
    else:
        draw.text((cx, card_margin + 460), course_line, fill=COLOR_TEXT, anchor='mm', font=course_font)
        date_y = card_margin + 540

    draw.text((cx, date_y), f'Date: {issued_at}', fill=COLOR_MUTED, anchor='mm', font=text_font)

    seal_center = (width - card_margin - 150, height - card_margin - 130)
    seal_r = 100
    draw.ellipse(
        [seal_center[0] - seal_r, seal_center[1] - seal_r, seal_center[0] + seal_r, seal_center[1] + seal_r],
        outline=COLOR_VIOLET,
        width=8,
    )
    draw.ellipse(
        [
            seal_center[0] - seal_r + 14,
            seal_center[1] - seal_r + 14,
            seal_center[0] + seal_r - 14,
            seal_center[1] + seal_r - 14,
        ],
        outline=COLOR_ACCENT,
        width=3,
    )
    draw.text(seal_center, 'CODEMENTOR\nCERTIFIED', fill=COLOR_VIOLET, anchor='mm', font=seal_font, align='center')

    draw.text(
        (card_margin + 24, height - card_margin - 36),
        f'Certificate No: {certificate_number}',
        fill=COLOR_MUTED,
        anchor='ls',
        font=small_font,
    )

    buf = BytesIO()
    img.save(buf, format='PDF')
    pdf_bytes = buf.getvalue()
    buf.close()
    return pdf_bytes
