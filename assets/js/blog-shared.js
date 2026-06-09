(function () {
  const BLOG_CONTENT_URL = "content/blog/articles.json";
  const supportedLangs = ["ja", "en", "vi", "zh", "ko", "my", "id"];
  const labels = {
    ja: { read: "記事を読む", empty: "記事が見つかりません", prev: "前へ", next: "次へ" },
    en: { read: "Read article", empty: "Article not found", prev: "Prev", next: "Next" },
    vi: { read: "Đọc bài viết", empty: "Không tìm thấy bài viết", prev: "Trước", next: "Tiếp theo" },
    zh: { read: "阅读更多", empty: "未找到文章", prev: "上一页", next: "下一页" },
    ko: { read: "기사 읽기", empty: "글을 찾을 수 없습니다", prev: "이전", next: "다음" },
    my: { read: "ပိုမိုဖတ်ရန်", empty: "ဆောင်းပါးမတွေ့ပါ", prev: "နောက်သို့", next: "ရှေ့သို့" },
    id: { read: "Baca artikel", empty: "Artikel tidak ditemukan", prev: "Sebelumnya", next: "Berikutnya" }
  };
  const PAGE_SIZE = window.GOLYN_BLOG_PAGE_SIZE || 6;
  let contentArticles = [];
  let contentLoaded = false;
  let currentPage = 1;

  function currentLang() {
    const lang = localStorage.getItem("golynLang") || document.documentElement.lang || "ja";
    return supportedLangs.includes(lang) ? lang : "ja";
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

  function readLocalArticles() {
    try {
      return JSON.parse(localStorage.getItem("golynArticles") || "[]");
    } catch (_) {
      return [];
    }
  }

  function normalizeDate(date) {
    return String(date || "").replace(/\./g, "-");
  }

  function normalizeArticle(article) {
    const slug = article.slug || article.id || "";
    return {
      id: article.id || slug,
      slug,
      lang: article.lang || "ja",
      date: normalizeDate(article.date),
      tag: article.tag || article.lang || "Blog",
      title: article.title || "",
      desc: article.desc || article.excerpt || "",
      excerpt: article.excerpt || article.desc || "",
      image: article.image || article.featuredImage || "",
      featuredImage: article.featuredImage || article.image || "",
      content: article.content || article.body || "",
      body: article.body || article.content || ""
    };
  }

  async function loadContent() {
    if (contentLoaded) return;
    contentLoaded = true;
    try {
      const response = await fetch(BLOG_CONTENT_URL, { cache: "no-store" });
      if (!response.ok) throw new Error(`Blog content ${response.status}`);
      const data = await response.json();
      const articles = Array.isArray(data) ? data : data.articles;
      if (Array.isArray(articles)) contentArticles = articles.map(normalizeArticle);
    } catch (error) {
      console.warn("Blog content fallback:", error.message);
      contentArticles = [];
    }
  }

  function allArticles() {
    const source = contentArticles.length ? contentArticles : (window.GOLYN_ARTICLES || []);
    return [...source.map(normalizeArticle), ...readLocalArticles().map(normalizeArticle)]
      .filter(article => article.id && article.title)
      .sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));
  }

  function groupKey(article) {
    return article.translationKey || article.slug.replace(/-(ja|en|vi|zh|ko|my|id)$/i, "") || article.id.replace(/-(ja|en|vi|zh|ko|my|id)$/i, "");
  }

  function articlesForLang(lang) {
    const groups = new Map();
    allArticles().forEach(article => {
      const key = groupKey(article);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(article);
    });

    return Array.from(groups.values()).map(group => (
      group.find(article => article.lang === lang) ||
      group.find(article => article.lang === "ja") ||
      group[0]
    )).sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));
  }

  function articlesForCurrentLang() {
    return articlesForLang(currentLang());
  }

  function articleURL(article) {
    return "article.html?id=" + encodeURIComponent(article.id);
  }

  function cardHTML(article, className) {
    const text = labels[currentLang()] || labels.ja;
    const isHomeCard = className === "news-card";
    return `
      <a class="${className}" href="${articleURL(article)}">
        <time class="${isHomeCard ? "news-date" : ""}" datetime="${escapeHTML(article.date)}">${escapeHTML(article.date)}</time>
        <span class="${isHomeCard ? "news-tag" : "blog-tag"}">${escapeHTML(article.tag || article.lang || "Blog")}</span>
        <h2 class="${isHomeCard ? "news-title" : ""}">${escapeHTML(article.title)}</h2>
        <p class="${isHomeCard ? "news-desc" : ""}">${escapeHTML(article.desc || article.excerpt)}</p>
        <span class="news-more">${escapeHTML(text.read)}</span>
      </a>`;
  }

  function renderPagination(totalPages, page) {
    const container = document.getElementById("paginationContainer");
    if (!container) return;
    if (totalPages <= 1) {
      container.style.display = "none";
      container.innerHTML = "";
      return;
    }

    const text = labels[currentLang()] || labels.ja;
    container.style.display = "flex";
    container.innerHTML = "";

    const addButton = (label, targetPage, className, disabled) => {
      const button = document.createElement("button");
      button.className = "pagination-btn" + (className ? " " + className : "");
      button.textContent = label;
      button.disabled = Boolean(disabled);
      button.addEventListener("click", () => renderNewsList(targetPage, true));
      container.appendChild(button);
    };

    addButton("← " + text.prev, page - 1, "prev", page === 1);
    for (let i = 1; i <= totalPages; i += 1) {
      addButton(String(i), i, i === page ? "active" : "", false);
    }
    addButton(text.next + " →", page + 1, "next", page === totalPages);
  }

  function scrollToBlogGrid() {
    const grid = document.querySelector(".blog-grid");
    if (grid) grid.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function renderNewsList(page, shouldScroll) {
    const grid = document.querySelector(".blog-grid");
    if (!grid) return;
    await loadContent();
    const articles = articlesForCurrentLang();
    const totalPages = Math.max(1, Math.ceil(articles.length / PAGE_SIZE));
    currentPage = Math.min(Math.max(1, Number(page) || 1), totalPages);
    const start = (currentPage - 1) * PAGE_SIZE;
    const visible = articles.slice(start, start + PAGE_SIZE);
    const text = labels[currentLang()] || labels.ja;

    grid.innerHTML = visible.length
      ? visible.map(article => cardHTML(article, "blog-card")).join("")
      : `<article class="blog-card is-empty"><h2>${escapeHTML(text.empty)}</h2></article>`;
    renderPagination(totalPages, currentPage);
    if (shouldScroll) scrollToBlogGrid();
  }

  async function renderHomeNews() {
    const grid = document.querySelector(".news-grid");
    if (!grid) return;
    await loadContent();
    grid.innerHTML = articlesForCurrentLang().slice(0, 3).map(article => cardHTML(article, "news-card")).join("");
  }

  function findArticleById(id, lang) {
    const articles = allArticles();
    const direct = articles.find(article => article.id === id || article.slug === id);
    if (direct) return direct;
    const group = articles.filter(article => groupKey(article) === id);
    return group.find(article => article.lang === lang) || group.find(article => article.lang === "ja") || group[0];
  }

  function renderBody(content) {
    return String(content || "")
      .split(/\n{2,}/)
      .map(block => `<p>${escapeHTML(block).replace(/\n/g, "<br>")}</p>`)
      .join("");
  }

  async function renderArticle() {
    const body = document.getElementById("articleBody");
    if (!body) return;
    await loadContent();
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    const lang = currentLang();
    const article = findArticleById(id, lang);
    const text = labels[lang] || labels.ja;

    if (!article) {
      body.innerHTML = `<p style="color:red;">${escapeHTML(text.empty)}</p>`;
      return;
    }

    document.title = article.title + " | Golyn Nail";
    const title = document.getElementById("articleTitle");
    const date = document.getElementById("articleDate");
    const tag = document.getElementById("articleTag");
    const image = document.getElementById("articleImage");

    if (title) title.textContent = article.title;
    if (date) date.textContent = article.date || "";
    if (tag) tag.textContent = article.tag || article.lang || "Blog";
    if (image && article.image) {
      image.src = article.image;
      image.style.display = "block";
    }

    body.innerHTML = renderBody(article.content || article.body);
  }

  function rerender() {
    renderNewsList(currentPage, false);
    renderHomeNews();
    renderArticle();
  }

  window.GolynBlog = { allArticles, articlesForCurrentLang, loadContent, rerender, renderNewsList };
  document.addEventListener("DOMContentLoaded", rerender);
  window.addEventListener("storage", rerender);

  const originalChooseLang = window.chooseLang;
  if (typeof originalChooseLang === "function") {
    window.chooseLang = function (lang) {
      originalChooseLang(lang);
      setTimeout(rerender, 0);
    };
  }
})();
