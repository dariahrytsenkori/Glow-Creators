const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

// Налаштування пошти (Gmail)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// 1. РЕЄСТРАЦІЯ
router.post('/register', async (req, res) => {
    const { name, surname, email, phone, password } = req.body;
    try {
        const [exists] = await db.query('SELECT * FROM users WHERE email = ? OR phone = ?', [email, phone]);
        if (exists.length > 0) {
            return res.status(400).json({ success: false, message: 'Користувач з такою поштою або телефоном вже є' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const verifyToken = Math.floor(100000 + Math.random() * 900000).toString();

        await db.query(
            'INSERT INTO users (name, surname, email, phone, password, verify_token) VALUES (?, ?, ?, ?, ?, ?)',
            [name, surname, email, phone, hashedPassword, verifyToken]
        );

        // Відправка коду на пошту
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Підтвердження реєстрації Beauty Whisper',
            text: `Ваш код підтвердження: ${verifyToken}`
        });

        res.json({ success: true, message: 'Код відправлено на пошту' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Помилка сервера' });
    }
});

// 2. ВХІД (LOGIN) — ЦЬОГО НЕ ВИСТАЧАЛО
router.post('/login', async (req, res) => {
    const { login, password } = req.body; // login = email або телефон
    try {
        const [users] = await db.query('SELECT * FROM users WHERE email = ? OR phone = ?', [login, login]);
        
        if (users.length === 0) {
            return res.status(401).json({ success: false, message: 'Користувача не знайдено' });
        }

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Невірний пароль' });
        }

        // Тут можна додати JWT токен, якщо використовуєте
        res.json({ 
            success: true, 
            user: { id: user.id, name: user.name, surname: user.surname } 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Помилка сервера' });
    }
});

module.exports = router;