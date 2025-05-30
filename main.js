// קישורים ל־Google Sheets (CSV)
const moviesCsvUrl   = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRy3QmBmzq23a0pVmV7GBNa8ryYiKiIes8VclVTfCiwqPRITOxxSrZt8dT9aTCkpQ/pub?output=csv";
const seriesListId   = "1yYRTUq6iRh0dfhFFFpVJiR351jXS2Ll-9VCjsLrTW0Y";
const seriesListName = "טבלת סדרות";
const episodesId     = "1XkZ4in53qT3mCImgrNlqv74JKKW9lG_ZieFGwcJpd5s";

let allMovies   = [];
let allSeries   = [];
let isSeriesMode = false;

// ────────────────────────────────────────────────────────────────────────────
// 1) יצירת כרטיס סרט
// ────────────────────────────────────────────────────────────────────────────
function createMovieCard(data) {
  const hebname    = data["שם הסרט בעברית"] || "";
  const engname    = data["שם הסרט באנגלית"] || "";
  const director   = data["במאי"] || "";
  const mainactors = data["שחקנים ראשיים"] || "";
  const producer   = data["מפיק"] || "";
  const writer     = data["תסריטאי"] || "";
  const score      = data["ציון IMDb"] || "";
  const pg         = data["סרט לילדים / מבוגרים"] || "";
  const imdblink   = data["קישור ל-IMDb"] || "";
  const genre      = data["ז'אנר"] || "";
  const awards     = data["פרסים והישגים בולטים"] || "";
  const viewing    = data["קישור לדרייב"] || "";
  const year       = data["שנת יציאה"] || "";
  const desc       = data["תיאור קצר"] || "";
  const pic        = data["קישור לתמונה"] || "default-image.jpg";
  const trailer    = data["טריילר"] || "";

  const card = document.createElement("div");
  card.className = "col-12 col-md-6 mb-4";

  const inner = document.createElement("div");
  inner.className = "card h-100 shadow-sm movie-card";
  inner.style.transition = "transform 0.3s ease";
  inner.style.transformOrigin = "center";

  // Trailer hover
  const trailerWr = document.createElement("div");
  trailerWr.className = "trailer-container";
  inner.addEventListener("mouseenter", () => {
    inner.style.transform = "scale(1.05)";
    if (trailer && !trailerWr.innerHTML) {
      const url = trailer.replace("watch?v=", "embed/") + "?autoplay=1&mute=1&rel=0&controls=1";
      trailerWr.innerHTML = `<iframe width="100%" height="100%" src="${url}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
    }
  });
  inner.addEventListener("mouseleave", () => inner.style.transform = "scale(1)");

  // Image
  const img = document.createElement("img");
  img.src = pic; img.alt = hebname;
  img.className = "movie-image";
  img.onerror = () => img.src = "https://raw.githubusercontent.com/ori-m-by/bar-yosef-movie-site/main/תמונה_לא_טעונה.png";

  // Content
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
      ${viewing.startsWith("http") ? `<a href="${viewing}" target="_blank" class="btn btn-primary"> ▶️ צפייה </a>` : ""}
      ${imdblink.startsWith("http") ? `<a href="${imdblink}" target="_blank" class="btn btn-secondary ms-2">📺 IMDb</a>` : ""}
    </div>
  `;

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
// 2) רינדור סרטים
// ────────────────────────────────────────────────────────────────────────────
function renderMovies(list) {
  const container = document.getElementById("moviecontainer");
  container.innerHTML = "";
  list.forEach(m => container.append(createMovieCard(m)));
}

// ────────────────────────────────────────────────────────────────────────────
// 3) סינון סרטים
// ────────────────────────────────────────────────────────────────────────────
function applyFilters() {
  if (isSeriesMode) return;
  const y = document.getElementById("yearFilter").value;
  const r = parseFloat(document.getElementById("ratingFilter").value) || 0;
  const g = document.getElementById("genreFilter").value.toLowerCase();
  const p = document.getElementById("pgFilter").value.toLowerCase();
  const q = document.getElementById("searchInput").value.toLowerCase();

  const filtered = allMovies.filter(m => {
    const ym = !y || m["שנת יציאה"] === y;
    const rm = (parseFloat(m["ציון IMDb"])||0) >= r;
    const gm = !g || (m["ז'אנר"]||"").toLowerCase().split(",").map(x=>x.trim()).includes(g);
    const pm = !p || (m["סרט לילדים / מבוגרים"]||"").toLowerCase() === p;
    const sm = [m["שם הסרט בעברית"], m["שם הסרט באנגלית"], m["במאי"], m["שחקנים ראשיים"], m["תיאור קצר"]]
                 .some(f => f && f.toLowerCase().includes(q));
    return ym && rm && gm && pm && sm;
  });

  renderMovies(filtered);
}

// ────────────────────────────────────────────────────────────────────────────
// 4) טעינת סרטים
// ────────────────────────────────────────────────────────────────────────────
function loadMovies() {
  fetch(moviesCsvUrl)
    .then(r => r.text())
    .then(txt => {
      allMovies = Papa.parse(txt, { header: true }).data
                     .filter(r => r["שם הסרט בעברית"]);
      renderMovies(allMovies);
      // yearFilter
      const years = [...new Set(allMovies.map(m=>m["שנת יציאה"]).filter(Boolean))].sort();
      years.forEach(y=>{
        const o = document.createElement("option"); o.value=o.textContent=y;
        document.getElementById("yearFilter").append(o);
      });
      // genreFilter
      const gset = new Set();
      allMovies.forEach(m=>(m["ז'אנר"]||"").split(",").forEach(x=>x.trim()&&gset.add(x.trim())));
      [...gset].sort().forEach(x=>{
        const o = document.createElement("option"); o.value=o.textContent=x;
        document.getElementById("genreFilter").append(o);
      });
      // pgFilter
      [...new Set(allMovies.map(m=>m["סרט לילדים / מבוגרים"]).filter(Boolean))].sort()
        .forEach(x=>{
          const o = document.createElement("option"); o.value=o.textContent=x;
          document.getElementById("pgFilter").append(o);
        });
    })
    .catch(e=>console.error("שגיאת loadMovies:", e));
}

// ────────────────────────────────────────────────────────────────────────────
// 5) יצירת כרטיס סדרה
// ────────────────────────────────────────────────────────────────────────────
function createSeriesCard(s) {
  const titleHe = s["שם הסדרה בעברית"];
  const titleEn = s["שם הסדרה באנגלית"] || "";
  const desc    = s["תיאור קצר"] || "";
  const pic     = s["תמונה"] || "";

  const card = document.createElement("div");
  card.className = "col-12 col-md-6 mb-4";

  const inner = document.createElement("div");
  inner.className = "card h-100 shadow-sm movie-card";
  inner.style.cursor = "pointer";

  const img = document.createElement("img");
  img.src = pic; img.alt = titleHe;
  img.className = "card-img-top movie-image";
  img.onerror = () => img.src = "https://raw.githubusercontent.com/ori-m-by/bar-yosef-movie-site/main/תמונה_לא_טעונה.png";

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
// 6) רינדור סדרות
// ────────────────────────────────────────────────────────────────────────────
function renderSeriesCards(list) {
  const container = document.getElementById("moviecontainer");
  container.innerHTML = "";
  const back = document.createElement("button");
  back.className = "btn btn-outline-secondary mb-3";
  back.textContent = "🔙 חזרה לסדרות";
  back.onclick = loadSeries;
  container.append(back);
  list.forEach(s => container.append(createSeriesCard(s)));
}

// ────────────────────────────────────────────────────────────────────────────
// 7) טעינת טבלת סדרות
// ────────────────────────────────────────────────────────────────────────────
function loadSeries() {
  isSeriesMode = true;
  document.querySelector("h1").textContent = "📺 הסדרות שלנו";
  document.getElementById("toggleViewBtn").textContent = "🎬 חזרה לסרטים";
  document.querySelector(".filter-bar").style.display = "none";

  const container = document.getElementById("moviecontainer");
  container.innerHTML = `<div class="text-center py-5">🔄 טוען סדרות...</div>`;

  const url = `https://docs.google.com/spreadsheets/d/${seriesListId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(seriesListName)}`;
  fetch(url)
    .then(r => r.text())
    .then(txt => {
      allSeries = Papa.parse(txt, { header: true }).data
        .filter(r => r["שם הסדרה בעברית"]);
      renderSeriesCards(allSeries);
    })
    .catch(e => {
      container.innerHTML = `<div class="text-danger text-center py-5">❌ שגיאה בטעינת סדרות</div>`;
      console.error(e);
    });
}

// ────────────────────────────────────────────────────────────────────────────
// 8) טעינת פרקים
// ────────────────────────────────────────────────────────────────────────────
function loadEpisodes(seriesName) {
  const container = document.getElementById("moviecontainer");
  container.innerHTML = `<div class="text-center py-5">🔄 טוען פרקים של ${seriesName}...</div>`;

  const url = `https://docs.google.com/spreadsheets/d/${episodesId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(seriesName)}`;
  fetch(url)
    .then(r => r.text())
    .then(txt => {
      const eps = Papa.parse(txt, { header: true }).data.filter(ep => ep["שם הפרק"]);

      const grouped = {};
      eps.forEach(ep => {
        const s = ep["עונה"];
        if (!grouped[s]) grouped[s] = [];
        grouped[s].push(ep);
      });

      container.innerHTML = "";
      const backSeries = document.createElement("button");
      backSeries.className = "btn btn-outline-secondary mb-3";
      backSeries.textContent = "🔙 חזרה לסדרות";
      backSeries.onclick = () => renderSeriesCards(allSeries);
      container.append(backSeries);

      Object.keys(grouped)
        .map(n => parseInt(n))
        .sort((a, b) => a - b)
        .forEach(seasonNum => {
          const btn = document.createElement("button");
          btn.className = "btn btn-info m-2";
          btn.textContent = `עונה ${seasonNum}`;
          btn.onclick = () => showEpisodesInSeason(seriesName, grouped[seasonNum], seasonNum);
          container.append(btn);
        });
    })
    .catch(e => {
      container.innerHTML = `<div class="text-danger text-center py-5">❌ שגיאה בטעינת הפרקים</div>`;
      console.error(e);
    });
}

// ────────────────────────────────────────────────────────────────────────────
// 9) הצגת פרקים בעונה
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
    img.src = ep["תמונה"] || "";
    img.className = "img-fluid rounded-start";
    img.onerror = () => img.src = "https://raw.githubusercontent.com/ori-m-by/bar-yosef-movie-site/main/תמונה_לא_טעונה.png";
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
// 10) toggle ושגרה ראשונית
// ────────────────────────────────────────────────────────────────────────────
document.getElementById("toggleViewBtn").addEventListener("click", () => {
  isSeriesMode = !isSeriesMode;
  const btn    = document.getElementById("toggleViewBtn");
  const title  = document.querySelector("h1");
  const filter = document.querySelector(".filter-bar");

  if (isSeriesMode) {
    title.textContent      = "📺 הסדרות שלנו";
    btn.textContent        = "🎬 חזרה לסרטים";
    filter.style.display   = "none";
    loadSeries();
  } else {
    title.textContent      = "🎬 הסרטים שלנו";
    btn.textContent        = "📺 מעבר לתצוגת סדרות";
    filter.style.display   = "block";
    loadMovies();
  }
});

document.addEventListener("DOMContentLoaded", loadMovies);
