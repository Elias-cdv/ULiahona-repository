//===========================
//   SEARCH CONTROLLER
//===========================

let themesData = null;
let selectedFilters = ["Old Testament", "New Testament", "Book of Mormon", "Doctrine & Covenants", "Pearl of Great Price"];

export async function initSearch() {
    console.log("🔍 Search controller loaded");

    // Load themes JSON
    await loadThemesData();

    // Setup event listeners
    setupSearchInput();
    setupThemeButtons();
    setupFilters();

    console.log("✅ Search initialized");
}

async function loadThemesData() {
    try {
        const response = await fetch('data/themes.json');
        themesData = await response.json();
        console.log("✅ Themes data loaded:", themesData);
    } catch (err) {
        console.error("❌ Error loading themes:", err);
        alert("Error loading themes data");
    }
}

function setupSearchInput() {
    const searchInput = document.getElementById("search-input");
    const searchBtn = document.getElementById("search-btn");

    if (searchBtn) {
        searchBtn.addEventListener("click", () => {
            const query = searchInput.value.trim().toLowerCase();
            if (query) {
                searchByTheme(query);
            }
        });
    }

    if (searchInput) {
        searchInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                const query = searchInput.value.trim().toLowerCase();
                if (query) {
                    searchByTheme(query);
                }
            }
        });
    }
}

function setupThemeButtons() {
    const buttons = document.querySelectorAll(".theme-btn");

    buttons.forEach(btn => {
        btn.addEventListener("click", () => {
            const theme = btn.dataset.theme;
            searchByTheme(theme);
        });
    });
}

function setupFilters() {
    const checkboxes = document.querySelectorAll(".filter-checkbox input");
    const selectAllBtn = document.getElementById("select-all-btn");

    checkboxes.forEach(cb => {
        cb.addEventListener("change", updateFilters);
    });

    if (selectAllBtn) {
        selectAllBtn.addEventListener("click", () => {
            const allChecked = Array.from(checkboxes).every(cb => cb.checked);

            checkboxes.forEach(cb => {
                cb.checked = !allChecked;
            });

            updateFilters();
        });
    }
}

function updateFilters() {
    const checkboxes = document.querySelectorAll(".filter-checkbox input");
    selectedFilters = Array.from(checkboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.value);

    console.log("✅ Filters updated:", selectedFilters);
}

function searchByTheme(theme) {
    console.log("🔍 Searching for theme:", theme);

    if (!themesData || !themesData.themes) {
        alert("Themes data not loaded yet");
        return;
    }

    const themeKey = theme.toLowerCase();
    const results = themesData.themes[themeKey];

    if (!results) {
        showNoResults(theme);
        return;
    }

    // Filter by selected scriptures
    const filteredResults = results.filter(item =>
        selectedFilters.includes(item.scripture)
    );

    if (filteredResults.length === 0) {
        showNoResults(theme, true);
        return;
    }

    displayResults(theme, filteredResults);
}

function displayResults(theme, results) {
    const container = document.getElementById("results-container");

    if (!container) return;

    let html = `
        <h3 class="results-header">
            📖 Results for "${theme}" (${results.length} verses)
        </h3>
    `;

    results.forEach(result => {
        html += `
            <div class="result-item">
                <div class="result-reference">${result.reference}</div>
                <div class="result-scripture">${result.scripture} - ${result.book}</div>
                <div class="result-text">"${result.text}"</div>
            </div>
        `;
    });

    container.innerHTML = html;
    console.log("✅ Displayed", results.length, "results");
}

function showNoResults(theme, filtered = false) {
    const container = document.getElementById("results-container");

    if (!container) return;

    const message = filtered
        ? `No results found for "${theme}" with the selected filters. Try selecting more scriptures.`
        : `No results found for "${theme}". Try searching for "faith" or "prayer".`;

    container.innerHTML = `
        <div class="no-results">
            <p>❌ ${message}</p>
        </div>
    `;
}