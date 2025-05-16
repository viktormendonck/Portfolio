let allProjectTypes = [];

const languageColors = {
  "C#": "#9146ff",
  "Python": "#3572A5",
  "GDScript": "#3572A5",
  "C++": "#f34b7d",
  "Unreal Blueprints": "#a5e1eb",
  "6502 Assembly": "#e28743",
  "html": "#33874b"
};

const toolColors = {
  "Unreal Engine": "#5f739e",
  "Unity": "#176b37",
  "Git": "#f1502f",
  "Blender": "#f5792a",
  "Godot": "#478cbf",
  "CMake": "#064F8C"
};

fetch('projects.json')
  .then(res => res.json())
  .then(data => {
    allProjectTypes = data;
    renderProjectTypes(data);
    setupSidebarFilters();
  })
  .catch(err => console.error("Error loading projects.json:", err));

// Render grouped projects by type (default view)
function renderProjectTypes(projectTypes) {
  const container = document.getElementById('projects-container');
  container.innerHTML = '';

  projectTypes.forEach(typeGroup => {
    const section = document.createElement('section');

    const heading = document.createElement('h2');
    heading.textContent = typeGroup.name;
    section.appendChild(heading);

    if (typeGroup.description) {
      const description = document.createElement('p');
      description.className = 'type-description';
      description.textContent = typeGroup.description;
      section.appendChild(description);
    }

    const group = document.createElement('div');
    group.className = 'project-group';

    typeGroup.projects.sort((a, b) => Number(a.order) - Number(b.order));

    typeGroup.projects.forEach(project => {
      group.appendChild(createProjectCard(project));
    });

    section.appendChild(group);
    container.appendChild(section);
  });
}

// Render flat filtered projects by language OR tool
function renderProjectsByFilter(filterType, filterValue) {
  const container = document.getElementById('projects-container');
  container.innerHTML = '';

  const flatProjects = allProjectTypes.flatMap(group => group.projects);

  let filtered = [];
  if (filterType === 'language') {
    filtered = flatProjects.filter(p => Array.isArray(p.language) && p.language.includes(filterValue));
  } else if (filterType === 'tool') {
    filtered = flatProjects.filter(p => Array.isArray(p.tools) && p.tools.includes(filterValue));
  }

  if (filtered.length === 0) {
    // No projects matched, show default view and clear selection
    clearAllSelectedBadges();
    renderProjectTypes(allProjectTypes);
    return;
  }

  const heading = document.createElement('h2');
  heading.textContent = `Projects filtered by ${filterType}: ${filterValue}`;
  container.appendChild(heading);

  const group = document.createElement('div');
  group.className = 'project-group filtered';

  filtered.sort((a, b) => Number(a.order) - Number(b.order))
          .forEach(project => {
            group.appendChild(createProjectCard(project));
          });

  container.appendChild(group);
}

// Helper to clear all selected badges
function clearAllSelectedBadges() {
  const languageBadges = document.querySelectorAll('.sidebar .sidebar-language.selected');
  const toolBadges = document.querySelectorAll('.sidebar .sidebar-tool.selected');

  languageBadges.forEach(b => b.classList.remove('selected'));
  toolBadges.forEach(b => b.classList.remove('selected'));
}


// Create project card (only first language shown)
function createProjectCard(project) {
  const content = document.createElement('div');
  content.className = 'project';

  let linksHTML = '';
  if (project.link) linksHTML += `<a href="${project.link}" target="_blank">Project</a>`;
  if (project.github) {
    if (linksHTML) linksHTML += ' | ';
    linksHTML += `<a href="${project.github}" target="_blank">Code</a>`;
  }

  const imageHTML = project.image
    ? `<img src="${project.image}" alt="${project.title}">`
    : '';

  let firstLang = (Array.isArray(project.language) && project.language.length > 0) ? project.language[0] : null;

  const languageBadge = firstLang
    ? `<span class="language-badge" style="background-color: ${languageColors[firstLang] || '#666'}">
        ${firstLang}
      </span>`
    : '';

  content.innerHTML = `
    ${imageHTML}
    <h3>${project.title}</h3>
    <div class="meta-line">
      <p><strong>Date:</strong> ${project.Date || "Unknown"}</p>
      ${languageBadge}
    </div>
    <p>${project.description}</p>
    <p>${linksHTML}</p>
  `;

  if (project.page) {
    const linkWrapper = document.createElement('a');
    linkWrapper.href = project.page;
    linkWrapper.style.textDecoration = 'none';
    linkWrapper.style.color = 'inherit';
    linkWrapper.appendChild(content);
    return linkWrapper;
  } else {
    return content;
  }
}

// Setup sidebar filter handlers for language and tool badges
function setupSidebarFilters() {
  const languageBadges = document.querySelectorAll('.sidebar .sidebar-language');
  const toolBadges = document.querySelectorAll('.sidebar .sidebar-tool');

  let currentFilter = { type: null, value: null };

  function clearAllSelected() {
    languageBadges.forEach(b => b.classList.remove('selected'));
    toolBadges.forEach(b => b.classList.remove('selected'));
  }

  function handleBadgeClick(badge, filterType) {
    const filterValue = badge.textContent.trim();

    badge.style.cursor = 'pointer';

    badge.addEventListener('click', () => {
      if (currentFilter.type === filterType && currentFilter.value === filterValue) {
        // toggle off filter
        badge.classList.remove('selected');
        currentFilter = { type: null, value: null };
        renderProjectTypes(allProjectTypes);
      } else {
        // clear previous
        clearAllSelected();
        // select this badge
        badge.classList.add('selected');
        currentFilter = { type: filterType, value: filterValue };
        renderProjectsByFilter(filterType, filterValue);
      }
    });
  }

  languageBadges.forEach(b => handleBadgeClick(b, 'language'));
  toolBadges.forEach(b => handleBadgeClick(b, 'tool'));
}
