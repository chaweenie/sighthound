const nodes = [
  {
    id: 'home',
    label: 'SiteHound',
    type: 'center',
    description: 'Professional contracting for residential and commercial spaces, with a focus on trust, quality, and calm communication.',
    image: 'images/about_me/aboutme_01.jpg',
    related: ['Services', 'Portfolio', 'Contact', 'Request a Quote', 'Service Areas', 'Credentials / Licensing']
  },
  { id: 'Services', label: 'Services', type: 'primary', description: 'Tailored contracting services from renovation planning to carpentry, finishing, and aftercare.', image: '', related: ['Portfolio', 'Request a Quote', 'Process Workflow'] },
  { id: 'Portfolio', label: 'Portfolio', type: 'primary', description: 'A gallery of finished projects that balances strong execution, clean design, and practical durability.', image: '', related: ['Services', 'Materials', 'Project Types'] },
  { id: 'Contact', label: 'Contact', type: 'primary', description: 'Reach out for an initial discussion, timeline review, or a sample scope of work.', image: '', related: ['Request a Quote', 'Service Areas'] },
  { id: 'Request a Quote', label: 'Request a Quote', type: 'primary', description: 'Start your project with a clear scope, transparent pricing, and thoughtful next steps.', image: '', related: ['Services', 'Contact'] },
  { id: 'Service Areas', label: 'Service Areas', type: 'primary', description: 'Serving local neighborhoods and nearby regions for both residential renovation and small commercial projects.', image: '', related: ['Safety Standards', 'Project Types'] },
  { id: 'Credentials / Licensing', label: 'Credentials / Licensing', type: 'primary', description: 'Licensed, insured, and committed to best practices in construction standards and compliance.', image: '', related: ['Safety Standards', 'Building Science Concepts'] },
  { id: 'Materials', label: 'Materials', type: 'secondary', description: 'Durable finishes, efficient assemblies, and reliable fixtures chosen for performance and longevity.', image: '', related: ['Techniques', 'Building Science Concepts'] },
  { id: 'Techniques', label: 'Techniques', type: 'secondary', description: 'Careful installation practices, clean sequencing, and disciplined site management for consistent results.', image: '', related: ['Process Workflow', 'Safety Standards'] },
  { id: 'Project Types', label: 'Project Types', type: 'secondary', description: 'Renovation, repair, custom builds, exterior updates, and interior improvements tailored to client goals.', image: '', related: ['Portfolio', 'Materials'] },
  { id: 'Building Science Concepts', label: 'Building Science Concepts', type: 'secondary', description: 'Systems-focused thinking that improves durability, comfort, and energy performance.', image: '', related: ['Service Areas', 'Materials'] },
  { id: 'Safety Standards', label: 'Safety Standards', type: 'secondary', description: 'Clear protocols and code compliance that protect people, property, and long-term value.', image: '', related: ['Credentials / Licensing', 'Process Workflow'] },
  { id: 'FAQs', label: 'FAQs', type: 'secondary', description: 'Common questions answered about timeline, payment, project scope, and coordination.', image: '', related: ['Contact', 'Request a Quote'] },
  { id: 'Process Workflow', label: 'Process Workflow', type: 'secondary', description: 'A simple sequence from consultation through delivery, inspection, and client follow-up.', image: '', related: ['Services', 'FAQs'] }
];

const connections = [
  ['home', 'Services'],
  ['home', 'Portfolio'],
  ['home', 'Contact'],
  ['home', 'Request a Quote'],
  ['home', 'Service Areas'],
  ['home', 'Credentials / Licensing'],
  ['Services', 'Materials'],
  ['Services', 'Process Workflow'],
  ['Portfolio', 'Project Types'],
  ['Portfolio', 'Materials'],
  ['Contact', 'Request a Quote'],
  ['Contact', 'FAQs'],
  ['Service Areas', 'Building Science Concepts'],
  ['Service Areas', 'Safety Standards'],
  ['Credentials / Licensing', 'Safety Standards'],
  ['Materials', 'Building Science Concepts'],
  ['Techniques', 'Process Workflow'],
  ['Techniques', 'Safety Standards'],
  ['FAQs', 'Process Workflow'],
  ['Project Types', 'Materials']
];

const panelPanel = document.getElementById('contentPanel');
const panelTitle = document.getElementById('panelTitle');
const panelText = document.getElementById('panelText');
const panelImage = document.getElementById('panelImage');
const panelLinks = document.getElementById('panelLinks');
const panelClose = document.getElementById('panelClose');
const modalOverlay = document.getElementById('graphModal');
const openGraphButton = document.getElementById('openGraph');
const modalClose = document.getElementById('modalClose');
const graphSvg = document.getElementById('graphSvg');
const modalGraphSvg = document.getElementById('modalGraphSvg');
const modalBody = document.getElementById('modalBody');
const bodyElement = document.body;

function createGraph(svgElement, isModal = false) {
    const bounds = svgElement.getBoundingClientRect();
  const viewBox = svgElement.getAttribute('viewBox')?.split(' ');
  const width = bounds.width || svgElement.clientWidth || (viewBox ? parseInt(viewBox[2], 10) : 760);
  const height = bounds.height || svgElement.clientHeight || (viewBox ? parseInt(viewBox[3], 10) : 660);
  const center = { x: width / 2, y: height / 2 };
  svgElement.innerHTML = '';

  if (svgElement.parentElement) {
    const existingLayer = svgElement.parentElement.querySelector(isModal ? '.modal-node-layer' : '.node-layer');
    if (existingLayer) {
      existingLayer.remove();
    }
  }

  const svgNamespace = 'http://www.w3.org/2000/svg';
  const lineGroup = document.createElementNS(svgNamespace, 'g');
  lineGroup.classList.add('line-group');

  const nodeSlots = [];
  const primaryRadius = Math.min(width, height) * 0.22;
  const secondaryRadius = Math.min(width, height) * 0.36;

  const homeNode = nodes.find((item) => item.id === 'home');
  const homeSlot = createSlot(homeNode, center.x, center.y, svgElement, isModal);
  nodeSlots.push(homeSlot);

  const primaryNodes = nodes.filter((node) => node.type === 'primary');
  primaryNodes.forEach((node, index) => {
    const angle = (index / primaryNodes.length) * Math.PI * 2 - Math.PI / 2;
    const x = center.x + Math.cos(angle) * primaryRadius;
    const y = center.y + Math.sin(angle) * primaryRadius;
    nodeSlots.push(createSlot(node, x, y, svgElement, isModal));
  });

  const secondaryNodes = nodes.filter((node) => node.type === 'secondary');
  secondaryNodes.forEach((node, index) => {
    const angle = (index / secondaryNodes.length) * Math.PI * 2 - Math.PI / 2 + 0.14;
    const x = center.x + Math.cos(angle) * secondaryRadius;
    const y = center.y + Math.sin(angle) * secondaryRadius;
    nodeSlots.push(createSlot(node, x, y, svgElement, isModal));
  });

  connections.forEach(([sourceId, targetId]) => {
    const source = nodeSlots.find((slot) => slot.dataset.id === sourceId);
    const target = nodeSlots.find((slot) => slot.dataset.id === targetId);
    if (source && target) {
      const path = document.createElementNS(svgNamespace, 'path');
      const startX = source.offsetLeft + source.offsetWidth / 2;
      const startY = source.offsetTop + source.offsetHeight / 2;
      const endX = target.offsetLeft + target.offsetWidth / 2;
      const endY = target.offsetTop + target.offsetHeight / 2;
      const dx = endX - startX;
      const dy = endY - startY;
      const curve = Math.sqrt(dx * dx + dy * dy) * 0.25;
      const pathData = `M ${startX} ${startY} C ${startX + curve} ${startY} ${endX - curve} ${endY} ${endX} ${endY}`;
      path.setAttribute('d', pathData);
      path.classList.add('graph-line');
      path.dataset.source = sourceId;
      path.dataset.target = targetId;
      lineGroup.appendChild(path);
    }
  });

  svgElement.appendChild(lineGroup);
  const nodeLayer = document.createElement('div');
  nodeLayer.className = isModal ? 'modal-node-layer' : 'node-layer';
  nodeLayer.style.position = 'absolute';
  nodeLayer.style.inset = '0';
  nodeLayer.style.pointerEvents = 'none';
  nodeSlots.forEach((slot) => nodeLayer.appendChild(slot));
  svgElement.parentElement.appendChild(nodeLayer);
}

function createSlot(node, x, y, svgElement, isModal) {
  const slot = document.createElement('div');
  slot.className = 'node-slot';
  slot.style.left = `${x}px`;
  slot.style.top = `${y}px`;
  slot.dataset.id = node.id;

  const button = document.createElement('button');
  button.className = `node ${node.type === 'center' ? 'node-center' : node.type === 'primary' ? 'node-primary' : 'node-secondary'}`;
  button.type = 'button';
  button.textContent = node.label;
  button.setAttribute('aria-label', `${node.label}, open details`);
  button.dataset.nodeId = node.id;
  button.addEventListener('click', () => openPanel(node.id));
  button.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openPanel(node.id);
    }
  });
  button.addEventListener('mouseenter', () => highlightLines(node.id, true, svgElement));
  button.addEventListener('mouseleave', () => highlightLines(node.id, false, svgElement));

  slot.appendChild(button);
  return slot;
}

function highlightLines(nodeId, on = true, svgElement) {
  const lines = svgElement.querySelectorAll('.graph-line');
  lines.forEach((line) => {
    if (line.dataset.source === nodeId || line.dataset.target === nodeId) {
      line.classList.toggle('hovered', on);
    }
  });
}

function openPanel(nodeId) {
  const node = nodes.find((item) => item.id === nodeId);
  if (!node) return;
  panelTitle.textContent = node.label;
  panelText.textContent = node.description;
  panelImage.textContent = node.image ? '' : 'Image placeholder for ' + node.label;
  panelImage.style.backgroundImage = node.image ? `url('${node.image}')` : 'none';
  panelImage.style.backgroundSize = 'cover';
  panelImage.style.backgroundPosition = 'center';
  panelImage.setAttribute('aria-label', node.image ? `Visual preview of ${node.label}` : `No preview image available for ${node.label}`);
  panelLinks.innerHTML = node.related
    .map((related) => {
      const target = nodes.find((item) => item.id === related);
      return `<a class="related-link" href="#" data-target="${related}">${related}</a>`;
    })
    .join('');
  panelPanel.classList.add('open');
  panelClose.focus();
  panelLinks.querySelectorAll('.related-link').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      openPanel(event.currentTarget.dataset.target);
    });
  });
}

function closePanel() {
  panelPanel.classList.remove('open');
}

function openGraphModal() {
  modalOverlay.classList.add('open');
  bodyElement.style.overflow = 'hidden';
  modalClose.focus();
}

function closeGraphModal() {
  modalOverlay.classList.remove('open');
  bodyElement.style.overflow = '';
  openGraphButton.focus();
}

function repositionGraphs() {
  const graphContainers = [graphSvg, modalGraphSvg];
  graphContainers.forEach((svg) => {
    if (!svg) return;
    createGraph(svg, svg === modalGraphSvg);
  });
}

openGraphButton?.addEventListener('click', openGraphModal);
modalClose?.addEventListener('click', closeGraphModal);
modalOverlay?.addEventListener('click', (event) => {
  if (event.target === modalOverlay) {
    closeGraphModal();
  }
});
panelClose?.addEventListener('click', closePanel);
window.addEventListener('resize', () => {
  requestAnimationFrame(repositionGraphs);
});
window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    if (modalOverlay.classList.contains('open')) {
      closeGraphModal();
      return;
    }
    if (panelPanel.classList.contains('open')) {
      closePanel();
    }
  }
});

document.addEventListener('DOMContentLoaded', () => {
  repositionGraphs();
  openGraphButton?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openGraphModal();
    }
  });

  document.querySelectorAll('.mobile-item button').forEach((button) => {
    button.addEventListener('click', () => {
      const nodeId = button.dataset.node;
      openPanel(nodeId);
    });
    button.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openPanel(button.dataset.node);
      }
    });
  });
});

