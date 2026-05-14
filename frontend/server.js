const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');
const nodemailer = require('nodemailer');

// 1. Підключаємо твій модуль liqpay.js
const { createPayment } = require('./liqpay.js'); 

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

// Налаштування пошти (транспортер залишається без змін)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'beautywhisper101@gmail.com', 
        pass: 'pbferurqcfpapuxe' 
    },
    tls: { rejectUnauthorized: false }
});

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
            return res.status(500).json({ success: false, message: 'Помилка бази даних' });
        }

        const mailOptions = {
            from: '"Beauty Whisper ✨" <beautywhisper101@gmail.com>',
            to: email,
            subject: 'Ласкаво просимо! ✨',
            html: `<h2>Привіт, ${name}! Ви успішно зареєстровані.</h2>`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log('Помилка пошти (але в базі все ок):', error.message);
            } else {
                console.log('Лист надіслано!');
            }
        });

        return res.json({ success: true, message: 'Успішна реєстрація!' });
    });
});

// --- ВХІД (LOGIN) ---
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
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
    const sql = "INSERT INTO booking (service, master, dateStr, timeStr, userName, userPhone) VALUES (?, ?, ?, ?, ?, ?)";
    
    db.query(sql, [service, master, dateStr, timeStr, userName, userPhone], (err, result) => {
        if (err) {
            console.error("Помилка БД:", err);
            return res.status(500).json({ error: err.message });
        }
        res.status(200).json({ message: "Успіх" });
    });
});

// --- СТОРІНКА ОПЛАТИ (Використовуємо твій liqpay.js) ---
app.get('/appointments/pay-page/:id', (req, res) => {
    const appointmentId = req.params.id;
    
    // Викликаємо функцію з твого liqpay.js
    const paymentData = createPayment({
        amount: 1000, // сума
        description: `Оплата запису №${appointmentId}`,
        order_id: appointmentId + "_" + Date.now() // унікальний ID для LiqPay
    });

    res.send(`
        <html>
        <body onload="document.forms[0].submit()">
            <form method="POST" action="https://www.liqpay.ua/api/3/checkout" accept-charset="utf-8">
                <input type="hidden" name="data" value="${paymentData.data}" />
                <input type="hidden" name="signature" value="${paymentData.signature}" />
            </form>
            <p>Перенаправлення на оплату...</p>
        </body>
        </html>
    `);
});

const PORT = 3001;
app.listen(PORT, () => console.log(`🚀 Сервер: http://localhost:${PORT}`));
