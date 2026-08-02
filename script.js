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
  "CMake": "#064F8C",
  "Meta XR": "#0082FB"
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

  // --- Render Favorites First ---
  const flatProjects = projectTypes.flatMap(group => group.projects);
  const favorites = flatProjects.filter(p => p.favorite);

  if (favorites.length > 0) {
    const favSection = document.createElement('section');
    const favHeading = document.createElement('h2');
    favHeading.textContent = "Featured Projects";
    favSection.appendChild(favHeading);

    const favGroup = document.createElement('div');
    favGroup.className = 'project-group';

    favorites
      .sort((a, b) => Number(a.order) - Number(b.order))
      .forEach(project => {
        favGroup.appendChild(createProjectCard(project));
      });

    favSection.appendChild(favGroup);
    container.appendChild(favSection);
  }

  // --- Then render grouped by category ---
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

    typeGroup.projects
      .sort((a, b) => Number(a.order) - Number(b.order))
      .forEach(project => {
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
    filtered = flatProjects.filter(project =>
      Array.isArray(project.language) &&
      project.language.includes(filterValue)
    );
  } else if (filterType === 'tool') {
    filtered = flatProjects.filter(project =>
      Array.isArray(project.tools) &&
      project.tools.includes(filterValue)
    );
  }

  if (filtered.length === 0) {
    clearAllSelectedBadges();
    renderProjectTypes(allProjectTypes);
    return;
  }

  const heading = document.createElement('h2');

  if (filterType === "tool") {
    heading.textContent = `Projects Made With ${filterValue}`;
  } else {
    heading.textContent = `Projects Made In ${filterValue}`;
  }

  container.appendChild(heading);

  const group = document.createElement('div');
  group.className = 'project-group filtered';

  filtered
    .sort((a, b) => Number(a.order) - Number(b.order))
    .forEach(project => {
      group.appendChild(createProjectCard(project));
    });

  container.appendChild(group);
}

// Helper to clear all selected badges
function clearAllSelectedBadges() {
  const languageBadges = document.querySelectorAll(
    '.sidebar .sidebar-language.selected'
  );

  const toolBadges = document.querySelectorAll(
    '.sidebar .sidebar-tool.selected'
  );

  languageBadges.forEach(badge => {
    badge.classList.remove('selected');
  });

  toolBadges.forEach(badge => {
    badge.classList.remove('selected');
  });
}

// Create project card (only first language shown)
function createProjectCard(project) {
  const content = document.createElement('div');
  content.className = 'project';

  const projectLinks = Array.isArray(project.link)
    ? project.link.filter(Boolean)
    : [];

  const renderedLinks = projectLinks
    .map((link, index) => {
      const url = typeof link === 'string'
        ? link
        : link.url;

      const label = typeof link === 'string'
        ? (
            projectLinks.length === 1
              ? 'Project'
              : `Project ${index + 1}`
          )
        : (
            link.label ||
            (
              projectLinks.length === 1
                ? 'Project'
                : `Project ${index + 1}`
            )
          );

      if (!url) {
        return '';
      }

      return `<a href="${url}" target="_blank">${label}</a>`;
    })
    .filter(Boolean);

  if (project.github) {
    renderedLinks.push(
      `<a href="${project.github}" target="_blank">Code</a>`
    );
  }

  const linksHTML = renderedLinks.join(' | ');

  const imageHTML = project.image
    ? `<img src="${project.image}" alt="${project.title}">`
    : '';

  const firstLang =
    Array.isArray(project.language) &&
    project.language.length > 0
      ? project.language[0]
      : null;

  const languageBadge = firstLang
    ? `
      <span
        class="language-badge"
        style="background-color: ${languageColors[firstLang] || '#666'}"
      >
        ${firstLang}
      </span>
    `
    : '';

  content.innerHTML = `
    ${imageHTML}
    <h3>${project.title}</h3>

    <div class="meta-line">
      <p>
        <strong>Date:</strong>
        ${project.Date || "Unknown"}
      </p>

      ${languageBadge}
    </div>

    <p>${project.description}</p>

    ${linksHTML ? `<p>${linksHTML}</p>` : ''}
  `;

  if (project.page) {
    const linkWrapper = document.createElement('a');

    linkWrapper.href = project.page;
    linkWrapper.style.textDecoration = 'none';
    linkWrapper.style.color = 'inherit';

    linkWrapper.appendChild(content);

    return linkWrapper;
  }

  return content;
}

// Setup sidebar filter handlers for language and tool badges
function setupSidebarFilters() {
  const languageBadges = document.querySelectorAll(
    '.sidebar .sidebar-language'
  );

  const toolBadges = document.querySelectorAll(
    '.sidebar .sidebar-tool'
  );

  let currentFilter = {
    type: null,
    value: null
  };

  // Determine used languages/tools from project data
  const usedLanguages = new Set();
  const usedTools = new Set();

  allProjectTypes.forEach(group => {
    group.projects.forEach(project => {
      if (Array.isArray(project.language)) {
        project.language.forEach(language => {
          usedLanguages.add(language);
        });
      }

      if (Array.isArray(project.tools)) {
        project.tools.forEach(tool => {
          usedTools.add(tool);
        });
      }
    });
  });

  // Clear selection styling
  function clearAllSelected() {
    languageBadges.forEach(badge => {
      badge.classList.remove('selected');
    });

    toolBadges.forEach(badge => {
      badge.classList.remove('selected');
    });
  }

  // Badge click handler
  function handleBadgeClick(badge, filterType) {
    const filterValue = badge.textContent.trim();

    badge.addEventListener('click', () => {
      const sameFilterSelected =
        currentFilter.type === filterType &&
        currentFilter.value === filterValue;

      if (sameFilterSelected) {
        badge.classList.remove('selected');

        currentFilter = {
          type: null,
          value: null
        };

        renderProjectTypes(allProjectTypes);
      } else {
        clearAllSelected();

        badge.classList.add('selected');

        currentFilter = {
          type: filterType,
          value: filterValue
        };

        renderProjectsByFilter(filterType, filterValue);
      }
    });
  }

  // Set up language badge interactivity
  languageBadges.forEach(badge => {
    const language = badge.textContent.trim();

    if (!usedLanguages.has(language)) {
      badge.style.pointerEvents = 'none';
      badge.style.cursor = 'default';
    } else {
      badge.style.cursor = 'pointer';
      handleBadgeClick(badge, 'language');
    }
  });

  // Set up tool badge interactivity
  toolBadges.forEach(badge => {
    const tool = badge.textContent.trim();

    if (!usedTools.has(tool)) {
      badge.style.pointerEvents = 'none';
      badge.style.cursor = 'default';
    } else {
      badge.style.cursor = 'pointer';
      handleBadgeClick(badge, 'tool');
    }
  });
}