/* =========================================
   THE NEWS SAATHI
   MAIN JAVASCRIPT
========================================= */


/* =========================================
   ELEMENTS
========================================= */

const newsGrid =
    document.getElementById("newsGrid");

const refreshBtn =
    document.getElementById("refreshBtn");

const lastUpdated =
    document.getElementById("lastUpdated");

const mobileUpdated =
    document.getElementById("mobileUpdated");

const darkModeBtn =
    document.getElementById("darkModeBtn");

const notesBtn =
    document.getElementById("notesBtn");

const notesPanel =
    document.getElementById("notesPanel");

const closeNotes =
    document.getElementById("closeNotes");

const notesInput =
    document.getElementById("notesInput");

const saveNotes =
    document.getElementById("saveNotes");

const notesStatus =
    document.getElementById("notesStatus");

const newsModal =
    document.getElementById("newsModal");

const closeModal =
    document.getElementById("closeModal");

const modalSourceLogo =
    document.getElementById("modalSourceLogo");

const modalSource =
    document.getElementById("modalSource");

const modalDate =
    document.getElementById("modalDate");

const modalTitle =
    document.getElementById("modalTitle");

const modalSummary =
    document.getElementById("modalSummary");

const readOriginal =
    document.getElementById("readOriginal");

const readSource =
    document.getElementById("readSource");

const screenshotBtn =
    document.getElementById("screenshotBtn");


/* =========================================
   SOURCE SHORT NAMES
========================================= */

const sourceShortNames = {

    "NDTV": "ND",

    "India Today": "IT",

    "Hindustan Times": "HT",

    "The Hindu": "TH",

    "BBC News": "BBC"

};


/* =========================================
   LOADING SCREEN
========================================= */

function showLoading() {

    newsGrid.innerHTML = "";

    for (let i = 0; i < 5; i++) {

        const column =
            document.createElement("div");

        column.className =
            "news-column";

        column.innerHTML = `

            <div class="skeleton-header"></div>

            <div class="skeleton-list">

                <div class="skeleton-item"></div>

                <div class="skeleton-item"></div>

                <div class="skeleton-item"></div>

                <div class="skeleton-item"></div>

                <div class="skeleton-item"></div>

                <div class="skeleton-item"></div>

            </div>

        `;

        newsGrid.appendChild(column);
    }
}


/* =========================================
   ESCAPE HTML
========================================= */

function escapeHTML(value = "") {

    return String(value)

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");
}


/* =========================================
   FORMAT TIME - INDIA IST
========================================= */

function formatTime(dateString) {

    const date =
        new Date(dateString);

    if (isNaN(date.getTime())) {

        return "--:--";

    }

    return date.toLocaleTimeString(
        "en-IN",
        {
            timeZone: "Asia/Kolkata",

            hour: "2-digit",

            minute: "2-digit",

            hour12: true
        }
    );
}


/* =========================================
   FORMAT DATE - INDIA
========================================= */

function formatDate(dateString) {

    const date =
        new Date(dateString);

    if (isNaN(date.getTime())) {

        return "Latest News";

    }

    return date.toLocaleDateString(
        "en-IN",
        {
            timeZone: "Asia/Kolkata",

            day: "2-digit",

            month: "short",

            year: "numeric"
        }
    );
}


/* =========================================
   UPDATE LAST UPDATED TIME
========================================= */

function updateLastUpdated(dateString) {

    const time =
        formatTime(dateString);


    /* Desktop */

    if (lastUpdated) {

        lastUpdated.textContent =
            `Last updated ${time}`;

    }


    /* Mobile */

    if (mobileUpdated) {

        mobileUpdated.textContent =
            `Updated ${time}`;

    }

}


/* =========================================
   CREATE NEWS COLUMN
========================================= */

function createNewsColumn(source) {

    const column =
        document.createElement("article");


    column.className =
        "news-column";


    const shortName =
        sourceShortNames[source.name] ||

        source.short ||

        source.name
            .substring(0, 3)
            .toUpperCase();


    let headlinesHTML = "";


    /* =====================================
       NEWS AVAILABLE
    ===================================== */

    if (
        source.news &&
        source.news.length
    ) {

        source.news
            .slice(0, 6)
            .forEach(
                (news, index) => {

                    headlinesHTML += `

                        <button
                            class="headline"
                            data-news-index="${index}"
                        >

                            <span class="number">
                                ${String(index + 1).padStart(2, "0")}
                            </span>

                            <span class="headline-text">
                                ${escapeHTML(news.title)}
                            </span>

                        </button>

                    `;
                }
            );

    }


    /* =====================================
       NO NEWS
    ===================================== */

    else {

        headlinesHTML = `

            <div
                style="
                    text-align:center;
                    padding:40px 15px;
                    color:var(--muted);
                "
            >

                <div
                    style="
                        font-size:30px;
                        margin-bottom:10px;
                    "
                >
                    📰
                </div>

                <strong
                    style="
                        font-size:12px;
                        color:var(--text);
                    "
                >
                    News temporarily unavailable
                </strong>

                <div
                    style="
                        font-size:10px;
                        margin-top:6px;
                    "
                >
                    Try refreshing
                </div>

            </div>

        `;
    }


    /* =====================================
       COLUMN HTML
    ===================================== */

    column.innerHTML = `

        <div class="column-header">

            <div class="source-info">

                <div class="source-logo">
                    ${escapeHTML(shortName)}
                </div>

                <div>

                    <h2>
                        ${escapeHTML(source.name)}
                    </h2>

                    <p>
                        Latest headlines
                    </p>

                </div>

            </div>


            <span class="live-badge">
                LIVE
            </span>

        </div>


        <div class="headline-list">

            ${headlinesHTML}

        </div>


        <div class="column-footer">

            <a
                href="${source.site}"
                target="_blank"
                rel="noopener noreferrer"
            >
                Visit ${escapeHTML(source.name)} ↗
            </a>

        </div>

    `;


    /* =====================================
       HEADLINE CLICK
    ===================================== */

    const buttons =
        column.querySelectorAll(".headline");


    buttons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const index =
                    Number(
                        button.dataset.newsIndex
                    );


                const news =
                    source.news[index];


                openNewsModal(
                    news,
                    source
                );

            }
        );

    });


    return column;
}


/* =========================================
   FETCH NEWS
========================================= */

async function fetchNews() {

    showLoading();


    /* Disable refresh button */

    if (refreshBtn) {

        refreshBtn.disabled =
            true;

        refreshBtn.classList.add(
            "refreshing"
        );


        refreshBtn.innerHTML = `

            <span id="refreshIcon">
                ↻
            </span>

            Updating...

        `;
    }


    try {

        /*
         * Unique timestamp prevents caching.
         */

        const cacheBuster =
            Date.now();


        const response =
            await fetch(
                `/api/news?t=${cacheBuster}`,
                {

                    method: "GET",

                    cache: "no-store",

                    headers: {

                        "Cache-Control":
                            "no-cache",

                        "Pragma":
                            "no-cache"

                    }

                }
            );


        if (!response.ok) {

            throw new Error(
                `Server returned ${response.status}`
            );

        }


        const data =
            await response.json();


        /* Clear old news */

        newsGrid.innerHTML = "";


        /* Check data */

        if (
            !data.columns ||
            !data.columns.length
        ) {

            showNoNews();

            return;

        }


        /* Add five columns */

        data.columns.forEach(
            source => {

                const column =
                    createNewsColumn(
                        source
                    );


                newsGrid.appendChild(
                    column
                );

            }
        );


        /*
         * IMPORTANT:
         * Update time using server time
         * and convert to India IST.
         */

        if (data.updatedAt) {

            updateLastUpdated(
                data.updatedAt
            );

        }


        console.log(
            "Fresh news loaded at:",
            formatTime(
                data.updatedAt
            )
        );


    }

    catch (error) {

        console.error(
            "News loading error:",
            error
        );


        showError();

    }

    finally {

        if (refreshBtn) {

            refreshBtn.disabled =
                false;

            refreshBtn.classList.remove(
                "refreshing"
            );


            refreshBtn.innerHTML = `

                <span id="refreshIcon">
                    ↻
                </span>

                Refresh

            `;
        }

    }

}


/* =========================================
   NO NEWS
========================================= */

function showNoNews() {

    newsGrid.innerHTML = `

        <div
            style="
                grid-column:1/-1;
                text-align:center;
                padding:70px 20px;
                color:var(--muted);
            "
        >

            <div
                style="
                    font-size:45px;
                    margin-bottom:12px;
                "
            >
                📰
            </div>


            <h2
                style="
                    color:var(--text);
                    margin-bottom:7px;
                "
            >
                No news available
            </h2>


            <p
                style="
                    font-size:12px;
                "
            >
                Please refresh and try again.
            </p>

        </div>

    `;
}


/* =========================================
   ERROR
========================================= */

function showError() {

    newsGrid.innerHTML = `

        <div
            style="
                grid-column:1/-1;
                text-align:center;
                padding:70px 20px;
                color:var(--muted);
            "
        >

            <div
                style="
                    font-size:45px;
                    margin-bottom:12px;
                "
            >
                ⚠️
            </div>


            <h2
                style="
                    color:var(--text);
                    margin-bottom:7px;
                "
            >
                Unable to load news
            </h2>


            <p
                style="
                    font-size:12px;
                    margin-bottom:15px;
                "
            >
                Please check your connection
                and refresh.
            </p>


            <button
                onclick="fetchNews()"
                style="
                    padding:10px 18px;
                    border:none;
                    border-radius:9px;
                    background:var(--primary);
                    color:white;
                    cursor:pointer;
                    font-weight:700;
                "
            >
                Try Again
            </button>

        </div>

    `;
}


/* =========================================
   REFRESH BUTTON
========================================= */

if (refreshBtn) {

    refreshBtn.addEventListener(
        "click",
        () => {

            fetchNews();

        }
    );

}


/* =========================================
   NEWS MODAL
========================================= */

function openNewsModal(
    news,
    source
) {

    if (!news) {
        return;
    }


    const shortName =
        sourceShortNames[source.name] ||

        source.short ||

        "NEWS";


    if (modalSourceLogo) {

        modalSourceLogo.textContent =
            shortName;

    }


    if (modalSource) {

        modalSource.textContent =
            source.name;

    }


    if (modalDate) {

        modalDate.textContent =
            news.pubDate
                ? formatDate(
                    news.pubDate
                )
                : "Latest News";

    }


    if (modalTitle) {

        modalTitle.textContent =
            news.title;

    }


    if (modalSummary) {

        modalSummary.textContent =
            news.summary ||
            "Summary unavailable.";

    }


    if (readSource) {

        readSource.textContent =
            source.name;

    }


    if (readOriginal) {

        readOriginal.href =
            news.link;

    }


    if (newsModal) {

        newsModal.classList.add(
            "active"
        );

        document.body.style.overflow =
            "hidden";

    }

}


/* =========================================
   CLOSE MODAL
========================================= */

function closeNewsModal() {

    if (newsModal) {

        newsModal.classList.remove(
            "active"
        );

    }


    document.body.style.overflow =
        "";

}


if (closeModal) {

    closeModal.addEventListener(
        "click",
        closeNewsModal
    );

}


if (newsModal) {

    newsModal.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                newsModal
            ) {

                closeNewsModal();

            }

        }
    );

}


/* =========================================
   ESCAPE KEY
========================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape"
        ) {

            closeNewsModal();


            if (notesPanel) {

                notesPanel.style.display =
                    "none";

            }

        }

    }
);


/* =========================================
   DARK MODE
========================================= */

function loadTheme() {

    const saved =
        localStorage.getItem(
            "newsSaathiTheme"
        );


    if (
        saved === "dark"
    ) {

        document.documentElement
            .classList.add(
                "dark"
            );


        if (darkModeBtn) {

            darkModeBtn.textContent =
                "☀️";

        }

    }

    else {

        if (darkModeBtn) {

            darkModeBtn.textContent =
                "🌙";

        }

    }

}


if (darkModeBtn) {

    darkModeBtn.addEventListener(
        "click",
        () => {

            document.documentElement
                .classList.toggle(
                    "dark"
                );


            const dark =
                document.documentElement
                    .classList.contains(
                        "dark"
                    );


            localStorage.setItem(
                "newsSaathiTheme",
                dark
                    ? "dark"
                    : "light"
            );


            darkModeBtn.textContent =
                dark
                    ? "☀️"
                    : "🌙";

        }
    );

}


/* =========================================
   NOTES
========================================= */

function loadNotes() {

    if (!notesInput) {
        return;
    }


    const notes =
        localStorage.getItem(
            "newsSaathiNotes"
        );


    if (notes) {

        notesInput.value =
            notes;

    }

}


if (notesBtn) {

    notesBtn.addEventListener(
        "click",
        () => {

            const visible =
                notesPanel.style.display ===
                "block";


            notesPanel.style.display =
                visible
                    ? "none"
                    : "block";

        }
    );

}


if (closeNotes) {

    closeNotes.addEventListener(
        "click",
        () => {

            notesPanel.style.display =
                "none";

        }
    );

}


if (saveNotes) {

    saveNotes.addEventListener(
        "click",
        () => {

            localStorage.setItem(
                "newsSaathiNotes",
                notesInput.value
            );


            if (notesStatus) {

                notesStatus.textContent =
                    "✓ Notes saved";


                setTimeout(
                    () => {

                        notesStatus.textContent =
                            "";

                    },
                    2000
                );

            }

        }
    );

}


/* =========================================
   SCREENSHOT
========================================= */

if (screenshotBtn) {

    screenshotBtn.addEventListener(
        "click",
        async () => {

            try {

                if (
                    typeof html2canvas ===
                    "undefined"
                ) {

                    alert(
                        "Screenshot library is still loading. Please try again."
                    );

                    return;

                }


                const element =
                    document.getElementById(
                        "newsSummary"
                    );


                if (!element) {

                    alert(
                        "News summary area not found."
                    );

                    return;

                }


                const canvas =
                    await html2canvas(
                        element,
                        {

                            backgroundColor:
                                "#ffffff",

                            scale:
                                2,

                            useCORS:
                                true

                        }
                    );


                const link =
                    document.createElement(
                        "a"
                    );


                link.download =
                    "the-news-saathi-news.png";


                link.href =
                    canvas.toDataURL(
                        "image/png"
                    );


                link.click();


            }

            catch (error) {

                console.error(
                    "Screenshot error:",
                    error
                );


                alert(
                    "Unable to create screenshot."
                );

            }

        }
    );

}


/* =========================================
   LOAD SCREENSHOT LIBRARY
========================================= */

function loadScreenshotLibrary() {

    if (
        document.getElementById(
            "html2canvasScript"
        )
    ) {

        return;

    }


    const script =
        document.createElement(
            "script"
        );


    script.id =
        "html2canvasScript";


    script.src =
        "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";


    script.crossOrigin =
        "anonymous";


    document.body.appendChild(
        script
    );

}


/* =========================================
   INITIALIZE
========================================= */

if (notesPanel) {

    notesPanel.style.display =
        "none";

}


loadTheme();

loadNotes();

loadScreenshotLibrary();

fetchNews();