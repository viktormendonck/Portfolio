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

const languageColors = {
  "C#": "#9146ff",
  "Python": "#3572A5",
  "GDScript": "#3572A5",
  "C++": "#f34b7d",
  "Unreal Blueprints": "#a5e1eb",
  "6502 Assembly": "#e28743",
  "html":"#33874b"
};

function renderGroupedProjects(groupedProjects) {
  const container = document.getElementById('projects-container');
  container.innerHTML = '';

  Object.keys(groupedProjects).forEach(type => {
    const section = document.createElement('section');

    const heading = document.createElement('h2');
    heading.textContent = capitalize(type);
    section.appendChild(heading);

    const firstProject = groupedProjects[type][0];
    if (firstProject.typeDescription) {
      const description = document.createElement('p');
      description.className = 'type-description';
      description.textContent = firstProject.typeDescription;
      section.appendChild(description);
    }

    const group = document.createElement('div');
    group.className = 'project-group';

    groupedProjects[type].forEach(project => {
      const content = document.createElement('div');
      content.className = 'project';

      let linksHTML = '';
      if (project.link) {
        linksHTML += `<a href="${project.link}" target="_blank">Project</a>`;
      }
      if (project.github) {
        if (linksHTML) linksHTML += ' | ';
        linksHTML += `<a href="${project.github}" target="_blank">Code</a>`;
      }

      const imageHTML = project.image
        ? `<img src="${project.image}" alt="${project.title}">`
        : '';

      const languageBadge = project.language ? `
        <span class="language-badge" style="background-color: ${languageColors[project.language] || '#666'}">
          ${project.language}
        </span>` : '';

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
        group.appendChild(linkWrapper);
      } else {
        group.appendChild(content);
      }
    });

    section.appendChild(group);
    container.appendChild(section);
  });
}


function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}
