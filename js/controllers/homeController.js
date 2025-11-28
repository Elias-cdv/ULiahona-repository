//===========================
//     HOME CONTROLLER
//===========================

import { loadProgress, saveProgress } from "../modules/storage.js";
import { fetchQuote } from "../modules/quotes.js";
import { loadScripture } from "../modules/chapters.js";
import { createBookCard } from "../modules/dom.js";

// guardamos texto de la última frase mostrada para evitar repetidos inmediatos
let lastQuoteText = null;

export function initHome(){
    console.log("Home controller loaded");

    const progressSection = document.getElementById("progress-section");
    const quoteSection = document.getElementById("quote-section");
    const chooseContainer = document.querySelector("#choose-scripture .scripture-grid") 
        || document.getElementById("choose-scripture");

    if (!progressSection) {
        console.warn("progress-section not found in DOM — aborting initHome");
        return;
    }

    // 1 Cargar quote of the day (protegido)
    (async () => {
        try {
            await loadDailyQuote(quoteSection);
            enableQuoteRefresh(); // Attach el handler después de que el botón exista
        } catch (e) {
            console.warn("Failed to load quote (non-fatal):", e);
            if (quoteSection) quoteSection.innerHTML = `<p>Quote unavailable.</p>`;
        }
    })();

    // 2 Cargar progreso si existe
    const progress = loadProgress();

    if (!progress){
        progressSection.innerHTML =`
            <h2>Progress of Study</h2>
            <p class="no-book">No scripture selected yet.</p>
            <div class="progress-card">
                <div class="progress-bar" aria-hidden="true">
                    <div class="progress-fill" style="width:0%"></div>
                </div>
                <div class="progress-meta"><span class="progress-percent">0%</span></div>
            </div>
            <p class="hint">Choose one below to start.</p>
        `;
    } else {
        progressSection.innerHTML = `
            <h2>Progress of Study</h2>
            <p><strong>Selected scripture:</strong> ${progress.book}</p>
            <div class="progress-card">
                <div class="progress-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${progress.percentage}">
                    <div class="progress-fill" style="width:${progress.percentage}%"></div>
                </div>
                <div class="progress-meta"><span class="progress-percent">${progress.percentage}%</span></div>
            </div>
            <p class="motivation">Keep going, you're doing great!</p>
        `;
    }

    // 3 Renderizar las escrituras como iconos (dinámico)
    if (!chooseContainer) {
        console.warn("choose-scripture container not found — skipping rendering of cards");
        return;
    }

    const scriptures = [
        { file: "old-testament.json", name: "", img: "assets/images/ot.png"},
        { file: "new-testament.json", name: "", img: "assets/images/nt.png"},
        { file: "book-of-mormon.json", name: "", img: "assets/images/bom.png"},
        { file: "doctrine-and-covenants.json", name: "", img: "assets/images/dyc.png"},
        { file: "pearl-of-great-price.json", name: "", img: "assets/images/pgp.png"},
    ];

    // limpiar contenido previo
    chooseContainer.innerHTML = "";

    scriptures.forEach(scr => {
        const card = createBookCard(scr.name, scr.img);

        card.addEventListener("click", async () => {
            try {
                saveProgress({
                    book: scr.name,
                    chapter: 1,
                    verse: 1,
                    percentage: 0
                });
                progressSection.innerHTML = `
                    <h2>Progress of Study</h2>
                    <p><strong>Selected scripture:</strong> ${scr.name}</p>
                    <div class="progress-card">
                        <div class="progress-bar" aria-hidden="true">
                            <div class="progress-fill" style="width:0%"></div>
                        </div>
                        <div class="progress-meta"><span class="progress-percent">0%</span></div>
                    </div>
                    <p class="motivation">Keep going, you're doing great!</p>
                `;
                console.log("Saved progress for:", scr.name);
            } catch (err) {
                console.error("Click handler failed:", err);
            }
        });

        chooseContainer.appendChild(card);
    });
}

async function loadDailyQuote(container) {
    if (!container) return;
    
    const maxAttempts = 5;
    let attempt = 0;
    let q = null;

    while (attempt < maxAttempts) {
        q = await fetchQuote(lastQuoteText);
        if (!q) break;
        if (q.text && q.text !== lastQuoteText) break;
        attempt++;
    }

    if (!q) q = { text: "Quote unavailable.", author: "" };

    lastQuoteText = q.text ?? null;
    container.innerHTML = `
        <div class="quote-card-header">
            <h2>Quote of the Day</h2>
            <button id="quote-refresh" class="btn-icon" title="Reload quote">⟳</button>
        </div>
        <div class="quote-card">
            <blockquote>${q.text}</blockquote>
            <small class="quote-author">${q.author || ""}</small>
        </div>
    `;
}

function enableQuoteRefresh() {
    const btn = document.getElementById("quote-refresh");
    if (!btn) {
        console.warn("quote-refresh button not found");
        return;
    }

    btn.addEventListener("click", async (e) => {
        e.preventDefault();
        console.log("Quote refresh clicked");
        
        try {
            btn.disabled = true;
            btn.classList.add("btn-loading");
            
            // Obtener nueva frase evitando la actual
            const q = await fetchQuote(lastQuoteText);

            if (q && q.text) {
                lastQuoteText = q.text;
                const container = document.getElementById("quote-section");
                
                if (container) {
                    container.innerHTML = `
                        <div class="quote-card-header">
                            <h2>Quote of the Day</h2>
                            <button id="quote-refresh" class="btn-icon" title="Reload quote">⟳</button>
                        </div>
                        <div class="quote-card">
                            <blockquote>${q.text}</blockquote>
                            <small class="quote-author">${q.author || ""}</small>
                        </div>
                    `;
                    console.log("✓ Quote refreshed");
                    
                    // Re-attach handler al nuevo botón
                    setTimeout(() => enableQuoteRefresh(), 50);
                }
            } else {
                console.warn("No new quote received");
            }
        } catch (err) {
            console.error("Quote refresh failed:", err);
        } finally {
            btn.disabled = false;
            btn.classList.remove("btn-loading");
        }
    });
}
