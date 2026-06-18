(function () {
  const GALLERY_CONTENT_URL = "/content/gallery/gallery.json";
  const GALLERY_CATEGORIES = [
    { key: "all", label: "All" },
    { key: "new", label: "New" },
    { key: "simple", label: "Simple" },
    { key: "gel", label: "Gel" },
    { key: "foot", label: "Foot" },
    { key: "seasonal", label: "Seasonal" },
    { key: "design", label: "Design" }
  ];
  const INITIAL_VISIBLE_COUNT = 8;
  const LOAD_MORE_COUNT = 8;
  let contentLoaded = false;
  let activeCategory = "all";
  let visibleCount = INITIAL_VISIBLE_COUNT;

  function assetURL(value) {
    const url = String(value || '').trim();
    return /^(?:https?:\/\/|\/|data:|blob:)/i.test(url) ? url : '/' + url.replace(/^\.\//, '');
  }

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
    const image = assetURL(item.image || item.src || "");
    const category = item.category || "simple";
    const tags = Array.isArray(item.tags) ? item.tags : (item.tags ? String(item.tags).split(",").map(tag => tag.trim()).filter(Boolean) : []);
    return {
      title,
      label: item.label || title,
      alt: item.alt || title,
      tag: item.tag || title,
      category,
      tags,
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
    if (Array.isArray(window.GOLYN_CONTENT_GALLERY_ITEMS) && window.GOLYN_CONTENT_GALLERY_ITEMS.length) {
      setItems(window.GOLYN_CONTENT_GALLERY_ITEMS);
      return;
    }
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

  function matchesCategory(item, category) {
    if (category === "all") return true;
    return item.category === category || (Array.isArray(item.tags) && item.tags.includes(category));
  }

  function filteredItems() {
    return items().filter(item => matchesCategory(item, activeCategory));
  }

  function shuffle(items) {
    const copy = items.slice();
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
    }
    return copy;
  }

  function homeItems() {
    const allItems = items();
    if (!allItems.length) return [];
    const recentPool = allItems.slice(0, Math.min(24, allItems.length));
    const selected = shuffle(recentPool).slice(0, 8);
    if (selected.length >= 8) return selected;
    const selectedSources = new Set(selected.map(item => item.src));
    const fallback = allItems.filter(item => !selectedSources.has(item.src));
    return selected.concat(fallback).slice(0, 8);
  }

  function renderFilters() {
    const filters = document.querySelector("[data-gallery-filters]");
    if (!filters) return;
    filters.innerHTML = GALLERY_CATEGORIES.map(category => `
      <button class="gallery-filter${category.key === activeCategory ? " active" : ""}" type="button" data-gallery-filter="${category.key}" aria-pressed="${category.key === activeCategory}">
        ${escapeHTML(category.label)}
      </button>
    `).join("");
    filters.querySelectorAll("[data-gallery-filter]").forEach(button => {
      button.addEventListener("click", () => {
        activeCategory = button.dataset.galleryFilter || "all";
        visibleCount = INITIAL_VISIBLE_COUNT;
        renderGalleryPage();
      });
    });
  }

  function renderLoadMore(total, visibleTotal) {
    const button = document.querySelector("[data-gallery-more]");
    if (!button) return;
    const wrapper = button.closest(".gallery-more");
    const isComplete = visibleTotal >= total;
    button.hidden = isComplete;
    if (wrapper) wrapper.hidden = isComplete;
    button.onclick = () => {
      visibleCount += LOAD_MORE_COUNT;
      renderGalleryPage();
    };
  }

  function renderHomeGallery() {
    const grid = document.querySelector(".gallery-grid[data-gallery-scope='home']");
    if (!grid) return;
    const selected = homeItems();
    window.GOLYN_HOME_GALLERY_ITEMS = selected;
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
    const selected = filteredItems();
    const visibleItems = selected.slice(0, visibleCount);
    window.GOLYN_ACTIVE_GALLERY_ITEMS = selected;
    grid.innerHTML = visibleItems.map((item, index) => `
      <button class="gallery-item" type="button" data-gallery-index="${index}" data-gallery-category="${escapeHTML(item.category)}">
        <img alt="${escapeHTML(item.alt || item.label)}" src="${escapeHTML(item.src)}"/>
        <span class="gallery-label">${escapeHTML(item.label)}</span>
      </button>
    `).join("");
    renderFilters();
    renderLoadMore(selected.length, visibleItems.length);
    document.dispatchEvent(new CustomEvent("golyn:gallery-rendered"));
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
