fetch('projects.json')
  .then(res => res.json())
  .then(data => {
    const grouped = groupByType(data);
    renderGroupedProjects(grouped);
  })
  .catch(err => console.error("Error loading projects.json:", err));

function groupByType(projects) {
  const map = {};
  projects.forEach(project => {
    const type = project.type;
    if (!map[type]) map[type] = [];
    map[type].push(project);
  });

  // Sort each group by the "order" field (converted to Number)
  Object.keys(map).forEach(type => {
    map[type].sort((a, b) => Number(a.order) - Number(b.order));
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

      // Only include links if they are non-empty
      let linksHTML = '';
      if (project.link) {
        linksHTML += `<a href="${project.link}" target="_blank">Live Project</a>`;
      }
      if (project.github) {
        if (linksHTML) linksHTML += ' | ';
        linksHTML += `<a href="${project.github}" target="_blank">GitHub</a>`;
      }

      div.innerHTML = `
        <img src="${project.image}" alt="${project.title}">
        <h3>${project.title}</h3>
        <p><strong>Date:</strong> ${project.Date || "Unknown"}</p>
        <p>${project.description}</p>
        <p>${linksHTML}</p>
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
