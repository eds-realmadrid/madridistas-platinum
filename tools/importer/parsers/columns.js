/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns block.
 * Base: columns. Source: https://platinum.madridistas.com/es-es
 * Instances:
 *   1. Details section#aldetalle-2 .framer-1d1thws (3 numbered features with text+image)
 *   2. RM Play section.framer-k3mkbh .framer-34b08d (text + large screenshot)
 *   3. Wallet section.framer-1d2aruc .framer-1rz9e0p (heading + items + phone mockup)
 *   4. Welcome Pack section.framer-1askbkw .framer-1wv5k5o (product image + text + items)
 *
 * Block library structure (multiple columns, multiple rows):
 *   Row 1: block name
 *   Each subsequent row: [col1 content] | [col2 content]
 */
export default function parse(element, { document }) {
  const cells = [];

  // Detect which instance based on parent section or element classes
  const parentSection = element.closest('section');
  const sectionId = parentSection ? parentSection.id : '';
  const sectionClass = parentSection ? parentSection.className : '';

  if (sectionId === 'aldetalle-2' || element.classList.contains('framer-1d1thws')) {
    // Details: 3 numbered feature rows
    // Each feature has: number (01/02/03), h3 title, description paragraph, and image
    // Row 1: .framer-15t9bnw (text left, image right)
    // Row 2: .framer-r73wlt (image left, text right)
    // Row 3: .framer-7eklff (text left, image right)

    // Feature 1: text + image
    const f1Text = element.querySelector('.framer-1p1fmhh');
    const f1Img = element.querySelector('.framer-12u8gys img[src*="framerusercontent"]');
    if (f1Text || f1Img) {
      const textCell = document.createElement('div');
      const num1 = f1Text ? f1Text.querySelector('.framer-l3ingd p, .framer-1j8oqln p') : null;
      const title1 = f1Text ? f1Text.querySelector('h3') : null;
      const desc1 = f1Text ? f1Text.querySelector('.framer-14eb6kd p') : null;
      if (num1) { const p = document.createElement('p'); p.textContent = num1.textContent.trim(); textCell.append(p); }
      if (title1) { const h = document.createElement('h3'); h.textContent = title1.textContent.trim(); textCell.append(h); }
      if (desc1) { const p = document.createElement('p'); p.textContent = desc1.textContent.trim(); textCell.append(p); }
      cells.push([textCell, f1Img || '']);
    }

    // Feature 2: image + text (reversed layout)
    const f2Img = element.querySelector('.framer-c3ck3j img[src*="framerusercontent"]');
    const f2Text = element.querySelector('.framer-csr0fo');
    if (f2Text || f2Img) {
      const textCell = document.createElement('div');
      const num2 = f2Text ? f2Text.querySelector('.framer-1elm9rt p') : null;
      const title2 = f2Text ? f2Text.querySelector('h3') : null;
      const desc2 = f2Text ? f2Text.querySelector('.framer-18zzkq8 p') : null;
      if (num2) { const p = document.createElement('p'); p.textContent = num2.textContent.trim(); textCell.append(p); }
      if (title2) { const h = document.createElement('h3'); h.textContent = title2.textContent.trim(); textCell.append(h); }
      if (desc2) { const p = document.createElement('p'); p.textContent = desc2.textContent.trim(); textCell.append(p); }
      cells.push([f2Img || '', textCell]);
    }

    // Feature 3: text + image
    const f3Text = element.querySelector('.framer-dvkn6v');
    const f3Img = element.querySelector('.framer-1w16giz img[src*="framerusercontent"]');
    if (f3Text || f3Img) {
      const textCell = document.createElement('div');
      const num3 = f3Text ? f3Text.querySelector('.framer-1omhld4 p') : null;
      const title3 = f3Text ? f3Text.querySelector('h3') : null;
      const desc3 = f3Text ? f3Text.querySelector('.framer-2wb6lu p') : null;
      if (num3) { const p = document.createElement('p'); p.textContent = num3.textContent.trim(); textCell.append(p); }
      if (title3) { const h = document.createElement('h3'); h.textContent = title3.textContent.trim(); textCell.append(h); }
      if (desc3) { const p = document.createElement('p'); p.textContent = desc3.textContent.trim(); textCell.append(p); }
      cells.push([textCell, f3Img || '']);
    }
  } else if (sectionClass.includes('framer-k3mkbh')) {
    // RM Play: text column + image column
    const textDiv = document.createElement('div');
    const heading = element.querySelector('h2');
    const descP = element.querySelector('.framer-14953tw p, .framer-styles-preset-1v02pti');
    if (heading) { const h = document.createElement('h2'); h.textContent = heading.textContent.trim(); textDiv.append(h); }
    if (descP) { const p = document.createElement('p'); p.innerHTML = descP.innerHTML; textDiv.append(p); }

    const img = element.querySelector('.framer-1h74x05 img[src*="framerusercontent"]');
    cells.push([textDiv, img || '']);
  } else if (sectionClass.includes('framer-1d2aruc')) {
    // Wallet: heading + icon items | phone mockup image
    const textDiv = document.createElement('div');
    const heading = element.querySelector('h3');
    if (heading) { const h = document.createElement('h3'); h.textContent = heading.textContent.trim(); textDiv.append(h); }

    // Two text items with descriptions
    const item1 = element.querySelector('.framer-3oj08a p, .framer-1l27fxg > div:first-child .framer-styles-preset-1v02pti');
    const item2 = element.querySelector('.framer-1xx5pi8 p, .framer-1bpqyxo .framer-styles-preset-1v02pti');
    const ul = document.createElement('ul');
    if (item1) { const li = document.createElement('li'); li.textContent = item1.textContent.trim(); ul.append(li); }
    if (item2) { const li = document.createElement('li'); li.textContent = item2.textContent.trim(); ul.append(li); }
    if (ul.children.length > 0) textDiv.append(ul);

    // Phone mockup image - in .framer-hlr24b or .framer-1ljl9av container
    const img = element.querySelector('.framer-hlr24b img, .framer-1ljl9av img, img[src*="framerusercontent"]');
    cells.push([textDiv, img || '']);
  } else if (sectionClass.includes('framer-1askbkw')) {
    // Welcome Pack: product image | text with heading, description, and feature list
    const img = element.querySelector('.framer-1o64qoj img[src*="framerusercontent"]');

    const textDiv = document.createElement('div');
    const heading = element.querySelector('h2');
    const desc = element.querySelector('.framer-1paap1t p');
    if (heading) { const h = document.createElement('h2'); h.textContent = heading.textContent.trim(); textDiv.append(h); }
    if (desc) { const p = document.createElement('p'); p.textContent = desc.textContent.trim(); textDiv.append(p); }

    // Four feature items
    const itemTexts = [
      element.querySelector('.framer-171pylg p'),
      element.querySelector('.framer-kelice p'),
      element.querySelector('.framer-1g4fsl5 p'),
      element.querySelector('.framer-ozyzox p'),
    ].filter(Boolean);

    if (itemTexts.length > 0) {
      const ul = document.createElement('ul');
      itemTexts.forEach((t) => {
        const li = document.createElement('li');
        li.textContent = t.textContent.trim();
        ul.append(li);
      });
      textDiv.append(ul);
    }

    cells.push([img || '', textDiv]);
  } else {
    // Fallback: generic 2-column extraction
    const allImages = Array.from(element.querySelectorAll('img[src*="framerusercontent"]'));
    const allText = Array.from(element.querySelectorAll('h2, h3, p.framer-styles-preset-1v02pti'));
    const textDiv = document.createElement('div');
    allText.forEach((el) => textDiv.append(el.cloneNode(true)));
    const img = allImages.length > 0 ? allImages[0] : '';
    cells.push([textDiv, img]);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns', cells });
  element.replaceWith(block);
}
