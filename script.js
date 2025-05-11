let projects = [];

fetch('projects.json')
  .then(res => res.json())
  .then(data => {
    projects = data;
    createFilterButtons(projects);
    renderProjects(projects);
  });

function createFilterButtons(data) {
  const container = document.getElementById('filter-buttons');
  const types = [...new Set(data.map(p => p.type))];

  // Include 'all' at the top
  ['all', ...types].forEach(type => {
    const btn = document.createElement('button');
    btn.textContent = capitalize(type);
    btn.className = 'filter-btn';
    btn.dataset.type = type;
    container.appendChild(btn);
  });

  container.addEventListener('click', (e) => {
    if (e.target.classList.contains('filter-btn')) {
      const type = e.target.dataset.type;
      document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
      e.target.classList.add('active');
      const filtered = type === 'all' ? projects : projects.filter(p => p.type === type);
      renderProjects(filtered);
    }
  });

  // Set default active
  container.querySelector('[data-type="all"]').classList.add('active');
}

function renderProjects(data) {
  const container = document.getElementById('projects-container');
  container.innerHTML = '';
  data.forEach(project => {
    const div = document.createElement('div');
    div.className = 'project';
    div.innerHTML = `
      <img src="${project.image}" alt="${project.title}">
      <h2>${project.title}</h2>
      <p>${project.description}</p>
      <p>
        <a href="${project.link}" target="_blank">Live Project</a> |
        <a href="${project.github}" target="_blank">GitHub</a>
      </p>
    `;
    container.appendChild(div);
  });
}

function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

