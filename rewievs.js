document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("reviewForm");
    const container = document.getElementById("reviews-container");

    function loadReviews() {
        container.innerHTML = "";
        
        // Тестові дані з макета Figma
        const defaultReviews = [
            { name: "Вікторія", date: "20 травня", message: "Бездоганний сервіс та неймовірний затишок. Тепер це моє улюблене місце." },
            { name: "Анна", date: "5 липня", message: "Довго шукала своє місце і нарешті знайшла. Тут ідеально все." },
            { name: "Емілія", date: "16 серпня", message: "Справжній професіоналізм та естетика у кожній деталі." }
        ];

        const reviews = JSON.parse(localStorage.getItem("reviews")) || defaultReviews;

        reviews.forEach((review, index) => {
            const card = document.createElement("div");
            card.classList.add("review-card");

            card.innerHTML = `
                <div class="review-header">
                    <img src="https://i.pravatar.cc/150?u=${index + 5}" alt="avatar">
                    <div>
                        <span class="review-name">${review.name}</span>
                        <span class="review-date">${review.date}</span>
                    </div>
                </div>
                <div class="review-stars">★★★★★</div>
                <p>${review.message}</p>
            `;
            container.appendChild(card);
        });
    }

    form.addEventListener("submit", function (e) {
        e.preventDefault();
        const name = document.getElementById("name").value;
        const message = document.getElementById("message").value;
        const date = new Date().toLocaleDateString("uk-UA", { day: 'numeric', month: 'long' });

        const reviews = JSON.parse(localStorage.getItem("reviews")) || [];
        reviews.unshift({ name, message, date });
        localStorage.setItem("reviews", JSON.stringify(reviews));

        form.reset();
        loadReviews();
    });

    loadReviews();
});