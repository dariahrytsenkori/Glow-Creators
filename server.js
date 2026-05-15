const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');
const nodemailer = require('nodemailer');
const fs = require('fs');

function loadEnvFile(fileName) {
    const envPath = path.join(__dirname, fileName);
    if (!fs.existsSync(envPath)) return;

    const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
    lines.forEach((line) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('//')) return;

        const separatorIndex = trimmed.indexOf('=');
        if (separatorIndex === -1) return;

        const key = trimmed.slice(0, separatorIndex).trim();
        const value = trimmed.slice(separatorIndex + 1).trim();
        if (key && process.env[key] === undefined) {
            process.env[key] = value;
        }
    });
}

loadEnvFile('bd.env');

// 1. РџС–РґРєР»СЋС‡Р°С”РјРѕ С‚РІС–Р№ РјРѕРґСѓР»СЊ liqpay.js
const { createPayment, verifyCallback, decodeCallbackData } = require('./liqpay.js'); 

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname)));

const databaseUrl = process.env.MYSQL_PUBLIC_URL || process.env.MYSQL_URL;
const db = databaseUrl
    ? mysql.createConnection(databaseUrl)
    : mysql.createConnection({
        host: process.env.MYSQLHOST || '127.0.0.1',
        port: Number(process.env.MYSQLPORT) || 3306,
        user: process.env.MYSQLUSER || 'root',
        password: process.env.MYSQLPASSWORD || '',
        database: process.env.MYSQLDATABASE || process.env.MYSQL_DATABASE || 'salon_krasi'
    });

db.connect(err => {
    if (err) console.error('вќЊ РџРѕРјРёР»РєР° Р‘Р”:', err.message);
    else console.log('вњ… Р‘Р°Р·Р° РїС–РґРєР»СЋС‡РµРЅР° СѓСЃРїС–С€РЅРѕ!');
});

// РќР°Р»Р°С€С‚СѓРІР°РЅРЅСЏ РїРѕС€С‚Рё (С‚СЂР°РЅСЃРїРѕСЂС‚РµСЂ Р·Р°Р»РёС€Р°С”С‚СЊСЃСЏ Р±РµР· Р·РјС–РЅ)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'beautywhisper101@gmail.com', 
        pass: 'pbferurqcfpapuxe' 
    },
    tls: { rejectUnauthorized: false }
});

transporter.verify((error) => {
    if (error) console.log("вќЊ РџРѕРјРёР»РєР° РїРѕС€С‚Рё:", error.message);
    else console.log("рџ“§ РџРѕС€С‚Р° РіРѕС‚РѕРІР° РґРѕ РІС–РґРїСЂР°РІРєРё!");
});

// Р РћРЈРў Р Р•Р„РЎРўР РђР¦Р†Р‡
function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function formatMoney(value) {
    const amount = Number(value);
    return `${Number.isFinite(amount) ? amount.toFixed(2) : '0.00'} UAH`;
}

function buildReceiptHtml(order) {
    const customer = order.customer || {};
    const cart = Array.isArray(order.cart) ? order.cart : [];
    const rows = cart.map((item) => `
        <tr>
            <td style="padding:12px 0;border-bottom:1px solid #eee;">${escapeHtml(item.name || 'РџРѕСЃР»СѓРіР°')}</td>
            <td style="padding:12px 0;border-bottom:1px solid #eee;text-align:right;white-space:nowrap;">${formatMoney(item.price)}</td>
        </tr>
    `).join('');

    return `
        <div style="margin:0;padding:0;background:#f6f2ef;font-family:Arial,sans-serif;color:#2c2c2c;">
            <div style="max-width:640px;margin:0 auto;padding:28px 16px;">
                <div style="background:#fff;border-radius:18px;padding:28px;border:1px solid #eadfdc;">
                    <div style="font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#8b5e57;font-weight:700;">Beauty Whisper</div>
                    <h1 style="margin:10px 0 6px;font-size:26px;color:#612a26;">РљРІРёС‚Р°РЅС†С–СЏ РїСЂРѕ РѕРїР»Р°С‚Сѓ</h1>
                    <p style="margin:0 0 22px;color:#666;line-height:1.5;">Р’Р°С€ Р·Р°РїРёСЃ РїС–РґС‚РІРµСЂРґР¶РµРЅРѕ. Р¦Рµ С‚РµСЃС‚РѕРІРёР№ РїР»Р°С‚С–Р¶ LiqPay, СЂРµР°Р»СЊРЅС– РєРѕС€С‚Рё Р· РєР°СЂС‚РєРё РЅРµ СЃРїРёСЃСѓСЋС‚СЊСЃСЏ.</p>
                    <div style="background:#fdfaf9;border-radius:14px;padding:16px;margin-bottom:22px;">
                        <p style="margin:0 0 8px;"><strong>РќРѕРјРµСЂ Р·Р°РјРѕРІР»РµРЅРЅСЏ:</strong> ${escapeHtml(order.orderId)}</p>
                        <p style="margin:0 0 8px;"><strong>Р”Р°С‚Р°:</strong> ${escapeHtml(new Date(order.createdAt || Date.now()).toLocaleString('uk-UA'))}</p>
                        <p style="margin:0 0 8px;"><strong>РљР»С–С”РЅС‚:</strong> ${escapeHtml(customer.name)}</p>
                        <p style="margin:0;"><strong>РўРµР»РµС„РѕРЅ:</strong> ${escapeHtml(customer.phone)}</p>
                    </div>
                    <table style="width:100%;border-collapse:collapse;font-size:15px;">
                        <thead>
                            <tr>
                                <th style="text-align:left;padding-bottom:10px;color:#777;border-bottom:1px solid #ddd;">РџРѕСЃР»СѓРіР°</th>
                                <th style="text-align:right;padding-bottom:10px;color:#777;border-bottom:1px solid #ddd;">РЎСѓРјР°</th>
                            </tr>
                        </thead>
                        <tbody>${rows}</tbody>
                    </table>
                    <div style="margin-top:22px;padding-top:18px;border-top:2px solid #612a26;text-align:right;">
                        <div style="font-size:14px;color:#777;">Р”Рѕ СЃРїР»Р°С‚Рё</div>
                        <div style="font-size:28px;font-weight:700;color:#612a26;">${formatMoney(order.amount)}</div>
                    </div>
                    <p style="margin:24px 0 0;color:#777;font-size:13px;line-height:1.5;">РЇРєС‰Рѕ РїРѕС‚СЂС–Р±РЅРѕ Р·РјС–РЅРёС‚Рё Р·Р°РїРёСЃ, Р·РІКјСЏР¶С–С‚СЊСЃСЏ Р· СЃР°Р»РѕРЅРѕРј Beauty Whisper.</p>
                </div>
            </div>
        </div>
    `;
}

app.post('/api/send-receipt', (req, res) => {
    const { order } = req.body || {};
    const customer = order && order.customer ? order.customer : {};
    const email = String(customer.email || '').trim();

    if (!order || !email || !email.includes('@')) {
        return res.status(400).json({ success: false, message: 'Valid order and customer email are required' });
    }

    transporter.sendMail({
        from: '"Beauty Whisper" <beautywhisper101@gmail.com>',
        to: email,
        subject: `РљРІРёС‚Р°РЅС†С–СЏ Beauty Whisper ${order.orderId || ''}`.trim(),
        html: buildReceiptHtml(order)
    }, (error) => {
        if (error) {
            console.error('Receipt email error:', error.message);
            return res.status(500).json({ success: false, message: error.message });
        }

        res.json({ success: true });
    });
});

app.post('/api/register', (req, res) => {
    const { name, surname, email, phone, password } = req.body;
    const sql = 'INSERT INTO users (name, surname, email, phone, password) VALUES (?, ?, ?, ?, ?)';
    
    db.query(sql, [name, surname, email, phone, password], (err, result) => {
        if (err) {
            console.error('РџРѕРјРёР»РєР° Р‘Р”:', err);
            return res.status(500).json({ success: false, message: 'РџРѕРјРёР»РєР° Р±Р°Р·Рё РґР°РЅРёС…' });
        }

        const mailOptions = {
            from: '"Beauty Whisper вњЁ" <beautywhisper101@gmail.com>',
            to: email,
            subject: 'Р›Р°СЃРєР°РІРѕ РїСЂРѕСЃРёРјРѕ! вњЁ',
            html: `<h2>РџСЂРёРІС–С‚, ${name}! Р’Рё СѓСЃРїС–С€РЅРѕ Р·Р°СЂРµС”СЃС‚СЂРѕРІР°РЅС–.</h2>`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log('РџРѕРјРёР»РєР° РїРѕС€С‚Рё (Р°Р»Рµ РІ Р±Р°Р·С– РІСЃРµ РѕРє):', error.message);
            } else {
                console.log('Р›РёСЃС‚ РЅР°РґС–СЃР»Р°РЅРѕ!');
            }
        });

        return res.json({
            success: true,
            message: 'РЈСЃРїС–С€РЅР° СЂРµС”СЃС‚СЂР°С†С–СЏ!',
            user: {
                id: result.insertId,
                name,
                surname,
                email,
                phone
            }
        });
    });
});

// --- Р’РҐР†Р” (LOGIN) ---
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    console.log(`РЎРїСЂРѕР±Р° РІС…РѕРґСѓ: Email: ${email}, Password: ${password}`);

    const sql = 'SELECT * FROM users WHERE email = ? AND password = ?';
    db.query(sql, [email, password], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: err.message });

        if (results.length > 0) {
            const user = results[0];
            res.json({
                success: true,
                user: {
                    id: user.id || user.user_id,
                    name: user.name,
                    surname: user.surname,
                    email: user.email,
                    phone: user.phone
                }
            });
        } else {
            res.status(401).json({ success: false, message: 'РќРµРІС–СЂРЅРёР№ email Р°Р±Рѕ РїР°СЂРѕР»СЊ' });
        }
    });
});

// --- РћРўР РРњРђРќРќРЇ Р’РЎР†РҐ Р‘Р РћРќР®Р’РђРќР¬ ---
app.get('/api/booking', (req, res) => {
    const sql = 'SELECT * FROM booking ORDER BY dateStr DESC, timeStr DESC';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('РџРѕРјРёР»РєР° РѕС‚СЂРёРјР°РЅРЅСЏ Р·Р°РїРёСЃС–РІ:', err);
            return res.status(500).json({ success: false, message: 'РџРѕРјРёР»РєР° Р‘Р”' });
        }
        res.json(results);
    });
});

// --- РЎРўР’РћР Р•РќРќРЇ РќРћР’РћР“Рћ Р—РђРџРРЎРЈ ---
app.post('/api/booking', (req, res) => {
    const { service, master, dateStr, timeStr, userName, userPhone } = req.body;
    const sql = "INSERT INTO booking (service, master, dateStr, timeStr, userName, userPhone) VALUES (?, ?, ?, ?, ?, ?)";
    
    db.query(sql, [service, master, dateStr, timeStr, userName, userPhone], (err, result) => {
        if (err) {
            console.error("РџРѕРјРёР»РєР° Р‘Р”:", err);
            return res.status(500).json({ error: err.message });
        }
        res.status(200).json({ message: "РЈСЃРїС–С…" });
    });
});

// --- РЎРўРћР Р†РќРљРђ РћРџР›РђРўР (Р’РёРєРѕСЂРёСЃС‚РѕРІСѓС”РјРѕ С‚РІС–Р№ liqpay.js) ---
app.post('/api/pay', (req, res) => {
    try {
        const { amount, description, orderId, customer, cart } = req.body;
        const numericAmount = Number(amount);

        if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
            return res.status(400).json({ success: false, message: 'Invalid payment amount' });
        }

        const safeOrderId = String(orderId || `ORDER_${Date.now()}`);
        const publicBaseUrl = (process.env.BASE_URL || '').trim().replace(/\/$/, '');
        const browserBaseUrl = publicBaseUrl || `${req.protocol}://${req.get('host')}`;
        const paymentUrls = {
            result_url: `${browserBaseUrl}/success.html?order_id=${encodeURIComponent(safeOrderId)}`
        };

        if (publicBaseUrl) {
            paymentUrls.server_url = `${publicBaseUrl}/api/liqpay/callback`;
        }

        const payment = createPayment({
            amount: numericAmount,
            description: description || `Beauty Whisper order ${safeOrderId}`,
            order_id: safeOrderId,
            ...paymentUrls
        });

        console.log('LiqPay payment created:', {
            orderId: safeOrderId,
            amount: numericAmount,
            customer,
            cartItems: Array.isArray(cart) ? cart.length : 0
        });

        res.json({
            success: true,
            data: payment.data,
            signature: payment.signature,
            orderId: safeOrderId
        });
    } catch (error) {
        console.error('LiqPay create payment error:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
});

app.post('/pay-redirect', (req, res) => {
    try {
        const { amount, description, orderId } = req.body;
        const numericAmount = Number(amount);

        if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
            return res.status(400).send('Invalid payment amount');
        }

        const safeOrderId = String(orderId || `ORDER_${Date.now()}`);
        const publicBaseUrl = (process.env.BASE_URL || '').trim().replace(/\/$/, '');
        const browserBaseUrl = publicBaseUrl || `${req.protocol}://${req.get('host')}`;
        const paymentUrls = {
            result_url: `${browserBaseUrl}/success.html?order_id=${encodeURIComponent(safeOrderId)}`
        };

        if (publicBaseUrl) {
            paymentUrls.server_url = `${publicBaseUrl}/api/liqpay/callback`;
        }

        const payment = createPayment({
            amount: numericAmount,
            description: description || `Beauty Whisper order ${safeOrderId}`,
            order_id: safeOrderId,
            ...paymentUrls
        });

        res.set('Referrer-Policy', 'no-referrer');
        res.send(`<!DOCTYPE html>
<html lang="uk">
<head>
    <meta charset="UTF-8">
    <meta name="referrer" content="no-referrer">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>РџРµСЂРµС…С–Рґ РґРѕ LiqPay</title>
    <style>
        body { font-family: Arial, sans-serif; display: grid; place-items: center; min-height: 100vh; margin: 0; color: #2c2c2c; }
        .box { text-align: center; max-width: 420px; padding: 24px; }
        button { background: #612a26; color: #fff; border: 0; border-radius: 10px; padding: 14px 22px; font-size: 16px; cursor: pointer; }
        p { color: #666; }
    </style>
</head>
<body>
    <div class="box">
        <h1>РџРµСЂРµС…С–Рґ РґРѕ РѕРїР»Р°С‚Рё</h1>
        <p>РќР°С‚РёСЃРЅС–С‚СЊ РєРЅРѕРїРєСѓ, С‰РѕР± РІС–РґРєСЂРёС‚Рё Р·Р°С…РёС‰РµРЅСѓ СЃС‚РѕСЂС–РЅРєСѓ LiqPay.</p>
        <form id="liqpay-form" method="POST" action="https://www.liqpay.ua/api/3/checkout" accept-charset="utf-8" referrerpolicy="no-referrer">
            <input type="hidden" name="data" value="${payment.data}">
            <input type="hidden" name="signature" value="${payment.signature}">
            <button type="submit" autofocus>Р’С–РґРєСЂРёС‚Рё LiqPay</button>
        </form>
    </div>
</body>
</html>`);
    } catch (error) {
        console.error('LiqPay redirect page error:', error.message);
        res.status(500).send(error.message);
    }
});

app.post('/api/liqpay/callback', (req, res) => {
    const { data, signature } = req.body;

    if (!verifyCallback(data, signature)) {
        console.warn('Invalid LiqPay callback signature');
        return res.status(400).send('invalid signature');
    }

    try {
        const payment = decodeCallbackData(data);
        console.log('LiqPay callback:', {
            orderId: payment.order_id,
            status: payment.status,
            amount: payment.amount,
            currency: payment.currency,
            transactionId: payment.transaction_id
        });

        // Add DB update here when payments/orders table is available.
        res.send('ok');
    } catch (error) {
        console.error('LiqPay callback parse error:', error.message);
        res.status(400).send('bad callback data');
    }
});

app.get('/appointments/pay-page/:id', (req, res) => {
    const appointmentId = req.params.id;
    
    // Р’РёРєР»РёРєР°С”РјРѕ С„СѓРЅРєС†С–СЋ Р· С‚РІРѕРіРѕ liqpay.js
    const paymentData = createPayment({
        amount: 1000, // СЃСѓРјР°
        description: `РћРїР»Р°С‚Р° Р·Р°РїРёСЃСѓ в„–${appointmentId}`,
        order_id: appointmentId + "_" + Date.now() // СѓРЅС–РєР°Р»СЊРЅРёР№ ID РґР»СЏ LiqPay
    });

    res.send(`
        <html>
        <body onload="document.forms[0].submit()">
            <form method="POST" action="https://www.liqpay.ua/api/3/checkout" accept-charset="utf-8">
                <input type="hidden" name="data" value="${paymentData.data}" />
                <input type="hidden" name="signature" value="${paymentData.signature}" />
            </form>
            <p>РџРµСЂРµРЅР°РїСЂР°РІР»РµРЅРЅСЏ РЅР° РѕРїР»Р°С‚Сѓ...</p>
        </body>
        </html>
    `);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`рџљЂ РЎРµСЂРІРµСЂ: http://localhost:${PORT}`));

