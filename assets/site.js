// Every page works from local files as well as a static web host.
document.documentElement.classList.add('js');
const button = document.querySelector('.menu');
const navigation = document.querySelector('#navigation');
const closeMenu = () => {
  button.setAttribute('aria-expanded', 'false');
  button.textContent = 'Menu +';
  navigation.classList.remove('open');
};
button.addEventListener('click', () => {
  const open = button.getAttribute('aria-expanded') !== 'true';
  button.setAttribute('aria-expanded', String(open));
  button.textContent = open ? 'Close −' : 'Menu +';
  navigation.classList.toggle('open', open);
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && button.getAttribute('aria-expanded') === 'true') {
    closeMenu();
    button.focus();
  }
});
navigation.addEventListener('click', event => {
  if (event.target.closest('a')) closeMenu();
});
const desktop = window.matchMedia('(min-width: 901px)');
desktop.addEventListener('change', event => { if (event.matches) closeMenu(); });

const search = document.querySelector('#publication-query');
if (search) {
  const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const entries = [...document.querySelectorAll('.publication')].map(element => ({
    element, text: normalize(element.textContent + ' ' + element.closest('.publication-year').dataset.year)
  }));
  const groups = [...document.querySelectorAll('.publication-year')];
  const status = document.querySelector('#publication-status');
  const empty = document.querySelector('#publication-empty');
  const update = () => {
    const terms = normalize(search.value).trim().split(/\s+/).filter(Boolean);
    let count = 0;
    entries.forEach(({element, text}) => {
      element.hidden = !terms.every(term => text.includes(term));
      if (!element.hidden) count++;
    });
    groups.forEach(group => {
      group.hidden = !group.querySelector('.publication:not([hidden])');
      const link = document.querySelector('.section-index a[href="#' + group.id + '"]');
      if (link) link.hidden = group.hidden;
    });
    status.textContent = terms.length
      ? count + ' of ' + entries.length + ' publications match your search.'
      : entries.length + ' publications · Search by title, author, journal, or year.';
    empty.hidden = count !== 0;
  };
  search.addEventListener('input', update);
  search.addEventListener('search', update);
  update();
}


// Keep full-size image links usable when the modal viewer is unavailable.
const coverViewer = document.querySelector('#cover-viewer');
if (coverViewer && typeof coverViewer.showModal === 'function') {
  const coverImage = document.querySelector('#cover-viewer-image');
  const coverTitle = document.querySelector('#cover-viewer-title');
  const coverPaper = document.querySelector('#cover-viewer-paper');
  let coverOpener = null;
  coverViewer.hidden = false;
  document.querySelectorAll('.cover-link').forEach(link => {
    link.addEventListener('click', event => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      if (coverViewer.open) return;
      coverOpener = link;
      coverImage.src = link.href;
      coverImage.alt = link.querySelector('img').alt;
      coverTitle.textContent = link.closest('.publication').querySelector('b').textContent;
      coverPaper.href = link.dataset.paperUrl;
      coverViewer.showModal();
      document.documentElement.classList.add('cover-viewer-open');
    });
  });
  coverViewer.querySelector('.cover-viewer-close').addEventListener('click', () => coverViewer.close());
  coverViewer.addEventListener('click', event => {
    if (event.target !== coverViewer) return;
    const bounds = coverViewer.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) coverViewer.close();
  });
  coverViewer.addEventListener('close', () => {
    document.documentElement.classList.remove('cover-viewer-open');
    if (coverOpener && coverOpener.isConnected) coverOpener.focus();
  });
}
