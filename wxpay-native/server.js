import bodyParser from 'body-parser';
import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import path from 'path';
import qrcode from 'qrcode';
import WechatPay from 'wechatpay-node-v3';

// ---------------- env & basic validation ----------------
const {
  WECHAT_MCH_ID,
  WECHAT_APP_ID,
  WECHAT_API_V3_KEY,
  NOTIFY_URL,
  PORT = 3000
} = process.env;

if (!WECHAT_MCH_ID || !WECHAT_APP_ID || !WECHAT_API_V3_KEY || !NOTIFY_URL) {
  console.error('[WXPAY] 请在 .env 中配置 WECHAT_MCH_ID、WECHAT_APP_ID、WECHAT_API_V3_KEY、NOTIFY_URL');
  process.exit(1);
}

// ---------------- certificate loading ----------------
const CERT_DIR = path.resolve('./certs');
const mchPrivateKeyPath = path.join(CERT_DIR, 'apiclient_key.pem');
const wechatPublicCertPath = path.join(CERT_DIR, 'wechatpay_cert.pem');

if (!fs.existsSync(mchPrivateKeyPath) || !fs.existsSync(wechatPublicCertPath)) {
  console.error('[WXPAY] 缺少证书文件，请将 apiclient_key.pem 与 wechatpay_cert.pem 放到 certs/ 目录');
  process.exit(1);
}

const mchPrivateKey = fs.readFileSync(mchPrivateKeyPath);
const wechatPublicCert = fs.readFileSync(wechatPublicCertPath);

function getCertSerial() {
  const pem = wechatPublicCert.toString();
  const serialMatch = pem.match(/Serial Number:[^\n]*([0-9A-F]+)/i);
  return serialMatch ? serialMatch[1].replace(/:/g, '') : '';
}

// ---------------- init sdk ----------------
const pay = new WechatPay({
  mchid: WECHAT_MCH_ID,
  serial: getCertSerial(),
  privateKey: mchPrivateKey,
  publicKey: wechatPublicCert,
  key: WECHAT_API_V3_KEY
});

// ---------------- express app ----------------
const app = express();
app.use(bodyParser.json());
app.use(express.static(path.resolve('./public')));

// 生成简易订单号: yyyyMMddHHmmss + 4 随机
function genOrderNo() {
  const now = new Date();
  const pad = (n) => n.toString().padStart(2, '0');
  const ts =
    now.getFullYear().toString() +
    pad(now.getMonth() + 1) +
    pad(now.getDate()) +
    pad(now.getHours()) +
    pad(now.getMinutes()) +
    pad(now.getSeconds());
  return ts + Math.floor(Math.random() * 9000 + 1000);
}

// 创建支付订单 -> 返回二维码 DataURL
app.post('/api/create-order', async (req, res) => {
  try {
    const {amount = 1, description = '测试商品'} = req.body || {};
    const fen = Math.round(Number(amount) * 100);
    if (fen <= 0) return res.status(400).json({message: '金额必须大于 0'});

    const outTradeNo = genOrderNo();

    const wxResp = await pay.transactions.native({
      mchid: WECHAT_MCH_ID,
      appid: WECHAT_APP_ID,
      description,
      out_trade_no: outTradeNo,
      notify_url: NOTIFY_URL,
      amount: {total: fen, currency: 'CNY'}
    });

    const qrDataUrl = await qrcode.toDataURL(wxResp.code_url);

    res.json({success: true, data: {orderNo: outTradeNo, qrDataUrl}});
  } catch (err) {
    console.error('[WXPAY] create-order error:', err);
    res.status(500).json({success: false, message: '下单失败'});
  }
});

// 微信支付回调
app.post('/api/wechat/notify', async (req, res) => {
  try {
    const {resource} = req.body;
    if (!resource) throw new Error('非法回调');

    const plaintext = pay.decipher_gcm(
      resource.ciphertext,
      resource.nonce,
      resource.associated_data
    );
    const result = JSON.parse(plaintext.toString());

    if (result.trade_state === 'SUCCESS') {
      // TODO: 这里完成业务逻辑（更新订单状态、写数据库等）。必须幂等！
      console.log('[WXPAY] 支付成功 →', result.out_trade_no);
    } else {
      console.warn('[WXPAY] 非成功状态回调', result);
    }

    res.json({code: 'SUCCESS', message: 'OK'});
  } catch (err) {
    console.error('[WXPAY] notify error:', err);
    res.status(500).json({code: 'FAIL', message: 'ERROR'});
  }
});

// health check
app.get('/api/ping', (req, res) => res.send('pong'));

console.log('[WXPAY] Starting server...');

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[WXPAY] Server listening: http://localhost:${PORT}`);
}).on('error', (err) => {
  console.error('[WXPAY] Server error:', err);
}); 