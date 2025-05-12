const csvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRy3QmBmzq23a0pVmV7GBNa8ryYiKiIes8VclVTfCiwqPRITOxxSrZt8dT9aTCkpQ/pub?output=csv";
let allMovies = [];

const container = document.getElementById("moviecontainer");
const searchInput = document.getElementById("searchInput");
const yearFilter = document.getElementById("yearFilter");
const ratingFilter = document.getElementById("ratingFilter");

fetch(csvUrl)
  .then(res => res.text())
  .then(csvDATA => {
    const result = Papa.parse(csvDATA, { header: true });
    allMovies = result.data.filter(row => row["שם הסרט בעברית"]); // להסיר שורות ריקות

    populateYearFilter(allMovies);
    renderMovies(allMovies);
  });

function populateYearFilter(movies) {
  const years = [...new Set(movies.map(m => m["שנת יציאה"]).filter(Boolean))].sort().reverse();
  years.forEach(y => {
    const option = document.createElement("option");
    option.value = y;
    option.textContent = y;
    yearFilter.appendChild(option);
  });
}

function renderMovies(movies) {
  container.innerHTML = "";

  movies.forEach(row => {
    const {
      "שם הסרט בעברית": hebname = "",
      "שם הסרט באנגלית": engname = "",
      "במאי": director = "",
      "שחקנים ראשיים": mainactors = "",
      "מפיק": producer = "",
      "תסריטאי": writer = "",
      "ציון IMDb": score = "",
      "סרט לילדים / מבוגרים": pg = "",
      "קישור ל-IMDb": imdblink = "",
      "ז'אנר": genre = "",
      "פרסים והישגים בולטים": awards = "",
      "קישור לדרייב": viewinglink = "",
      "שנת יציאה": year = "",
      "תיאור קצר": description = "",
      "קישור לתמונה": picture = "default.jpg",
      "טריילר": trailer = ""
    } = row;

    const card = document.createElement("div");
    card.className = "col";

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
    img.onerror = () => {
      img.src = "https://raw.githubusercontent.com/ori-m-by/bar-yosef-movie-site/main/%D7%AA%D7%9E%D7%95%D7%A0%D7%94%20%D7%9C%D7%90%D7%AA%D7%A8.png";
    };

    const contentDiv = document.createElement("div");
    contentDiv.className = "movie-content";

    contentDiv.innerHTML = `
      <h5>${hebname}</h5>
      <h6 class="text-muted">${engname}</h6>
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
    container.appendChild(card);
  });
}

function applyFilters() {
  const query = searchInput.value.toLowerCase();
  const selectedYear = yearFilter.value;
  const selectedRating = parseFloat(ratingFilter.value || 0);

  const filtered = allMovies.filter(movie => {
    const combinedText = `
      ${movie["שם הסרט בעברית"] || ""}
      ${movie["שם הסרט באנגלית"] || ""}
      ${movie["במאי"] || ""}
      ${movie["שחקנים ראשיים"] || ""}
      ${movie["תיאור קצר"] || ""}
    `.toLowerCase();

    const yearMatch = !selectedYear || movie["שנת יציאה"] === selectedYear;
    const ratingMatch = !selectedRating || parseFloat(movie["ציון IMDb"]) >= selectedRating;
    const textMatch = combinedText.includes(query);

    return yearMatch && ratingMatch && textMatch;
  });

  renderMovies(filtered);
}

searchInput.addEventListener("input", applyFilters);
yearFilter.addEventListener("change", applyFilters);
ratingFilter.addEventListener("change", applyFilters);
