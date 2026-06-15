(function () {
  if (!window.CMS) return;

  const widthPattern = "(?:100|[1-9]?\\d)(?:\\.\\d+)?%|(?:[1-9]\\d{0,3})(?:\\.\\d+)?(?:px|rem|em|vw)";

  function clean(value) {
    return String(value || "").trim();
  }

  function escapeAttribute(value) {
    return clean(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  CMS.registerEditorComponent({
    id: "sized-image",
    label: "Sized Image",
    fields: [
      {
        name: "image",
        label: "Image",
        widget: "image",
        required: true,
        hint: "Choose an uploaded image or replace with a Cloudflare R2 URL."
      },
      {
        name: "alt",
        label: "Alt Text",
        widget: "string",
        required: false
      },
      {
        name: "title",
        label: "Title",
        widget: "string",
        required: false
      },
      {
        name: "width",
        label: "Width",
        widget: "string",
        required: false,
        hint: "Examples: 50%, 80%, 360px, 28rem. Leave blank for full width."
      }
    ],
    pattern: new RegExp("!\\[([^\\]]*)\\]\\((\\S+?)(?:\\s+\"([^\"]*)\")?\\)(?:\\s*\\{width=(" + widthPattern + ")\\})?", "i"),
    fromBlock(match) {
      return {
        alt: match[1] || "",
        image: match[2] || "",
        title: match[3] || "",
        width: match[4] || ""
      };
    },
    toBlock(data) {
      const image = clean(data.image);
      const alt = clean(data.alt);
      const title = clean(data.title);
      const width = clean(data.width);
      const titleText = title ? ` "${title}"` : "";
      const widthText = width ? `{width=${width}}` : "";
      return `![${alt}](${image}${titleText})${widthText}`;
    },
    toPreview(data) {
      const image = clean(data.image);
      const alt = escapeAttribute(data.alt);
      const title = escapeAttribute(data.title);
      const width = clean(data.width);
      const style = width ? ` style="width:${escapeAttribute(width)};max-width:100%;height:auto;"` : ' style="max-width:100%;height:auto;"';
      const titleAttr = title ? ` title="${title}"` : "";
      return `<img src="${escapeAttribute(image)}" alt="${alt}"${titleAttr}${style}>`;
    }
  });
})();
