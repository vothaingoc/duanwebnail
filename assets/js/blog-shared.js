(function () {
  const labels = {
    ja: { read: "記事を読む", empty: "記事が見つかりません", all: "記事をもっと見る" },
    en: { read: "Read article", empty: "Article not found", all: "See all articles" },
    vi: { read: "Đọc bài viết", empty: "Không tìm thấy bài viết", all: "Xem tất cả bài viết" }
  };
  const PAGE_SIZE = window.GOLYN_BLOG_PAGE_SIZE || 6;
  let serverPage = 1;
  let serverTotalPages = 1;
  let serverPaginationActive = false;
  let renderToken = 0;

  function currentLang() {
    return localStorage.getItem("golynLang") || document.documentElement.lang || "ja";
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

  function allArticles() {
    return [...(window.GOLYN_ARTICLES || []), ...readLocalArticles()]
      .filter(article => article && article.id && article.title)
      .sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));
  }

  function articlesForCurrentLang() {
    return allArticles();
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
        <p class="${isHomeCard ? "news-desc" : ""}">${escapeHTML(article.desc)}</p>
        <span class="news-more">${escapeHTML(text.read)}</span>
      </a>`;
  }

  function paginationLabel(kind) {
    const lang = currentLang();
    const labelsByKind = {
      prev: { ja: "前へ", en: "Prev", vi: "Trước", zh: "上一页", ko: "이전", my: "နောက်သို့", id: "Sebelumnya" },
      next: { ja: "次へ", en: "Next", vi: "Tiếp theo", zh: "下一页", ko: "다음", my: "ရှေ့သို့", id: "Berikutnya" }
    };
    return (labelsByKind[kind] && labelsByKind[kind][lang]) || labelsByKind[kind].ja;
  }

  function renderServerPagination(totalPages, currentPage) {
    const container = document.getElementById("paginationContainer");
    if (!container) return;

    if (totalPages <= 1) {
      container.style.display = "none";
      container.innerHTML = "";
      return;
    }

    container.style.display = "flex";
    container.innerHTML = "";

    const addButton = (label, page, className, disabled) => {
      const button = document.createElement("button");
      button.className = "pagination-btn" + (className ? " " + className : "");
      button.textContent = label;
      button.disabled = Boolean(disabled);
      button.addEventListener("click", () => renderNewsList(page, true));
      container.appendChild(button);
    };

    const addDots = () => {
      const dots = document.createElement("span");
      dots.className = "pagination-dots";
      dots.textContent = "...";
      container.appendChild(dots);
    };

    addButton("← " + paginationLabel("prev"), currentPage - 1, "prev", currentPage === 1);

    const maxVisiblePages = 5;
    const halfVisible = Math.floor(maxVisiblePages / 2);
    let startPage = Math.max(1, currentPage - halfVisible);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
      addButton("1", 1, "", false);
      if (startPage > 2) addDots();
    }

    for (let page = startPage; page <= endPage; page += 1) {
      addButton(String(page), page, page === currentPage ? "active" : "", false);
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) addDots();
      addButton(String(totalPages), totalPages, "", false);
    }

    addButton(paginationLabel("next") + " →", currentPage + 1, "next", currentPage === totalPages);
  }

  function scrollToBlogGrid() {
    const grid = document.querySelector(".blog-grid");
    if (grid) grid.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function renderLocalNewsList() {
    const grid = document.querySelector(".blog-grid");
    if (!grid) return;
    serverPaginationActive = false;
    grid.innerHTML = articlesForCurrentLang().map(article => cardHTML(article, "blog-card")).join("");
    if (typeof window.initPagination === "function") window.initPagination();
  }

  async function renderNewsList(page, shouldScroll) {
    const grid = document.querySelector(".blog-grid");
    if (!grid) return;

    const requestedPage = Math.max(1, Number(page) || serverPage || 1);
    const currentToken = ++renderToken;
    const api = window.GolynSupabaseContent;

    if (!api || typeof api.fetchArticlePage !== "function") {
      renderLocalNewsList();
      return;
    }

    try {
      grid.setAttribute("aria-busy", "true");
      const result = await api.fetchArticlePage(requestedPage, PAGE_SIZE);
      if (currentToken !== renderToken) return;

      if (!result.totalCount && allArticles().length) {
        renderLocalNewsList();
        return;
      }

      serverPaginationActive = true;
      serverPage = result.page;
      serverTotalPages = result.totalPages;
      grid.innerHTML = result.articles.map(article => cardHTML(article, "blog-card")).join("");

      if (!result.articles.length) {
        const text = labels[currentLang()] || labels.ja;
        grid.innerHTML = `<article class="blog-card is-empty"><h2>${escapeHTML(text.empty)}</h2></article>`;
      }

      renderServerPagination(serverTotalPages, serverPage);
      if (shouldScroll) scrollToBlogGrid();
    } catch (error) {
      console.warn("Supabase blog pagination fallback:", error.message);
      renderLocalNewsList();
    } finally {
      if (currentToken === renderToken) grid.removeAttribute("aria-busy");
    }
  }

  function renderHomeNews() {
    const grid = document.querySelector(".news-grid");
    if (!grid) return;
    grid.innerHTML = articlesForCurrentLang().slice(0, 3).map(article => cardHTML(article, "news-card")).join("");
  }

  async function renderArticle() {
    const body = document.getElementById("articleBody");
    if (!body) return;

    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    let article = allArticles().find(item => item.id === id);
    const api = window.GolynSupabaseContent;
    if (!article && api && typeof api.fetchArticleById === "function" && id) {
      try {
        article = await api.fetchArticleById(id);
      } catch (error) {
        console.warn("Supabase article fallback:", error.message);
      }
    }
    const text = labels[currentLang()] || labels.ja;

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

    body.innerHTML = String(article.content || "")
      .split("\n\n")
      .map(para => `<p>${escapeHTML(para).replace(/\n/g, "<br>")}</p>`)
      .join("");
  }

  function rerender() {
    renderNewsList(serverPaginationActive ? serverPage : 1, false);
    renderHomeNews();
    renderArticle();
  }

  window.GolynBlog = { allArticles, articlesForCurrentLang, rerender, renderNewsList };
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
