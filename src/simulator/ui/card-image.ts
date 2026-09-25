/**
 * Maps card identities to NarutoCardGuide's public asset convention. The
 * upstream Preview catalog predates product codes (`N-001`), so N01 is its
 * current local asset set. New catalog IDs already carrying a set code, such
 * as N02-001, resolve without any new mapping.
 */
export function resolveCardImage(cardId: string): string | null {
  const setCard = /^([A-Z]+\d+)-(\d+)$/i.exec(cardId);
  if (setCard) return `/Cards/${setCard[1]}/${cardId}.jpg`;

  const previewCard = /^N-(\d+)$/i.exec(cardId);
  if (previewCard) return `/Cards/N01/N01-${previewCard[1]}.jpg`;

  if (/^C-\d+$/i.test(cardId)) return `/Cards/Chakra cards/${cardId}.png`;
  if (/^S-\d+$/i.test(cardId)) return `/Cards/Summon cards/${cardId}.png`;
  return null;
}

const escapeHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

export function cardImageMarkup(cardId: string, name: string): string {
  const src = resolveCardImage(cardId);
  if (!src) return '';
  return `<img class="game-card-image" data-card-image data-card-preview src="${escapeHtml(src)}" alt="${escapeHtml(name)}" loading="lazy" />`;
}

function ensurePreviewDialog(): HTMLDialogElement {
  const current = document.querySelector<HTMLDialogElement>('#simulator-card-preview');
  if (current) return current;
  const dialog = document.createElement('dialog');
  dialog.id = 'simulator-card-preview';
  dialog.className = 'simulator-card-preview';
  dialog.innerHTML = '<button type="button" aria-label="Close card preview">×</button><img alt="" />';
  dialog.querySelector('button')?.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
  document.body.append(dialog);
  return dialog;
}

/** Attach shared image fallback and click-to-zoom behavior after a board render. */
export function enhanceCardImages(root: HTMLElement): void {
  root.querySelectorAll<HTMLImageElement>('[data-card-image]').forEach((image) => {
    const fallback = () => image.closest('.game-card')?.classList.add('image-missing');
    image.addEventListener('error', fallback, { once: true });
    if (image.complete && image.naturalWidth === 0) fallback();
  });
  if (root.dataset.cardImageEvents === 'true') return;
  root.dataset.cardImageEvents = 'true';
  root.addEventListener('click', (event) => {
    const image = event.target instanceof Element ? event.target.closest<HTMLImageElement>('[data-card-preview]') : null;
    if (!image || image.closest('.game-card')?.classList.contains('image-missing')) return;
    const dialog = ensurePreviewDialog();
    const preview = dialog.querySelector('img');
    if (!preview) return;
    preview.src = image.currentSrc || image.src;
    preview.alt = image.alt;
    dialog.showModal();
  });
}
