//===========================
//   READER CONTROLLER (VERSIÓN MÍNIMA)
//===========================
import { loadScripture } from "../modules/chapters.js";

let currentScripture = {
    file: null, 
    name: null, 
    data: null,
    structureType: null, 
    currentBookIndex: null, // indice del libro actual
    currentChapterIndex: null //indice del capitulo actual
};

export function initReader() {
    console.log("✅ Reader controller loaded");

    const scriptureList = document.querySelector(".scripture-list");

    if (!scriptureList) {
        console.warn("❌ scripture-list not found in DOM");
        return;
    }

    console.log("✅ scripture-list found");

    // Renderizar lista de escrituras (SOLO IMÁGENES)
    renderScriptureList(scriptureList);

    initToolbar();
}

// Función que renderiza escrituras del json y las muestra con las imagenes designadas
function renderScriptureList(container) {
    const scriptures = [
        { file: "old-testament.json", name: "Old Testament", img: "assets/images/ot.png" },
        { file: "new-testament.json", name: "New Testament", img: "assets/images/nt.png" },
        { file: "book-of-mormon.json", name: "Book of Mormon", img: "assets/images/bom.png" },
        { file: "doctrine-and-covenants.json", name: "Doctrine & Covenants", img: "assets/images/dyc.png" },
        { file: "pearl-of-great-price.json", name: "Pearl of Great Price", img: "assets/images/pgp.png" }
    ];

    console.log("📋 Rendering", scriptures.length, "scripture images");

    container.innerHTML = ""; // Limpiar

    scriptures.forEach(scr => {
        const item = document.createElement("div");
        item.classList.add("scripture-item");
        item.innerHTML = `
            <img src="${scr.img}" alt="${scr.name}" class="scripture-thumb">
            <span class="scripture-name">${scr.name}</span>
        `;

        // Ahora funciona con todas las escrituras, no uso if
        item.addEventListener ("click", () => {
            loadScriptureBooks(scr.file, scr.name);
        });
        container.appendChild(item);
    });

    console.log("✅ Scripture images rendered");
}

async function loadScriptureBooks(file, name) {
    console.log("🔄 Iniciando carga de:", name);
    
    try {
        // ===== 1. OBTENER LOS ELEMENTOS DEL DOM =====
        const scriptureTitle = document.getElementById("scripture-title");
        const booksContainer = document.getElementById("books-container");
        const readingWelcome = document.getElementById("reading-welcome");
        
        if (!scriptureTitle || !booksContainer) {
            console.error("No se encontraron los elementos del DOM");
            return;
        }
        
        console.log("Elementos del DOM encontrados");
        
        // ===== 2. OCULTAR EL MENSAJE DE BIENVENIDA =====
        if (readingWelcome) {
            readingWelcome.classList.add("hidden");
        }
        
        // ===== 3. MOSTRAR LOS CONTENEDORES =====
        scriptureTitle.classList.remove("hidden");
        booksContainer.classList.remove("hidden");

        // ===== 3.5 OCULTAR Y LIMPIAR CONTENIDO ANTERIOR =====
        const chaptersContainer = document.getElementById("chapters-container");
        const scriptureContent = document.getElementById("scripture-content");

        if (chaptersContainer){
            chaptersContainer.classList.add("hidden");
            chaptersContainer.innerHTML = "";
        }
        if (scriptureContent){
            scriptureContent.classList.add("hidden");
            scriptureContent.innerHTML = "";
        }
        
        console.log("Contenido anterior limpiado");
        console.log("Contenedores visibles");
        
        // ===== 4. CARGAR EL JSON =====
        console.log("Llamando a loadScripture con:", file);
        
        const data = await loadScripture(file);
        
        console.log("JSON recibido:", data);
        
        // ===== 5. VERIFICAR QUE LLEGÓ ALGO =====
        if (!data) {
            console.error("No se recibió data");
            scriptureTitle.innerHTML = "<h2>Error al cargar</h2>";
            booksContainer.innerHTML = `<p>No se pudo cargar ${name}</p>`;
            return;
        }
        
        console.log("Data recibida correctamente");
        
        // ===== 6. DETECTAR ESTRUCTURA (books vs sections) =====
        let itemsToShow = [];
        let structureType = "";
        
        if (data.books && Array.isArray(data.books)) {
            // Estructura normal: books → chapters
            itemsToShow = data.books;
            structureType = "books";
            console.log("✅ Estructura detectada: BOOKS (con chapters)");
        } else if (data.sections && Array.isArray(data.sections)) {
            // Estructura de D&C: sections directas
            itemsToShow = data.sections;
            structureType = "sections";
            console.log("✅ Estructura detectada: SECTIONS (sin chapters intermedios)");
        } else {
            console.error("❌ Estructura desconocida. No tiene 'books' ni 'sections'");
            console.log("🔍 Propiedades disponibles:", Object.keys(data));
            return;
        }
        
        console.log(`📚 Total de ${structureType}:`, itemsToShow.length);
        
        // ===== 7. GUARDAR EN ESTADO GLOBAL =====
        currentScripture.file = file;
        currentScripture.name = name;
        currentScripture.data = data;
        currentScripture.structureType = structureType; // ← Nuevo: guardar el tipo
        console.log("Estado guardado:", currentScripture);
        
        // ===== 8. MOSTRAR EL TÍTULO =====
        scriptureTitle.innerHTML = `<h2>📖 ${name}</h2>`;
        console.log("Título mostrado:", name);
        
        // ===== 9. LIMPIAR EL CONTENEDOR =====
        booksContainer.innerHTML = "";
        console.log("Contenedor limpiado");
        
        // ===== 10. CREAR Y MOSTRAR CADA ITEM =====
        console.log("Creando elementos para", itemsToShow.length, "items...");
        
        itemsToShow.forEach((itemData, index) => {
            const bookItem = document.createElement("div");
            bookItem.classList.add("book-item");
            
            // Adaptar según la estructura
            if (structureType === "books") {
                // Books tienen chapters
                bookItem.innerHTML = `
                    <span class="book-name">${itemData.book}</span>
                    <span class="book-chapters">${itemData.chapters.length} chapters</span>
                `;
                
                bookItem.addEventListener("click", () => {
                    console.log("Click en libro:", itemData.book);
                    showChapters(itemData);
                });
                
                console.log(`  ${index + 1}. ${itemData.book} (${itemData.chapters.length} chapters)`);
                
            } else if (structureType === "sections") {
                // Sections NO tienen chapters, van directo a verses
                bookItem.innerHTML = `
                    <span class="book-name">${itemData.reference}</span>
                    <span class="book-chapters">${itemData.verses.length} verses</span>
                `;
                
                bookItem.addEventListener("click", () => {
                    console.log("Click en section:", itemData.reference);
                    // Llamar directamente a showChapterContent (saltamos showChapters)
                    showChapterContent(name, itemData);
                });
                
                console.log(`  ${index + 1}. ${itemData.reference} (${itemData.verses.length} verses)`);
            }
            
            booksContainer.appendChild(bookItem);
        });
        
        console.log("✅ Todos los items mostrados");
        
    } catch (error) {
        console.error("ERROR al cargar:", error);
        console.error("Stack trace:", error.stack);
    }
}

//Nueva función para mostrar los capitulos. Utiliza una lógica parecida a loadBookOfMormon
function showChapters(bookData) {
    console.log("Mostrando capitulos de: ", bookData.book);

    try {
        //obtener elementos de DOM
        const scriptureTitle = document.getElementById("scripture-title");
        const booksContainer = document.getElementById("books-container");        // ← YA LO TIENES
        const chaptersContainer = document.getElementById("chapters-container");

        //guardar indice del libro actual
        const bookIndex = currentScripture.data.books.findIndex(b => b.book === bookData.book);
        currentScripture.currentBookIndex = bookIndex;
        currentScripture.currentChapterIndex = null; // Resetear capítulo
        console.log("📍 Libro guardado en índice:", bookIndex);
        
        //ver si existen o no
        if (!scriptureTitle || !booksContainer || !chaptersContainer){
            console.error("No se encontraron los elementos del DOM");
            return;
        }

        console.log("Elementos del DOM encontrados");

        //ocultar lista de libros
        booksContainer.classList.add("hidden");                                    // ← YA LO TIENES
        console.log("Lista de libros ocultada");

        //mostrar los capitulos, usando "remove"
        chaptersContainer.classList.remove("hidden");
        console.log("Contenedor de capitulos visible");
        
        //Cambiar titulo al nombre del libro
        scriptureTitle.innerHTML = `<h2>${bookData.book}</h2>`;
        console.log("Titulo cambiado a: ", bookData.book);

        //limpiar los capitulos
        chaptersContainer.innerHTML = "";
        console.log("Contenedor de capitulos limpiado");

        if (!bookData.chapters || bookData.chapters.length === 0){
            console.error("Este libro no tiene capitulos");
            chaptersContainer.innerHTML = "<p>No chapters available</p>";
            return;
        }
        
        console.log("Creando", bookData.chapters.length, "botones de capitulos...");

        // Crear el HTML de todos los botones
        let chaptersHTML = "";

        bookData.chapters.forEach((chapterData) => {
            chaptersHTML += `<button class="chapter-button" data-chapter="${chapterData.chapter}">${chapterData.chapter}</button>`;
        });

        // Insertar todos los botones de una vez
        chaptersContainer.innerHTML = chaptersHTML;
        console.log("Botones insertados con innerHTML");

        // Buscar todos los botones que acabamos de crear
        const chapterButtons = chaptersContainer.querySelectorAll(".chapter-button");
        console.log("Botones encontrados:", chapterButtons.length);

        // Agregar listener a cada botón
        chapterButtons.forEach((button) => {
            button.addEventListener("click", () => {
                const chapterNumber = parseInt(button.getAttribute("data-chapter"));
                console.log("Click en capitulo:", chapterNumber);
                
                // Buscar los datos del capítulo
                const chapterData = bookData.chapters.find(ch => ch.chapter === chapterNumber);
                
                if (chapterData) {
                    showChapterContent(bookData.book, chapterData);
                } else {
                    console.error("No se encontraron datos para el capitulo", chapterNumber);
                }
            });
        });

        console.log("Listeners agregados a los botones");

    } catch (error){
        console.error("ERROR al mostrar capitulos: ", error);
        console.error("Stack trace:", error.stack);
    }
}

function showChapterContent(bookName, chapterData) {
    console.log("Mostrando contenido de:", bookName, "- Chapter/Section", chapterData.chapter || chapterData.section);
    
    try {
        // ===== 1. OBTENER LOS ELEMENTOS DEL DOM =====
        const scriptureTitle = document.getElementById("scripture-title");
        const booksContainer = document.getElementById("books-container");
        const chaptersContainer = document.getElementById("chapters-container");
        const scriptureContent = document.getElementById("scripture-content");
        
        if (!scriptureTitle || !booksContainer || !chaptersContainer || !scriptureContent) {
            console.error("No se encontraron los elementos del DOM");
            return;
        }
        
        console.log("Elementos del DOM encontrados");
        
        // ===== 2. GUARDAR ÍNDICE DEL CAPÍTULO ACTUAL =====
        if (currentScripture.structureType === "books") {
            // Para books normales
            const currentBook = currentScripture.data.books[currentScripture.currentBookIndex];
            const chapterIndex = currentBook.chapters.findIndex(ch => ch.chapter === chapterData.chapter);
            currentScripture.currentChapterIndex = chapterIndex;
            console.log("📍 Capítulo guardado en índice:", chapterIndex);
        } else if (currentScripture.structureType === "sections") {
            // Para sections de D&C
            const sectionIndex = currentScripture.data.sections.findIndex(s => s.section === chapterData.section);
            currentScripture.currentBookIndex = sectionIndex; // En D&C, el section ES el book
            currentScripture.currentChapterIndex = 0; // Las sections no tienen chapters
            console.log("📍 Section guardada en índice:", sectionIndex);
        }
        
        // ===== 3. OCULTAR TODO LO ANTERIOR =====
        booksContainer.classList.add("hidden");
        chaptersContainer.classList.add("hidden");
        console.log("Lista de libros/secciones y capítulos ocultados");
        
        // ===== 4. MOSTRAR EL CONTENEDOR DE CONTENIDO =====
        scriptureContent.classList.remove("hidden");
        console.log("Contenedor de contenido visible");
        
        // ===== 5. CAMBIAR EL TÍTULO =====
        const chapterNumber = chapterData.chapter || chapterData.section;
        const label = chapterData.chapter ? "Chapter" : "Section";
        
        scriptureTitle.innerHTML = `<h2>${bookName} - ${label} ${chapterNumber}</h2>`;
        console.log("Titulo cambiado");
        
        // ===== 6. LIMPIAR EL CONTENEDOR =====
        scriptureContent.innerHTML = "";
        console.log("Contenedor limpiado");
        
        // ===== 7. VERIFICAR QUE TIENE VERSÍCULOS =====
        if (!chapterData.verses || chapterData.verses.length === 0) {
            console.error("Este capitulo/section no tiene versiculos");
            scriptureContent.innerHTML = "<p>No verses available</p>";
            return;
        }
        
        console.log("Mostrando", chapterData.verses.length, "versiculos...");
        
        // ===== 8. CREAR BOTONES DE NAVEGACIÓN =====
        const navigationHTML = `
            <div class="navigation-buttons">
                <button id="back-to-books" class="nav-btn">Back to Books</button>
                <button id="prev-chapter" class="nav-btn">Previous</button>
                <button id="next-chapter" class="nav-btn">Next</button>
                <button id="mark-complete-btn" class="nav-btn complete-btn">Mark as complete</button>
            </div>
        `;
        
        // ===== 9. CREAR EL HTML DE TODOS LOS VERSÍCULOS =====
        let versesHTML = navigationHTML; // Botones arriba
        
        chapterData.verses.forEach((verseData) => {
            versesHTML += `
                <p class="verse">
                    <strong>${verseData.verse}</strong> ${verseData.text}
                </p>
            `;
        });
        
        versesHTML += navigationHTML; // Botones abajo también
        
        // Insertar todo el contenido
        scriptureContent.innerHTML = versesHTML;
        
        console.log("Todos los versiculos y botones mostrados");
        
        // ===== 10. AGREGAR FUNCIONALIDAD A LOS BOTONES =====
        setupNavigationButtons();
        
    } catch (error) {
        console.error("ERROR al mostrar contenido:", error);
        console.error("Stack trace:", error.stack);
    }
}
// función para navegación  de botones
function setupNavigationButtons() {
    // Obtener los botones
    const backtoBooks = document.querySelectorAll("#back-to-books");
    const prevButtons = document.querySelectorAll("#prev-chapter");
    const nextButtons = document.querySelectorAll("#next-chapter");
    const markCompleteButtons = document.querySelectorAll("#mark-complete-btn");    

    console.log("🎮 Configurando botones de navegación...");
    console.log("  - Botones 'Back':", backtoBooks.length);
    console.log("  - Botones 'Previous':", prevButtons.length);
    console.log("  - Botones 'Next':", nextButtons.length);
    
    // ===== BOTÓN: BACK TO BOOKS =====
    backtoBooks.forEach(btn => {
        btn.addEventListener("click", () => {
            console.log("🏠 Volver a la lista de libros/secciones");
            
            const scriptureTitle = document.getElementById("scripture-title");
            const booksContainer = document.getElementById("books-container");
            const chaptersContainer = document.getElementById("chapters-container");
            const scriptureContent = document.getElementById("scripture-content");
            
            // Ocultar contenido y capítulos
            scriptureContent.classList.add("hidden");
            chaptersContainer.classList.add("hidden");
            
            // Mostrar libros/secciones
            booksContainer.classList.remove("hidden");
            
            // Cambiar título
            scriptureTitle.innerHTML = `<h2>📖 ${currentScripture.name}</h2>`;
            
            // Resetear índice de capítulo
            currentScripture.currentChapterIndex = null;
        });
    });
    
    // ===== BOTÓN: PREVIOUS =====
    prevButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            console.log("⬅️ Ir al capítulo/sección anterior");
            navigateToPrevious();
        });
    });
    
    // ===== BOTÓN: NEXT =====
    nextButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            console.log("➡️ Ir al capítulo/sección siguiente");
            navigateToNext();
        });
    });

    // ===== BOTÓN: MARK AS COMPLETE =====
    console.log("🔍 Mark Complete buttons found:", markCompleteButtons.length);
    
    markCompleteButtons.forEach(btn => {
        // Verificar si ya está completado
        if (checkIfChapterCompleted()) {
            btn.textContent = "✓ Completed";
            btn.classList.add("completed");
            btn.disabled = true;
        }
        
        btn.addEventListener("click", () => {
            console.log("🖱️ Click en Mark as Complete");
            markChapterComplete(); // ← Ahora sí llamará a la función
        });
    });

    console.log("✅ Botones configurados");

}

//función de navegación de previous prevoius
function navigateToPrevious() {
    if (currentScripture.structureType === "books") {
        // Navegación para books con chapters
        const currentBook = currentScripture.data.books[currentScripture.currentBookIndex];
        const currentChapterIndex = currentScripture.currentChapterIndex;
        
        if (currentChapterIndex > 0) {
            // Hay capítulo anterior en el mismo libro
            const prevChapter = currentBook.chapters[currentChapterIndex - 1];
            showChapterContent(currentBook.book, prevChapter);
        } else {
            // Ir al último capítulo del libro anterior
            if (currentScripture.currentBookIndex > 0) {
                const prevBook = currentScripture.data.books[currentScripture.currentBookIndex - 1];
                currentScripture.currentBookIndex--;
                const lastChapter = prevBook.chapters[prevBook.chapters.length - 1];
                showChapterContent(prevBook.book, lastChapter);
            } else {
                console.log("❌ Ya estás en el primer capítulo");
                alert("You're at the beginning!");
            }
        }
    } else if (currentScripture.structureType === "sections") {
        // Navegación para sections de D&C
        const currentSectionIndex = currentScripture.currentBookIndex;
        
        if (currentSectionIndex > 0) {
            const prevSection = currentScripture.data.sections[currentSectionIndex - 1];
            showChapterContent(currentScripture.name, prevSection);
        } else {
            console.log("❌ Ya estás en la primera sección");
            alert("You're at the beginning!");
        }
    }
}

function navigateToNext() {
    if (currentScripture.structureType === "books") {
        // Navegación para books con chapters
        const currentBook = currentScripture.data.books[currentScripture.currentBookIndex];
        const currentChapterIndex = currentScripture.currentChapterIndex;
        
        if (currentChapterIndex < currentBook.chapters.length - 1) {
            // Hay capítulo siguiente en el mismo libro
            const nextChapter = currentBook.chapters[currentChapterIndex + 1];
            showChapterContent(currentBook.book, nextChapter);
        } else {
            // Ir al primer capítulo del siguiente libro
            if (currentScripture.currentBookIndex < currentScripture.data.books.length - 1) {
                const nextBook = currentScripture.data.books[currentScripture.currentBookIndex + 1];
                currentScripture.currentBookIndex++;
                const firstChapter = nextBook.chapters[0];
                showChapterContent(nextBook.book, firstChapter);
            } else {
                console.log("❌ Ya estás en el último capítulo");
                alert("You've reached the end!");
            }
        }
    } else if (currentScripture.structureType === "sections") {
        // Navegación para sections de D&C
        const currentSectionIndex = currentScripture.currentBookIndex;
        
        if (currentSectionIndex < currentScripture.data.sections.length - 1) {
            const nextSection = currentScripture.data.sections[currentSectionIndex + 1];
            showChapterContent(currentScripture.name, nextSection);
        } else {
            console.log("❌ Ya estás en la última sección");
            alert("You've reached the end!");
        }
    }
}
//===========================
//   TOOLBAR FUNCTIONALITY
//===========================

let currentPanel = null; // Track which panel is open

export function initToolbar() {
    console.log("📝 Initializing toolbar...");
    
    const toolbar = document.querySelector(".toolbar");
    
    if (!toolbar) {
        console.warn("❌ Toolbar not found");
        return;
    }
    
    // Crear contenido del toolbar con TODOS los botones
    toolbar.innerHTML = `
        <h3>🛠️ Toolbar</h3>
        
        <!-- BOTONES DEL TOOLBAR -->
        <div class="toolbar-buttons">
            <button class="toolbar-btn" data-panel="notes" title="Notes">
                📝 Notes
            </button>
            <button class="toolbar-btn" data-panel="highlighter" title="Highlighter">
                🖍️ Highlight
            </button>
            <button class="toolbar-btn" data-panel="progress" title="Progress">
                📊 Progress
            </button>
            <button class="toolbar-btn" data-panel="music" title="Music">
                🎵 Music
            </button>
            <button class="toolbar-btn" data-panel="themes" title="Themes">
                🎨 Themes
            </button>
        </div>
        
        <!-- PANEL DE CONTROL -->
        <div id="control-panel" class="control-panel hidden">
            <!-- PANEL: NOTES -->
            <div class="panel-content" data-content="notes">
                <h4>📝 My Notes</h4>
                <textarea 
                    id="reader-notes" 
                    class="notes-textarea" 
                    placeholder="Write your thoughts, insights, or reflections here...
                    
Your notes are automatically saved."
                ></textarea>
                <p class="panel-info">💾 Auto-saved to your browser</p>
                <button id="toolbar-export-btn" class="panel-action-btn">
                    📥 Export Notes
                </button>
            </div>
            
            <!-- PANEL: HIGHLIGHTER -->
            <div class="panel-content hidden" data-content="highlighter">
                <h4>🖍️ Highlighter</h4>
                <p class="panel-info">Select text in the scripture, then choose a color:</p>
                <div class="color-palette">
                    <button class="color-btn" data-color="yellow" style="background: #ffeb3b;" title="Yellow">
                        Yellow
                    </button>
                    <button class="color-btn" data-color="orange" style="background: #ff9800;" title="Orange">
                        Orange
                    </button>
                    <button class="color-btn" data-color="green" style="background: #4caf50;" title="Green">
                        Green
                    </button>
                    <button class="color-btn" data-color="pink" style="background: #e91e63;" title="Pink">
                        Pink
                    </button>
                </div>
                <button id="clear-highlights-btn" class="panel-action-btn danger">
                    🗑️ Clear All Highlights
                </button>
            </div>
            
            <!-- PANEL: PROGRESS -->
            <div class="panel-content hidden" data-content="progress">
                <h4>📊 Reading Progress</h4>
                <div id="progress-display">
                    <p class="panel-info">No scripture selected yet.</p>
                </div>
            </div>
            
            <!-- PANEL: MUSIC -->
            <div class="panel-content hidden" data-content="music">
                <h4>🎵 Background Music</h4>
                <p class="panel-info">Select a playlist:</p>
                <select id="music-playlist" class="music-select">
                    <option value="">-- Select Music --</option>
                    <option value="PLqwKWPzu8KtT9X7YsHx5zJpVSjqGdJCEO">Peaceful Piano</option>
                    <option value="PLqwKWPzu8KtQfMJD8bEwMEQMq6mNJPJTL">Instrumental Hymns</option>
                    <option value="PLqwKWPzu8KtRY7Ef4EGBBfPvhB6OkPVx6">Classical Study</option>
                </select>
                <div id="youtube-player-container" class="hidden">
                    <div id="youtube-player"></div>
                </div>
                <div class="music-controls hidden" id="music-controls">
                    <button id="music-play" class="music-btn">▶️ Play</button>
                    <button id="music-pause" class="music-btn">⏸️ Pause</button>
                    <button id="music-stop" class="music-btn">⏹️ Stop</button>
                </div>
            </div>
            
            <!-- PANEL: THEMES -->
            <div class="panel-content hidden" data-content="themes">
                <h4>🎨 Scripture Themes</h4>
                <p class="panel-info">Go to the Search page to explore scriptures by theme</p>
                <a href="searching.html" class="panel-action-btn">
                    🔍 Go to Search
                </a>
            </div>
        </div>
    `;
    
    // ===== SETUP FUNCTIONALITY =====
    setupToolbarButtons();
    loadNotes();
    setupNotesAutosave();
    setupHighlighter();
    setupProgress();
    setupMusic();
    
    console.log("✅ Toolbar initialized with all panels");
}

// ===== TOGGLE PANELS =====
function setupToolbarButtons() {
    const buttons = document.querySelectorAll(".toolbar-btn");
    const controlPanel = document.getElementById("control-panel");
    const panels = document.querySelectorAll(".panel-content");
    
    buttons.forEach(btn => {
        btn.addEventListener("click", () => {
            const panelName = btn.dataset.panel;
            
            // Si es el mismo panel, toggle visibility
            if (currentPanel === panelName && !controlPanel.classList.contains("hidden")) {
                controlPanel.classList.add("hidden");
                currentPanel = null;
                btn.classList.remove("active");
                return;
            }
            
            // Mostrar panel seleccionado
            currentPanel = panelName;
            controlPanel.classList.remove("hidden");
            
            // Ocultar todos los paneles
            panels.forEach(p => p.classList.add("hidden"));
            
            // Mostrar panel activo
            const activePanel = document.querySelector(`[data-content="${panelName}"]`);
            if (activePanel) {
                activePanel.classList.remove("hidden");
            }
            
            // Highlight active button
            buttons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            
            console.log(`📂 Panel opened: ${panelName}`);
        });
    });
}

// ===== NOTES FUNCTIONALITY =====
function loadNotes() {
    const textarea = document.getElementById("reader-notes");
    if (!textarea) return;
    
    const savedNotes = localStorage.getItem("reader-notes") || "";
    textarea.value = savedNotes;
    console.log("📖 Notes loaded");
}

function setupNotesAutosave() {
    const textarea = document.getElementById("reader-notes");
    if (textarea) {
        textarea.addEventListener("input", () => {
            localStorage.setItem("reader-notes", textarea.value);
            console.log("💾 Notes saved");
        });
    }
    
    const exportBtn = document.getElementById("toolbar-export-btn");
    if (exportBtn) {
        exportBtn.addEventListener("click", () => {
            const notes = localStorage.getItem("reader-notes") || "No notes available.";
            const blob = new Blob([notes], { type: "text/plain;charset=utf-8" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `uliahona-notes-${new Date().toISOString().split('T')[0]}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            console.log("✅ Notes exported");
        });
    }
}

// ===== HIGHLIGHTER (placeholder) =====
function setupHighlighter() {
    console.log("🖍️ Highlighter setup - will implement next");
    // TO DO: Implementar en la siguiente sesión
}

// ===== PROGRESS TRACKING =====

function setupProgress() {
    console.log("📊 Progress tracking initialized");
    updateProgressDisplay();
}

function updateProgressDisplay() {
    const progressDisplay = document.getElementById("progress-display");
    if (!progressDisplay) return;
    
    // Obtener progreso guardado
    const progress = JSON.parse(localStorage.getItem("reading-progress") || "{}");
    
    if (Object.keys(progress).length === 0) {
        progressDisplay.innerHTML = `<p class="panel-info">Start reading and mark chapters as complete to track your progress!</p>`;
        return;
    }
    
    // Generar HTML de progreso
    let html = "";
    
    for (const [scripture, data] of Object.entries(progress)) {
        const percentage = Math.round((data.completed / data.total) * 100);
        
        html += `
            <div class="progress-item">
                <h5>📖 ${scripture}</h5>
                <p class="panel-info">${data.completed} / ${data.total} chapters completed</p>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${percentage}%"></div>
                </div>
                <p style="text-align: right; margin-top: 0.5rem; font-size: 0.9rem; font-weight: 600; color: var(--gold);">
                    ${percentage}%
                </p>
            </div>
        `;
    }
    
    progressDisplay.innerHTML = html;
}

function markChapterComplete() {
    console.log("🔍 Checking current scripture state:", currentScripture);
    
    if (!currentScripture.name) {
        alert("❌ No scripture selected");
        return;
    }
    
    if (currentScripture.currentBookIndex === null) {
        alert("❌ No book selected");
        return;
    }
    
    if (currentScripture.currentChapterIndex === null && currentScripture.structureType === "books") {
        alert("❌ No chapter selected");
        return;
    }
    
    // Obtener progreso actual
    const progress = JSON.parse(localStorage.getItem("reading-progress") || "{}");
    
    // Inicializar si no existe
    if (!progress[currentScripture.name]) {
        let totalChapters = 0;
        
        if (currentScripture.structureType === "books") {
            // Contar todos los capítulos de todos los libros
            currentScripture.data.books.forEach(book => {
                totalChapters += book.chapters.length;
            });
        } else if (currentScripture.structureType === "sections") {
            // Para D&C, cada section es un "capítulo"
            totalChapters = currentScripture.data.sections.length;
        }
        
        progress[currentScripture.name] = {
            total: totalChapters,
            completed: 0,
            chapters: {}
        };
    }
    
    // Crear ID único del capítulo
    let chapterId;
    if (currentScripture.structureType === "books") {
        const currentBook = currentScripture.data.books[currentScripture.currentBookIndex];
        const currentChapter = currentBook.chapters[currentScripture.currentChapterIndex];
        chapterId = `${currentBook.book}-${currentChapter.chapter}`;
    } else {
        const currentSection = currentScripture.data.sections[currentScripture.currentBookIndex];
        chapterId = `section-${currentSection.section}`;
    }
    
    console.log("📝 Chapter ID:", chapterId);
    
    // Marcar como completado si no lo está ya
    if (!progress[currentScripture.name].chapters[chapterId]) {
        progress[currentScripture.name].chapters[chapterId] = true;
        progress[currentScripture.name].completed++;
        
        // Guardar
        localStorage.setItem("reading-progress", JSON.stringify(progress));
        
        console.log("✅ Chapter marked as complete:", chapterId);
        
        // Actualizar display
        updateProgressDisplay();
        
        // Actualizar botón
        const btn = document.getElementById("mark-complete-btn");
        if (btn) {
            btn.textContent = "✓ Completed";
            btn.classList.add("completed");
            btn.disabled = true;
        }
        
        // Mostrar mensaje
        alert("✅ Chapter marked as complete!");
    } else {
        alert("ℹ️ This chapter is already completed");
    }
}

function checkIfChapterCompleted() {
    if (!currentScripture.name || currentScripture.currentBookIndex === null) {
        return false;
    }
    
    if (currentScripture.structureType === "books" && currentScripture.currentChapterIndex === null) {
        return false;
    }
    
    const progress = JSON.parse(localStorage.getItem("reading-progress") || "{}");
    
    if (!progress[currentScripture.name]) return false;
    
    let chapterId;
    if (currentScripture.structureType === "books") {
        const currentBook = currentScripture.data.books[currentScripture.currentBookIndex];
        const currentChapter = currentBook.chapters[currentScripture.currentChapterIndex];
        chapterId = `${currentBook.book}-${currentChapter.chapter}`;
    } else {
        const currentSection = currentScripture.data.sections[currentScripture.currentBookIndex];
        chapterId = `section-${currentSection.section}`;
    }
    
    return !!progress[currentScripture.name].chapters[chapterId];
}


// ===== MUSIC (placeholder) =====
function setupMusic() {
    console.log("🎵 Music setup - will implement next");
    // TO DO: Implementar YouTube API
}