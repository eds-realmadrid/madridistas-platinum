import { loadFragment } from '../fragment/fragment.js';

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const locales = ['en-us', 'es-es'];
  const locale = locales.find((l) => window.location.pathname.includes(l)) || 'es-es';
  const fragment = await loadFragment(`/${locale}/footer`);

  // decorate footer DOM
  block.textContent = '';
  const footer = document.createElement('div');
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  block.append(footer);
}
