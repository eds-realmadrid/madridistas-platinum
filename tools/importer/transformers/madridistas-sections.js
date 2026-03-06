/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: madridistas sections.
 * Adds section breaks (<hr>) and section-metadata blocks from template sections.
 * Runs in afterTransform only. Uses payload.template.sections.
 * Selectors from captured DOM (migration-work/cleaned.html).
 */
const H = { before: 'beforeTransform', after: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === H.after) {
    const { template } = payload;
    if (!template || !template.sections || template.sections.length < 2) return;

    const { document } = element.ownerDocument ? { document: element.ownerDocument } : { document: element.getRootNode() };

    // Process sections in reverse order to avoid position shifts
    const sections = [...template.sections].reverse();

    sections.forEach((section) => {
      // Find the first element matching the section selector
      const selectorStr = Array.isArray(section.selector) ? section.selector.join(', ') : section.selector;
      const sectionEl = element.querySelector(selectorStr);
      if (!sectionEl) return;

      // Add section-metadata block if section has a style
      if (section.style) {
        const sectionMetadata = WebImporter.Blocks.createBlock(document, {
          name: 'Section Metadata',
          cells: { style: section.style },
        });
        sectionEl.after(sectionMetadata);
      }

      // Add <hr> before section (except the first one)
      const isFirstSection = section.id === template.sections[0].id;
      if (!isFirstSection) {
        const hr = document.createElement('hr');
        sectionEl.before(hr);
      }
    });
  }
}
