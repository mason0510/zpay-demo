require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const utility = require('utility');
const moment = require('moment');
const path = require('path');
const ZPaySignatureValidator = require('./zpay-signature-validator');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// 健康检查端点
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        service: 'Z-Pay Demo'
    });
});

// Z-Pay配置 - 从环境变量读取
const ZPAY_CONFIG = {
    pid: process.env.ZPAY_PID || '你的pid', // 商户ID
    key: process.env.ZPAY_KEY || '你的key', // 商户密钥
    gateway: process.env.ZPAY_GATEWAY || 'https://zpayz.cn/submit.php',
    notifyUrl: process.env.NOTIFY_URL || `http://localhost:${PORT}/api/notify`,
    returnUrl: process.env.RETURN_URL || `http://localhost:${PORT}/payment-result.html`,
    siteName: process.env.SITE_NAME || 'Z-Pay演示系统'
};

// 初始化签名验证器
const signatureValidator = new ZPaySignatureValidator(ZPAY_CONFIG.key);

// 参数排序拼接函数
function getVerifyParams(params) {
    const sPara = [];
    if (!params) return null;
    
    for (const key in params) {
        if ((!params[key]) || key === "sign" || key === "sign_type") {
            continue;
        }
        sPara.push([key, params[key]]);
    }
    
    sPara.sort();
    let prestr = '';
    for (let i = 0; i < sPara.length; i++) {
        const obj = sPara[i];
        if (i === sPara.length - 1) {
            prestr = prestr + obj[0] + '=' + obj[1];
        } else {
            prestr = prestr + obj[0] + '=' + obj[1] + '&';
        }
    }
    return prestr;
}

// 生成订单号
function generateOrderNo() {
    return moment().format('YYYYMMDDHHmmss') + Math.floor(Math.random() * 900 + 100);
}

// 创建支付订单
app.post('/api/create-order', (req, res) => {
    try {
        const { amount, productName, paymentMethod, customerName, customerEmail } = req.body;
        
        // 验证参数
        if (!amount || !productName || !paymentMethod) {
            return res.status(400).json({
                success: false,
                message: '缺少必要参数'
            });
        }
        
        // 生成订单号
        const orderNo = generateOrderNo();
        
        // 构建支付参数
        const paymentData = {
            pid: ZPAY_CONFIG.pid,
            money: amount,
            name: productName,
            notify_url: ZPAY_CONFIG.notifyUrl,
            out_trade_no: orderNo,
            return_url: ZPAY_CONFIG.returnUrl,
            sitename: ZPAY_CONFIG.siteName,
            type: paymentMethod // alipay, wxpay, qqpay, tenpay
        };
        
        // 使用专业签名验证器生成支付URL
        const paymentUrl = signatureValidator.generatePaymentUrl(paymentData);
        
        res.json({
            success: true,
            data: {
                orderNo,
                paymentUrl,
                amount,
                productName,
                paymentMethod
            }
        });
        
    } catch (error) {
        console.error('创建订单失败:', error);
        res.status(500).json({
            success: false,
            message: '创建订单失败'
        });
    }
});

// 支付异步通知
app.post('/api/notify', (req, res) => {
    try {
        console.log('收到支付通知:', req.body);
        
        // 使用专业签名验证器验证回调通知
        const verifyResult = signatureValidator.verifyNotify(req.body);
        
        if (!verifyResult.valid) {
            console.error('签名验证失败:', verifyResult.message);
            console.error('调试信息:', signatureValidator.debugSign(req.body));
            return res.status(400).send('fail');
        }
        
        if (verifyResult.success) {
            console.log('支付成功:', verifyResult.data);
            
            // 这里处理支付成功的业务逻辑
            // 例如：更新订单状态、发送通知等
            const { out_trade_no, trade_no, money, name } = req.body;
            console.log(`订单 ${out_trade_no} 支付成功，金额：${money}元，商品：${name}`);
            
            res.send('success'); // 返回success表示处理成功
        } else {
            console.log('支付未完成:', verifyResult.message);
            res.send('success'); // 即使未完成也返回success，避免重复通知
        }
        
    } catch (error) {
        console.error('处理支付通知失败:', error);
        res.status(500).send('fail');
    }
});

// 获取订单状态（模拟）
app.get('/api/order-status/:orderNo', (req, res) => {
    const { orderNo } = req.params;
    
    // 这里应该查询数据库获取实际订单状态
    // 现在返回模拟数据
    res.json({
        success: true,
        data: {
            orderNo,
            status: 'pending', // pending, success, failed
            amount: '100.00',
            productName: '测试商品',
            createTime: moment().format('YYYY-MM-DD HH:mm:ss')
        }
    });
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`Z-Pay演示服务器运行在 http://localhost:${PORT}`);
});