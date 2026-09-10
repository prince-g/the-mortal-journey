export const CARD_COUNT = 9;

export function getGalleryLayout(viewportWidth) {
  const columns = viewportWidth >= 960 ? 3 : viewportWidth >= 600 ? 2 : 1;
  return {
    columns,
    gap: columns === 3 ? 0.72 : columns === 2 ? 0.62 : 0.5,
  };
}

export function createCardSlots(count, columns) {
  return Array.from({ length: count }, (_, index) => ({
    index,
    column: index % columns,
    row: Math.floor(index / columns),
  }));
}
