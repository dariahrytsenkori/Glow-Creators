(function () {
    const STORAGE_KEY = 'siteLanguage';

    const translations = {
        'Головна': 'Home',
        'BEAUTY WHISPER - салон краси Київ': 'BEAUTY WHISPER - Beauty Salon Kyiv',
        'Послуги | Beauty Whisper': 'Services | Beauty Whisper',
        'Майстри Beauty Whisper | Команда салону краси': 'Beauty Whisper Masters | Beauty Salon Team',
        'Налаштування | Beauty Whisper': 'Settings | Beauty Whisper',
        'Запис на процедуру - Beauty Whisper': 'Book an Appointment - Beauty Whisper',
        'Всі': 'All',
        'Про нас': 'About Us',
        'Наша команда': 'Our Team',
        'Послуги': 'Services',
        'Відгуки': 'Reviews',
        'Контакти': 'Contacts',
        'Профіль': 'Profile',
        'Меню': 'Menu',
        'Графік роботи': 'Working Hours',
        'Пн-Пт: 09:00 - 21:00': 'Mon-Fri: 09:00 - 21:00',
        'Сб: 10:00 - 19:00': 'Sat: 10:00 - 19:00',
        'Нд: 10:00 - 17:00': 'Sun: 10:00 - 17:00',
        'Спілкуймося мовою краси': 'Let Beauty Speak',
        'Ваш простір для відновлення, краси та натхнення. Завітайте до нас та пориньте у світ спокою.': 'Your space for renewal, beauty and inspiration. Visit us and step into a world of calm.',
        'вул. Велика Васильківська, 100, Київ': '100 Velyka Vasylkivska St, Kyiv',

        'Мій акаунт': 'My Account',
        'Бронювання': 'Bookings',
        'Історія процедур': 'Procedure History',
        'Кошик': 'Cart',
        'Налаштування': 'Settings',
        'Вийти': 'Log Out',
        'Сповіщення': 'Notifications',
        'Email сповіщення': 'Email Notifications',
        'Отримувати повідомлення на пошту': 'Receive messages by email',
        'SMS сповіщення': 'SMS Notifications',
        'Нагадування про записи через SMS': 'Appointment reminders by SMS',
        'Акції та новини': 'Promotions and News',
        'Інформація про спеціальні пропозиції': 'Information about special offers',
        'Конфіденційність': 'Privacy',
        'Показувати профіль': 'Show Profile',
        'Інші клієнти можуть бачити ваш профіль': 'Other clients can see your profile',
        'Зберігати історію': 'Save History',
        'Зберегти інформацію про відвідування': 'Save information about visits',
        'Мова та регіон': 'Language and Region',
        'Мова': 'Language',
        'Українська': 'Ukrainian',
        'Часовий пояс': 'Time Zone',
        'Київ (UTC+2)': 'Kyiv (UTC+2)',
        'Варшава (UTC+1)': 'Warsaw (UTC+1)',
        'Дії з обліковим записом': 'Account Actions',
        'Змінити пароль': 'Change Password',
        'Оновіть свій пароль для безпеки': 'Update your password for security',
        'Завантажити дані': 'Download Data',
        'Отримати копію своїх особистих даних': 'Get a copy of your personal data',
        'Видалити обліковий запис': 'Delete Account',
        'Назавжди видалити ваш обліковий запис': 'Permanently delete your account',
        'Зміна паролю': 'Change Password',
        'Зберегти пароль': 'Save Password',
        'Видалення акаунту': 'Account Deletion',
        'Ця дія незворотна. Для підтвердження введіть ваш логін та пароль.': 'This action cannot be undone. Enter your login and password to confirm.',
        'Видалити назавжди': 'Delete Permanently',

        'Ваші актуальні записи': 'Your Current Bookings',
        'Записів не знайдено.': 'No bookings found.',
        'Не вдалося підключитися до сервера.': 'Could not connect to the server.',
        'Перенести': 'Reschedule',
        'Перенести неможливо': 'Cannot Reschedule',
        'Майстер:': 'Master:',
        'Скасувати': 'Cancel',
        'Зберегти': 'Save',
        'Нова дата:': 'New Date:',
        'Новий час:': 'New Time:',

        'Запис на процедуру': 'Book an Appointment',
        'Оберіть категорію': 'Choose a Category',
        'Волосся': 'Hair',
        'Обличчя': 'Face',
        'Нігті': 'Nails',
        'Послуга': 'Service',
        'Індивідуальні послуги': 'Individual Services',
        'Майстер': 'Master',
        'Бажана дата': 'Preferred Date',
        'Бажаний час': 'Preferred Time',
        'Ваші дані': 'Your Details',
        'Підтвердити запис': 'Confirm Booking',
        'Оберіть послугу...': 'Choose a service...',
        'Оберіть майстра...': 'Choose a master...',
        'Оберіть час...': 'Choose a time...',

        'BEAUTY WHISPER - салон краси у Києві на вул. Велика Васильківська, 100. Ми створюємо образи, що надихають: догляд за волоссям, макіяж, манікюр, зачіски та beauty-сети. Професіоналізм, затишок та турбота - у кожній деталі.': 'BEAUTY WHISPER is a beauty salon in Kyiv at 100 Velyka Vasylkivska Street. We create inspiring looks: hair care, makeup, manicure, hairstyles and beauty sets. Professionalism, comfort and care are in every detail.',
        'Манікюр': 'Manicure',
        'Макіяж': 'Makeup',
        'Сети': 'Sets',
        'Найкращі майстри': 'Top Masters',
        'Детальніше': 'More Details',
        'Записатися': 'Book Now',
        'ЗАПИСАТИСЯ': 'BOOK NOW',
        'Записатися зараз': 'Book Now',
        'Обрати послугу': 'Choose Service',
        'Усі': 'All',
        'Індивідуальні': 'Individual',
        'Комплекси': 'Packages',
        'Наші майстри': 'Our Masters',
        'Усі майстри': 'All Masters',
        'Hair-Майстер': 'Hair Master',
        'Nail-Майстер': 'Nail Master',
        'Майкер-стиліст': 'Makeup Stylist',
        'Досвід': 'Experience',
        'Спеціалізація': 'Specialization',
        'роки': 'years',
        'років': 'years',

        'Вхід': 'Login',
        'Реєстрація': 'Registration',
        'Зареєструватися': 'Sign Up',
        'Увійти': 'Log In',
        'Пароль': 'Password',
        'Новий пароль': 'New Password',
        'Старий пароль': 'Old Password',
        'Логін (Email)': 'Login (Email)',
        'Ім’я': 'First Name',
        'Прізвище': 'Last Name',
        'Телефон': 'Phone',
        'Місто': 'City',
        'Дата народження': 'Date of Birth',
        'Змінити фото': 'Change Photo',
        'Бонуси': 'Bonuses',
        'Редагувати': 'Edit'
    };

    const reverseTranslations = Object.fromEntries(
        Object.entries(translations).map(([uk, en]) => [en, uk])
    );

    function getLanguage() {
        return localStorage.getItem(STORAGE_KEY) || 'uk';
    }

    function translateText(value, language) {
        const trimmed = value.trim();
        if (!trimmed) return value;

        const dictionary = language === 'en' ? translations : reverseTranslations;
        const translated = dictionary[trimmed];
        if (!translated) return value;

        return value.replace(trimmed, translated);
    }

    function translateAttributes(element, language) {
        ['placeholder', 'title', 'aria-label', 'alt'].forEach((attr) => {
            if (!element.hasAttribute(attr)) return;
            const value = element.getAttribute(attr);
            const translated = translateText(value, language);
            if (translated !== value) element.setAttribute(attr, translated);
        });
    }

    function translatePage(language) {
        document.documentElement.lang = language === 'en' ? 'en' : 'uk';
        if (document.title) document.title = translateText(document.title, language);

        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode(node) {
                    const parent = node.parentElement;
                    if (!parent || ['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(parent.tagName)) {
                        return NodeFilter.FILTER_REJECT;
                    }
                    return node.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
                }
            }
        );

        const nodes = [];
        while (walker.nextNode()) nodes.push(walker.currentNode);
        nodes.forEach((node) => {
            const translated = translateText(node.nodeValue, language);
            if (translated !== node.nodeValue) node.nodeValue = translated;
        });

        document.querySelectorAll('[placeholder], [title], [aria-label], img[alt]').forEach((element) => {
            translateAttributes(element, language);
        });

        const languageSelect = document.getElementById('languageSelect');
        if (languageSelect) languageSelect.value = language;
    }

    let observerTimer;
    function scheduleTranslate() {
        clearTimeout(observerTimer);
        observerTimer = setTimeout(() => translatePage(getLanguage()), 50);
    }

    window.setSiteLanguage = function setSiteLanguage(language) {
        const normalized = language === 'en' ? 'en' : 'uk';
        localStorage.setItem(STORAGE_KEY, normalized);
        translatePage(normalized);
    };

    document.addEventListener('DOMContentLoaded', () => {
        translatePage(getLanguage());

        const languageSelect = document.getElementById('languageSelect');
        if (languageSelect) {
            languageSelect.value = getLanguage();
            languageSelect.addEventListener('change', (event) => {
                window.setSiteLanguage(event.target.value);
            });
        }

        const observer = new MutationObserver(scheduleTranslate);
        observer.observe(document.body, { childList: true, subtree: true });
    });
})();
