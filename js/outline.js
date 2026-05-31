document.addEventListener("DOMContentLoaded", () => {
  const trees = document.querySelectorAll("[data-outline-tree]");

  trees.forEach((tree) => {
    const nav = tree.querySelector("nav");
    if (!nav) {
      return;
    }

    const items = nav.querySelectorAll("li");

    items.forEach((item) => {
      const link = item.querySelector(":scope > a");
      const childList = item.querySelector(":scope > ul");

      if (!link || !childList) {
        return;
      }

      item.classList.add("has-children");

      const row = document.createElement("div");
      row.className = "outline-row";

      link.parentNode.insertBefore(row, link);
      row.appendChild(link);

      const toggle = document.createElement("button");
      toggle.type = "button";
      toggle.className = "outline-toggle";
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", `Toggle ${link.textContent.trim()}`);

      row.appendChild(toggle);

      toggle.addEventListener("click", (event) => {
        event.preventDefault();
        const expanded = item.classList.toggle("is-expanded");
        toggle.setAttribute("aria-expanded", expanded ? "true" : "false");
      });
    });
  });
});
