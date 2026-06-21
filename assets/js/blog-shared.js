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
  const PAGE_SIZE = window.GOLYN_BLOG_PAGE_SIZE || 12;
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
    const url = articleURL(article);
    const image = article.featuredImage || article.image || "";
    if (!isHomeCard) {
      const media = image
        ? `<a class="blog-card-media" href="${url}" aria-label="${escapeHTML(article.title)}"><img src="${escapeHTML(image)}" alt="${escapeHTML(article.title)}" loading="lazy"></a>`
        : `<a class="blog-card-media blog-card-placeholder" href="${url}" aria-label="${escapeHTML(article.title)}"><span>${escapeHTML(article.tag || "Blog")}</span></a>`;
      return `
      <article class="${className}">
        ${media}
        <div class="blog-card-body">
          <div class="blog-meta">
            <span class="blog-tag">${escapeHTML(article.tag || article.lang || "Blog")}</span>
            <time class="blog-date" datetime="${escapeHTML(article.date)}">${escapeHTML(article.date)}</time>
          </div>
          <h2><a href="${url}">${escapeHTML(article.title)}</a></h2>
          <p>${escapeHTML(article.desc || article.excerpt)}</p>
          <a class="news-more" href="${url}">${escapeHTML(text.read)}</a>
        </div>
      </article>`;
    }
    return `
      <article class="${className}">
        <div class="${isHomeCard ? "news-meta" : "blog-meta"}">
          <span class="${isHomeCard ? "news-tag" : "blog-tag"}">${escapeHTML(article.tag || article.lang || "Blog")}</span>
          <time class="${isHomeCard ? "news-date" : "blog-date"}" datetime="${escapeHTML(article.date)}">${escapeHTML(article.date)}</time>
        </div>
        <h2 class="${isHomeCard ? "news-title" : ""}"><a href="${url}">${escapeHTML(article.title)}</a></h2>
        <p class="${isHomeCard ? "news-desc" : ""}">${escapeHTML(article.desc || article.excerpt)}</p>
        <a class="news-more" href="${url}">${escapeHTML(text.read)}</a>
      </article>`;
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
    const maxVisiblePages = 5;
    const halfVisible = Math.floor(maxVisiblePages / 2);
    let startPage = Math.max(1, page - halfVisible);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
      addButton("1", 1, "", false);
      if (startPage > 2) {
        const dots = document.createElement("span");
        dots.className = "pagination-dots";
        dots.textContent = "...";
        container.appendChild(dots);
      }
    }

    for (let i = startPage; i <= endPage; i += 1) {
      addButton(String(i), i, i === page ? "active" : "", false);
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        const dots = document.createElement("span");
        dots.className = "pagination-dots";
        dots.textContent = "...";
        container.appendChild(dots);
      }
      addButton(String(totalPages), totalPages, "", false);
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

  function normalizeImageWidth(value) {
    const width = String(value || "").trim();
    return /^(?:100|[1-9]?\d)(?:\.\d+)?%$|^(?:[1-9]\d{0,3})(?:\.\d+)?(?:px|rem|em|vw)$/i.test(width)
      ? width
      : "";
  }

  function normalizeImageAlign(value) {
    const align = String(value || "").trim().toLowerCase();
    return ["left", "center", "right"].includes(align) ? align : "center";
  }

  function alignStyle(value) {
    const align = normalizeImageAlign(value);
    if (align === "left") return "display:block;margin-left:0;margin-right:auto;";
    if (align === "right") return "display:block;margin-left:auto;margin-right:0;";
    return "display:block;margin-left:auto;margin-right:auto;";
  }

  function alignFromStyle(style) {
    const value = String(style || "").toLowerCase();
    if (/margin-left\s*:\s*auto/.test(value) && /margin-right\s*:\s*0/.test(value)) return "right";
    if (/margin-left\s*:\s*auto/.test(value) && /margin-right\s*:\s*auto/.test(value)) return "center";
    if (/margin-left\s*:\s*0/.test(value) && /margin-right\s*:\s*auto/.test(value)) return "left";
    return "center";
  }

  function imageHTML(src, alt, width, title, align) {
    const safeWidth = normalizeImageWidth(width);
    const style = safeWidth
      ? ` style="width:${escapeHTML(safeWidth)};${alignStyle(align)}"`
      : ` style="${alignStyle(align)}"`;
    const titleAttr = title ? ` title="${escapeHTML(title)}"` : "";
    return `<img class="article-inline-image" src="${escapeHTML(src)}" alt="${escapeHTML(alt)}" loading="lazy"${titleAttr} data-align="${normalizeImageAlign(align)}"${style}>`;
  }

  function readAttribute(attrs, name) {
    const match = String(attrs || "").match(new RegExp(`${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i"));
    return match ? String(match[1] || match[2] || match[3] || "") : "";
  }

  function widthFromStyle(style) {
    const match = String(style || "").match(/(?:^|;)\s*width\s*:\s*([^;]+)/i);
    return match ? match[1] : "";
  }

  function safeImageSrc(src) {
    return /^(https?:\/\/|\/|images\/|\.\/images\/)/i.test(String(src || "").trim());
  }

  function decodeHTML(value) {
    return String(value || "")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<[^>]*>/g, "")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&");
  }

  function normalizeTextSize(value) {
    const size = String(value || "").trim();
    return /^(?:[8-9]|[1-5]\d|60)(?:\.\d+)?px$|^(?:0?\.\d+|[1-4](?:\.\d+)?|5)rem$|^(?:[8-9]|[1-5]\d|60)(?:\.\d+)?pt$/i.test(size)
      ? size
      : "16px";
  }

  function normalizeTextColor(value) {
    const color = String(value || "").trim();
    return /^#[0-9a-f]{3}(?:[0-9a-f]{3})?$/i.test(color) ? color : "#4A2E10";
  }

  function normalizeTextFont(value) {
    const font = String(value || "").trim().toLowerCase();
    return ["default", "sans", "serif", "japanese", "vietnamese"].includes(font) ? font : "default";
  }

  function normalizeTextAlign(value) {
    const align = String(value || "").trim().toLowerCase();
    return ["left", "center", "right"].includes(align) ? align : "";
  }

  function textFontStyle(value) {
    const font = normalizeTextFont(value);
    if (font === "serif") return "font-family:'Cormorant Garamond',serif;";
    if (font === "japanese") return "font-family:'Noto Sans JP','Yu Gothic',sans-serif;";
    if (font === "vietnamese") return "font-family:'Be Vietnam Pro',Arial,sans-serif;";
    if (font === "sans") return "font-family:'Jost',Arial,sans-serif;";
    return "";
  }

  function styleValue(style, property) {
    const match = String(style || "").match(new RegExp(`(?:^|;)\\s*${property}\\s*:\\s*([^;]+)`, "i"));
    return match ? match[1] : "";
  }

  function fontKeyFromStyle(style) {
    const family = styleValue(style, "font-family").toLowerCase();
    if (family.includes("cormorant")) return "serif";
    if (family.includes("noto sans jp") || family.includes("yu gothic")) return "japanese";
    if (family.includes("be vietnam")) return "vietnamese";
    if (family.includes("jost") || family.includes("arial")) return "sans";
    return "default";
  }

  function styledTextHTML(text, font, size, color, align) {
    const safeFont = normalizeTextFont(font);
    const safeSize = normalizeTextSize(size);
    const safeColor = normalizeTextColor(color);
    const safeAlign = normalizeTextAlign(align);
    const alignStyle = safeAlign ? `text-align:${safeAlign};` : "";
    return `<div class="article-styled-text" data-font="${safeFont}" style="${textFontStyle(safeFont)}font-size:${escapeHTML(safeSize)};color:${escapeHTML(safeColor)};${alignStyle}">${escapeHTML(text).replace(/\n/g, "<br>")}</div>`;
  }

  function styledInlineHTML(text, font, size, color) {
    const safeFont = normalizeTextFont(font);
    const safeSize = normalizeTextSize(size);
    const safeColor = normalizeTextColor(color);
    return `<span class="article-styled-inline" data-font="${safeFont}" style="${textFontStyle(safeFont)}font-size:${escapeHTML(safeSize)};color:${escapeHTML(safeColor)};">${escapeHTML(text)}</span>`;
  }

  function htmlImageBlock(value) {
    const match = String(value || "").trim().match(/^<img\b([^>]*)>$/i);
    if (!match) return "";
    const attrs = match[1];
    const src = readAttribute(attrs, "src");
    if (!safeImageSrc(src)) return "";
    const width = readAttribute(attrs, "width") || widthFromStyle(readAttribute(attrs, "style"));
    const align = readAttribute(attrs, "data-align") || alignFromStyle(readAttribute(attrs, "style"));
    return imageHTML(src, readAttribute(attrs, "alt"), width, readAttribute(attrs, "title"), align);
  }

  function htmlStyledTextBlock(value) {
    const match = String(value || "").trim().match(/^<div\b([^>]*)class=(?:"[^"]*\barticle-styled-text\b[^"]*"|'[^']*\barticle-styled-text\b[^']*')[^>]*>([\s\S]*?)<\/div>$/i);
    if (!match) return "";
    const attrs = match[1] || "";
    const style = readAttribute(attrs, "style");
    return styledTextHTML(
      decodeHTML(match[2] || ""),
      readAttribute(attrs, "data-font") || fontKeyFromStyle(style),
      styleValue(style, "font-size") || "16px",
      styleValue(style, "color") || "#4A2E10"
    );
  }

  function htmlStyledInline(value) {
    const match = String(value || "").match(/^<span\b([^>]*)class=(?:"[^"]*\barticle-styled-inline\b[^"]*"|'[^']*\barticle-styled-inline\b[^']*')[^>]*>([\s\S]*?)<\/span>$/i);
    if (!match) return "";
    const attrs = match[1] || "";
    const style = readAttribute(attrs, "style");
    return styledInlineHTML(
      decodeHTML(match[2] || ""),
      readAttribute(attrs, "data-font") || fontKeyFromStyle(style),
      styleValue(style, "font-size") || "16px",
      styleValue(style, "color") || "#4A2E10",
      styleValue(style, "text-align")
    );
  }

  function renderInlineMarkdown(value) {
    const inlinePattern = /<span\b[^>]*class=(?:"[^"]*\barticle-styled-inline\b[^"]*"|'[^']*\barticle-styled-inline\b[^']*')[^>]*>[\s\S]*?<\/span>|!\[([^\]]*)\]\((\S+?)(?:\s+"([^"]*)")?\)(?:\s*\{width=([^}]+)\})?/g;
    let html = "";
    let lastIndex = 0;
    String(value || "").replace(inlinePattern, (match, alt, src, title, width, index) => {
      html += escapeHTML(value.slice(lastIndex, index));
      html += htmlStyledInline(match) || imageHTML(src, alt, width, title);
      lastIndex = index + match.length;
      return match;
    });
    html += escapeHTML(value.slice(lastIndex));
    return html;
  }

  function isImageURL(value) {
    return /^https?:\/\/\S+\.(?:avif|gif|jpe?g|png|webp)(?:[?#]\S*)?$/i.test(String(value || "").trim());
  }

  function imageURLWithWidth(value) {
    const match = String(value || "").trim().match(/^(https?:\/\/\S+\.(?:avif|gif|jpe?g|png|webp)(?:[?#]\S*)?)(?:\s+\{width=([^}]+)\})?$/i);
    return match ? { src: match[1], width: match[2] || "" } : null;
  }

  function renderBody(content) {
    return String(content || "")
      .split(/\n{2,}/)
      .map(block => {
        const trimmed = block.trim();
        const safeHTMLImage = htmlImageBlock(trimmed);
        if (safeHTMLImage) {
          return `<p>${safeHTMLImage}</p>`;
        }
        const safeStyledText = htmlStyledTextBlock(trimmed);
        if (safeStyledText) {
          return safeStyledText;
        }
        const image = imageURLWithWidth(trimmed);
        if (image || isImageURL(trimmed)) {
          return `<p>${imageHTML(image ? image.src : trimmed, "", image ? image.width : "")}</p>`;
        }
        return `<p>${renderInlineMarkdown(block).replace(/\n/g, "<br>")}</p>`;
      })
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
