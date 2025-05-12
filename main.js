// main.js

const csvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRy3QmBmzq23a0pVmV7GBNa8ryYiKiIes8VclVTfCiwqPRITOxxSrZt8dT9aTCkpQ/pub?output=csv";

const state = {
  year: "",
  genre: "",
  score: "",
  search: ""
};

const filters = {
  year: new Set(),
  genre: new Set(),
  score: new Set()
};

fetch(csvUrl)
  .then(res => res.text())
  .then(csvDATA => {
    const result = Papa.parse(csvDATA, { header: true });
    const rows = result.data.filter(row => row["שם הסרט בעברית"]);
    generateFilterOptions(rows);
    renderMovies(rows);

    document.getElementById("filter-year").addEventListener("change", e => {
      state.year = e.target.value;
      renderMovies(rows);
    });
    document.getElementById("filter-genre").addEventListener("change", e => {
      state.genre = e.target.value;
      renderMovies(rows);
    });
    document.getElementById("filter-score").addEventListener("change", e => {
      state.score = e.target.value;
      renderMovies(rows);
    });
    document.getElementById("search-input").addEventListener("input", e => {
      state.search = e.target.value.toLowerCase();
      renderMovies(rows);
    });
  })
  .catch(error => {
    console.error("שגיאה בטעינת הנתונים:", error);
  });

function generateFilterOptions(rows) {
  rows.forEach(row => {
    if (row["שנת יציאה"]) filters.year.add(row["שנת יציאה"].trim());
    if (row["ז'אנר"]) filters.genre.add(row["ז'אנר"].trim());
    if (row["ציון IMDb"]) filters.score.add(row["ציון IMDb"].trim());
  });

  const yearSelect = document.getElementById("filter-year");
  const genreSelect = document.getElementById("filter-genre");
  const scoreSelect = document.getElementById("filter-score");

  filters.year.forEach(y => yearSelect.innerHTML += `<option value="${y}">${y}</option>`);
  filters.genre.forEach(g => genreSelect.innerHTML += `<option value="${g}">${g}</option>`);
  filters.score.forEach(s => scoreSelect.innerHTML += `<option value="${s}">${s}</option>`);
}

function renderMovies(data) {
  const container = document.getElementById("moviecontainer");
  container.innerHTML = "";

  data.filter(movie => {
    const matchesYear = !state.year || movie["שנת יציאה"] === state.year;
    const matchesGenre = !state.genre || movie["ז'אנר"] === state.genre;
    const matchesScore = !state.score || movie["ציון IMDb"] === state.score;
    const text = `\${movie["שם הסרט בעברית"]} \${movie["שם הסרט באנגלית"]} \${movie["במאי"]} \${movie["שחקנים ראשיים"]}`.toLowerCase();
    const matchesSearch = !state.search || text.includes(state.search);
    return matchesYear && matchesGenre && matchesScore && matchesSearch;
  }).forEach(movie => {
    const hebname = movie["שם הסרט בעברית"] || "";
    const engname = movie["שם הסרט באנגלית"] || "";
    const director = movie["במאי"] || "";
    const mainactors = movie["שחקנים ראשיים"] || "";
    const producer = movie["מפיק"] || "";
    const writer = movie["תסריטאי"] || "";
    const score = movie["ציון IMDb"] || "";
    const pg = movie["סרט לילדים / מבוגרים"] || "";
    const imdblink = movie["קישור ל-IMDb"] || "";
    const genre = movie["ז'אנר"] || "";
    const awards = movie["פרסים והישגים בולטים"] || "";
    const viewinglink = movie["קישור לדרייב"] || "";
    const year = movie["שנת יציאה"] || "";
    const description = movie["תיאור קצר"] || "";
    const picture = movie["קישור לתמונה"] || "default-image.jpg";
    const trailer = movie["טריילר"] || "";

    const cardWrapper = document.createElement("div");
    cardWrapper.className = "col-12 col-md-6 mb-4";

    const card = document.createElement("div");
    card.className = "card h-100 shadow-sm movie-card";

    const trailerWrapper = document.createElement("div");
    trailerWrapper.className = "trailer-container";

    card.addEventListener("mouseenter", () => {
      card.style.transform = "scale(1.05)";
      if (trailer && !trailerWrapper.innerHTML) {
        const embedUrl = trailer.replace("watch?v=", "embed/") + "?autoplay=1&mute=1&rel=0&controls=1";
        trailerWrapper.innerHTML = `<iframe width="100%" height="100%" src="${embedUrl}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
      }
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "scale(1)";
    });

    const img = document.createElement("img");
    img.src = picture;
    img.alt = hebname;
    img.className = "movie-image";
    img.onerror = function () {
      this.src = "https://raw.githubusercontent.com/ori-m-by/bar-yosef-movie-site/main/%D7%AA%D7%9E%D7%95%D7%A0%D7%94%20%D7%9C%D7%90%D7%AA%D7%A8.png";
    };

    const contentDiv = document.createElement("div");
    contentDiv.className = "movie-content";
    contentDiv.innerHTML = `
      <h5 class="card-title">${hebname}</h5>
      <h6 class="card-subtitle mb-2 text-muted">${engname}</h6>
      <p><strong>שנה:</strong> ${year}<br><strong>ז'אנר:</strong> ${genre}</p>
      <p>${description}</p>
      <div class="extra-info">
        <p><strong>במאי:</strong> ${director}<br>
           <strong>שחקנים:</strong> ${mainactors}<br>
           <strong>תסריטאי:</strong> ${writer}<br>
           <strong>מפיק:</strong> ${producer}<br>
           <strong>IMDB:</strong> ${score}<br>
           <strong>פרסים:</strong> ${awards}<br>
           <strong>קהל יעד:</strong> ${pg}</p>
        ${viewinglink.startsWith("http") ? `<a href="${viewinglink}" target="_blank" class="btn btn-primary"> ▶️ צפייה </a>` : ""}
        ${imdblink.startsWith("http") ? `<a href="${imdblink}" target="_blank" class="btn btn-secondary ms-2">📺 IMDb</a>` : ""}
      </div>
    `;

    const leftSide = document.createElement("div");
    leftSide.className = "left-side";
    leftSide.appendChild(trailerWrapper);
    leftSide.appendChild(img);

    const rowDiv = document.createElement("div");
    rowDiv.className = "d-flex flex-row";
    rowDiv.appendChild(leftSide);
    rowDiv.appendChild(contentDiv);

    card.appendChild(rowDiv);
    cardWrapper.appendChild(card);
    container.appendChild(cardWrapper);
  });
}
