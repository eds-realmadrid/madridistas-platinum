/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: madridistas cleanup.
 * Removes non-authorable content from Framer-built platinum.madridistas.com.
 * Selectors from captured DOM (migration-work/cleaned.html).
 */
const H = { before: 'beforeTransform', after: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === H.before) {
    // Remove cookie consent (OneTrust - found in captured DOM)
    WebImporter.DOMUtils.remove(element, [
      '#onetrust-consent-sdk',
      '#CybotCookiebotDialog',
      '[class*="cookie"]',
    ]);

    // Remove Framer canvas/3D elements that can't be migrated
    WebImporter.DOMUtils.remove(element, [
      'canvas',
    ]);

    // Remove SVG container icons (inline base64 SVG icons used as decorative elements)
    const svgContainers = element.querySelectorAll('.svgContainer');
    svgContainers.forEach((container) => {
      const img = container.querySelector('img[src^="data:image/svg+xml"]');
      if (img) container.remove();
    });

    // Unwrap nested spans that Framer generates (span > span:only-child)
    const nestedSpans = element.querySelectorAll('span.framer-text > span.framer-text:only-child');
    nestedSpans.forEach((span) => {
      const parent = span.parentElement;
      if (parent && parent.children.length === 1) {
        parent.replaceWith(...span.childNodes);
      }
    });
  }

  if (hookName === H.after) {
    // Remove header/navigation (Framer nav bar: .framer-JOz7s)
    WebImporter.DOMUtils.remove(element, [
      '.framer-JOz7s',
      '.framer-kq6m5m-container',
    ]);

    // Remove footer section (RM logo, copyright, legal links at bottom of .framer-7udm7i)
    const footerSection = element.querySelector('section.framer-7udm7i .framer-j6wha7');
    if (footerSection) footerSection.remove();

    // Remove floating bottom bar (sticky CTA bar at bottom)
    WebImporter.DOMUtils.remove(element, [
      '.framer-1r801k',
    ]);

    // Remove SSR variant wrappers (Framer responsive containers)
    const ssrVariants = element.querySelectorAll('.ssr-variant');
    ssrVariants.forEach((variant) => {
      // Move children out of the ssr-variant wrapper
      while (variant.firstChild) {
        variant.parentNode.insertBefore(variant.firstChild, variant);
      }
      variant.remove();
    });

    // Remove empty divs left by Framer layout
    const emptyDivs = element.querySelectorAll('div:empty');
    emptyDivs.forEach((div) => {
      if (!div.querySelector('img') && !div.textContent.trim()) {
        div.remove();
      }
    });

    // Clean up Framer-specific attributes
    element.querySelectorAll('*').forEach((el) => {
      el.removeAttribute('data-framer-appear-id');
      el.removeAttribute('data-framer-name');
      el.removeAttribute('data-framer-component-type');
    });

    // Remove iframes, link elements, noscript
    WebImporter.DOMUtils.remove(element, ['iframe', 'link', 'noscript']);
  }
}
