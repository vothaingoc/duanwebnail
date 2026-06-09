(function () {
  const GALLERY_CONTENT_URL = "content/gallery/gallery.json";
  let contentLoaded = false;

  function escapeHTML(value) {
    return String(value || "").replace(/[&<>"']/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[char]));
  }

  function normalizeItem(item, index) {
    const title = item.title || item.label || `Gallery ${index + 1}`;
    const image = item.image || item.src || "";
    return {
      title,
      label: item.label || title,
      alt: item.alt || title,
      tag: item.tag || title,
      image,
      src: image,
      createdAt: item.createdAt || "",
      featured: Boolean(item.featured),
      order: Number.isFinite(Number(item.order)) ? Number(item.order) : index + 1
    };
  }

  function gallerySort(a, b) {
    const aDate = a.createdAt ? Date.parse(a.createdAt) : NaN;
    const bDate = b.createdAt ? Date.parse(b.createdAt) : NaN;
    const aHasDate = Number.isFinite(aDate);
    const bHasDate = Number.isFinite(bDate);
    if (aHasDate && bHasDate && bDate !== aDate) return bDate - aDate;
    if (aHasDate !== bHasDate) return aHasDate ? -1 : 1;
    return (a.order || 999) - (b.order || 999);
  }

  function setItems(items) {
    window.GOLYN_GALLERY_ITEMS = items.map(normalizeItem).sort(gallerySort);
  }

  async function loadContent() {
    if (contentLoaded) return;
    contentLoaded = true;
    try {
      const response = await fetch(GALLERY_CONTENT_URL, { cache: "no-store" });
      if (!response.ok) throw new Error(`Gallery content ${response.status}`);
      const data = await response.json();
      const items = Array.isArray(data) ? data : data.images;
      if (Array.isArray(items)) setItems(items);
    } catch (error) {
      console.warn("Gallery content fallback:", error.message);
      setItems(Array.isArray(window.GOLYN_GALLERY_ITEMS) ? window.GOLYN_GALLERY_ITEMS : []);
    }
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

  async function render() {
    await loadContent();
    renderHomeGallery();
    renderGalleryPage();
    document.dispatchEvent(new CustomEvent("golyn:gallery-rendered"));
  }

  window.GolynGallery = { items, render, loadContent };
  document.addEventListener("DOMContentLoaded", render);
})();
