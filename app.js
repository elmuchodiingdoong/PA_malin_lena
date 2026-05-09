const sidebar = document.getElementById("sidebar");
const detailPanel = document.getElementById("detail-panel");
const mapContainer = document.getElementById("basel-map");
const overallIntro = document.getElementById("overall-intro");

let activeThumb = null;
let activeTopicIndex = null;
let allTopics = [];
let map = null;
let mapMarkers = [];

const UI_TEXT = {
  error: "Fehler beim Laden. Bitte topics.json prüfen.",
  noTopics: "Keine Themen gefunden.",
  mapUnavailable: "Karte konnte nicht geladen werden.",
};

function getField(field) {
  if (Array.isArray(field)) {
    return field;
  }
  if (typeof field === "object" && field !== null) {
    if (Object.prototype.hasOwnProperty.call(field, "de")) {
      return field.de || "";
    }
    return field;
  }
  return field || "";
}

function markerTitle(topic, index) {
  return `${index + 1}. ${getField(topic.title)}`;
}

function formatLinkText(url) {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function appendLinkedText(container, value) {
  const text = String(value || "");
  const urlRegex = /(https?:\/\/[^\s)]+)/g;
  let lastIndex = 0;
  let match;

  while ((match = urlRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      container.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
    }

    const link = document.createElement("a");
    link.href = match[1];
    link.textContent = formatLinkText(match[1]);
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    container.appendChild(link);
    lastIndex = urlRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    container.appendChild(document.createTextNode(text.slice(lastIndex)));
  }
}

function appendInlineFormatting(container, value) {
  const text = String(value || "");
  const regex = /__([^_]+)__/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      appendLinkedText(container, text.slice(lastIndex, match.index));
    }
    const underline = document.createElement("u");
    underline.textContent = match[1];
    container.appendChild(underline);
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    appendLinkedText(container, text.slice(lastIndex));
  }
}

function renderDetail(topic, index) {
  const content = document.createElement("div");
  content.className = "detail-content";

  const heading = document.createElement("h2");
  heading.textContent = `${index + 1}. ${getField(topic.title)}`;

  const body = document.createElement("div");
  body.className = "detail-body";

  const imagesRow = document.createElement("div");
  imagesRow.className = "detail-images";

  const images = Array.isArray(topic.images) ? topic.images.slice(0, 3) : [];
  images.forEach((image, i) => {
    if (!image?.src) return;
    const img = document.createElement("img");
    img.className = "embed-img";
    img.src = image.src;
    img.alt = image.alt || `Thema Bild ${i + 1}`;
    img.loading = "lazy";
    img.addEventListener("error", () => img.remove());
    imagesRow.appendChild(img);
  });

  if (imagesRow.children.length) {
    body.appendChild(imagesRow);
  }
  appendRichText(body, getField(topic.text));
  content.appendChild(heading);
  content.appendChild(body);

  detailPanel.innerHTML = "";
  detailPanel.appendChild(content);
}

function appendRichText(container, value) {
  const addParagraph = (entry) => {
    if (!entry) return;
    const text = document.createElement("p");
    appendInlineFormatting(text, entry);
    container.appendChild(text);
  };

  const addBullets = (items) => {
    if (!Array.isArray(items) || !items.length) return;
    const list = document.createElement("ul");
    items.forEach((item) => {
      const li = document.createElement("li");
      appendInlineFormatting(li, item);
      list.appendChild(li);
    });
    container.appendChild(list);
  };

  if (Array.isArray(value)) {
    addBullets(value);
  } else if (typeof value === "object" && value !== null) {
    addParagraph(value.intro || "");
    addBullets(value.bullets || []);
    addParagraph(value.outro || "");
  } else {
    addParagraph(value);
  }
}

function renderIntroduction(introduction) {
  if (!overallIntro) return;
  if (!introduction) {
    overallIntro.innerHTML = "";
    overallIntro.style.display = "none";
    return;
  }

  overallIntro.style.display = "block";
  overallIntro.innerHTML = "";

  const card = document.createElement("div");
  card.className = "intro-card";

  const title = document.createElement("h2");
  title.textContent = introduction.title || "Einleitung";
  card.appendChild(title);

  appendRichText(card, getField(introduction.text || introduction));
  overallIntro.appendChild(card);
}

function activateTopic(index, options = {}) {
  const { focusMap = true } = options;
  const topic = allTopics[index];
  if (!topic) return;

  const buttons = sidebar.querySelectorAll(".thumb-item");
  const clickedBtn = buttons[index];
  if (clickedBtn) {
    if (activeThumb) activeThumb.classList.remove("active");
    clickedBtn.classList.add("active");
    activeThumb = clickedBtn;
  }

  activeTopicIndex = index;
  renderDetail(topic, index);

  const marker = mapMarkers[index];
  if (focusMap && map && marker) {
    map.flyTo(marker.getLatLng(), 14, { duration: 0.6 });
    marker.openPopup();
  }
}

function renderSidebar(topics) {
  sidebar.innerHTML = "";

  topics.forEach((topic, index) => {
    const btn = document.createElement("button");
    btn.className = "thumb-item";

    const wrapper = document.createElement("div");
    wrapper.className = "thumb-img-wrapper";

    const thumbImage = topic.images?.[0];
    if (thumbImage?.src) {
      const img = document.createElement("img");
      img.src = thumbImage.src;
      img.alt = thumbImage.alt || `Thema ${index + 1}`;
      img.loading = "lazy";
      img.addEventListener("error", () => {
        wrapper.classList.add("thumb-img-missing");
        img.remove();
      });
      wrapper.appendChild(img);
    } else {
      wrapper.classList.add("thumb-img-missing");
    }

    const label = document.createElement("span");
    label.className = "thumb-label";
    label.textContent = `${index + 1}. ${getField(topic.title)}`;

    btn.appendChild(wrapper);
    btn.appendChild(label);

    btn.addEventListener("click", () => {
      activateTopic(index);
    });

    sidebar.appendChild(btn);
  });

  if (topics.length && sidebar.firstElementChild) {
    activateTopic(0, { focusMap: false });
  }
}

function initMap(topics) {
  if (!mapContainer) return;
  if (!window.L) {
    mapContainer.textContent = UI_TEXT.mapUnavailable;
    return;
  }

  if (!map) {
    map = window.L.map("basel-map").setView([47.5596, 7.5886], 13);
    window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);
  }

  mapMarkers.forEach((marker) => marker.remove());
  mapMarkers = [];

  const bounds = [];

  topics.forEach((topic, index) => {
    const lat = topic.location?.lat;
    const lng = topic.location?.lng;
    if (typeof lat !== "number" || typeof lng !== "number") return;

    const marker = window.L.marker([lat, lng]).addTo(map);
    marker.bindPopup(markerTitle(topic, index));
    marker.on("click", () => {
      activateTopic(index, { focusMap: false });
    });

    mapMarkers[index] = marker;
    bounds.push([lat, lng]);
  });

  if (bounds.length) {
    map.fitBounds(bounds, { padding: [30, 30] });
  }
}

async function loadTopics() {
  try {
    const response = await fetch("content/topics.json");
    if (!response.ok) throw new Error("Could not load content/topics.json");

    const data = await response.json();
    renderIntroduction(data.introduction);
    allTopics = Array.isArray(data.topics) ? data.topics.slice(0, 8) : [];

    if (!allTopics.length) {
      sidebar.innerHTML = `<p class="loading-msg">${UI_TEXT.noTopics}</p>`;
      return;
    }

    renderSidebar(allTopics);
    initMap(allTopics);
  } catch (error) {
    const loadingEl = document.getElementById("loading");
    if (loadingEl) {
      loadingEl.textContent = UI_TEXT.error;
    }
    console.error(error);
  }
}

loadTopics();
