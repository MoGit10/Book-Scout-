// DOM Elements
const qInput = document.getElementById("q");
const btnSearch = document.getElementById("btnSearch");
const subjectSelect = document.getElementById("subject");
const limitSelect = document.getElementById("limit");
const btnSubject = document.getElementById("btnSubject");
const statusEl = document.getElementById("status");
const hintEl = document.getElementById("hint");
const gridEl = document.getElementById("grid");

const overlay = document.getElementById("overlay");
const closeModal = document.getElementById("closeModal");
const modalTitle = document.getElementById("modalTitle");
const modalBody = document.getElementById("modalBody");

// Swiper and Chart DOM
const trendingWrap = document.getElementById("trendingWrap");
const subjectsCanvas = document.getElementById("subjectsChart");

let swiperInstance = null;
let subjectsChart = null;
let lastLoadedWorkIds = []; // store ids from current results

function setStatus(msg) {
  if (statusEl) statusEl.textContent = msg;
}

function coverUrlFromDoc(doc) {
  // Search API
  if (doc && doc.cover_i) return `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`;

  // Works from subject API
  if (doc && doc.cover_id) return `https://covers.openlibrary.org/b/id/${doc.cover_id}-M.jpg`;

  return "";
}

function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function openModal(title, html) {
  modalTitle.textContent = title;
  modalBody.innerHTML = html;
  overlay.classList.remove("hidden");
  overlay.setAttribute("aria-hidden", "false");
}

function closeTheModal() {
  overlay.classList.add("hidden");
  overlay.setAttribute("aria-hidden", "true");
}

if (closeModal) closeModal.addEventListener("click", closeTheModal);
if (overlay) {
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeTheModal();
  });
}
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeTheModal();
});

function renderBooks(books, sourceLabel = "") {
  if (!gridEl) return;

  gridEl.innerHTML = "";
  if (hintEl) hintEl.textContent = sourceLabel;

  lastLoadedWorkIds = [];

  if (!books || books.length === 0) {
    gridEl.innerHTML = `<div class="card">No results found.</div>`;
    return;
  }

  for (const b of books) {
    const title = b.title || b.title_suggest || "Untitled";
    const author =
      (b.author_name && b.author_name[0]) ||
      (b.authors && b.authors[0] && b.authors[0].name) ||
      "Unknown author";
    const year = b.first_publish_year || b.first_publish_date || "";
    const cover = coverUrlFromDoc(b);

    const workKey = b.key || "";
    const workId = workKey.startsWith("/works/") ? workKey.replace("/works/", "") : "";

    if (workId) lastLoadedWorkIds.push(workId);

    const card = document.createElement("div");
    card.className = "book";
    card.dataset.workId = workId;

    card.innerHTML = `
      <div class="cover">
        ${cover ? `<img src="${cover}" alt="Cover of ${escapeHtml(title)}" loading="lazy">` : ""}
      </div>
      <div class="book-body">
        <h3 class="title">${escapeHtml(title)}</h3>
        <p class="muted">${escapeHtml(author)}${year ? ` • ${escapeHtml(year)}` : ""}</p>
      </div>
    `;

    card.addEventListener("click", () => {
      if (!workId) {
        openModal(title, `<p>No work id found for this item.</p>`);
        return;
      }
      loadWorkDetails(workId);
    });

    gridEl.appendChild(card);
  }

  // after rendering to build chart from loaded books
  buildSubjectsChartFromLoadedBooks();
}

// first api search 
async function searchBooks() {
  const q = (qInput?.value || "").trim();
  if (!q) {
    setStatus("Type something to search.");
    return;
  }

  const limit = Number(limitSelect?.value || "12");
  const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&limit=${limit}`;

  try {
    setStatus("Searching...");
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    const docs = Array.isArray(data?.docs) ? data.docs : [];

    renderBooks(docs, `Search results for "${q}"`);
    setStatus(`Loaded ${Math.min(docs.length, limit)} result(s).`);
  } catch (err) {
    console.error(err);
    setStatus("Search failed. Check console.");
  }
}

// second api fetch for subject 
async function loadSubject() {
  const subject = subjectSelect?.value || "history";
  const limit = Number(limitSelect?.value || "12");

  // Open Library 
  const url = `https://openlibrary.org/subjects/${encodeURIComponent(subject)}.json?limit=${limit}`;

  try {
    setStatus(`Loading subject: ${subject}...`);
    const res = await fetch(url);


    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    const works = Array.isArray(data?.works) ? data.works : [];

    renderBooks(works, `Subject: ${subject}`);
    setStatus(`Loaded ${Math.min(works.length, limit)} book(s) from "${subject}".`);
  } catch (err) {
    console.error(err);
    setStatus("Subject failed. Check console.");
    if (gridEl) gridEl.innerHTML = `<div class="card">Subject failed to load.</div>`;
  }
}

// third fecth work detail 
async function loadWorkDetails(workId) {
  const url = `https://openlibrary.org/works/${encodeURIComponent(workId)}.json`;

  try {
    setStatus("Loading details...");
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const work = await res.json();

    const title = work.title || "Book";
    const desc =
      typeof work.description === "string"
        ? work.description
        : (work.description && work.description.value)
          ? work.description.value
          : "No description available.";

    const subjects = Array.isArray(work.subjects) ? work.subjects.slice(0, 12) : [];
    const subjectBadges = subjects
      .map((s) => `<span class="badge">${escapeHtml(s)}</span>`)
      .join("");

    openModal(
      title,
      `
        <p>${escapeHtml(desc)}</p>
        ${subjects.length ? `<div style="margin-top:10px">${subjectBadges}</div>` : ""}
        <p style="margin-top:12px">
          <a href="https://openlibrary.org/works/${encodeURIComponent(workId)}" target="_blank" rel="noreferrer">
            View on Open Library →
          </a>
        </p>
      `
    );

    setStatus("Details loaded.");
  } catch (err) {
    console.error(err);
    openModal("Error", `<p>Could not load book details.</p>`);
    setStatus("Details failed. Check console.");
  }
}

// fourth api fetch My Books API Trending Picks and  Swiper
async function loadTrending() {
  if (!trendingWrap) return;

  const url = "https://openlibrary.org/people/mekBot/books/want-to-read.json?limit=12";

  try {
    setStatus("Loading trending...");
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    const entries = Array.isArray(data?.reading_log_entries) ? data.reading_log_entries : [];

    trendingWrap.innerHTML = "";

    for (const entry of entries) {
      const work = entry?.work || {};
      const title = work.title || "Untitled";
      const key = work.key || ""; 
      const workId = key.startsWith("/works/") ? key.replace("/works/", "") : "";

      const coverId = work.cover_id;
      const cover = coverId ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg` : "";

      const slide = document.createElement("div");
      slide.className = "swiper-slide";
      slide.style.width = "220px";

      slide.innerHTML = `
        <div class="book" style="height:100%;">
          <div class="cover" style="height:220px;">
            ${cover ? `<img src="${cover}" alt="Cover of ${escapeHtml(title)}" loading="lazy">` : ""}
          </div>
          <div class="book-body">
            <h3 class="title">${escapeHtml(title)}</h3>
            <p class="muted">From a public shelf</p>
          </div>
        </div>
      `;

      slide.addEventListener("click", () => {
        if (workId) loadWorkDetails(workId);
      });

      trendingWrap.appendChild(slide);
    }

    // init re init Swiper
    if (swiperInstance) swiperInstance.destroy(true, true);

    swiperInstance = new Swiper("#trendingSwiper", {
      slidesPerView: 1.2,
      spaceBetween: 12,
      breakpoints: {
        640: { slidesPerView: 2.2 },
        900: { slidesPerView: 3.2 },
        1100: { slidesPerView: 4.2 },
      },
      navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
      },
    });

    setStatus("Trending loaded.");
  } catch (err) {
    console.error(err);
    setStatus("Trending failed. Check console.");
  }
}

// chart lib 
async function buildSubjectsChartFromLoadedBooks() {
  if (!subjectsCanvas) return;
  if (!window.Chart) return; // Chart.js not loaded yet
  if (!lastLoadedWorkIds.length) return;

  // sample a few so you don't spam the API
  const sample = lastLoadedWorkIds.slice(0, 8);

  try {
    const works = await Promise.all(
      sample.map(async (id) => {
        const res = await fetch(`https://openlibrary.org/works/${encodeURIComponent(id)}.json`);
        if (!res.ok) return null;
        return res.json();
      })
    );

    const counts = {};
    for (const w of works) {
      if (!w) continue;
      const subs = Array.isArray(w.subjects) ? w.subjects.slice(0, 8) : [];
      for (const s of subs) counts[s] = (counts[s] || 0) + 1;
    }

    const sorted = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);

    const labels = sorted.map(([k]) => k);
    const values = sorted.map(([, v]) => v);

    if (subjectsChart) subjectsChart.destroy();

    subjectsChart = new Chart(subjectsCanvas, {
      type: "bar",
      data: {
        labels,
        datasets: [{ label: "Count", data: values }],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
        },
        scales: {
          y: { beginAtZero: true, ticks: { precision: 0 } },
        },
      },
    });
  } catch (err) {
    console.error(err);
  }
}

// Events
if (btnSearch) btnSearch.addEventListener("click", searchBooks);
if (btnSubject) btnSubject.addEventListener("click", loadSubject);
if (qInput) {
  qInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") searchBooks();
  });
}


loadSubject();   
loadTrending();  
