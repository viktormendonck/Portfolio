fetch('projects.json')
  .then(response => response.json())
  .then(data => {
    const container = document.getElementById('projects-container');
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
  });
