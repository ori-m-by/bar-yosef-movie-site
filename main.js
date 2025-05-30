// main.js

// ────────────────────────────────────────────────────────────────────────────
// 0) Constants & State
// ────────────────────────────────────────────────────────────────────────────
const moviesCsvUrl   = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRy3QmBmzq23a0pVmV7GBNa8ryYiKiIes8VclVTfCiwqPRITOxxSrZt8dT9aTCkpQ/pub?output=csv";
const seriesListId   = "1yYRTUq6iRh0dfhFFFpVJiR351jXS2Ll-9VCjsLrTW0Y";
const seriesListName = "טבלת סדרות";
const episodesId     = "1XkZ4in53qT3mCImgrNlqv74JKKW9lG_ZieFGwcJpd5s";

let allMovies   = [];
let allSeries   = [];
let isSeriesMode = false;

// Fallback image URL
const fallbackImage = "https://raw.githubusercontent.com/ori-m-by/bar-yosef-movie-site/main/תמונה_לא_טעונה.png";

// ────────────────────────────────────────────────────────────────────────────
// 1) createMovieCard: סרט עם show-info listeners
// ────────────────────────────────────────────────────────────────────────────
function createMovieCard(data) {
  const hebname    = data["שם הסרט בעברית"]       || "";
  const engname    = data["שם הסרט באנגלית"]      || "";
  const director   = data["במאי"]                  || "";
  const mainactors = data["שחקנים ראשיים"]         || "";
  const producer   = data["מפיק"]                  || "";
  const writer     = data["תסריטאי"]               || "";
  const score      = data["ציון IMDb"]             || "";
  const pg         = data["סרט לילדים / מבוגרים"]   || "";
  const imdblink   = data["קישור ל-IMDb"]           || "";
  const genre      = data["ז'אנר"]                  || "";
  const awards     = data["פרסים והישגים בולטים"]   || "";
  const viewing    = data["קישור לדרייב"]           || "";
  const year       = data["שנת יציאה"]             || "";
  const desc       = data["תיאור קצר"]             || "";
  const pic        = data["קישור לתמונה"]           || fallbackImage;
  const trailer    = data["טריילר"]                || "";

  // Card container
  const card = document.createElement("div");
  card.className = "col-12 col-md-6 mb-4";

  // Inner card
  const inner = document.createElement("div");
  inner.className = "card h-100 shadow-sm movie-card";

  // show-info on hover via JS
  inner.addEventListener("mouseenter", () => inner.classList.add("show-info"));
  inner.addEventListener("mouseleave", () => inner.classList.remove("show-info"));

  // Trailer wrapper
  const trailerWr = document.createElement("div");
  trailerWr.className = "trailer-container";

  // Image element
  const img = document.createElement("img");
  img.src = pic;
  img.alt = hebname;
  img.className = "movie-image";
  img.onerror = () => { img.src = fallbackImage; };

  // Content (text + extra-info)
  const content = document.createElement("div");
  content.className = "movie-content";
  content.innerHTML = `
    <h5 class="card-title">${hebname}</h5>
    <h6 class="card-subtitle mb-2 text-muted">${engname}</h6>
    <p><strong>שנה:</strong> ${year}<br><strong>ז'אנר:</strong> ${genre}</p>
    <p>${desc}</p>
    <div class="extra-info">
      <p><strong>במאי:</strong> ${director}<br>
         <strong>שחקנים:</strong> ${mainactors}<br>
         <strong>תסריטאי:</strong> ${writer}<br>
         <strong>מפיק:</strong> ${producer}<br>
         <strong>IMDB:</strong> ${score}<br>
         <strong>פרסים:</strong> ${awards}<br>
         <strong>קהל יעד:</strong> ${pg}</p>
      ${viewing.startsWith("http") 
        ? `<a href="${viewing}" target="_blank" class="btn btn-primary"> ▶️ צפייה </a>` 
        : ""}
      ${imdblink.startsWith("http") 
        ? `<a href="${imdblink}" target="_blank" class="btn btn-secondary ms-2">📺 IMDb</a>` 
        : ""}
    </div>
  `;

  // Assemble left & right sides
  const leftCol = document.createElement("div");
  leftCol.className = "left-side";
  leftCol.append(trailerWr, img);

  const row = document.createElement("div");
  row.className = "d-flex flex-row";
  row.append(leftCol, content);

  inner.append(row);
  card.append(inner);
  return card;
}

// ────────────────────────────────────────────────────────────────────────────
// 2) createSeriesCard: סדרה עם show-info listeners
// ────────────────────────────────────────────────────────────────────────────
function createSeriesCard(s) {
  const titleHe = s["שם הסדרה בעברית"] || "";
  const titleEn = s["שם הסדרה באנגלית"] || "";
  const desc    = s["תיאור קצר"]           || "";
  const pic     = s["תמונה"]               || fallbackImage;

  const card = document.createElement("div");
  card.className = "col-12 col-md-6 mb-4";

  const inner = document.createElement("div");
  inner.className = "card h-100 shadow-sm movie-card";

  // show-info on hover via JS
  inner.addEventListener("mouseenter", () => inner.classList.add("show-info"));
  inner.addEventListener("mouseleave", () => inner.classList.remove("show-info"));

  // Series image
  const img = document.createElement("img");
  img.src = pic;
  img.alt = titleHe;
  img.className = "card-img-top movie-image";
  img.onerror = () => { img.src = fallbackImage; };

  // Body
  const bd = document.createElement("div");
  bd.className = "card-body";
  bd.innerHTML = `
    <h5 class="card-title">${titleHe}</h5>
    <h6 class="card-subtitle mb-2 text-muted">${titleEn}</h6>
    <p class="card-text">${desc}</p>
    <div class="extra-info">
      <p><strong>שם הסדרה:</strong> ${titleHe}<br>
         <strong>תיאור:</strong> ${desc}</p>
      <button class="btn btn-outline-primary" onclick="loadEpisodes('${titleHe}')">
        📂 ראה עונות ופרקים
      </button>
    </div>
  `;

  inner.append(img, bd);
  card.append(inner);
  return card;
}

// ────────────────────────────────────────────────────────────────────────────
// 3) renderMovies & renderSeriesCards
// ────────────────────────────────────────────────────────────────────────────
function renderMovies(list) {
  const container = document.getElementById("moviecontainer");
  container.innerHTML = "";
  list.forEach(m => container.append(createMovieCard(m)));
}

function renderSeriesCards(list) {
  const container = document.getElementById("moviecontainer");
  container.innerHTML = "";

  // Back button to series list
  const back = document.createElement("button");
  back.className = "btn btn-outline-secondary mb-3";
  back.textContent = "🔙 חזרה לסדרות";
  back.onclick = loadSeries;
  container.append(back);

  list.forEach(s => container.append(createSeriesCard(s)));
}

// ────────────────────────────────────────────────────────────────────────────
// 4) applyFilters (for movies only)
// ────────────────────────────────────────────────────────────────────────────
function applyFilters() {
  if (isSeriesMode) return; // no filters in series mode

  const yearFilter   = document.getElementById("yearFilter").value;
  const ratingFilter = parseFloat(document.getElementById("ratingFilter").value) || 0;
  const genreFilter  = document.getElementById("genreFilter").value.toLowerCase();
  const pgFilter     = document.getElementById("pgFilter").value.toLowerCase();
  const searchTerm   = document.getElementById("searchInput").value.toLowerCase();

  const filtered = allMovies.filter(m => {
    const ym = !yearFilter || m["שנת יציאה"] === yearFilter;
    const rm = (parseFloat(m["ציון IMDb"])||0) >= ratingFilter;
    const gm = !genreFilter || (m["ז'אנר"]||"").toLowerCase()
                                .split(",").map(x=>x.trim())
                                .includes(genreFilter);
    const pm = !pgFilter || (m["סרט לילדים / מבוגרים"]||"")
                                .toLowerCase() === pgFilter;
    const sm = [
      m["שם הסרט בעברית"],
      m["שם הסרט באנגלית"],
      m["במאי"],
      m["שחקנים ראשיים"],
      m["תיאור קצר"]
    ].some(f => f && f.toLowerCase().includes(searchTerm));

    return ym && rm && gm && pm && sm;
  });

  renderMovies(filtered);
}

// ────────────────────────────────────────────────────────────────────────────
// 5) loadMovies: fetch & init filters
// ────────────────────────────────────────────────────────────────────────────
function loadMovies() {
  fetch(moviesCsvUrl)
    .then(res => res.text())
    .then(csv => {
      allMovies = Papa.parse(csv, { header: true }).data
                     .filter(r => r["שם הסרט בעברית"]);
      renderMovies(allMovies);

      // build yearFilter options
      const years = [...new Set(allMovies.map(m=>m["שנת יציאה"]).filter(Boolean))].sort();
      const ySelect = document.getElementById("yearFilter");
      years.forEach(y => {
        const opt = document.createElement("option");
        opt.value = y;
        opt.textContent = y;
        ySelect.append(opt);
      });

      // build genreFilter options (split multi-genres)
      const gset = new Set();
      allMovies.forEach(m => {
        (m["ז'אנר"]||"").split(",").forEach(x=> {
          const g = x.trim();
          if(g) gset.add(g);
        });
      });
      const gSelect = document.getElementById("genreFilter");
      [...gset].sort().forEach(g => {
        const opt = document.createElement("option");
        opt.value = g;
        opt.textContent = g;
        gSelect.append(opt);
      });

      // build pgFilter options
      const pgSet = new Set(allMovies.map(m=>m["סרט לילדים / מבוגרים"]).filter(Boolean));
      const pgSelect = document.getElementById("pgFilter");
      [...pgSet].sort().forEach(p => {
        const opt = document.createElement("option");
        opt.value = p;
        opt.textContent = p;
        pgSelect.append(opt);
      });
    })
    .catch(err => console.error("שגיאת loadMovies:", err));
}

// ────────────────────────────────────────────────────────────────────────────
// 6) loadSeries: fetch series list
// ────────────────────────────────────────────────────────────────────────────
function loadSeries() {
  isSeriesMode = true;
  document.body.classList.add("series-mode");
  document.querySelector("h1").textContent = "📺 הסדרות שלנו";
  document.getElementById("toggleViewBtn").textContent = "🎬 חזרה לסרטים";
  document.querySelector(".filter-bar").style.display = "none";

  const url = `https://docs.google.com/spreadsheets/d/${seriesListId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(seriesListName)}`;
  fetch(url)
    .then(res => res.text())
    .then(csv => {
      allSeries = Papa.parse(csv, { header: true }).data
                     .filter(r => r["שם הסדרה בעברית"]);
      renderSeriesCards(allSeries);
    })
    .catch(err => {
      const container = document.getElementById("moviecontainer");
      container.innerHTML = `<div class="text-danger text-center py-5">❌ שגיאה בטעינת סדרות</div>`;
      console.error(err);
    });
}

// ────────────────────────────────────────────────────────────────────────────
// 7) loadEpisodes: fetch episodes for a series
// ────────────────────────────────────────────────────────────────────────────
function loadEpisodes(seriesName) {
  const container = document.getElementById("moviecontainer");
  container.innerHTML = `<div class="text-center py-5">🔄 טוען פרקים של ${seriesName}...</div>`;

  const url = `https://docs.google.com/spreadsheets/d/${episodesId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(seriesName)}`;
  fetch(url)
    .then(res => res.text())
    .then(csv => {
      const eps = Papa.parse(csv, { header: true }).data
                     .filter(ep => ep["שם הפרק"]);

      // group by season (numeric sort)
      const grouped = {};
      eps.forEach(ep => {
        const s = parseInt(ep["עונה"], 10);
        if (!grouped[s]) grouped[s] = [];
        grouped[s].push(ep);
      });

      // back button to series list
      container.innerHTML = "";
      const back = document.createElement("button");
      back.className = "btn btn-outline-secondary mb-3";
      back.textContent = "🔙 חזרה לסדרות";
      back.onclick = loadSeries;
      container.append(back);

      // season buttons
      Object.keys(grouped).map(n=>parseInt(n,10)).sort((a,b)=>a-b)
        .forEach(seasonNum => {
          const btn = document.createElement("button");
          btn.className = "btn btn-info m-2";
          btn.textContent = `עונה ${seasonNum}`;
          btn.onclick = () => showEpisodesInSeason(seriesName, grouped[seasonNum], seasonNum);
          container.append(btn);
        });
    })
    .catch(err => {
      const container = document.getElementById("moviecontainer");
      container.innerHTML = `<div class="text-danger text-center py-5">❌ שגיאה בטעינת הפרקים</div>`;
      console.error(err);
    });
}

// ────────────────────────────────────────────────────────────────────────────
// 8) showEpisodesInSeason: render episodes in a season
// ────────────────────────────────────────────────────────────────────────────
function showEpisodesInSeason(seriesName, episodesList, seasonNum) {
  const container = document.getElementById("moviecontainer");
  container.innerHTML = `<h3 class="text-center mb-4">${seriesName} – עונה ${seasonNum}</h3>`;

  const backToSeasons = document.createElement("button");
  backToSeasons.className = "btn btn-outline-secondary mb-3";
  backToSeasons.textContent = "🔙 חזרה לעונות";
  backToSeasons.onclick = () => loadEpisodes(seriesName);
  container.append(backToSeasons);

  episodesList.forEach(ep => {
    const card = document.createElement("div");
    card.className = "card mb-3";

    const row = document.createElement("div");
    row.className = "row g-0";

    const colImg = document.createElement("div");
    colImg.className = "col-md-4";
    const img = document.createElement("img");
    img.src = ep["תמונה"] || fallbackImage;
    img.className = "img-fluid rounded-start";
    img.onerror = () => { img.src = fallbackImage; };
    colImg.append(img);

    const colBody = document.createElement("div");
    colBody.className = "col-md-8";
    const bd = document.createElement("div");
    bd.className = "card-body";
    bd.innerHTML = `
      <h5 class="card-title">${ep["שם הפרק"]} (פרק ${ep["מספר פרק"]})</h5>
      <p class="card-text"><small class="text-muted">תאריך שידור: ${ep["תאריך שידור"]}</small></p>
      <p class="card-text">${ep["תיאור"]}</p>
      ${ep["קישור"] ? `<a href="${ep["קישור"]}" target="_blank" class="btn btn-primary">▶️ צפייה</a>` : ""}
    `;
    colBody.append(bd);

    row.append(colImg, colBody);
    card.append(row);
    container.append(card);
  });
}

// ────────────────────────────────────────────────────────────────────────────
// 9) Toggle button & initial load
// ────────────────────────────────────────────────────────────────────────────
document.getElementById("toggleViewBtn").addEventListener("click", () => {
  isSeriesMode = !isSeriesMode;
  document.body.classList.toggle("series-mode", isSeriesMode);

  const btn    = document.getElementById("toggleViewBtn");
  const title  = document.querySelector("h1");
  const filter = document.querySelector(".filter-bar");

  if (isSeriesMode) {
    title.textContent    = "📺 הסדרות שלנו";
    btn.textContent      = "🎬 חזרה לסרטים";
    filter.style.display = "none";
    loadSeries();
  } else {
    title.textContent    = "🎬 הסרטים שלנו";
    btn.textContent      = "📺 מעבר לתצוגת סדרות";
    filter.style.display = "block";
    loadMovies();
  }
});

// initial load: fetch movies
document.addEventListener("DOMContentLoaded", loadMovies);
