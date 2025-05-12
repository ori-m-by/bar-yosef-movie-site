const csvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRy3QmBmzq23a0pVmV7GBNa8ryYiKiIes8VclVTfCiwqPRITOxxSrZt8dT9aTCkpQ/pub?output=csv";

fetch(csvUrl)
  .then(res => res.text())
  .then(csvDATA => {
    const result = Papa.parse(csvDATA, { header: true });
    const rows = result.data;

    const container = document.getElementById("moviecontainer");

    rows.forEach(row => {
      const hebname = row["שם הסרט בעברית"] || "";
      const engname = row["שם הסרט באנגלית"] || "";
      const director = row["במאי"] || "";
      const mainactors = row["שחקנים ראשיים"] || "";
      const producer = row["מפיק"] || "";
      const writer = row["תסריטאי"] || "";
      const score = row["ציון IMDb"] || "";
      const pg = row["סרט לילדים / מבוגרים"] || "";
      const imdblink = row["קישור ל-IMDb"] || "";
      const genre = row["ז'אנר"] || "";
      const awards = row["פרסים והישגים בולטים"] || "";
      const viewinglink = row["קישור לדרייב"] || "";
      const year = row["שנת יציאה"] || "";
      const description = row["תיאור קצר"] || "";
      const picture = row["קישור לתמונה"] || "default-image.jpg";
      const trailer = row["טריילר"] || "";

      const card = document.createElement("div");
      card.className = "col-12 col-md-6 mb-4";

      const cardInner = document.createElement("div");
      cardInner.className = "card h-100 shadow-sm movie-card";
      cardInner.style.transition = "transform 0.3s ease";
      cardInner.style.transformOrigin = "center";

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

      // אלמנט הטריילר
      const trailerWrapper = document.createElement("div");
      trailerWrapper.className = "trailer-container";
      trailerWrapper.dataset.trailer = trailer;

      // אלמנט התמונה
      const img = document.createElement("img");
      img.src = picture;
      img.alt = hebname;
      img.className = "movie-image";
      img.onerror = function () {
        console.warn(`⚠️ התמונה נכשלה בטעינה: ${picture}`);
        this.onerror = null;
        this.src = "https://raw.githubusercontent.com/ori-m-by/bar-yosef-movie-site/main/%D7%AA%D7%9E%D7%95%D7%A0%D7%94%20%D7%9C%D7%90%D7%AA%D7%A8.png";
      };

      // עמודת התוכן הימנית
      const contentDiv = document.createElement("div");
      contentDiv.className = "movie-content";
      contentDiv.innerHTML = `
        <h5 class="card-title">${hebname}</h5>
        <h6 class="card-subtitle mb-2 text-muted">${engname}</h6>
        <p><strong>שנה:</strong> ${year}<br><strong>ז'אנר:</strong> ${genre}</p>
        <p>${description}</p>
        <p><strong>במאי:</strong> ${director}<br>
           <strong>שחקנים:</strong> ${mainactors}<br>
           <strong>תסריטאי:</strong> ${writer}<br>
           <strong>מפיק:</strong> ${producer}<br>
           <strong>IMDB:</strong> ${score}<br>
           <strong>פרסים:</strong> ${awards}<br>
           <strong>קהל יעד:</strong> ${pg}</p>
        ${viewinglink.startsWith("http") ? `<a href="${viewinglink}" target="_blank" class="btn btn-primary"> ▶️ צפייה </a>` : ""}
        ${imdblink.startsWith("http") ? `<a href="${imdblink}" target="_blank" class="btn btn-secondary ms-2">📺 IMDb</a>` : ""}
      `;

      // אלמנט הצד השמאלי
      const leftSide = document.createElement("div");
      leftSide.className = "left-side";
      leftSide.appendChild(trailerWrapper);
      leftSide.appendChild(img);

      // מבנה כללי
      const row = document.createElement("div");
      row.className = "d-flex flex-row";
      row.appendChild(leftSide);
      row.appendChild(contentDiv);

      cardInner.appendChild(row);
      card.appendChild(cardInner);
      container.appendChild(card);
    });
  })
  .catch(error => {
    console.error("שגיאה בטעינת הנתונים:", error);
  });
