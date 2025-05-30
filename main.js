// main.js

const moviesCsvUrl   = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRy3QmBmzq23a0pVmV7GBNa8ryYiKiIes8VclVTfCiwqPRITOxxSrZt8dT9aTCkpQ/pub?output=csv";
const seriesListId   = "1yYRTUq6iRh0dfhFFFpVJiR351jXS2Ll-9VCjsLrTW0Y";
const seriesListName = "טבלת סדרות";
const episodesId     = "1XkZ4in53qT3mCImgrNlqv74JKKW9lG_ZieFGwcJpd5s";

let allMovies   = [];
let allSeries   = [];
let isSeriesMode = false;

// ↑ התפקידים של הפונקציות createMovieCard, renderMovies, applyFilters, loadMovies
// נשארו כמו שהיו, לא חוזר עליהם כאן כדי לחסוך מקום.
// נניח שהן כבר קיימות מעל בקובץ שלך.

// ────────────────────────────────────────────────────────────────────────────
// פונקציה חדשה: רינדור כרטיס סדרה (עם extra-info שמופיע ב-hover)
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

  // תמונה עליון
  const img = document.createElement("img");
  img.src = pic; img.alt = titleHe;
  img.className = "card-img-top movie-image";
  img.onerror = () => img.src = "https://raw.githubusercontent.com/ori-m-by/bar-yosef-movie-site/main/תמונה_לא_טעונה.png";

  // גוף הכרטיס
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
// רינדור כל כרטיסי הסדרות
// ────────────────────────────────────────────────────────────────────────────
function renderSeriesCards(list) {
  const container = document.getElementById("moviecontainer");
  container.innerHTML = "";
  // כפתור חזרה
  const back = document.createElement("button");
  back.className = "btn btn-outline-secondary mb-3";
  back.textContent = "🔙 חזרה לסדרות";
  back.onclick = loadSeries;
  container.append(back);

  // כרטיס לכל סדרה
  list.forEach(s => container.append(createSeriesCard(s)));
}

// ────────────────────────────────────────────────────────────────────────────
// טעינת טבלת הסדרות הכללית
// ────────────────────────────────────────────────────────────────────────────
function loadSeries() {
  isSeriesMode = true;
  document.querySelector("h1").textContent = "📺 הסדרות שלנו";
  document.getElementById("toggleViewBtn").textContent = "🎬 חזרה לסרטים";

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
      container.innerHTML = `<div class="text-danger text-center py-5">❌ שגיאה בטעינת הסדרות</div>`;
      console.error(e);
    });
}

// ────────────────────────────────────────────────────────────────────────────
// טעינת פרקים של סדרה לפי עונות ופרקים
// ────────────────────────────────────────────────────────────────────────────
function loadEpisodes(seriesName) {
  const container = document.getElementById("moviecontainer");
  container.innerHTML = `<div class="text-center py-5">🔄 טוען פרקים של ${seriesName}...</div>`;

  const url = `https://docs.google.com/spreadsheets/d/${episodesId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(seriesName)}`;
  fetch(url)
    .then(r => r.text())
    .then(txt => {
      const eps = Papa.parse(txt, { header: true }).data
        .filter(ep => ep["שם הפרק"]);

      // קיבוץ ע״פ עונה
      const grouped = {};
      eps.forEach(ep => {
        const s = ep["עונה"];
        if (!grouped[s]) grouped[s] = [];
        grouped[s].push(ep);
      });

      // יצירת כפתור חזרה לעמוד הסדרות
      container.innerHTML = "";
      const backSeries = document.createElement("button");
      backSeries.className = "btn btn-outline-secondary mb-3";
      backSeries.textContent = "🔙 חזרה לסדרות";
      backSeries.onclick = () => renderSeriesCards(allSeries);
      container.append(backSeries);

      // סדרת כפתורי עונות מסודרות מספרית
      Object.keys(grouped)
        .map(n => parseInt(n))
        .sort((a,b)=>a-b)
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
// הצגת פרקים במקרה לחיצה על עונה
// ────────────────────────────────────────────────────────────────────────────
function showEpisodesInSeason(seriesName, episodesList, seasonNum) {
  const container = document.getElementById("moviecontainer");
  container.innerHTML = `<h3 class="text-center mb-4">${seriesName} - עונה ${seasonNum}</h3>`;

  // כפתור חזרה לעמוד הפרקים
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
      ${ep["קישור"]?`<a href="${ep["קישור"]}" target="_blank" class="btn btn-primary">▶️ צפייה</a>`:""}
    `;
    colBody.append(bd);

    row.append(colImg, colBody);
    card.append(row);
    container.append(card);
  });
}

// ────────────────────────────────────────────────────────────────────────────
// לחצן toggle וסגירת טעינת סרטים/סדרות
// ────────────────────────────────────────────────────────────────────────────
 document.getElementById("toggleViewBtn").addEventListener("click", () => {
   isSeriesMode = !isSeriesMode;
   const btn    = document.getElementById("toggleViewBtn");
   const title  = document.querySelector("h1");
   const filter = document.querySelector(".filter-bar");

   if (isSeriesMode) {
     // לעבור לתצוגת סדרות
     title.textContent      = "📺 הסדרות שלנו";
     btn.textContent        = "🎬 חזרה לסרטים";
     filter.style.display   = "none";   // מסתיר את סרגל הסינון של הסרטים
     loadSeries();
   } else {
     // לחזור לתצוגת סרטים
     title.textContent      = "🎬 הסרטים שלנו";
     btn.textContent        = "📺 מעבר לתצוגת סדרות";
     filter.style.display   = "block";  // מראה שוב את סרגל הסינון
     loadMovies();                     // טוען מחדש סרטים + סינונים
   }
 });

// ────────────────────────────────────────────────────────────────────────────
// טעינת סרטים בעת הטעינה הראשונית
// ────────────────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", loadMovies);
