"""Convert ImageGen's painted neutral checkerboard into real alpha."""

from pathlib import Path
import argparse

import numpy as np
from PIL import Image


def convert(source: Path, destination: Path) -> None:
    rgb = np.asarray(Image.open(source).convert("RGB"), dtype=np.float32)
    lightness = rgb.mean(axis=2)
    chroma = rgb.max(axis=2) - rgb.min(axis=2)

    neutral = np.clip((18.0 - chroma) / 12.0, 0.0, 1.0)
    bright = np.clip((lightness - 165.0) / 35.0, 0.0, 1.0)
    alpha = np.rint(255.0 * (1.0 - neutral * bright)).astype(np.uint8)

    rgba = np.dstack((rgb.astype(np.uint8), alpha))
    Image.fromarray(rgba, "RGBA").save(destination)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path)
    parser.add_argument("destination", type=Path)
    args = parser.parse_args()
    convert(args.source, args.destination)
