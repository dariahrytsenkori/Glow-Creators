const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { body, query, param, validationResult } = require('express-validator');
const appointmentController = require('../controllers/appointmentController');
const fs = require('fs');
const path = require('path');
const { createPayment } = require('../utils/liqpay');

// 🔹 Middleware для перевірки помилок валідації
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }
    next();
};

//////////////////////////////////////////////////////
// 🔹 GET /appointments/slots (Без змін)
//////////////////////////////////////////////////////
router.get(
    '/slots',
    [
        query('date').notEmpty().isISO8601(),
        query('masterId').notEmpty().isInt({ gt: 0 })
    ],
    handleValidationErrors,
    async (req, res) => {
        try {
            const { date, masterId } = req.query;
            const allSlots = [];
            for (let h = 9; h <= 17; h++) {
                allSlots.push(`${date} ${h.toString().padStart(2, '0')}:00:00`);
            }
            const [booked] = await db.query(
                `SELECT DATE_FORMAT(appointment_datetime, '%Y-%m-%d %H:%i:%s') AS appointment_datetime
                 FROM appointments WHERE master_id = ? AND appointment_datetime BETWEEN ? AND ?`,
                [masterId, `${date} 00:00:00`, `${date} 23:59:59`]
            );
            const bookedTimes = booked.map(b => b.appointment_datetime);
            const freeSlots = allSlots.filter(slot => !bookedTimes.includes(slot));
            res.json({ success: true, date, masterId: Number(masterId), freeSlots });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Помилка сервера' });
        }
    }
);

//////////////////////////////////////////////////////
// 🔹 POST /appointments (ОНОВЛЕНО ПІД МАСИВ ПОСЛУГ)
//////////////////////////////////////////////////////
router.post(
    '/',
    [
        body('datetime').notEmpty().isISO8601(),
        body('services').isArray({ min: 1 }).withMessage('Список послуг не може бути порожнім'),
        body('userId').notEmpty().isInt({ gt: 0 }),
        body('masterId').notEmpty().isInt({ gt: 0 }),
        body('paymentMethod').notEmpty().isIn(['online', 'offline'])
    ],
    handleValidationErrors,
    async (req, res) => {
        const connection = await db.getConnection();
        try {
            const { datetime, services, userId, masterId, paymentMethod } = req.body;
            await connection.beginTransaction();

            // 1. Отримуємо дані про всі вибрані послуги та рахуємо суму
            const [servicesData] = await connection.query(
                'SELECT id, price, name FROM services WHERE id IN (?)',
                [services]
            );

            if (servicesData.length === 0) {
                await connection.rollback();
                return res.status(404).json({ success: false, message: 'Послуги не знайдені' });
            }

            const totalPrice = servicesData.reduce((sum, s) => sum + Number(s.price), 0);
            const serviceNames = servicesData.map(s => s.name).join(', ');
            const serviceIdsString = servicesData.map(s => s.id).join(',');

            // 2. Перевірка чи вільний майстер
            const [existing] = await connection.query(
                'SELECT id FROM appointments WHERE master_id = ? AND appointment_datetime = ? FOR UPDATE',
                [masterId, datetime]
            );

            if (existing.length > 0) {
                await connection.rollback();
                return res.status(409).json({ success: false, message: 'Слот вже зайнятий' });
            }

            // 3. Вставляємо запис (додаємо колонку service_ids та total_price)
            const [result] = await connection.query(
                `INSERT INTO appointments 
                (appointment_datetime, user_id, master_id, payment_method, total_price, service_ids)
                VALUES (?, ?, ?, ?, ?, ?)`,
                [datetime, userId, masterId, paymentMethod, totalPrice, serviceIdsString]
            );

            let orderId = null;
            if (paymentMethod === 'online') {
                orderId = `ORD-${result.insertId}-${Date.now()}`;
                await connection.query(
                    'UPDATE appointments SET liqpay_order_id = ? WHERE id = ?',
                    [orderId, result.insertId]
                );
            }

            await connection.commit();
            res.status(201).json({
                success: true,
                data: { appointmentId: result.insertId, paymentMethod, orderId, totalPrice }
            });

        } catch (error) {
            await connection.rollback();
            console.error('POST /appointments ERROR:', error);
            res.status(500).json({ success: false, message: 'Помилка сервера' });
        } finally {
            connection.release();
        }
    }
);

//////////////////////////////////////////////////////
// 🔹 GET /pay-page/:id (ОНОВЛЕНО ПІД СУМУ ЗАПИСУ)
//////////////////////////////////////////////////////
router.get(
    '/pay-page/:id',
    [param('id').isInt({ gt: 0 })],
    handleValidationErrors,
    async (req, res) => {
        const { id } = req.params;
        try {
            const filePath = path.join(__dirname, '../views/payment.html');
            if (!fs.existsSync(filePath)) return res.status(500).send('payment.html не знайдено');
            
            let html = fs.readFileSync(filePath, 'utf-8');

            // Отримуємо запис та назви послуг
            const [[appointment]] = await db.query('SELECT * FROM appointments WHERE id = ?', [id]);
            if (!appointment) return res.status(404).send('Запис не знайдено');

            const [services] = await db.query('SELECT name FROM services WHERE id IN (?)', [appointment.service_ids.split(',')]);
            const description = services.map(s => s.name).join(', ');

            const params = {
                amount: appointment.total_price,
                description: `Оплата послуг: ${description}`,
                order_id: appointment.liqpay_order_id,
                result_url: `${process.env.BASE_URL}/success.html`,
                server_url: `${process.env.BASE_URL}/appointments/callback`
            };

            const { data, signature } = createPayment(params);

            const finalHtml = html
                .replace('{{data}}', data.trim())
                .replace('{{signature}}', signature.trim());

            res.set('Content-Type', 'text/html; charset=utf-8');
            return res.send(finalHtml);
        } catch (error) {
            console.error('PAY PAGE ERROR:', error);
            res.status(500).send('Помилка сервера');
        }
    }
);

//////////////////////////////////////////////////////
// 🔹 POST /callback (Без змін)
//////////////////////////////////////////////////////
router.post('/callback', async (req, res) => {
    try {
        if (!req.body || !req.body.data) return res.status(400).send('No data');
        const decoded = JSON.parse(Buffer.from(req.body.data, 'base64').toString('utf-8'));

        if (decoded.status === 'success' || decoded.status === 'sandbox') {
            await db.query(
                'UPDATE appointments SET payment_status = "paid" WHERE liqpay_order_id = ?',
                [decoded.order_id]
            );
        }
        res.send('ok');
    } catch (error) {
        res.status(500).send('error');
    }
});

module.exports = router;