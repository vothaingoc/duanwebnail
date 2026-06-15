(function () {
  if (!window.CMS) return;

  const widthPattern = "(?:100|[1-9]?\\d)(?:\\.\\d+)?%|(?:[1-9]\\d{0,3})(?:\\.\\d+)?(?:px|rem|em|vw)";

  function clean(value) {
    return String(value || "").trim();
  }

  function escapeAttribute(value) {
    return clean(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function parseWidth(value) {
    const match = clean(value).match(/^(\d+(?:\.\d+)?)(%|px|rem|em|vw)$/i);
    return {
      amount: match ? match[1] : "",
      unit: match ? match[2].toLowerCase() : "%"
    };
  }

  function clampWidth(amount, unit) {
    const number = Number(amount);
    if (!Number.isFinite(number) || number <= 0) return "";
    if (unit === "%") return Math.min(100, Math.max(5, number));
    if (unit === "px") return Math.min(2000, Math.max(20, number));
    if (unit === "vw") return Math.min(100, Math.max(5, number));
    return Math.min(120, Math.max(1, number));
  }

  function registerImageWidthWidget() {
    if (!window.React || typeof CMS.registerWidget !== "function") return false;

    const React = window.React;
    const h = React.createElement;
    const units = ["%", "px", "rem", "em", "vw"];
    const presets = ["25%", "50%", "75%", "100%", "320px", "480px", "640px"];

    class ImageWidthControl extends React.Component {
      setWidth(amount, unit) {
        const next = clampWidth(amount, unit);
        this.props.onChange(next ? `${next}${unit}` : "");
      }

      adjust(delta) {
        const parsed = parseWidth(this.props.value);
        const current = Number(parsed.amount) || (parsed.unit === "%" ? 100 : 320);
        const step = parsed.unit === "px" ? 20 : parsed.unit === "rem" || parsed.unit === "em" ? 1 : 5;
        this.setWidth(current + delta * step, parsed.unit);
      }

      render() {
        const parsed = parseWidth(this.props.value);
        const wrapperStyle = {
          border: "1px solid #d5d7de",
          borderRadius: "6px",
          padding: "12px",
          background: "#fff"
        };
        const rowStyle = { display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" };
        const buttonStyle = {
          border: "1px solid #cbd1dc",
          borderRadius: "5px",
          background: "#f6f7fb",
          color: "#2b3340",
          minWidth: "34px",
          height: "34px",
          cursor: "pointer"
        };
        const inputStyle = {
          width: "110px",
          height: "34px",
          border: "1px solid #cbd1dc",
          borderRadius: "5px",
          padding: "0 9px"
        };
        const previewWidth = normalizeWidthForPreview(this.props.value);

        return h("div", { style: wrapperStyle },
          h("div", { style: rowStyle },
            h("button", { type: "button", style: buttonStyle, onClick: () => this.adjust(-1) }, "-"),
            h("input", {
              type: "number",
              min: "0",
              value: parsed.amount,
              placeholder: "Auto",
              style: inputStyle,
              onChange: event => this.setWidth(event.target.value, parsed.unit)
            }),
            h("select", {
              value: parsed.unit,
              style: Object.assign({}, inputStyle, { width: "78px" }),
              onChange: event => this.setWidth(parsed.amount || (event.target.value === "%" ? 100 : 320), event.target.value)
            }, units.map(unit => h("option", { key: unit, value: unit }, unit))),
            h("button", { type: "button", style: buttonStyle, onClick: () => this.adjust(1) }, "+"),
            h("button", {
              type: "button",
              style: Object.assign({}, buttonStyle, { minWidth: "64px" }),
              onClick: () => this.props.onChange("")
            }, "Auto")
          ),
          h("div", { style: Object.assign({}, rowStyle, { marginTop: "10px" }) },
            presets.map(preset => h("button", {
              key: preset,
              type: "button",
              style: Object.assign({}, buttonStyle, { minWidth: "58px", height: "30px", fontSize: "12px" }),
              onClick: () => this.props.onChange(preset)
            }, preset))
          ),
          h("div", {
            style: {
              width: "100%",
              maxWidth: "360px",
              height: "8px",
              marginTop: "12px",
              borderRadius: "999px",
              background: "#eceff4",
              overflow: "hidden"
            }
          }, h("div", {
            style: {
              width: previewWidth,
              height: "100%",
              background: "#3f6edb"
            }
          }))
        );
      }
    }

    function normalizeWidthForPreview(value) {
      const parsed = parseWidth(value);
      if (!parsed.amount) return "100%";
      if (parsed.unit === "%") return `${clampWidth(parsed.amount, "%")}%`;
      if (parsed.unit === "vw") return `${clampWidth(parsed.amount, "vw")}%`;
      const px = parsed.unit === "px" ? Number(parsed.amount) : Number(parsed.amount) * 16;
      return `${Math.min(100, Math.max(5, (px / 640) * 100))}%`;
    }

    CMS.registerWidget("image_width", ImageWidthControl);
    return true;
  }

  const widthWidget = registerImageWidthWidget() ? "image_width" : "string";

  function setInputValue(input, value) {
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
    setter.call(input, value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function previewWidth(value) {
    const parsed = parseWidth(value);
    if (!parsed.amount) return "100%";
    if (parsed.unit === "%" || parsed.unit === "vw") return `${clampWidth(parsed.amount, parsed.unit)}%`;
    const px = parsed.unit === "px" ? Number(parsed.amount) : Number(parsed.amount) * 16;
    return `${Math.min(100, Math.max(5, (px / 640) * 100))}%`;
  }

  function findWidthField(input) {
    let node = input.parentElement;
    for (let i = 0; node && i < 7; i += 1, node = node.parentElement) {
      const controls = node.querySelectorAll("input, textarea, select");
      const text = clean(node.textContent).toUpperCase();
      if (controls.length === 1 && controls[0] === input && text.includes("WIDTH")) {
        return node;
      }
    }
    return null;
  }

  function findSizedImageBlock(input) {
    let node = input.parentElement;
    for (let i = 0; node && i < 12; i += 1, node = node.parentElement) {
      const text = clean(node.textContent).toUpperCase();
      if (text.includes("SIZED IMAGE") && node.querySelector("img")) return node;
    }
    return null;
  }

  function imageKey(src) {
    try {
      const url = new URL(src, window.location.href);
      return decodeURIComponent(url.pathname.split("/").filter(Boolean).pop() || url.pathname);
    } catch (_) {
      return String(src || "").split(/[?#]/)[0].split("/").pop();
    }
  }

  function sameImage(a, b) {
    const first = imageKey(a);
    const second = imageKey(b);
    return Boolean(first && second && first === second);
  }

  function applyWidthToPreview(input) {
    const block = findSizedImageBlock(input);
    if (!block) return;
    const blockImages = Array.from(block.querySelectorAll("img"))
      .map(img => img.currentSrc || img.src)
      .filter(Boolean);
    if (!blockImages.length) return;

    const width = normalizeImageWidth(input.value);
    document.querySelectorAll("img").forEach(img => {
      if (block.contains(img)) return;
      const src = img.currentSrc || img.src;
      if (!blockImages.some(blockSrc => sameImage(blockSrc, src))) return;
      img.style.maxWidth = "100%";
      img.style.height = "auto";
      img.style.display = "block";
      if (width) {
        img.style.width = width;
      } else {
        img.style.removeProperty("width");
      }
    });
  }

  function syncAllPreviewWidths() {
    document.querySelectorAll("input[data-golyn-width-enhanced='true'], textarea[data-golyn-width-enhanced='true']").forEach(input => {
      applyWidthToPreview(input);
    });
  }

  function makeButton(label, onClick) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = label;
    button.style.border = "1px solid #cbd1dc";
    button.style.borderRadius = "5px";
    button.style.background = "#f6f7fb";
    button.style.color = "#1f2937";
    button.style.minWidth = label.length > 3 ? "58px" : "34px";
    button.style.height = "32px";
    button.style.padding = "0 10px";
    button.style.cursor = "pointer";
    button.addEventListener("click", onClick);
    return button;
  }

  function enhanceWidthInput(input) {
    if (input.dataset.golynWidthEnhanced === "true") return;
    const field = findWidthField(input);
    if (!field) return;

    input.dataset.golynWidthEnhanced = "true";
    input.placeholder = "Auto, 50%, 360px...";

    const units = ["%", "px", "rem", "em", "vw"];
    const presets = ["25%", "50%", "75%", "100%", "320px", "480px", "640px"];
    const controls = document.createElement("div");
    controls.style.display = "grid";
    controls.style.gap = "10px";
    controls.style.marginTop = "10px";
    controls.style.padding = "12px";
    controls.style.border = "1px solid #d5d7de";
    controls.style.borderRadius = "6px";
    controls.style.background = "#fff";

    const row = document.createElement("div");
    row.style.display = "flex";
    row.style.flexWrap = "wrap";
    row.style.alignItems = "center";
    row.style.gap = "8px";

    const unitSelect = document.createElement("select");
    unitSelect.style.height = "32px";
    unitSelect.style.border = "1px solid #cbd1dc";
    unitSelect.style.borderRadius = "5px";
    unitSelect.style.padding = "0 8px";
    units.forEach(unit => {
      const option = document.createElement("option");
      option.value = unit;
      option.textContent = unit;
      unitSelect.appendChild(option);
    });

    const bar = document.createElement("div");
    bar.style.width = "100%";
    bar.style.maxWidth = "360px";
    bar.style.height = "8px";
    bar.style.borderRadius = "999px";
    bar.style.background = "#eceff4";
    bar.style.overflow = "hidden";

    const fill = document.createElement("div");
    fill.style.height = "100%";
    fill.style.background = "#3f6edb";
    bar.appendChild(fill);

    const update = () => {
      const parsed = parseWidth(input.value);
      unitSelect.value = parsed.unit;
      fill.style.width = previewWidth(input.value);
      applyWidthToPreview(input);
      window.setTimeout(() => applyWidthToPreview(input), 120);
    };

    const write = value => {
      setInputValue(input, value);
      update();
    };

    const adjust = direction => {
      const parsed = parseWidth(input.value);
      const unit = parsed.unit || unitSelect.value || "%";
      const current = Number(parsed.amount) || (unit === "%" ? 100 : 320);
      const step = unit === "px" ? 20 : unit === "rem" || unit === "em" ? 1 : 5;
      const next = clampWidth(current + direction * step, unit);
      write(next ? `${next}${unit}` : "");
    };

    unitSelect.addEventListener("change", () => {
      const parsed = parseWidth(input.value);
      const amount = parsed.amount || (unitSelect.value === "%" ? 100 : 320);
      const next = clampWidth(amount, unitSelect.value);
      write(next ? `${next}${unitSelect.value}` : "");
    });
    input.addEventListener("input", update);

    row.appendChild(makeButton("-", () => adjust(-1)));
    row.appendChild(makeButton("+", () => adjust(1)));
    row.appendChild(unitSelect);
    row.appendChild(makeButton("Auto", () => write("")));

    const presetRow = document.createElement("div");
    presetRow.style.display = "flex";
    presetRow.style.flexWrap = "wrap";
    presetRow.style.gap = "8px";
    presets.forEach(preset => presetRow.appendChild(makeButton(preset, () => write(preset))));

    controls.appendChild(row);
    controls.appendChild(presetRow);
    controls.appendChild(bar);
    input.insertAdjacentElement("afterend", controls);
    update();
  }

  function enhanceSizedImageWidthControls() {
    document.querySelectorAll("input, textarea").forEach(input => {
      if (findWidthField(input)) enhanceWidthInput(input);
    });
    syncAllPreviewWidths();
  }

  const observer = new MutationObserver(() => enhanceSizedImageWidthControls());
  if (document.body) {
    observer.observe(document.body, { childList: true, subtree: true });
    enhanceSizedImageWidthControls();
  } else {
    document.addEventListener("DOMContentLoaded", () => {
      observer.observe(document.body, { childList: true, subtree: true });
      enhanceSizedImageWidthControls();
    });
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
        widget: widthWidget,
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
