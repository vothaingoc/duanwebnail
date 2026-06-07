(function () {
  const config = window.GOLYN_SUPABASE || {};
  const hasConfig = Boolean(config.url && config.anonKey);
  const hasClient = Boolean(window.supabase && window.supabase.createClient);

  if (!hasConfig || !hasClient) {
    window.GolynSupabaseReady = Promise.resolve(false);
    return;
  }

  const client = window.supabase.createClient(config.url, config.anonKey);
  window.GolynSupabase = client;

  function normalizeArticle(row) {
    return {
      id: row.slug || row.id,
      slug: row.slug,
      lang: row.lang || "ja",
      title: row.title || "",
      tag: row.tag || "",
      desc: row.excerpt || row.desc || "",
      content: row.content || "",
      image: row.image_url || "",
      date: String(row.published_at || row.created_at || "").slice(0, 10).replace(/-/g, "."),
      status: row.status || "published",
      sortOrder: row.sort_order || 0
    };
  }

  function articleListColumns() {
    return "id,slug,lang,title,tag,excerpt,image_url,status,published_at,created_at,sort_order";
  }

  function articleDetailColumns() {
    return "id,slug,lang,title,tag,excerpt,content,image_url,status,published_at,created_at,sort_order";
  }

  function normalizeGalleryItem(row) {
    return {
      id: row.id,
      src: row.src || "",
      storagePath: row.storage_path || "",
      label: row.label || "",
      tag: row.tag || "",
      alt: row.alt || row.label || "",
      featured: Boolean(row.featured),
      sortOrder: row.sort_order || 0
    };
  }

  async function fetchArticlePage(page, pageSize) {
    const safePage = Math.max(1, Number(page) || 1);
    const safePageSize = Math.max(1, Number(pageSize) || 6);
    const from = (safePage - 1) * safePageSize;
    const to = from + safePageSize - 1;
    const { data, error, count } = await client
      .from("articles")
      .select(articleListColumns(), { count: "exact" })
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .order("sort_order", { ascending: true })
      .range(from, to);

    if (error) throw error;
    return {
      articles: Array.isArray(data) ? data.map(normalizeArticle) : [],
      page: safePage,
      pageSize: safePageSize,
      totalCount: count || 0,
      totalPages: Math.max(1, Math.ceil((count || 0) / safePageSize))
    };
  }

  async function fetchLatestArticles(limit) {
    const safeLimit = Math.max(1, Number(limit) || 3);
    const { data, error } = await client
      .from("articles")
      .select(articleListColumns())
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .order("sort_order", { ascending: true })
      .range(0, safeLimit - 1);

    if (error) throw error;
    return Array.isArray(data) ? data.map(normalizeArticle) : [];
  }

  async function fetchArticleById(id) {
    const { data, error } = await client
      .from("articles")
      .select(articleDetailColumns())
      .eq("status", "published")
      .eq("slug", id)
      .maybeSingle();

    if (error) throw error;
    return data ? normalizeArticle(data) : null;
  }

  async function loadGallery() {
    const { data, error } = await client
      .from("gallery_items")
      .select("id,src,storage_path,label,tag,alt,featured,sort_order,created_at")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) throw error;
    if (Array.isArray(data) && data.length) {
      window.GOLYN_GALLERY_ITEMS = data.map(normalizeGalleryItem);
      if (window.GolynGallery && typeof window.GolynGallery.render === "function") {
        window.GolynGallery.render();
      }
    }
  }

  async function loadContent() {
    try {
      await loadGallery();
      return true;
    } catch (error) {
      console.warn("Supabase content fallback:", error.message);
      return false;
    }
  }

  window.GolynSupabaseContent = { fetchArticlePage, fetchLatestArticles, fetchArticleById };
  window.GolynSupabaseReady = loadContent();
})();
