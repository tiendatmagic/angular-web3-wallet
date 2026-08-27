/**
 * Utility function to find the nearest ancestor element that forms a Containing Block
 * for fixed position descendants according to the CSS Transforms / Filter / Containment specifications.
 *
 * When a fixed element is rendered inside an ancestor with transform, perspective, filter,
 * backdrop-filter, will-change: transform, or containment, the browser positions it relative
 * to that ancestor instead of the Viewport.
 *
 * This function computes the (left, top) offset of such containing block so fixed popovers
 * can adjust their position coordinates and render accurately at the intended screen location.
 */
export function getContainingBlockOffset(el: HTMLElement | null): { left: number; top: number } {
  if (!el || typeof window === 'undefined' || typeof document === 'undefined') {
    return { left: 0, top: 0 };
  }

  let parent = el.parentElement;
  while (parent && parent !== document.body && parent !== document.documentElement) {
    const style = window.getComputedStyle(parent);

    const hasTransform = Boolean(style.transform && style.transform !== 'none');
    const hasPerspective = Boolean(style.perspective && style.perspective !== 'none');
    const hasFilter = Boolean(style.filter && style.filter !== 'none');
    const hasBackdropFilter = Boolean(style.backdropFilter && style.backdropFilter !== 'none');

    const willChange = style.willChange || '';
    const hasWillChange =
      willChange.includes('transform') ||
      willChange.includes('perspective') ||
      willChange.includes('filter') ||
      willChange.includes('backdrop-filter');

    const contain = style.contain || '';
    const hasContain =
      contain.includes('paint') ||
      contain.includes('layout') ||
      contain.includes('strict') ||
      contain.includes('content');

    if (hasTransform || hasPerspective || hasFilter || hasBackdropFilter || hasWillChange || hasContain) {
      const rect = parent.getBoundingClientRect();
      return { left: rect.left, top: rect.top };
    }

    parent = parent.parentElement;
  }

  return { left: 0, top: 0 };
}
