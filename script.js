let allProjectTypes = [];
let activeFilter = null;

const languageColors = {
  "C#": "#9146ff", "Python": "#3572A5", "GDScript": "#3572A5",
  "C++": "#f34b7d", "Unreal Blueprints": "#a5e1eb",
  "6502 Assembly": "#e28743", "html": "#33874b", "CSS": "#1572b6", "JS": "#f0db4f"
};

const toolColors = {
  "Unreal Engine": "#5f739e", "Unity": "#176b37", "Git": "#f1502f",
  "Blender": "#f5792a", "Godot": "#478cbf", "CMake": "#064F8C",
  "Meta XR": "#0082FB", "Perforce": "#4b66a8"
};

const page = document.body.dataset.page;
setupNavigation();
document.getElementById('year')?.replaceChildren(String(new Date().getFullYear()));

if (page === 'home' || page === 'projects') {
  loadProjects();
}

async function loadProjects() {
  try {
    // projects-data.js mirrors projects.json so the portfolio also works when
    // index.html is opened directly from disk. projects.json remains the source
    // used by the site when hosted through a web server.
    if (Array.isArray(window.PORTFOLIO_PROJECTS)) {
      initialiseProjects(window.PORTFOLIO_PROJECTS);
      return;
    }

    const response = await fetch('projects.json');
    if (!response.ok) throw new Error(`Could not load projects.json (${response.status})`);
    initialiseProjects(await response.json());
  } catch (error) {
    console.error(error);
    const target = document.getElementById('featured-projects') || document.getElementById('projects-container');
    if (target) target.innerHTML = '<p class="load-error">Projects could not be loaded.</p>';
  }
}

function initialiseProjects(data) {
  allProjectTypes = data;
  if (page === 'home') renderFeaturedProjects();
  if (page === 'projects') {
    buildFilters();
    renderProjectTypes(allProjectTypes);
  }
}

function setupNavigation() {
  const button = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.site-nav');
  if (!button || !nav) return;
  button.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    button.setAttribute('aria-expanded', String(open));
  });
}

function flattenProjects() {
  return allProjectTypes.flatMap(group => group.projects.map(project => ({ ...project, category: group.name })));
}

function renderFeaturedProjects() {
  const container = document.getElementById('featured-projects');
  const favorites = flattenProjects()
    .filter(project => project.favorite)
    .sort((a, b) => Number(a.order) - Number(b.order))
    .slice(0, 4);

  container.replaceChildren(...favorites.map((project, index) => createProjectCard(project, index === 0 ? 'featured-large' : '')));
}

function renderProjectTypes(groups) {
  const container = document.getElementById('projects-container');
  container.innerHTML = '';

  groups.forEach(groupData => {
    const visibleProjects = groupData.projects
      .filter(matchesActiveFilter)
      .sort((a, b) => Number(a.order) - Number(b.order));
    if (!visibleProjects.length) return;

    const section = document.createElement('section');
    section.className = 'project-section';
    section.innerHTML = `<div class="section-heading"><div><h2>${escapeHtml(groupData.name)}</h2>${groupData.description ? `<p>${escapeHtml(groupData.description)}</p>` : ''}</div><span class="project-count">${visibleProjects.length}</span></div>`;

    const grid = document.createElement('div');
    grid.className = 'project-grid';
    visibleProjects.forEach(project => grid.appendChild(createProjectCard({ ...project, category: groupData.name })));
    section.appendChild(grid);
    container.appendChild(section);
  });

  if (!container.children.length) container.innerHTML = '<div class="empty-results"><h2>No projects found</h2><p>Try a different filter.</p></div>';
}

function matchesActiveFilter(project) {
  if (!activeFilter) return true;
  const values = activeFilter.type === 'language' ? project.language : project.tools;
  return Array.isArray(values) && values.includes(activeFilter.value);
}

function createProjectCard(project, extraClass = '') {
  const card = document.createElement(project.page ? 'a' : 'article');
  card.className = `project-card ${extraClass}`.trim();
  if (project.page) card.href = project.page;

  const language = Array.isArray(project.language) ? project.language[0] : null;
  const image = project.image ? `<div class="project-image"><img src="${escapeAttribute(project.image)}" alt="${escapeAttribute(project.title)}" loading="lazy"></div>` : '';

  card.innerHTML = `
    ${image}
    <div class="project-card-body">
      <div class="project-kicker"><span>${escapeHtml(project.category || '')}</span><span>${escapeHtml(project.Date || '')}</span></div>
      <h3>${escapeHtml(project.title)}</h3>
      <p>${escapeHtml(project.description || '')}</p>
      <div class="project-card-footer">
        ${language ? `<span class="tech-pill" style="--pill-color:${languageColors[language] || '#777'}">${escapeHtml(language)}</span>` : '<span></span>'}
        ${project.page ? '<span class="open-project">View project <i class="fa-solid fa-arrow-right"></i></span>' : ''}
      </div>
    </div>`;
  return card;
}

function buildFilters() {
  const languages = new Set();
  const tools = new Set();
  flattenProjects().forEach(project => {
    project.language?.forEach(item => languages.add(item));
    project.tools?.forEach(item => tools.add(item));
  });

  populateFilterList('language-filters', [...languages].sort(), 'language', languageColors);
  populateFilterList('tool-filters', [...tools].sort(), 'tool', toolColors);

  document.getElementById('clear-filters').addEventListener('click', clearFilter);
}

function populateFilterList(containerId, values, type, colors) {
  const container = document.getElementById(containerId);
  values.forEach(value => {
    const button = document.createElement('button');
    button.className = 'filter-chip';
    button.type = 'button';
    button.textContent = value;
    button.style.setProperty('--chip-color', colors[value] || '#777');
    button.addEventListener('click', () => setFilter(type, value, button));
    container.appendChild(button);
  });
}

function setFilter(type, value, button) {
  const same = activeFilter?.type === type && activeFilter?.value === value;
  document.querySelectorAll('.filter-chip').forEach(chip => chip.classList.remove('selected'));
  activeFilter = same ? null : { type, value };
  if (!same) button.classList.add('selected');
  document.getElementById('clear-filters').classList.toggle('visible', Boolean(activeFilter));
  renderProjectTypes(allProjectTypes);
}

function clearFilter() {
  activeFilter = null;
  document.querySelectorAll('.filter-chip').forEach(chip => chip.classList.remove('selected'));
  document.getElementById('clear-filters').classList.remove('visible');
  renderProjectTypes(allProjectTypes);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);
}
function escapeAttribute(value) { return escapeHtml(value); }
