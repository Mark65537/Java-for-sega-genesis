// scripts.js
function loadPage(language) {
    const content = document.getElementById('content');
    fetch(`${language}.html`)
        .then(response => response.text())
        .then(data => {
            content.innerHTML = data;
        })
        .catch(error => {
            console.error('Error loading page:', error);
        });
}
