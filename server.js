const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

const db = mysql.createConnection({
    host: '26.105.234.220', 
    user: 'Даша',
    password: 'dasha_kruta',
    database: 'salon_krasi'
});

db.connect(err => {
    if (err) console.error('❌ Помилка БД:', err.message);
    else console.log('✅ База підключена успішно!');
});

// НАЛАШТУВАННЯ ПОШТИ
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'beautywhisper101@gmail.com', 
        pass: 'jsbhlsexbiwcmdwx' // Твій перевірений код
    },
    // ЦЕ ВИПРАВЛЯЄ ПОМИЛКУ З ТЕРМІНАЛУ:
    tls: {
        rejectUnauthorized: false
    }
});

// ПЕРЕВІРКА ЗВ'ЯЗКУ З ПОШТОЮ (з'явиться в консолі при старті)
transporter.verify((error) => {
    if (error) console.log("❌ Помилка пошти:", error.message);
    else console.log("📧 Пошта готова до відправки!");
});

// РОУТ РЕЄСТРАЦІЇ
app.post('/api/register', (req, res) => {
    const { name, surname, email, phone, password } = req.body;
    const sql = 'INSERT INTO users (name, surname, email, phone, password) VALUES (?, ?, ?, ?, ?)';
    
    db.query(sql, [name, surname, email, phone, password], (err, result) => {
        if (err) {
            console.error('Помилка БД:', err);
            // Важливо: відправляємо JSON, а не просто текст
            return res.status(500).json({ success: false, message: 'Помилка бази даних' });
        }

        const mailOptions = {
            from: '"Beauty Whisper ✨" <beautywhisper101@gmail.com>',
            to: email,
            subject: 'Ласкаво просимо! ✨',
            html: `<h2>Привіт, ${name}! Ви успішно зареєстровані.</h2>`
        };

        // ВІДПРАВЛЯЄМО ПОШТУ
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log('Помилка пошти (але в базі все ок):', error.message);
                // Навіть якщо пошта впала, ми вже записали юзера, тому кажемо "success: true"
            } else {
                console.log('Лист надіслано!');
            }
        });

        // ВАЖЛИВО: Відповідаємо клієнту ВІДРАЗУ після запису в базу, 
        // не чекаючи, поки пошта "прогрузиться"
        return res.json({ success: true, message: 'Успішна реєстрація!' });
    });
});

// --- ВХІД (LOGIN) ---
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    
    // Це додасть напис у термінал VS Code:
    console.log(`Спроба входу: Email: ${email}, Password: ${password}`);

    const sql = 'SELECT * FROM users WHERE email = ? AND password = ?';
    db.query(sql, [email, password], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: err.message });

        if (results.length > 0) {
            res.json({ success: true, user: results[0] });
        } else {
            res.status(401).json({ success: false, message: 'Невірний email або пароль' });
        }
    });
});

// --- ОТРИМАННЯ ВСІХ БРОНЮВАНЬ ---
app.get('/api/booking', (req, res) => {
    // Вибираємо всі записи з таблиці (переконайся, що таблиця 'bookings' існує в БД)
    const sql = 'SELECT * FROM booking ORDER BY dateStr DESC, timeStr DESC';
    
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Помилка отримання записів:', err);
            return res.status(500).json({ success: false, message: 'Помилка БД' });
        }
        res.json(results);
    });
});

// --- СТВОРЕННЯ НОВОГО ЗАПИСУ ---
app.post('/api/booking', (req, res) => {
    const { service, master, dateStr, timeStr, userName, userPhone } = req.body;

    // ТУТ МАЄ БУТИ booking (одинарне число)
    const sql = "INSERT INTO booking (service, master, dateStr, timeStr, userName, userPhone) VALUES (?, ?, ?, ?, ?, ?)";
    
    db.query(sql, [service, master, dateStr, timeStr, userName, userPhone], (err, result) => {
        if (err) {
            console.error("Помилка БД:", err);
            return res.status(500).json({ error: err.message });
        }
        res.status(200).json({ message: "Успіх" });
    });
});

const PORT = 3001;
app.listen(PORT, () => console.log(`🚀 Сервер: http://localhost:${PORT}`));