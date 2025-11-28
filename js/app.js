// js/main.js
// Inicialización global ligera para ULiahona (Home)
(function () {
    "use strict";
    document.addEventListener("DOMContentLoaded", () => {
        console.log("ULiahona — main initialized");
        const savedTheme = localStorage.getItem("ul_theme");
        if (savedTheme === "dark") document.documentElement.classList.add("dark");
        window.UL = window.UL || {};
        window.UL.log = (...args) => console.log("[ULiahona]", ...args);
    });
})();

import { initHome } from "./controllers/homeController.js";

document.addEventListener("DOMContentLoaded", () => {
    console.log("DOMContentLoaded fired — checking page for init...");
    // Llama initHome si existe la sección de progreso (evita falsos positivos)
    const hasProgress = !!document.getElementById("progress-section");
    console.log("progress-section found:", hasProgress);
    if (hasProgress) {
        try {
            initHome();
            console.log("initHome() invoked");
        } catch (err) {
            console.error("Error running initHome:", err);
        }
    }
});
