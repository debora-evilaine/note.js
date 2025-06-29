export const renderMarkdown = (text) => {
    return text
        .replace(/^### (.*$)/gim, "<h3>$1</h3>")
        .replace(/^## (.*$)/gim, "<h2>$1</h2>")
        .replace(/^# (.*$)/gim, "<h1>$1</h1>")
        .replace(/\*\*(.*?)\*\*/gim, "<strong>$1</strong>")
        .replace(/\*(.*?)\*/gim, "<em>$1</em>")
        .replace(/`(.*?)`/gim, "<code>$1</code>")
        .replace(/\n/gim, "<br>");
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