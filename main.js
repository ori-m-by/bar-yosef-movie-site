// main.js

// --- קישורים לקבצי Google Sheets (CSV) ---
const moviesCsvUrl   = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRy3QmBmzq23a0pVmV7GBNa8ryYiKiIes8VclVTfCiwqPRITOxxSrZt8dT9aTCkpQ/pub?output=csv";
const seriesListId   = "1yYRTUq6iRh0dfhFFFpVJiR351jXS2Ll-9VCjsLrTW0Y";
const seriesListName = "טבלת סדרות";
const episodesId     = "1XkZ4in53qT3mCImgrNlqv74JKKW9lG_ZieFGwcJpd5s";

let allMovies  = [];
let allSeries  = [];
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

  // טריילר ב-hover
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

  // תמונה
  const img = document.createElement("img");
  img.src = pic; img.alt = hebname;
  img.className = "movie-image";
  img.onerror = () => img.src = "https://raw.githubusercontent.com/ori-m-by/bar-yosef-movie-site/main/תמונה_לא_טעונה.png";

  // תוכן הכרטיס
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

  // בניית ה-DOM
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
  if (isSeriesMode) return; // בסדרות אין את זה
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
    .then(r=>r.text())
    .then(txt=>{
      allMovies = Papa.parse(txt, { header: true }).data.filter(r=>r["שם הסרט בעברית"]);
      renderMovies(allMovies);
      // בונים את אפשרויות הסינון:
      const years = [...new Set(allMovies.map(m=>m["שנת יציאה"]).filter(Boolean))].sort();
      years.forEach(y=>{
        const o = document.createElement("option"); o.value=o.textContent=y;
        document.getElementById("yearFilter").append(o);
      });
      const gset = new Set();
      allMovies.forEach(m=>{
        (m["ז'אנר"]||"").split(",").forEach(x=>x.trim()&&gset.add(x.trim()));
      });
      [...gset].sort().forEach(x=>{
        const o = document.createElement("option"); o.value=o.textContent=x;
        document.getElementById("genreFilter").append(o);
      });
      [...new Set(allMovies.map(m=>m["סרט לילדים / מבוגרים"]).filter(Boolean))].sort()
        .forEach(x=>{
          const o = document.createElement("option"); o.value=o.textContent=x;
          document.getElementById("pgFilter").append(o);
        });
    })
    .catch(e=>console.error("שגיאה בטעינת סרטים:",e));
}

// ────────────────────────────────────────────────────────────────────────────
// 5) תצוגת סדרות
// ────────────────────────────────────────────────────────────────────────────
function renderSeriesCards(seriesList) {
  const container = document.getElementById("moviecontainer");
  container.innerHTML = "";
  seriesList.forEach(s=>{
    const card = document.createElement("div");
    card.className = "col-12 col-md-6 mb-4";

    const inner = document.createElement("div");
    inner.className = "card h-100 shadow-sm movie-card";

    const img = document.createElement("img");
    img.src = s["תמונה"] || "https://raw.githubusercontent.com/ori-m-by/bar-yosef-movie-site/main/תמונה_לא_טעונה.png";
    img.className = "card-img-top"; img.alt=s["שם הסדרה בעברית"];
    img.onerror = ()=>img.src = "https://raw.githubusercontent.com/ori-m-by/bar-yosef-movie-site/main/תמונה_לא_טעונה.png";

    const bd = document.createElement("div");
    bd.className = "card-body";
    bd.innerHTML = `
      <h5 class="card-title">${s["שם הסדרה בעברית"]}</h5>
      <h6 class="card-subtitle mb-2 text-muted">${s["שם הסדרה באנגלית"]||""}</h6>
      <p class="card-text">${s["תיאור קצר"]||""}</p>
      <button class="btn btn-outline-primary" onclick="loadEpisodes('${s["שם הסדרה בעברית"]}')">
        📂 ראה עונות ופרקים
      </button>
    `;

    inner.append(img, bd);
    card.append(inner);
    container.append(card);
  });
}

// ────────────────────────────────────────────────────────────────────────────
// 6) טעינת הסדרות (טבלת סדרות)
// ────────────────────────────────────────────────────────────────────────────
function loadSeries() {
  const container = document.getElementById("moviecontainer");
  container.innerHTML = `<div class="text-center w-100 py-5">🔄 טוען סדרות...</div>`;

  const url = `https://docs.google.com/spreadsheets/d/${seriesListId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(seriesListName)}`;
  fetch(url)
    .then(r=>r.text())
    .then(txt=>{
      allSeries = Papa.parse(txt,{ header:true }).data.filter(r=>r["שם הסדרה בעברית"]);
      renderSeriesCards(allSeries);
    })
    .catch(e=>{
      container.innerHTML = `<div class="text-danger text-center py-5">❌ שגיאה בטעינת הסדרות</div>`;
      console.error("שגיאה בטעינת סדרות:",e);
    });
}

// ────────────────────────────────────────────────────────────────────────────
// 7) טעינת פרקים של סדרה (גיליון לפי שם הסדרה)
// ────────────────────────────────────────────────────────────────────────────
function loadEpisodes(seriesName) {
  const container = document.getElementById("moviecontainer");
  container.innerHTML = `<div class="text-center py-5">🔄 טוען פרקים של ${seriesName}...</div>`;

  const url = `https://docs.google.com/spreadsheets/d/${episodesId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(seriesName)}`;
  fetch(url)
    .then(r=>r.text())
    .then(txt=>{
      const eps = Papa.parse(txt,{ header:true }).data.filter(ep=>ep["שם הפרק"]);
      // קיבוץ לפי עונה:
      const grouped = {};
      eps.forEach(ep=>{
        const s = ep["עונה"];
        if(!grouped[s]) grouped[s]=[];
        grouped[s].push(ep);
      });
      // תצוגת הפרקים:
      container.innerHTML = `<h3 class="text-center mb-4">${seriesName}</h3>`;
      Object.keys(grouped).sort().forEach(season=>{
        const btn = document.createElement("button");
        btn.className="btn btn-outline-info m-2";
        btn.textContent=`עונה ${season}`;
        btn.onclick = ()=> {
          // מעבר לפרקים של העונה:
          const list = grouped[season];
          container.innerHTML = `<h3 class="text-center mb-4">${seriesName} - עונה ${season}</h3>`;
          list.forEach(ep=>{
            const card = document.createElement("div");
            card.className="card mb-3";
            const row = document.createElement("div");
            row.className="row g-0";
            const c1 = document.createElement("div"); c1.className="col-md-4";
            const img = document.createElement("img");
            img.src=ep["תמונה"]||""; img.className="img-fluid rounded-start";
            img.onerror=()=>img.src="https://raw.githubusercontent.com/ori-m-by/bar-yosef-movie-site/main/תמונה_לא_טעונה.png";
            c1.append(img);
            const c2 = document.createElement("div"); c2.className="col-md-8";
            const bd = document.createElement("div"); bd.className="card-body";
            bd.innerHTML=`
              <h5 class="card-title">${ep["שם הפרק"]} (פרק ${ep["מספר פרק"]})</h5>
              <p class="card-text">${ep["תאריך שידור"]||""}</p>
              <p class="card-text">${ep["תיאור"]||""}</p>
              ${ep["קישור"]?`<a href="${ep["קישור"]}" target="_blank" class="btn btn-primary">▶️ צפייה</a>`:""}
            `;
            c2.append(bd);
            row.append(c1,c2);
            card.append(row);
            container.append(card);
          });
        };
        container.append(btn);
      });
    })
    .catch(e=>{
      container.innerHTML = `<div class="text-danger text-center py-5">❌ שגיאה בטעינת הפרקים</div>`;
      console.error("שגיאה בטעינת הפרקים:",e);
    });
}

// ────────────────────────────────────────────────────────────────────────────
// 8) לחצן-toggle ותזמון טעינת סרטים
// ────────────────────────────────────────────────────────────────────────────
document.getElementById("toggleViewBtn").addEventListener("click", ()=>{
  isSeriesMode = !isSeriesMode;
  const btn   = document.getElementById("toggleViewBtn");
  const title = document.querySelector("h1");
  if(isSeriesMode) {
    title.textContent = "📺 הסדרות שלנו";
    btn.textContent   = "🎬 חזרה לסרטים";
    loadSeries();
  } else {
    title.textContent = "🎬 הסרטים שלנו";
    btn.textContent   = "📺 מעבר לסדרות";
    renderMovies(allMovies);
  }
});

// טעינת סרטים עם DOMContentLoaded
document.addEventListener("DOMContentLoaded", loadMovies);
