// Mobile Menu Toggle
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');

if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });
}

// Tab Switching Logic
function switchTab(tabName) {
    const tabPdf = document.getElementById('tab-pdf');
    const tabReadme = document.getElementById('tab-readme');
    const contentPdf = document.getElementById('content-pdf');
    const contentReadme = document.getElementById('content-readme');

    if (!tabPdf || !tabReadme || !contentPdf || !contentReadme) return;

    if (tabName === 'pdf') {
        tabPdf.classList.add('border-primary', 'text-primary', 'bg-white');
        tabPdf.classList.remove('border-transparent', 'text-gray-500', 'hover:text-gray-700', 'hover:bg-gray-100');
        
        tabReadme.classList.remove('border-primary', 'text-primary', 'bg-white');
        tabReadme.classList.add('border-transparent', 'text-gray-500', 'hover:text-gray-700', 'hover:bg-gray-100');
        
        contentPdf.classList.remove('hidden');
        contentReadme.classList.add('hidden');
    } else {
        tabReadme.classList.add('border-primary', 'text-primary', 'bg-white');
        tabReadme.classList.remove('border-transparent', 'text-gray-500', 'hover:text-gray-700', 'hover:bg-gray-100');
        
        tabPdf.classList.remove('border-primary', 'text-primary', 'bg-white');
        tabPdf.classList.add('border-transparent', 'text-gray-500', 'hover:text-gray-700', 'hover:bg-gray-100');
        
        contentReadme.classList.remove('hidden');
        contentPdf.classList.add('hidden');
    }
}

// Progress Tracking
const STORAGE_KEY = 'dive-into-llms-progress';

function getProgress() {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
}

function saveProgress(chapterId, isComplete) {
    const progress = getProgress();
    progress[chapterId] = isComplete;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    updateUIWithProgress();
}

function updateUIWithProgress() {
    const progress = getProgress();
    const chapterCount = 11; // Total chapters
    let completedCount = 0;

    // Update Home Page Icons
    document.querySelectorAll('.chapter-status-icon').forEach(icon => {
        const chapterId = icon.dataset.chapterId;
        if (progress[chapterId]) {
            icon.classList.remove('text-gray-300');
            icon.classList.add('text-green-500');
            completedCount++;
        }
    });

    // Update Overall Progress Bar (Home Page)
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    const progressContainer = document.getElementById('overall-progress-container');

    if (progressBar && progressText && progressContainer) {
        const percentage = Math.round((completedCount / chapterCount) * 100);
        progressBar.style.width = `${percentage}%`;
        progressText.textContent = `${percentage}%`;
        if (completedCount > 0) {
            progressContainer.classList.remove('hidden');
        }
    }

    // Update Chapter Page Button
    const markCompleteBtn = document.getElementById('mark-complete-btn');
    if (markCompleteBtn && typeof chapterData !== 'undefined') {
        const isComplete = progress[chapterData.id];
        const icon = markCompleteBtn.querySelector('i');
        
        if (isComplete) {
            markCompleteBtn.innerHTML = '<i class="fas fa-check-circle"></i> Completed';
            markCompleteBtn.classList.remove('bg-blue-600', 'hover:bg-blue-700');
            markCompleteBtn.classList.add('bg-green-600', 'hover:bg-green-700');
        } else {
            markCompleteBtn.innerHTML = '<i class="far fa-circle"></i> Mark as Complete';
            markCompleteBtn.classList.add('bg-blue-600', 'hover:bg-blue-700');
            markCompleteBtn.classList.remove('bg-green-600', 'hover:bg-green-700');
        }
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateUIWithProgress();

    // Event Listener for Mark Complete Button
    const markCompleteBtn = document.getElementById('mark-complete-btn');
    if (markCompleteBtn && typeof chapterData !== 'undefined') {
        markCompleteBtn.addEventListener('click', () => {
            const currentStatus = getProgress()[chapterData.id];
            saveProgress(chapterData.id, !currentStatus);
        });
    }
});
