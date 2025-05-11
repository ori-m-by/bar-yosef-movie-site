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
      const genra = row["ז'אנר"] || "";
      const awards = row["פרסים והישגים בולטים"] || "";
      const viewinglink = row["קישור לדרייב"] || "";
      const year = row["שנת יציאה"] || "";
      const description = row["תיאור קצר"] || "";
      const picture = row["קישור לתמונה"] || "";
      const trailer = row["טריילר"] || "";

      const card = document.createElement("div");
      card.className = "col";

      card.innerHTML = `
        <div class="card h-100 shadow-sm">
          <div class="card-body">
            <h5 class="card-title">${hebname}</h5>
            <h6 class="card-subtitle mb-2 text-muted">${engname}</h6>
            <p class="card-text"><strong>שנה:</strong> ${year}<br><strong>ז'אנר:</strong> ${genra}</p>
            <p class="card-text">${description}</p>
            ${viewinglink.startsWith("http") ? `<a href="${viewinglink}" target="_blank" class="btn btn-primary">▶️ צפייה</a>` : ""}
            ${imdblink.startsWith("http") ? `<a href="${imdblink}" target="_blank" class="btn btn-secondary ms-2">📺 IMDb</a>` : ""}
          </div>
        </div>
      `;

      container.appendChild(card);
    });
  })
  .catch(error => {
    console.error("⚠️ שגיאה בטעינת נתוני הסרטים:", error);
    const container = document.getElementById("moviecontainer");
    container.innerHTML = `<div class="alert alert-danger text-center">⚠️ שגיאה בטעינת הנתונים. נסו לרענן את העמוד.</div>`;
  });
