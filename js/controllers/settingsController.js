//===========================
//   SETTINGS CONTROLLER
//===========================

export function initSettings() {
    console.log("⚙️ Settings controller loaded");

    // ===== 1. CARGAR CONFIGURACIONES GUARDADAS =====
    loadSavedSettings();

    // ===== 2. THEME TOGGLE =====
    const themeToggle = document.getElementById("theme-toggle");
    if (themeToggle) {
        themeToggle.addEventListener("change", (e) => {
            const isDark = e.target.checked;
            toggleTheme(isDark);
        });
    }

    // ===== 3. READING STYLE =====
    const styleCheckboxes = document.querySelectorAll('input[name="reading-style"]');
    styleCheckboxes.forEach(checkbox => {
        checkbox.addEventListener("change", (e) => {
            if (e.target.checked) {
                // Desmarcar los otros
                styleCheckboxes.forEach(cb => {
                    if (cb !== e.target) cb.checked = false;
                });
                
                localStorage.setItem("reading-style", e.target.value);
                console.log("✅ Reading style saved:", e.target.value);
            }
        });
    });

    // ===== 4. MUSIC TOGGLE =====
    const musicToggle = document.getElementById("music-toggle");
    if (musicToggle) {
        musicToggle.addEventListener("change", (e) => {
            const isOn = e.target.checked;
            localStorage.setItem("music", isOn ? "on" : "off");
            console.log("🎵 Music:", isOn ? "ON" : "OFF");
        });
    }

    // ===== 5. EXPORT NOTES =====
    const exportBtn = document.getElementById("export-notes-btn");
    if (exportBtn) {
        exportBtn.addEventListener("click", exportNotes);
    }
}

function loadSavedSettings() {
    // Theme
    const savedTheme = localStorage.getItem("theme");
    const themeToggle = document.getElementById("theme-toggle");
    if (savedTheme === "dark") {
        document.body.classList.add("dark");
        if (themeToggle) themeToggle.checked = true;
    }

    // Reading Style
    const savedStyle = localStorage.getItem("reading-style") || "scroll";
    const styleCheckbox = document.getElementById(`style-${savedStyle}`);
    if (styleCheckbox) styleCheckbox.checked = true;

    // Music
    const savedMusic = localStorage.getItem("music");
    const musicToggle = document.getElementById("music-toggle");
    if (savedMusic === "on" && musicToggle) {
        musicToggle.checked = true;
    }

    console.log("✅ Settings loaded from localStorage");
}

function toggleTheme(isDark) {
    if (isDark) {
        document.body.classList.add("dark");
        localStorage.setItem("theme", "dark");
        console.log("🌙 Dark mode activated");
    } else {
        document.body.classList.remove("dark");
        localStorage.setItem("theme", "light");
        console.log("☀️ Light mode activated");
    }
}

function exportNotes() {
    console.log("📥 Exporting notes...");

    // Obtener notas del localStorage
    const notes = localStorage.getItem("reader-notes") || "No notes available.";

    // Crear Blob
    const blob = new Blob([notes], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    // Crear link de descarga
    const a = document.createElement("a");
    a.href = url;
    a.download = `uliahona-notes-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log("✅ Notes exported successfully");
}