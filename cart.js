document.addEventListener("DOMContentLoaded", render);

function render() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const container = document.getElementById('cart-container');
    const totalDisplay = document.getElementById('total-price');
    
    if (!container) return;

    if (cart.length === 0) {
        container.innerHTML = "<p style='text-align:center; color:#888; padding: 20px; font-size: 14px;'>Ваш кошик порожній</p>";
        if (totalDisplay) totalDisplay.innerText = "0 грн";
        return;
    }

    let total = 0;
    container.innerHTML = cart.map((item, i) => {
        const itemPrice = parseInt(item.price) || 0;
        total += itemPrice;

        return `
        <div class="cart-item">
            <div class="icon-box">📅</div>
            <div class="details">
                <div class="item-title">${item.name}</div>
                <div class="item-info">
                    ${item.date || '10 червня 2026 о 14:00'}<br>
                    ${item.master || 'Майстер'}
                </div>
            </div>
            <div class="price-box">
                <div class="price-value">${itemPrice} грн</div>
                <button class="btn-remove" onclick="remove(${i})">Видалити</button>
            </div>
        </div>`;
    }).join('');

    if (totalDisplay) totalDisplay.innerText = total + " грн";
}

window.remove = function(index) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    render();
};

window.confirmBooking = function() {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    if(cart.length > 0) {
        alert("Запис оформлено успішно!");
        localStorage.removeItem('cart');
        render();
    } else {
        alert("Кошик порожній.");
    }
};