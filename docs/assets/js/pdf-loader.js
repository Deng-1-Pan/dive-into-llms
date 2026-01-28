if (typeof chapterData !== 'undefined' && chapterData.pdfUrl) {
    const url = chapterData.pdfUrl;
    let pdfDoc = null,
        pageNum = 1,
        pageRendering = false,
        pageNumPending = null,
        scale = 1.0, // Initial scale based on container width
        canvas = document.getElementById('the-canvas'),
        ctx = canvas.getContext('2d');

    const container = document.getElementById('pdf-container');
    const loader = document.getElementById('pdf-loader');

    /**
     * Get page info from document, resize canvas accordingly, and render page.
     * @param num Page number.
     */
    function renderPage(num) {
        pageRendering = true;
        
        // Fetch page
        pdfDoc.getPage(num).then(function(page) {
            // Calculate scale to fit width
            const containerWidth = container.clientWidth - 40; // minus padding
            const viewport = page.getViewport({scale: 1});
            const desiredScale = containerWidth / viewport.width;
            
            // Apply zoom factor
            const finalScale = desiredScale * scale;
            
            const scaledViewport = page.getViewport({scale: finalScale});

            canvas.height = scaledViewport.height;
            canvas.width = scaledViewport.width;

            // Render PDF page into canvas context
            const renderContext = {
                canvasContext: ctx,
                viewport: scaledViewport
            };
            const renderTask = page.render(renderContext);

            // Wait for render to finish
            renderTask.promise.then(function() {
                pageRendering = false;
                loader.style.display = 'none'; // Hide loader
                
                if (pageNumPending !== null) {
                    renderPage(pageNumPending);
                    pageNumPending = null;
                }
            });
        });

        // Update page counters
        document.getElementById('page-num').textContent = num;
    }

    /**
     * If another page rendering in progress, waits until the rendering is
     * finised. Otherwise, executes rendering immediately.
     */
    function queueRenderPage(num) {
        if (pageRendering) {
            pageNumPending = num;
        } else {
            renderPage(num);
        }
    }

    /**
     * Displays previous page.
     */
    function onPrevPage() {
        if (pageNum <= 1) {
            return;
        }
        pageNum--;
        queueRenderPage(pageNum);
    }
    document.getElementById('pdf-prev').addEventListener('click', onPrevPage);

    /**
     * Displays next page.
     */
    function onNextPage() {
        if (pageNum >= pdfDoc.numPages) {
            return;
        }
        pageNum++;
        queueRenderPage(pageNum);
    }
    document.getElementById('pdf-next').addEventListener('click', onNextPage);

    /**
     * Zoom In/Out
     */
    document.getElementById('pdf-zoom-in').addEventListener('click', () => {
        scale += 0.2;
        document.getElementById('zoom-level').textContent = Math.round(scale * 100) + '%';
        queueRenderPage(pageNum);
    });

    document.getElementById('pdf-zoom-out').addEventListener('click', () => {
        if (scale > 0.4) {
            scale -= 0.2;
            document.getElementById('zoom-level').textContent = Math.round(scale * 100) + '%';
            queueRenderPage(pageNum);
        }
    });

    /**
     * Asynchronously downloads PDF.
     */
    pdfjsLib.getDocument(url).promise.then(function(pdfDoc_) {
        pdfDoc = pdfDoc_;
        document.getElementById('page-count').textContent = pdfDoc.numPages;

        // Initial render
        renderPage(pageNum);
    }, function (reason) {
        // PDF loading error
        console.error(reason);
        loader.innerHTML = '<p class="text-red-500">Error loading PDF. Please try downloading it.</p>';
    });

    // Handle window resize
    window.addEventListener('resize', () => {
        if (pdfDoc) {
            renderPage(pageNum);
        }
    });
}
