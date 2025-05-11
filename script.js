fetch('projects.json')
  .then(res => res.json())
  .then(data => {
    const grouped = groupByType(data);
    renderGroupedProjects(grouped);
  });

function groupByType(projects) {
  const map = {};
  projects.forEach(project => {
    const type = project.type;
    if (!map[type]) map[type] = [];
    map[type].push(project);
  });
  return map;
}

function renderGroupedProjects(groupedProjects) {
  const container = document.getElementById('projects-container');
  container.innerHTML = '';

  Object.keys(groupedProjects).forEach(type => {
    const section = document.createElement('section');

    const heading = document.createElement('h2');
    heading.textContent = capitalize(type);
    section.appendChild(heading);

    const group = document.createElement('div');
    group.className = 'project-group';

    groupedProjects[type].forEach(project => {
      const div = document.createElement('div');
      div.className = 'project';
      div.innerHTML = `
        <img src="${project.image}" alt="${project.title}">
        <h3>${project.title}</h3>
        <p>${project.description}</p>
        <p>
          <a href="${project.link}" target="_blank">Live Project</a> |
          <a href="${project.github}" target="_blank">GitHub</a>
        </p>
      `;
      group.appendChild(div);
    });

    section.appendChild(group);
    container.appendChild(section);
  });
}

function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

