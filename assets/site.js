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
