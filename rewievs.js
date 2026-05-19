document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('reviewForm');
    const container = document.getElementById('reviews-container');

    if (!form || !container) return;

    const defaultReviews = [
        {
            name: 'Вікторія',
            date: '20 травня',
            message: 'Бездоганний сервіс та неймовірний затишок. Тепер це моє улюблене місце.'
        },
        {
            name: 'Анна',
            date: '5 липня',
            avatar: 'img3/ChatGPT Image 19 трав. 2026 р., 12_55_54.png',
            message: 'Довго шукала свій салон і нарешті знайшла. Тут ідеально все.'
        },
        {
            name: 'Емілія',
            date: '16 серпня',
            avatar: 'img3/ChatGPT Image 19 трав. 2026 р., 13_03_18.png',
            message: 'Справжній професіоналізм та естетика у кожній деталі.'
        }
    ];

    function getReviews() {
        try {
            const savedReviews = JSON.parse(localStorage.getItem('reviews') || 'null');
            return Array.isArray(savedReviews) && savedReviews.length ? savedReviews : defaultReviews;
        } catch (error) {
            localStorage.removeItem('reviews');
            return defaultReviews;
        }
    }

    function escapeHtml(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function getAvatar(review, index) {
        const name = String(review.name || '').toLowerCase();

        if (review.avatar) return review.avatar;
        if (name.includes('анна')) return 'img3/ChatGPT Image 19 трав. 2026 р., 12_55_54.png';
        if (name.includes('емілі') || name.includes('еміл')) return 'img3/ChatGPT Image 19 трав. 2026 р., 13_03_18.png';

        return `https://i.pravatar.cc/150?u=${encodeURIComponent(review.name || index)}`;
    }

    function loadReviews() {
        const reviews = getReviews();

        container.innerHTML = reviews.map((review, index) => `
            <article class="review-card">
                <div class="card-user">
                    <img src="${getAvatar(review, index)}" alt="">
                    <div>
                        <span class="user-name">${escapeHtml(review.name)}</span>
                        <span class="user-date">${escapeHtml(review.date)}</span>
                    </div>
                </div>
                <div class="main-stars">★★★★★</div>
                <p>${escapeHtml(review.message)}</p>
            </article>
        `).join('');
    }

    form.addEventListener('submit', function (event) {
        event.preventDefault();

        const name = document.getElementById('userName').value.trim();
        const message = document.getElementById('userText').value.trim();

        if (!name || !message) return;

        const date = new Date().toLocaleDateString('uk-UA', {
            day: 'numeric',
            month: 'long'
        });

        const savedReviews = getReviews();
        const nextReviews = [{ name, message, date }, ...savedReviews];

        localStorage.setItem('reviews', JSON.stringify(nextReviews));
        form.reset();
        loadReviews();
    });

    loadReviews();
});
