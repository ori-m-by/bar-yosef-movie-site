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
      const picture = row["קישור לתמונה"] || "default-image.jpg"; // תמונה ברירת מחדל
      const trailer = row["טריילר"] || "";

      // יצירת כרטיס עם תמונה
      const card = document.createElement("div");
      card.className = "col-12 col-md-6"; // שני כרטיסים בשורה

      const img = document.createElement("img");
      img.src = picture;
      img.alt = hebname;
      img.className = "card-img-left";
      img.style.maxWidth = "150px";
      img.style.height = "auto";
      img.style.marginRight = "15px";

      // טיפול בשגיאות תמונה
      img.onerror = function () {
        console.warn(`⚠️ התמונה נכשלה בטעינה: ${picture}`);
        this.onerror = null; // למנוע לולאת שגיאות
        this.src = "https://github.com/ori-m-by/bar-yosef-movie-site/blob/main/%D7%AA%D7%9E%D7%95%D7%A0%D7%94%20%D7%9C%D7%90%D7%AA%D7%A8.png?raw=true"; // תמונת ברירת מחדל
      };

      card.innerHTML = `
        <div class="card h-100 shadow-sm">
          <div class="card-body d-flex">
            <!-- תמונה בצד שמאל -->
            ${img.outerHTML}
            
            <!-- כיתוב בצד ימין -->
            <div class="card-text">
                <h5 class="card-title">${hebname}</h5>
                <h6 class="card-subtitle mb-2 text-muted">${engname}</h6>
                <p><strong>שנה:</strong> ${year}<br><strong>ז'אנר:</strong> ${genre}</p>
                <p>${description}</p>
                ${viewinglink.startsWith("http") ? `<a href="${viewinglink}" target="_blank" class="btn btn-primary"> ▶️ צפייה </a>` : ""}
                ${imdblink.startsWith("http") ? `<a href="${imdblink}" target="_blank" class="btn btn-secondary ms-2">📺 IMDb</a>` : ""}
            </div>
          </div>
        </div>
      `;

      // הוספת הכרטיס לאזור התצוגה
      container.appendChild(card);
    });
  })
  .catch(error => {
    console.error("שגיאה בטעינת הנתונים:", error);
  });
