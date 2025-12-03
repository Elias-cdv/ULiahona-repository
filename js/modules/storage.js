export function saveProgress(data) {
    localStorage.setItem("uliahona-progress", JSON.stringify(data));
}

export function loadProgress() {
    const data = localStorage.getItem("uliahona-progress");
    return data ? JSON.parse(data) : null;
}


