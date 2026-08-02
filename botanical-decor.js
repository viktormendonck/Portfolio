(() => {
  const leafFiles = [
    'leaf1.svg',
    'leaf2.svg',
    'leaf3.svg',
    'leaf4.svg',
    'leaf5.svg',
    'leaf6.svg'
  ];

  const accentFiles = [
    'Accent1.svg',
    'Accent2.svg',
    'StraightUp.svg',
    'BigDiagonal.svg'
  ];

  const random = (min, max) => min + Math.random() * (max - min);
  const pick = array => array[Math.floor(Math.random() * array.length)];

  function createOrnament(assetRoot, kind) {
    const ornament = document.createElement('img');
    const isLeaf = kind === 'leaf';

    ornament.src = assetRoot + pick(isLeaf ? leafFiles : accentFiles);
    ornament.alt = '';
    ornament.setAttribute('aria-hidden', 'true');
    ornament.draggable = false;
    ornament.className = `botanical-background__ornament botanical-background__ornament--${kind}`;

    // Keep most decorations near the outer edges so the reading area stays clear.
    const side = Math.random() < 0.5 ? 'left' : 'right';
    const mayEnterContent = Math.random() < (isLeaf ? 0.28 : 0.12);
    const horizontalPosition = mayEnterContent ? random(3, 20) : random(-5, 9);
    ornament.style[side] = `${horizontalPosition}%`;

    // The layer is fixed to the viewport, so percentages can never lengthen the page.
    ornament.style.top = `${random(-8, 96)}%`;

    const size = isLeaf ? random(34, 155) : random(90, 245);
    ornament.style.width = `${size}px`;
    ornament.style.opacity = `${isLeaf ? random(0.045, 0.145) : random(0.022, 0.07)}`;

    const rotation = random(-180, 180);
    const mirrorX = Math.random() < 0.5 ? -1 : 1;
    const mirrorY = Math.random() < 0.16 ? -1 : 1;
    ornament.style.transform = `rotate(${rotation}deg) scale(${mirrorX}, ${mirrorY})`;

    if (Math.random() < 0.12) {
      ornament.style.filter = `blur(${random(0.2, 0.65)}px)`;
    }

    return ornament;
  }

  function createBotanicalBackground() {
    document.querySelector('.botanical-background')?.remove();

    const onProjectPage = location.pathname.includes('/project-pages/');
    const isHomePage = !onProjectPage && (
      location.pathname.endsWith('/') ||
      location.pathname.endsWith('/index.html') ||
      !location.pathname.split('/').pop().includes('.')
    );
    const assetRoot = onProjectPage ? '../assets/decor/' : 'assets/decor/';

    const layer = document.createElement('div');
    layer.className = 'botanical-background';
    layer.setAttribute('aria-hidden', 'true');

    // Scale density with viewport area rather than document height. This keeps the
    // result varied without creating elements below the real end of the page.
    const viewportArea = window.innerWidth * window.innerHeight;
    const areaFactor = Math.max(0, Math.min(10, viewportArea / 180000));

    const leafCount = isHomePage
      ? Math.round(random(28, 38) + areaFactor)
      : Math.round(random(16, 24) + areaFactor * 0.55);

    const accentCount = isHomePage
      ? Math.round(random(5, 8))
      : Math.round(random(2, 4));

    for (let index = 0; index < leafCount; index += 1) {
      layer.appendChild(createOrnament(assetRoot, 'leaf'));
    }

    for (let index = 0; index < accentCount; index += 1) {
      layer.appendChild(createOrnament(assetRoot, 'accent'));
    }

    document.body.prepend(layer);
  }

  let resizeTimer;
  const queueRebuild = () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(createBotanicalBackground, 180);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createBotanicalBackground, { once: true });
  } else {
    createBotanicalBackground();
  }

  window.addEventListener('resize', queueRebuild);
})();
