//===========================
//   READER CONTROLLER (VERSIÓN MÍNIMA)
//===========================

import { loadScripture } from "../modules/chapters.js";

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

        // PRUEBA: Agregar listener solo a book of mormon
        if (scr.file === "book-of-mormon.json"){
            item.addEventListener("click", () => {
                item.addEventListener("click", () => {

                console.log("Click en book of mormon")});//prueba exitosa, la consola en devtools mostró el mensaje
                loadBookOfMormon(); //se agregó esta linea para conectar listener con la función de abajo
            });
        }

        container.appendChild(item);
    });

    console.log("✅ Scripture images rendered");
}

/*  Función de prueba para cargar datos json en el reader container
    Usaré solamente book of mormon por ahora
    Si la prueba es exitosa, diseñare un algoritmo para que funcione 
    con todas las escrituras */

async function loadBookOfMormon() {
    console.log("Iniciando la carga de Book of Mormon");

    try {
        // Cargar el json
        console.log("Llamando a loadScripture('book-of-mormon.json')...");

        const data = await loadScripture("book-of-mormon.json");

        console.log("Json recibido!");
        console.log(data);

        if (!data){
            console.error("No se recibio data");
            return;
        }

        console.log("Data recibida correctamente");

        /*Está sentencia if verifica que datos tiene el JSON,
          desconocia el "Object.keys", la IA me la mostró, es 
          util para obtener datos de un json, incluso de una API
          
          nota: La usaré en otras prácticas*/
        if (!data.books){
            console.error("El json no tiene la propiedad books");
            console.log("Propiedades que si tiene: ", Object.keys(data));
            return;
        }

        console.log("El json tiene 'books'");
        console.log("Total de libros: ", data.books.length);

        /*Estamos verificando que todo funcione, para ello mostraremos
          los primeros 5 libros, debería mostrarse 1 Nephi, 2 Nephi, Jacob, 
          Jarom y Omni*/
        console.log("Primeros cinco libros: ");
        data.books.slice(0, 5).forEach((book, index) => {
            console.log(`${index + 1}. ${book.book}`);
        });

    } catch (error){
        console.error("Error al cargar: ", error);
        console.error("Stack trace: ", error.stack);
    }
}
