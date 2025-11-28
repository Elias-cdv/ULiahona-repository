export function createBookCard(name, imgPath) {
    const div = document.createElement("div");
    div.classList.add("book-card");
    // accesible y útil para tooltip
    div.setAttribute("role", "button");
    div.setAttribute("aria-label", name);
    div.title = name;

    div.innerHTML = `
        <img src="${imgPath}" alt="${name}">
        <p class="book-name" title="${name}">${name}</p>
    `;
    
    return div;
}