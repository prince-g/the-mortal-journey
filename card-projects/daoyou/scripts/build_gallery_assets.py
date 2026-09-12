"""Build the nine independent runtime card-layer sets from supplied artwork."""

from pathlib import Path
import re
import shutil

from PIL import Image, ImageEnhance, ImageFilter, ImageOps


PROJECT_ROOT = Path(__file__).resolve().parents[1]
ASSET_ROOT = PROJECT_ROOT / "web" / "assets"
TARGET_SIZE = (941, 1672)

# Card 1 retains the original RuiC layers. Cards 2-9 use the supplied pairs.
CARD_MAP = (
    (1, None, None, None),
    (2, 1, "IMG_2464.JPG", (380, 0, 1420, 1129)),
    (3, 2, "IMG_2457.JPG", (350, 50, 1100, 1128)),
    (4, 4, "IMG_2454.JPG", (570, 0, 1205, 1127)),
    (5, 8, "IMG_2455.JPG", None),
    (6, 9, "IMG_2473.JPG", None),
    (7, 10, "IMG_2460.JPG", None),
    (8, 11, "IMG_2474.JPG", None),
    (9, 12, "IMG_2479.JPG", None),
)


def numbered_lineart() -> dict[int, Path]:
    result = {}
    for path in (ASSET_ROOT / "lineart").glob("*.webp"):
        match = re.match(r"^(\d+)", path.name)
        if match:
            result[int(match.group(1))] = path
    return result


def prepare_registered_layers(
    subject_path: Path,
    lineart_path: Path,
    crop: tuple[int, int, int, int] | None,
) -> tuple[Image.Image, Image.Image]:
    subject = Image.open(subject_path).convert("RGBA")
    if subject_path.stem == "4":
        from rembg import new_session, remove

        rgb = Image.new("RGB", subject.size, (8, 12, 16))
        rgb.paste(subject, mask=subject.getchannel("A"))
        subject.putalpha(remove(rgb, session=new_session("u2net")).getchannel("A"))
    lineart = Image.open(lineart_path).convert("RGB")
    if lineart.size != subject.size:
        lineart = lineart.resize(subject.size, Image.Resampling.LANCZOS)

    if crop is None:
        return (
            ImageOps.fit(subject, TARGET_SIZE, Image.Resampling.LANCZOS),
            ImageOps.fit(lineart, TARGET_SIZE, Image.Resampling.LANCZOS),
        )

    subject = subject.crop(crop)
    lineart = lineart.crop(crop)
    subject = ImageOps.contain(subject, (903, 1505), Image.Resampling.LANCZOS)
    lineart = ImageOps.contain(lineart, subject.size, Image.Resampling.LANCZOS)
    position = ((TARGET_SIZE[0] - subject.width) // 2, int(TARGET_SIZE[1] * 0.54 - subject.height / 2))

    subject_canvas = Image.new("RGBA", TARGET_SIZE, (0, 0, 0, 0))
    subject_canvas.alpha_composite(subject, position)
    lineart_canvas = Image.new("RGB", TARGET_SIZE, "white")
    lineart_canvas.paste(lineart, position)
    return subject_canvas, lineart_canvas


def prepare_background(path: Path) -> Image.Image:
    source = Image.open(path).convert("RGB")
    source = source.crop((0, int(source.height * 0.08), source.width, int(source.height * 0.9)))
    background = ImageOps.fit(
        source,
        TARGET_SIZE,
        Image.Resampling.LANCZOS,
        centering=(0.5, 0.5),
    )
    background = background.filter(ImageFilter.GaussianBlur(2.2))
    background = ImageEnhance.Color(background).enhance(0.9)
    return ImageEnhance.Brightness(background).enhance(0.74)


def save_layers(card_number: int, subject: Image.Image, background: Image.Image, lineart: Image.Image) -> None:
    destination = ASSET_ROOT / f"card{card_number}"
    destination.mkdir(parents=True, exist_ok=True)
    subject.save(destination / "subject.png", optimize=True)
    background.save(destination / "background.png", optimize=True)
    lineart.save(destination / "lineart.png", optimize=True)
    shutil.copyfile(ASSET_ROOT / "text.png", destination / "text.png")


def main() -> None:
    linearts = numbered_lineart()
    required = {entry[1] for entry in CARD_MAP[1:]}
    missing = required - linearts.keys()
    if missing:
        raise FileNotFoundError(f"Missing line art numbers: {sorted(missing)}")

    save_layers(
        1,
        Image.open(ASSET_ROOT / "subject.png").convert("RGBA"),
        Image.open(ASSET_ROOT / "background.png").convert("RGB"),
        Image.open(ASSET_ROOT / "lineart.png").convert("RGB"),
    )

    for card_number, source_number, background_name, crop in CARD_MAP[1:]:
        subject, lineart = prepare_registered_layers(
            ASSET_ROOT / "source" / f"{source_number}.png",
            linearts[source_number],
            crop,
        )
        background = prepare_background(ASSET_ROOT / "background" / background_name)
        save_layers(card_number, subject, background, lineart)
        print(f"card{card_number}: source {source_number}, {background_name}")


if __name__ == "__main__":
    main()
