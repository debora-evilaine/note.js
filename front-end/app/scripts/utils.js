export const renderMarkdown = (text) => {
    return window.marked.parse(text);
};

export const escapeHtml = (text) => {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
};

export const getPreviewText = (content) => {
    return content.replace(/[#*`]/g, "").substring(0, 100) + "...";
};

export const highlightSearchTerm = (text, searchTerm) => {
    if (!searchTerm) return text;
    const regex = new RegExp(`(${escapeRegex(searchTerm)})`, "gi");
    return text.replace(regex, '<mark class="search-highlight-text">$1</mark>');
};

export const escapeRegex = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};