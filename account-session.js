(function () {
    function normalizeUser(user) {
        return {
            firstName: user.firstName || user.name || '',
            lastName: user.lastName || user.surname || '',
            email: user.email || '',
            phone: user.phone || '',
            city: user.city || '',
            dob: user.dob || '',
            bonusPoints: Number(user.bonusPoints) || 0
        };
    }

    function getCurrentUser() {
        try {
            const rawUser = localStorage.getItem('currentUser');
            return rawUser ? normalizeUser(JSON.parse(rawUser)) : null;
        } catch (error) {
            localStorage.removeItem('currentUser');
            return null;
        }
    }

    window.getCurrentAccountUser = getCurrentUser;

    window.logoutCurrentUser = function logoutCurrentUser(event) {
        if (event) event.preventDefault();
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    };

    function setText(id, value) {
        const element = document.getElementById(id);
        if (element) element.textContent = value || 'Не вказано';
    }

    function applyCurrentUser() {
        const user = getCurrentUser();

        if (!user) {
            if (document.getElementById('sidebarName') || document.getElementById('profileName')) {
                const returnTo = encodeURIComponent(window.location.pathname.split('/').pop() || 'profile.html');
                window.location.href = `login.html?return=${returnTo}`;
            }
            return;
        }

        setText('sidebarName', user.firstName);
        setText('sidebarSurname', user.lastName);
        setText('profileName', user.firstName);
        setText('profileSurname', user.lastName);
        setText('profileDob', user.dob);
        setText('profileEmail', user.email);
        setText('profilePhone', user.phone);
        setText('profileCity', user.city);

        const bonusPoints = document.getElementById('bonusPoints');
        if (bonusPoints) bonusPoints.textContent = user.bonusPoints;

        const bonusLeft = document.getElementById('bonusLeft');
        if (bonusLeft) {
            const left = Math.max(500 - user.bonusPoints, 0);
            bonusLeft.textContent = `Залишилось ${left} балів`;
        }

        const bonusFill = document.getElementById('bonusFill');
        if (bonusFill) {
            bonusFill.style.width = `${Math.min((user.bonusPoints / 500) * 100, 100)}%`;
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', applyCurrentUser);
    } else {
        applyCurrentUser();
    }
})();
