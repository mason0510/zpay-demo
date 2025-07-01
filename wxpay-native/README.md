# 微信Native支付Demo

## 配置步骤

### 1. 创建.env文件
复制 `.env.example` 为 `.env`，然后填入你的配置：

```bash
cp .env.example .env
```

### 2. 配置参数
在 `.env` 文件中填入以下参数：

- `WECHAT_MCH_ID`: 微信支付商户号
- `WECHAT_APP_ID`: 微信公众号/小程序/APP的AppID  
- `WECHAT_API_V3_KEY`: 微信支付APIv3密钥
- `NOTIFY_URL`: 支付结果通知URL（必须是外网可访问的https地址）

### 3. 上传证书文件
将以下证书文件放到 `certs/` 目录：

- `apiclient_key.pem`: 商户私钥
- `wechatpay_cert.pem`: 微信支付证书

### 4. 启动服务
```bash
npm start
```

### 5. 测试支付
打开浏览器访问：http://localhost:3000

## 注意事项

1. 回调地址必须是外网可访问的https地址
2. 证书文件路径不能错误
3. 商户号、AppID、APIv3密钥必须匹配
4. 生产环境请确保证书文件安全性