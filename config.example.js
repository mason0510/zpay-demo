// Z-Pay 配置示例文件
// 复制此文件为 config.js 并填入您的实际配置信息

module.exports = {
    // Z-Pay 商户配置
    zpay: {
        pid: '您的商户ID',           // 在 Z-Pay 后台获取
        key: '您的商户密钥',         // 在 Z-Pay 后台获取
        gateway: 'https://zpayz.cn/submit.php',  // Z-Pay 支付网关地址
        
        // 回调地址配置
        notifyUrl: 'http://您的域名/api/notify',      // 异步通知地址（支付完成后Z-Pay会POST到此地址）
        returnUrl: 'http://您的域名/payment-result.html', // 同步跳转地址（用户支付完成后跳转到此页面）
        
        // 网站信息
        siteName: 'Z-Pay演示系统'
    },
    
    // 服务器配置
    server: {
        port: process.env.PORT || 3000,
        host: '0.0.0.0'
    },
    
    // 支持的支付方式
    paymentMethods: {
        alipay: {
            name: '支付宝',
            enabled: true,
            icon: '💰'
        },
        wxpay: {
            name: '微信支付',
            enabled: true,
            icon: '💚'
        },
        qqpay: {
            name: 'QQ钱包',
            enabled: true,
            icon: '🐧'
        },
        tenpay: {
            name: '财付通',
            enabled: true,
            icon: '💳'
        }
    },
    
    // 订单配置
    order: {
        // 订单号前缀
        prefix: 'ZPAY',
        
        // 默认订单有效期（分钟）
        expireMinutes: 30,
        
        // 最小支付金额（元）
        minAmount: 0.01,
        
        // 最大支付金额（元）
        maxAmount: 99999.99
    },
    
    // 日志配置
    logging: {
        level: 'info',  // debug, info, warn, error
        file: './logs/app.log',
        maxSize: '10m',
        maxFiles: 5
    },
    
    // 安全配置
    security: {
        // 是否验证支付通知签名
        verifyNotifySignature: true,
        
        // 允许的IP地址（支付通知来源IP白名单）
        allowedIPs: [
            '127.0.0.1',
            // 'Z-Pay的服务器IP地址'
        ],
        
        // CORS 配置
        cors: {
            origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
            credentials: true
        }
    }
};