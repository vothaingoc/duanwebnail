(function () {
  if (!window.CMS) return;

  const widthPattern = "(?:100|[1-9]?\\d)(?:\\.\\d+)?%|(?:[1-9]\\d{0,3})(?:\\.\\d+)?(?:px|rem|em|vw)";

  function clean(value) {
    return String(value || "").trim();
  }

  function escapeAttribute(value) {
    return clean(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function attributeValue(attrs, name) {
    const match = String(attrs || "").match(new RegExp(`${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i"));
    return match ? clean(match[1] || match[2] || match[3]) : "";
  }

  function widthFromStyle(style) {
    const match = String(style || "").match(/(?:^|;)\s*width\s*:\s*([^;]+)/i);
    return match ? clean(match[1]) : "";
  }

  function normalizeAlign(value) {
    const align = clean(value).toLowerCase();
    return ["left", "center", "right"].includes(align) ? align : "center";
  }

  function alignFromStyle(style) {
    const value = String(style || "").toLowerCase();
    if (/margin-left\s*:\s*auto/.test(value) && /margin-right\s*:\s*0/.test(value)) return "right";
    if (/margin-left\s*:\s*auto/.test(value) && /margin-right\s*:\s*auto/.test(value)) return "center";
    if (/margin-left\s*:\s*0/.test(value) && /margin-right\s*:\s*auto/.test(value)) return "left";
    return "center";
  }

  function alignStyle(value) {
    const align = normalizeAlign(value);
    if (align === "left") return "display:block;margin-left:0;margin-right:auto;";
    if (align === "right") return "display:block;margin-left:auto;margin-right:0;";
    return "display:block;margin-left:auto;margin-right:auto;";
  }

  function normalizeEditorWidth(value) {
    return new RegExp(`^(?:${widthPattern})$`, "i").test(clean(value)) ? clean(value) : "";
  }

  function imageBlockHTML(image, alt, title, width, align) {
    const safeWidth = normalizeEditorWidth(width);
    const titleAttr = title ? ` title="${escapeAttribute(title)}"` : "";
    const widthStyle = safeWidth ? `width:${escapeAttribute(safeWidth)};` : "";
    return `<img class="article-inline-image" src="${escapeAttribute(image)}" alt="${escapeAttribute(alt)}"${titleAttr} data-align="${normalizeAlign(align)}" style="${widthStyle}max-width:100%;height:auto;${alignStyle(align)}">`;
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

  function escapeHTML(value) {
    return String(value || "").replace(/[&<>"']/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[char]));
  }

  function normalizeTextSize(value) {
    const size = clean(value);
    return /^(?:[8-9]|[1-5]\d|60)(?:\.\d+)?px$|^(?:0?\.\d+|[1-4](?:\.\d+)?|5)rem$|^(?:[8-9]|[1-5]\d|60)(?:\.\d+)?pt$/i.test(size)
      ? size
      : "16px";
  }

  function normalizeTextColor(value) {
    const color = clean(value);
    return /^#[0-9a-f]{3}(?:[0-9a-f]{3})?$/i.test(color) ? color : "#4A2E10";
  }

  function normalizeTextFont(value) {
    const font = clean(value).toLowerCase();
    return ["default", "sans", "serif", "japanese", "vietnamese"].includes(font) ? font : "default";
  }

  function fontStyle(value) {
    const font = normalizeTextFont(value);
    if (font === "serif") return "font-family:'Cormorant Garamond',serif;";
    if (font === "japanese") return "font-family:'Noto Sans JP','Yu Gothic',sans-serif;";
    if (font === "vietnamese") return "font-family:'Be Vietnam Pro',Arial,sans-serif;";
    if (font === "sans") return "font-family:'Jost',Arial,sans-serif;";
    return "";
  }

  function styleValue(style, property) {
    const match = String(style || "").match(new RegExp(`(?:^|;)\\s*${property}\\s*:\\s*([^;]+)`, "i"));
    return match ? clean(match[1]) : "";
  }

  function fontKeyFromStyle(style) {
    const family = styleValue(style, "font-family").toLowerCase();
    if (family.includes("cormorant")) return "serif";
    if (family.includes("noto sans jp") || family.includes("yu gothic")) return "japanese";
    if (family.includes("be vietnam")) return "vietnamese";
    if (family.includes("jost") || family.includes("arial")) return "sans";
    return "default";
  }

  function styledTextHTML(text, font, size, color) {
    return `<div class="article-styled-text" data-font="${normalizeTextFont(font)}" style="${fontStyle(font)}font-size:${escapeAttribute(normalizeTextSize(size))};color:${escapeAttribute(normalizeTextColor(color))};">${escapeHTML(text).replace(/\n/g, "<br>")}</div>`;
  }

  function normalizeTextAlign(value) {
    const align = clean(value).toLowerCase();
    return ["left", "center", "right"].includes(align) ? align : "";
  }

  function styledInlineHTML(text, font, size, color) {
    return `<span class="article-styled-inline" data-font="${normalizeTextFont(font)}" style="${fontStyle(font)}font-size:${escapeAttribute(normalizeTextSize(size))};color:${escapeAttribute(normalizeTextColor(color))};">${escapeHTML(text)}</span>`;
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
    const prototype = input instanceof window.HTMLSelectElement
      ? window.HTMLSelectElement.prototype
      : input instanceof window.HTMLTextAreaElement
        ? window.HTMLTextAreaElement.prototype
        : window.HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(prototype, "value").set;
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

  function findFieldByLabel(control, label) {
    let node = control.parentElement;
    const expected = clean(label).toUpperCase();
    for (let i = 0; node && i < 7; i += 1, node = node.parentElement) {
      const controls = node.querySelectorAll("input, textarea, select");
      const text = clean(node.textContent).toUpperCase();
      if (controls.length === 1 && controls[0] === control && text.includes(expected)) {
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

  function previewDocuments() {
    const docs = [document];
    document.querySelectorAll("iframe").forEach(frame => {
      try {
        if (frame.contentDocument) docs.push(frame.contentDocument);
      } catch (_) {
        // Cross-origin frames cannot be inspected.
      }
    });
    return docs;
  }

  function enhancedWidthInputs() {
    return Array.from(document.querySelectorAll("input[data-golyn-width-enhanced='true'], textarea[data-golyn-width-enhanced='true']"));
  }

  function previewImagesFor(input, block, blockImages) {
    const inputIndex = enhancedWidthInputs().indexOf(input);
    const candidates = [];

    previewDocuments().forEach(doc => {
      doc.querySelectorAll("img").forEach(img => {
        if (doc === document && block.contains(img)) return;
        const src = img.currentSrc || img.src;
        if (!src) return;
        candidates.push(img);
      });
    });

    const matching = candidates.filter(img => {
      const src = img.currentSrc || img.src;
      return blockImages.some(blockSrc => sameImage(blockSrc, src));
    });
    if (matching.length) return matching;

    return inputIndex >= 0 && candidates[inputIndex] ? [candidates[inputIndex]] : [];
  }

  function applyWidthToPreview(input) {
    const block = findSizedImageBlock(input);
    if (!block) return;
    const blockImages = Array.from(block.querySelectorAll("img"))
      .map(img => img.currentSrc || img.src)
      .filter(Boolean);
    if (!blockImages.length) return;

    const width = normalizeImageWidth(input.value);
    previewImagesFor(input, block, blockImages).forEach(img => {
      img.style.maxWidth = "100%";
      img.style.height = "auto";
      img.style.display = "block";
      img.style.objectFit = "contain";
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
    button.addEventListener("mousedown", event => event.preventDefault());
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

  function enhanceAlignControl(control) {
    if (control.dataset.golynAlignEnhanced === "true") return;
    const field = findFieldByLabel(control, "ALIGN");
    if (!field) return;
    control.dataset.golynAlignEnhanced = "true";

    const controls = document.createElement("div");
    controls.style.display = "flex";
    controls.style.flexWrap = "wrap";
    controls.style.gap = "8px";
    controls.style.marginTop = "10px";
    controls.style.padding = "12px";
    controls.style.border = "1px solid #d5d7de";
    controls.style.borderRadius = "6px";
    controls.style.background = "#fff";

    [
      ["left", "Left"],
      ["center", "Center"],
      ["right", "Right"]
    ].forEach(([value, label]) => {
      controls.appendChild(makeButton(label, () => setInputValue(control, value)));
    });

    control.insertAdjacentElement("afterend", controls);
  }

  function enhanceTextSizeInput(input) {
    if (input.dataset.golynTextSizeEnhanced === "true") return;
    const field = findFieldByLabel(input, "FONT SIZE");
    if (!field) return;
    input.dataset.golynTextSizeEnhanced = "true";
    input.placeholder = "16px";

    const presets = ["14px", "16px", "18px", "20px", "24px", "32px"];
    const controls = document.createElement("div");
    controls.style.display = "flex";
    controls.style.flexWrap = "wrap";
    controls.style.gap = "8px";
    controls.style.marginTop = "10px";
    controls.style.padding = "12px";
    controls.style.border = "1px solid #d5d7de";
    controls.style.borderRadius = "6px";
    controls.style.background = "#fff";

    const adjust = direction => {
      const parsed = clean(input.value).match(/^(\d+(?:\.\d+)?)(px|pt|rem)$/i);
      const unit = parsed ? parsed[2].toLowerCase() : "px";
      const current = parsed ? Number(parsed[1]) : 16;
      const step = unit === "rem" ? 0.1 : 1;
      const next = Math.max(unit === "rem" ? 0.5 : 8, current + direction * step);
      setInputValue(input, `${Number(next.toFixed(2))}${unit}`);
    };

    controls.appendChild(makeButton("-", () => adjust(-1)));
    controls.appendChild(makeButton("+", () => adjust(1)));
    presets.forEach(preset => controls.appendChild(makeButton(preset, () => setInputValue(input, preset))));
    input.insertAdjacentElement("afterend", controls);
  }

  function enhanceTextColorInput(input) {
    if (input.dataset.golynTextColorEnhanced === "true") return;
    const field = findFieldByLabel(input, "COLOR");
    if (!field) return;
    input.dataset.golynTextColorEnhanced = "true";
    input.placeholder = "#4A2E10";

    const colors = ["#1C1008", "#4A2E10", "#A0722A", "#C9963C", "#BC002D", "#0F766E", "#2563EB", "#7C3AED"];
    const controls = document.createElement("div");
    controls.style.display = "flex";
    controls.style.flexWrap = "wrap";
    controls.style.alignItems = "center";
    controls.style.gap = "8px";
    controls.style.marginTop = "10px";
    controls.style.padding = "12px";
    controls.style.border = "1px solid #d5d7de";
    controls.style.borderRadius = "6px";
    controls.style.background = "#fff";

    const picker = document.createElement("input");
    picker.type = "color";
    picker.value = normalizeTextColor(input.value);
    picker.style.width = "42px";
    picker.style.height = "32px";
    picker.style.border = "1px solid #cbd1dc";
    picker.style.borderRadius = "5px";
    picker.addEventListener("input", () => setInputValue(input, picker.value));
    input.addEventListener("input", () => {
      picker.value = normalizeTextColor(input.value);
    });
    controls.appendChild(picker);

    colors.forEach(color => {
      const button = makeButton("", () => setInputValue(input, color));
      button.style.background = color;
      button.style.minWidth = "28px";
      button.style.width = "28px";
      button.style.padding = "0";
      button.title = color;
      controls.appendChild(button);
    });

    input.insertAdjacentElement("afterend", controls);
  }

  function enhanceSizedImageWidthControls() {
    document.querySelectorAll("input, textarea").forEach(input => {
      if (findWidthField(input)) enhanceWidthInput(input);
      if (findFieldByLabel(input, "FONT SIZE")) enhanceTextSizeInput(input);
      if (findFieldByLabel(input, "COLOR")) enhanceTextColorInput(input);
    });
    document.querySelectorAll("input, textarea, select").forEach(control => {
      if (findFieldByLabel(control, "ALIGN")) enhanceAlignControl(control);
    });
    syncAllPreviewWidths();
  }

  function editorToolbarCandidates() {
    const candidates = Array.from(document.querySelectorAll("div")).filter(node => {
      const text = clean(node.textContent);
      return text.includes("Rich Text") && text.includes("Markdown") && !node.querySelector("textarea");
    });
    return candidates.filter(node => !candidates.some(other => other !== node && node.contains(other)));
  }

  function closestToolbarFromText() {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let node = walker.nextNode();
    while (node) {
      if (clean(node.nodeValue).includes("Rich Text")) {
        let parent = node.parentElement;
        for (let i = 0; parent && i < 8; i += 1, parent = parent.parentElement) {
          const text = clean(parent.textContent);
          if (text.includes("Rich Text") && text.includes("Markdown") && !parent.querySelector("textarea")) {
            return parent;
          }
        }
      }
      node = walker.nextNode();
    }
    return null;
  }

  function activeEditorTarget() {
    const selection = window.getSelection && window.getSelection();
    if (selection && selection.rangeCount) {
      let node = selection.anchorNode;
      while (node && node !== document.body) {
        if (node.nodeType === 1 && node.isContentEditable) return node;
        node = node.parentNode;
      }
    }
    const active = document.activeElement;
    if (active && (active.tagName === "TEXTAREA" || active.tagName === "INPUT" || active.isContentEditable)) return active;
    return null;
  }

  function insertAtTextarea(textarea, html, plainText) {
    const start = textarea.selectionStart || 0;
    const end = textarea.selectionEnd || start;
    const before = textarea.value.slice(0, start);
    const after = textarea.value.slice(end);
    const selected = textarea.value.slice(start, end) || plainText;
    const htmlWithText = html(selected);
    setInputValue(textarea, before + htmlWithText + after);
    textarea.focus();
    textarea.setSelectionRange(start + htmlWithText.length, start + htmlWithText.length);
  }

  function insertStyledInline(font, size, color) {
    const target = activeEditorTarget();
    const selection = window.getSelection && window.getSelection();
    const selectedText = selection && selection.rangeCount ? selection.toString() : "";
    const fallbackText = selectedText || window.prompt("Text to style", "") || "";
    if (!fallbackText) return;

    const build = text => styledInlineHTML(text, font, size, color);
    if (target && (target.tagName === "TEXTAREA" || target.tagName === "INPUT")) {
      insertAtTextarea(target, build, fallbackText);
      return;
    }

    if (selection && selection.rangeCount) {
      document.execCommand("insertHTML", false, build(fallbackText));
      const editor = activeEditorTarget();
      if (editor) editor.dispatchEvent(new Event("input", { bubbles: true }));
    }
  }

  function alignSelectedText(value) {
    const command = value === "center" ? "justifyCenter" : value === "right" ? "justifyRight" : "justifyLeft";
    const target = activeEditorTarget();
    if (target && (target.tagName === "TEXTAREA" || target.tagName === "INPUT")) {
      const start = target.selectionStart || 0;
      const end = target.selectionEnd || start;
      const selected = target.value.slice(start, end) || window.prompt("Text to align", "") || "";
      if (!selected) return;
      const style = value === "center"
        ? "text-align:center;"
        : value === "right"
          ? "text-align:right;"
          : "text-align:left;";
      const html = `<div class="article-styled-text" style="${style}">${escapeHTML(selected).replace(/\n/g, "<br>")}</div>`;
      setInputValue(target, target.value.slice(0, start) + html + target.value.slice(end));
      target.focus();
      target.setSelectionRange(start + html.length, start + html.length);
      return;
    }
    document.execCommand(command, false, null);
    const editor = activeEditorTarget();
    if (editor) editor.dispatchEvent(new Event("input", { bubbles: true }));
  }

  function createTextToolbarControls() {
    const controls = document.createElement("div");
    controls.style.display = "inline-flex";
    controls.style.alignItems = "center";
    controls.style.flexWrap = "wrap";
    controls.style.gap = "6px";

    const font = document.createElement("select");
    font.title = "Font";
    font.style.height = "28px";
    font.style.border = "1px solid #cbd1dc";
    font.style.borderRadius = "5px";
    [
      ["default", "Default"],
      ["sans", "Sans"],
      ["serif", "Serif"],
      ["japanese", "JP"],
      ["vietnamese", "VI"]
    ].forEach(([value, label]) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = label;
      font.appendChild(option);
    });

    const size = document.createElement("select");
    size.title = "Font size";
    size.style.height = "28px";
    size.style.border = "1px solid #cbd1dc";
    size.style.borderRadius = "5px";
    ["14px", "16px", "18px", "20px", "24px", "32px"].forEach(value => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      size.appendChild(option);
    });
    size.value = "16px";

    const color = document.createElement("input");
    color.type = "color";
    color.title = "Text color";
    color.value = "#4A2E10";
    color.style.width = "32px";
    color.style.height = "28px";
    color.style.border = "1px solid #cbd1dc";
    color.style.borderRadius = "5px";

    const apply = makeButton("A", () => insertStyledInline(font.value, size.value, color.value));
    apply.title = "Apply text style to selected text";
    apply.style.fontWeight = "700";

    const smaller = makeButton("A-", () => {
      const current = parseInt(size.value, 10) || 16;
      size.value = `${Math.max(8, current - 2)}px`;
    });
    smaller.title = "Decrease selected text size";
    const larger = makeButton("A+", () => {
      const current = parseInt(size.value, 10) || 16;
      size.value = `${Math.min(60, current + 2)}px`;
    });
    larger.title = "Increase selected text size";

    const alignLeft = makeButton("L", () => alignSelectedText("left"));
    alignLeft.title = "Align left";
    const alignCenter = makeButton("C", () => alignSelectedText("center"));
    alignCenter.title = "Align center";
    const alignRight = makeButton("R", () => alignSelectedText("right"));
    alignRight.title = "Align right";

    controls.appendChild(font);
    controls.appendChild(smaller);
    controls.appendChild(size);
    controls.appendChild(larger);
    controls.appendChild(color);
    controls.appendChild(apply);
    controls.appendChild(alignLeft);
    controls.appendChild(alignCenter);
    controls.appendChild(alignRight);
    return controls;
  }

  function enhanceRichTextToolbar() {
    if (document.querySelector("[data-golyn-persistent-text-toolbar='true']")) return;
    const toolbars = editorToolbarCandidates();
    const fallback = closestToolbarFromText();
    if (!toolbars.length && fallback) toolbars.push(fallback);
    toolbars.forEach(toolbar => {
      if (toolbar.dataset.golynTextToolbar === "true") return;
      toolbar.dataset.golynTextToolbar = "true";

      const controls = createTextToolbarControls();
      controls.style.marginLeft = "10px";
      controls.style.paddingLeft = "10px";
      controls.style.borderLeft = "1px solid #c4c8d2";
      toolbar.appendChild(controls);
    });
  }

  function elementOwnText(element) {
    return Array.from(element.childNodes)
      .filter(node => node.nodeType === Node.TEXT_NODE)
      .map(node => clean(node.nodeValue))
      .join(" ")
      .trim();
  }

  function bodyFieldHost() {
    const labels = Array.from(document.querySelectorAll("label, span, div")).filter(element => {
      return elementOwnText(element).toUpperCase() === "BODY";
    });

    for (const label of labels) {
      let node = label.parentElement;
      for (let i = 0; node && i < 10; i += 1, node = node.parentElement) {
        const text = clean(node.textContent);
        const hasEditor = node.querySelector("textarea, [contenteditable='true']");
        if (hasEditor && text.includes("Rich Text") && text.includes("Markdown")) return node;
      }
    }

    return null;
  }

  function persistentToolbarHost() {
    const bodyHost = bodyFieldHost();
    if (bodyHost) return bodyHost;

    const toolbar = closestToolbarFromText() || editorToolbarCandidates()[0];
    if (!toolbar) return null;

    let node = toolbar;
    for (let i = 0; node && i < 5; i += 1, node = node.parentElement) {
      const text = clean(node.textContent);
      if (text.includes("Rich Text") && text.includes("Markdown")) return node;
    }
    return toolbar.parentElement || toolbar;
  }

  function ensurePersistentTextToolbar() {
    const host = persistentToolbarHost();
    if (!host || document.querySelector("[data-golyn-persistent-text-toolbar='true']")) return;

    const bar = document.createElement("div");
    bar.dataset.golynPersistentTextToolbar = "true";
    bar.style.display = "flex";
    bar.style.alignItems = "center";
    bar.style.flexWrap = "wrap";
    bar.style.gap = "8px";
    bar.style.margin = "0";
    bar.style.padding = "8px 12px";
    bar.style.borderTop = "1px solid #c4c8d2";
    bar.style.borderBottom = "1px solid #c4c8d2";
    bar.style.background = "#eef0f5";

    const label = document.createElement("span");
    label.textContent = "Text tools";
    label.style.fontSize = "12px";
    label.style.fontWeight = "700";
    label.style.color = "#4b5563";
    label.style.marginRight = "4px";
    bar.appendChild(label);
    bar.appendChild(createTextToolbarControls());

    const bodyHost = bodyFieldHost();
    if (bodyHost) {
      const labelElement = Array.from(bodyHost.querySelectorAll("label, span, div")).find(element => elementOwnText(element).toUpperCase() === "BODY");
      if (labelElement && labelElement.parentElement === bodyHost) {
        labelElement.insertAdjacentElement("afterend", bar);
      } else {
        bodyHost.insertAdjacentElement("afterbegin", bar);
      }
      return;
    }

    const toolbar = closestToolbarFromText() || editorToolbarCandidates()[0];
    if (toolbar && toolbar.parentElement) {
      toolbar.insertAdjacentElement("afterend", bar);
    } else {
      host.insertAdjacentElement("afterbegin", bar);
    }
  }

  const observer = new MutationObserver(() => {
    enhanceSizedImageWidthControls();
    ensurePersistentTextToolbar();
    enhanceRichTextToolbar();
  });
  if (document.body) {
    observer.observe(document.body, { childList: true, subtree: true });
    enhanceSizedImageWidthControls();
    ensurePersistentTextToolbar();
    enhanceRichTextToolbar();
  } else {
    document.addEventListener("DOMContentLoaded", () => {
      observer.observe(document.body, { childList: true, subtree: true });
      enhanceSizedImageWidthControls();
      ensurePersistentTextToolbar();
      enhanceRichTextToolbar();
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
      },
      {
        name: "align",
        label: "Align",
        widget: "select",
        options: [
          { label: "Left", value: "left" },
          { label: "Center", value: "center" },
          { label: "Right", value: "right" }
        ],
        default: "center",
        required: false
      }
    ],
    pattern: new RegExp("<img\\b([^>]*)>|!\\[([^\\]]*)\\]\\((\\S+?)(?:\\s+\"([^\"]*)\")?\\)(?:\\s*\\{width=(" + widthPattern + ")\\})?", "i"),
    fromBlock(match) {
      if (match[1]) {
        const attrs = match[1];
        return {
          alt: attributeValue(attrs, "alt"),
          image: attributeValue(attrs, "src"),
          title: attributeValue(attrs, "title"),
          width: attributeValue(attrs, "width") || widthFromStyle(attributeValue(attrs, "style")),
          align: attributeValue(attrs, "data-align") || alignFromStyle(attributeValue(attrs, "style"))
        };
      }
      return {
        alt: match[2] || "",
        image: match[3] || "",
        title: match[4] || "",
        width: match[5] || "",
        align: "center"
      };
    },
    toBlock(data) {
      const image = clean(data.image);
      const alt = clean(data.alt);
      const title = clean(data.title);
      const width = clean(data.width);
      return imageBlockHTML(image, alt, title, width, data.align);
    },
    toPreview(data) {
      const image = clean(data.image);
      const alt = escapeAttribute(data.alt);
      const title = escapeAttribute(data.title);
      const width = normalizeEditorWidth(data.width);
      const style = width
        ? ` style="width:${escapeAttribute(width)};max-width:100%;height:auto;${alignStyle(data.align)}"`
        : ` style="max-width:100%;height:auto;${alignStyle(data.align)}"`;
      const titleAttr = title ? ` title="${title}"` : "";
      return `<img src="${escapeAttribute(image)}" alt="${alt}"${titleAttr} data-align="${normalizeAlign(data.align)}"${style}>`;
    }
  });

  CMS.registerEditorComponent({
    id: "styled-text",
    label: "Styled Text",
    fields: [
      {
        name: "text",
        label: "Text",
        widget: "text",
        required: true
      },
      {
        name: "font",
        label: "Font",
        widget: "select",
        options: [
          { label: "Default", value: "default" },
          { label: "Sans", value: "sans" },
          { label: "Serif", value: "serif" },
          { label: "Japanese", value: "japanese" },
          { label: "Vietnamese", value: "vietnamese" }
        ],
        default: "default",
        required: false
      },
      {
        name: "size",
        label: "Font Size",
        widget: "string",
        default: "16px",
        required: false,
        hint: "Examples: 14px, 18px, 24px, 1.2rem."
      },
      {
        name: "color",
        label: "Color",
        widget: "string",
        default: "#4A2E10",
        required: false,
        hint: "Use a hex color such as #4A2E10."
      }
    ],
    pattern: /<div\b([^>]*)class=(?:"[^"]*\barticle-styled-text\b[^"]*"|'[^']*\barticle-styled-text\b[^']*')[^>]*>([\s\S]*?)<\/div>/i,
    fromBlock(match) {
      const attrs = match[1] || "";
      const style = attributeValue(attrs, "style");
      return {
        text: decodeHTML(match[2] || ""),
        font: attributeValue(attrs, "data-font") || fontKeyFromStyle(style),
        size: styleValue(style, "font-size") || "16px",
        color: styleValue(style, "color") || "#4A2E10"
      };
    },
    toBlock(data) {
      return styledTextHTML(data.text, data.font, data.size, data.color);
    },
    toPreview(data) {
      return styledTextHTML(data.text, data.font, data.size, data.color);
    }
  });
})();
