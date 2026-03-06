/* eslint-disable */
/* global WebImporter */

/**
 * Parser for hero block.
 * Base: hero. Source: https://platinum.madridistas.com/es-es
 * Instances: section#hero, section.framer-1u7uig8 (motivation), section.framer-7udm7i (final CTA)
 *
 * Block library structure (1 column, 3 rows):
 *   Row 1: block name
 *   Row 2: background image (optional)
 *   Row 3: heading + subheading + CTA(s)
 */
export default function parse(element, { document }) {
  // Extract background image - different locations per instance
  // Hero: .framer-iqlr7s img, .framer-e9wnvb-container img (card image)
  // Motivation: .framer-iqqe56 img, .framer-11iws5p img
  // Final CTA: .framer-1wzpk0v img, .framer-1pzqj7p img
  const bgImage = element.querySelector(
    '.framer-iqlr7s img, .framer-11iws5p img, .framer-1pzqj7p img, .framer-iqqe56 img, .framer-1wzpk0v img, .framer-e9wnvb-container img'
  );

  // Extract heading (h1 or h2)
  const heading = element.querySelector('h1, h2');

  // Extract description paragraph
  // Hero: .framer-iubz5q p
  // Motivation: .framer-k3sf6l p
  const description = element.querySelector(
    '.framer-iubz5q p, .framer-k3sf6l p, .framer-styles-preset-1v02pti'
  );

  // Extract CTA links
  // Hero has two CTAs: primary (.framer-7lwcgo-container a) and secondary (.framer-zbrwbu-container a)
  // Final CTA has one: .framer-ziv712-container a
  const ctaLinks = Array.from(element.querySelectorAll('a.framer-PPENh, a.framer-11iys7m'));

  // Build cells matching hero block library structure
  const cells = [];

  // Row 1 (after block name): background image
  if (bgImage) {
    cells.push([bgImage]);
  }

  // Row 2: single content cell with heading, description, and CTAs combined
  const contentWrapper = document.createElement('div');
  if (heading) contentWrapper.append(heading);
  if (description) contentWrapper.append(description);
  ctaLinks.forEach((cta) => {
    const textEl = cta.querySelector('p.framer-text');
    if (textEl) {
      const p = document.createElement('p');
      const link = document.createElement('a');
      link.href = cta.href || '#';
      link.textContent = textEl.textContent.trim();
      p.append(link);
      contentWrapper.append(p);
    }
  });

  if (contentWrapper.children.length > 0) {
    cells.push([contentWrapper]);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero', cells });
  element.replaceWith(block);
}
