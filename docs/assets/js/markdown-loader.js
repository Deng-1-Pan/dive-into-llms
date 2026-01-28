if (typeof chapterData !== 'undefined' && chapterData.readmeUrl) {
    const url = chapterData.readmeUrl;
    const container = document.getElementById('markdown-content');

    fetch(url)
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.text();
        })
        .then(text => {
            // Configure Marked.js
            marked.setOptions({
                highlight: function(code, lang) {
                    if (Prism.languages[lang]) {
                        return Prism.highlight(code, Prism.languages[lang], lang);
                    } else {
                        return code;
                    }
                },
                breaks: true,
                gfm: true
            });

            // Render Markdown
            container.innerHTML = marked.parse(text);

            // Trigger Prism highlight
            Prism.highlightAllUnder(container);

            // Render Math with KaTeX
            renderMathInElement(container, {
                delimiters: [
                    {left: '$$', right: '$$', display: true},
                    {left: '$', right: '$', display: false},
                    {left: '\\(', right: '\\)', display: false},
                    {left: '\\[', right: '\\]', display: true}
                ],
                throwOnError : false
            });
            
            // Fix image paths in README
            // GitHub READMEs often use relative paths like ./assets/image.png
            // We need to convert them to raw GitHub URLs
            const baseUrl = url.substring(0, url.lastIndexOf('/'));
            const images = container.querySelectorAll('img');
            
            images.forEach(img => {
                const src = img.getAttribute('src');
                if (src && !src.startsWith('http') && !src.startsWith('//')) {
                    // Remove ./ if present
                    const cleanSrc = src.replace(/^\.\//, '');
                    img.setAttribute('src', `${baseUrl}/${cleanSrc}`);
                }
            });

        })
        .catch(error => {
            console.error('Error loading README:', error);
            container.innerHTML = `
                <div class="text-center p-8 text-gray-500">
                    <p>Error loading tutorial content.</p>
                    <a href="${url}" target="_blank" class="text-primary hover:underline mt-2 inline-block">View on GitHub</a>
                </div>
            `;
        });
}
