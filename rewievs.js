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
            message: 'Довго шукала свій салон і нарешті знайшла. Тут ідеально все.'
        },
        {
            name: 'Емілія',
            date: '16 серпня',
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

    function loadReviews() {
        const reviews = getReviews();

        container.innerHTML = reviews.map((review, index) => `
            <article class="review-card">
                <div class="card-user">
                    <img src="https://i.pravatar.cc/150?u=${encodeURIComponent(review.name || index)}" alt="">
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
