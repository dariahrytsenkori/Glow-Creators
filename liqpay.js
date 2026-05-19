const crypto = require('crypto');

function getRequiredEnv(name) {
    const value = process.env[name];
    if (!value || !value.trim()) {
        throw new Error(`Missing environment variable: ${name}`);
    }
    return value.trim();
}

function readBooleanEnv(name, defaultValue) {
    const value = process.env[name];
    if (value === undefined || value === '') return defaultValue;
    return ['1', 'true', 'yes', 'on'].includes(String(value).trim().toLowerCase());
}

function getLiqPayCredentials() {
    const publicKey = getRequiredEnv('LIQPAY_PUBLIC_KEY');
    const privateKey = getRequiredEnv('LIQPAY_PRIVATE_KEY');
    const sandbox = readBooleanEnv('LIQPAY_SANDBOX', false);
    const hasSandboxKey = publicKey.startsWith('sandbox_') || privateKey.startsWith('sandbox_');
    const hasPlaceholderKey = [publicKey, privateKey].some((key) => /^your_|^change_me|placeholder/i.test(key));

    if (!sandbox && hasSandboxKey) {
        throw new Error('Production LiqPay mode requires live merchant keys. Replace sandbox keys in bd.env.');
    }

    if (!sandbox && hasPlaceholderKey) {
        throw new Error('Production LiqPay mode requires real LIQPAY_PUBLIC_KEY and LIQPAY_PRIVATE_KEY values.');
    }

    return { publicKey, privateKey, sandbox };
}

function encodePayload(payload) {
    return Buffer.from(JSON.stringify(payload), 'utf8').toString('base64');
}

function createSignature(data, privateKey = getRequiredEnv('LIQPAY_PRIVATE_KEY')) {
    return crypto
        .createHash('sha3-256')
        .update(privateKey + data + privateKey)
        .digest()
        .toString('base64');
}

function createPayment(params) {
    const { publicKey, privateKey, sandbox } = getLiqPayCredentials();
    const amount = Number(params.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
        throw new Error('Payment amount must be greater than 0');
    }

    const payload = {
        public_key: publicKey,
        version: 7,
        action: 'pay',
        amount: amount.toFixed(2),
        currency: 'UAH',
        description: String(params.description || 'Beauty Whisper payment'),
        order_id: String(params.order_id),
        result_url: params.result_url,
        server_url: params.server_url,
        sandbox: sandbox ? 1 : undefined
    };

    Object.keys(payload).forEach((key) => {
        if (payload[key] === undefined || payload[key] === '') {
            delete payload[key];
        }
    });

    const data = encodePayload(payload);
    const signature = createSignature(data, privateKey);

    return { data, signature, payload };
}

function verifyCallback(data, signature) {
    if (!data || !signature) return false;
    return createSignature(data) === signature;
}

function decodeCallbackData(data) {
    return JSON.parse(Buffer.from(data, 'base64').toString('utf8'));
}

module.exports = {
    createPayment,
    verifyCallback,
    decodeCallbackData
};
