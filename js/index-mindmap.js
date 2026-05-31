document.addEventListener("DOMContentLoaded", () => {
  const content = document.querySelector("[data-index-content]");
  const overlay = document.querySelector("[data-mindmap-overlay]");
  const canvas = document.querySelector("[data-mindmap-canvas]");
  const openButton = document.querySelector("[data-mindmap-open]");
  const closeButtons = document.querySelectorAll("[data-mindmap-close]");
  const rootTitle = document.querySelector(".index-header h1")?.textContent.trim() || "Index";

  if (!content || !overlay || !canvas || !openButton) {
    return;
  }

  const headings = Array.from(content.querySelectorAll("h2, h3, h4"));
  if (!headings.length) {
    openButton.hidden = true;
    return;
  }

  const branches = buildTree(headings, content);
  renderMindMap({ title: rootTitle, children: branches }, canvas);

  openButton.addEventListener("click", () => {
    overlay.hidden = false;
    document.body.classList.add("mindmap-open");
  });

  closeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      overlay.hidden = true;
      document.body.classList.remove("mindmap-open");
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !overlay.hidden) {
      overlay.hidden = true;
      document.body.classList.remove("mindmap-open");
    }
  });
});

function buildTree(headings, container) {
  const root = [];
  const stack = [];

  headings.forEach((heading) => {
    const level = Number.parseInt(heading.tagName.slice(1), 10);
    const node = {
      title: heading.textContent.trim(),
      level,
      description: collectDescription(heading, container),
      links: collectLinks(heading, container),
      children: [],
      collapsed: false,
    };

    while (stack.length && stack[stack.length - 1].level >= level) {
      stack.pop();
    }

    if (stack.length) {
      stack[stack.length - 1].children.push(node);
    } else {
      root.push(node);
    }

    stack.push(node);
  });

  return root;
}

function collectDescription(heading, container) {
  const parts = [];
  let current = heading.nextElementSibling;

  while (current && current.parentElement === container) {
    if (/^H[2-4]$/.test(current.tagName)) {
      break;
    }
    if (current.tagName === "P") {
      parts.push(current.textContent.trim());
    }
    current = current.nextElementSibling;
  }

  return parts.join(" ").trim();
}

function collectLinks(heading, container) {
  const links = [];
  let current = heading.nextElementSibling;

  while (current && current.parentElement === container) {
    if (/^H[2-4]$/.test(current.tagName)) {
      break;
    }
    if (current.tagName === "UL") {
      current.querySelectorAll("a").forEach((link) => {
        links.push({
          title: link.textContent.trim(),
          href: link.getAttribute("href"),
        });
      });
    }
    current = current.nextElementSibling;
  }

  return links;
}

function renderMindMap(root, target) {
  target.innerHTML = "";
  const stage = document.createElement("div");
  stage.className = "mindmap-stage";

  const leftColumn = document.createElement("div");
  leftColumn.className = "mindmap-column mindmap-column--left";

  const rootWrap = document.createElement("div");
  rootWrap.className = "mindmap-root-wrap";

  const rootNode = document.createElement("div");
  rootNode.className = "mindmap-root";

  const rootTitle = document.createElement("h2");
  rootTitle.className = "mindmap-root__title";
  rootTitle.textContent = root.title;
  rootNode.appendChild(rootTitle);
  rootWrap.appendChild(rootNode);

  const rightColumn = document.createElement("div");
  rightColumn.className = "mindmap-column mindmap-column--right";

  root.children.forEach((node, index) => {
    const side = index % 2 === 0 ? "left" : "right";
    const rendered = renderBranch(node, side);
    if (side === "left") {
      leftColumn.appendChild(rendered);
    } else {
      rightColumn.appendChild(rendered);
    }
  });

  stage.appendChild(leftColumn);
  stage.appendChild(rootWrap);
  stage.appendChild(rightColumn);
  target.appendChild(stage);
}

function renderBranch(node, side) {
  const section = document.createElement("section");
  section.className = `mindmap-branch mindmap-branch--${side} mindmap-branch--level-${node.level}`;

  const card = document.createElement("div");
  card.className = "mindmap-topic";
  if (node.children.length || node.links.length) {
    card.classList.add("mindmap-topic--branch");
  }

  const eyebrow = document.createElement("p");
  eyebrow.className = "eyebrow";
  eyebrow.textContent = node.level === 2 ? "Layer" : "Sub-layer";
  card.appendChild(eyebrow);

  const headerRow = document.createElement("div");
  headerRow.className = "mindmap-topic__header";

  const title = document.createElement("h3");
  title.className = "mindmap-topic__title";
  title.textContent = node.title;
  headerRow.appendChild(title);

  let body;
  if (node.children.length) {
    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "mindmap-topic__toggle";
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", `Toggle ${node.title}`);
    headerRow.appendChild(toggle);
    section.dataset.expanded = "true";

    toggle.addEventListener("click", () => {
      const expanded = section.dataset.expanded !== "false";
      section.dataset.expanded = expanded ? "false" : "true";
      toggle.setAttribute("aria-expanded", expanded ? "false" : "true");
      body.hidden = expanded;
    });
  }

  card.appendChild(headerRow);

  if (node.description) {
    const description = document.createElement("p");
    description.className = "mindmap-topic__description";
    description.textContent = node.description;
    card.appendChild(description);
  }

  section.appendChild(card);

  body = document.createElement("div");
  body.className = "mindmap-branch__body";

  if (node.links.length) {
    const links = document.createElement("div");
    links.className = "mindmap-topic__links";

    node.links.forEach((linkData) => {
      const anchor = document.createElement("a");
      anchor.className = "mindmap-leaf";
      anchor.href = linkData.href;
      anchor.textContent = linkData.title;
      links.appendChild(anchor);
    });

    body.appendChild(links);
  }

  if (node.children.length) {
    const children = document.createElement("div");
    children.className = "mindmap-branch__children";

    node.children.forEach((child) => {
      children.appendChild(renderBranch(child, side));
    });

    body.appendChild(children);
  }

  if (node.links.length || node.children.length) {
    section.appendChild(body);
  }

  return section;
}
