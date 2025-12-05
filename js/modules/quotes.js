/*========================
     INTEGRACIÓN DE API
  =========================*/

/*Al principio solo use zenquotes, no cargó, investigue otras dos APIs, utilicé el mismo algoritmo, y ahora se llaman a 3
APIs para evitar fallas y caídas */
export async function fetchQuote(excludeText = null) {
    
    // API 1: Quotable (buena, pero a veces lento)
    const tryQuotable = async () => {
        try {
            const res = await fetch(`https://api.quotable.io/random?_=${Date.now()}`, {
                cache: "no-store",
                headers: { Accept: "application/json" }
            });
            if (!res.ok) return null;
            const j = await res.json();
            return j?.content ? { text: j.content, author: j.author || "Quotable" } : null;
        } catch (error) {
            console.warn("Quotable failed:", error.message);
            return null;
        }
    };

    // API 2: Advice Slip (siempre funciona, CORS ok)
    const tryAdviceSlip = async () => {
        try {
            const res = await fetch(`https://api.adviceslip.com/advice?_=${Date.now()}`, {
                cache: "no-store"
            });
            if (!res.ok) return null;
            const j = await res.json();
            return j?.slip?.advice ? { text: j.slip.advice, author: "Advice Slip" } : null;
        } catch (error) {
            console.warn("AdviceSlip failed:", error.message);
            return null;
        }
    };

    // API 3: uselessfacts (hechos aleatorios interesantes)
    const tryUselessFacts = async () => {
        try {
            const res = await fetch(`https://uselessfacts.jsonfeed.org/feed.json`, {
                cache: "no-store"
            });
            if (!res.ok) return null;
            const j = await res.json();
            if (j?.items && j.items.length > 0) {
                const idx = Math.floor(Math.random() * j.items.length);
                const item = j.items[idx];
                return { text: item.summary || item.content_text || "Random fact", author: "Useless Facts" };
            }
            return null;
        } catch (error) {
            console.warn("UselessFacts failed:", error.message);
            return null;
        }
    };

    // Intentos para evitar repetir excludeText
    const maxAttempts = 4;
    for (let i = 0; i < maxAttempts; i++) {
        try {
            // Prioridad: Quotable > AdviceSlip > UselessFacts
            let q = await tryQuotable();
            if (!q) q = await tryAdviceSlip();
            if (!q) q = await tryUselessFacts();
            
            if (!q) {
                console.warn("Intento", i + 1, "- No quote obtained");
                continue;
            }

            // Evitar devolver la misma frase
            if (!excludeText || q.text !== excludeText) {
                console.log("✓ Quote obtained:", q.text.substring(0, 50) + "...");
                return q;
            }

            console.warn("Intento", i + 1, "- Quote igual a anterior, reintentando...");
        } catch (err) {
            console.error("fetchQuote error en intento", i + 1, ":", err);
        }

        // Esperar antes de reintentar (excepto en último intento)
        if (i < maxAttempts - 1) {
            await new Promise(r => setTimeout(r, 200));
        }
    }

    // Último intento sin restricción
    try {
        const finalTry = await tryQuotable() || await tryAdviceSlip() || await tryUselessFacts();
        return finalTry || null;
    } catch (err) {
        console.error("Last fetchQuote attempt failed:", err);
        return null;
    }
}

