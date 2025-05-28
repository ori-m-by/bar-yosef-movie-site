const csvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRy3QmBmzq23a0pVmV7GBNa8ryYiKiIes8VclVTfCiwqPRITOxxSrZt8dT9aTCkpQ/pub?output=csv";

let allMovies = [];

function createMovieCard(data) {
  const hebname = data["שם הסרט בעברית"] || "";
  const engname = data["שם הסרט באנגלית"] || "";
  const director = data["במאי"] || "";
  const mainactors = data["שחקנים ראשיים"] || "";
  const producer = data["מפיק"] || "";
  const writer = data["תסריטאי"] || "";
  const score = data["ציון IMDb"] || "";
  const pg = data["סרט לילדים / מבוגרים"] || "";
  const imdblink = data["קישור ל-IMDb"] || "";
  const genre = data["ז'אנר"] || "";
  const awards = data["פרסים והישגים בולטים"] || "";
  const viewinglink = data["קישור לדרייב"] || "";
  const year = data["שנת יציאה"] || "";
  const description = data["תיאור קצר"] || "";
  const picture = data["קישור לתמונה"] || "default-image.jpg";
  const trailer = data["טריילר"] || "";

  const card = document.createElement("div");
  card.className = "col-12 col-md-6 mb-4";

  const cardInner = document.createElement("div");
  cardInner.className = "card h-100 shadow-sm movie-card";
  cardInner.style.transition = "transform 0.3s ease";
  cardInner.style.transformOrigin = "center";

  const trailerWrapper = document.createElement("div");
  trailerWrapper.className = "trailer-container";

  cardInner.addEventListener("mouseenter", () => {
    cardInner.style.transform = "scale(1.05)";
    if (trailer && !trailerWrapper.innerHTML) {
      const embedUrl = trailer.replace("watch?v=", "embed/") + "?autoplay=1&mute=1&rel=0&controls=1";
      trailerWrapper.innerHTML = `<iframe width="100%" height="100%" src="${embedUrl}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
    }
  });

  cardInner.addEventListener("mouseleave", () => {
    cardInner.style.transform = "scale(1)";
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

  cardInner.appendChild(rowDiv);
  card.appendChild(cardInner);

  return card;
}

function renderMovies(movies) {
  const container = document.getElementById("moviecontainer");
  container.innerHTML = "";
  movies.forEach(movie => {
    container.appendChild(createMovieCard(movie));
  });
}

function applyFilters() {
  const yearFilter = document.getElementById("yearFilter").value;
  const ratingFilter = parseFloat(document.getElementById("ratingFilter").value) || 0;
  const genreFilter = document.getElementById("genreFilter").value.toLowerCase();
  const searchTerm = document.getElementById("searchInput").value.toLowerCase();

  const filtered = allMovies.filter(movie => {
    const yearMatch = !yearFilter || movie["שנת יציאה"] === yearFilter;
    const rating = parseFloat(movie["ציון IMDb"]) || 0;
    const ratingMatch = rating >= ratingFilter;

    // ז'אנרים תואמים גם אם רשום קומדיה, הרפתקאות
    const genresInMovie = (movie["ז'אנר"] || "").split(",").map(g => g.trim().toLowerCase());
    const genreMatch = !genreFilter || genresInMovie.includes(genreFilter);

    const searchMatch = [movie["שם הסרט בעברית"], movie["שם הסרט באנגלית"], movie["במאי"], movie["שחקנים ראשיים"], movie["תיאור קצר"]]
      .some(field => field && field.toLowerCase().includes(searchTerm));

    return yearMatch && ratingMatch && genreMatch && searchMatch;
  });

  renderMovies(filtered);
}

fetch(csvUrl)
  .then(res => res.text())
  .then(csvData => {
    const result = Papa.parse(csvData, { header: true });
    allMovies = result.data.filter(row => row["שם הסרט בעברית"]); // סינון שורות ריקות
    renderMovies(allMovies);

    // יצירת אפשרויות סינון (שנים)
    const years = [...new Set(allMovies.map(m => m["שנת יציאה"]).filter(Boolean))].sort();
    const yearSelect = document.getElementById("yearFilter");
    years.forEach(year => {
      const option = document.createElement("option");
      option.value = year;
      option.textContent = year;
      yearSelect.appendChild(option);
    });

    // יצירת אפשרויות סינון לפי ז'אנר (כולל הפרדת ז'אנרים מרובים)
    const genreSet = new Set();
    allMovies.forEach(movie => {
      if (movie["ז'אנר"]) {
        movie["ז'אנר"].split(",").forEach(g => {
          const genre = g.trim();
          if (genre) genreSet.add(genre);
        });
      }
    });
    const genres = [...genreSet].sort();
    const genreSelect = document.getElementById("genreFilter");
    genres.forEach(genre => {
      const option = document.createElement("option");
      option.value = genre;
      option.textContent = genre;
      genreSelect.appendChild(option);
    });
  })
  .catch(err => console.error("שגיאה בטעינת הנתונים:", err));
