(function () {
  function escapeHTML(value) {
    return String(value || "").replace(/[&<>"']/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[char]));
  }

  function items() {
    return Array.isArray(window.GOLYN_GALLERY_ITEMS) ? window.GOLYN_GALLERY_ITEMS : [];
  }

  function renderHomeGallery() {
    const grid = document.querySelector(".gallery-grid[data-gallery-scope='home']");
    if (!grid) return;
    const selected = items().filter(item => item.featured).slice(0, 8);
    grid.innerHTML = selected.map((item, index) => `
      <div class="gallery-item g${index + 1}" data-gallery-index="${index}" style="background-image:url('${escapeHTML(item.src)}')">
        <div class="gallery-placeholder"><div class="gallery-label">${escapeHTML(item.label)}</div></div>
        <div class="overlay"><span>${escapeHTML(item.tag || item.label)}</span></div>
      </div>
    `).join("");
  }

  function renderGalleryPage() {
    const grid = document.querySelector(".gallery-page .gallery-grid");
    if (!grid) return;
    grid.innerHTML = items().map((item, index) => `
      <button class="gallery-item" type="button" data-gallery-index="${index}">
        <img alt="${escapeHTML(item.alt || item.label)}" src="${escapeHTML(item.src)}"/>
        <span class="gallery-label">${escapeHTML(item.label)}</span>
      </button>
    `).join("");
  }

  function render() {
    renderHomeGallery();
    renderGalleryPage();
    document.dispatchEvent(new CustomEvent("golyn:gallery-rendered"));
  }

  window.GolynGallery = { items, render };
  document.addEventListener("DOMContentLoaded", render);
})();
