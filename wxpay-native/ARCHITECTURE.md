# 微信 Native 扫码支付 Demo 架构设计

## 目录概览

```
wxpay-native/
├─ certs/                 # 证书目录（生产环境勿提交仓库）
│   ├─ apiclient_key.pem      # 商户私钥
│   └─ wechatpay_cert.pem     # 微信平台公钥
├─ public/                # 前端静态资源
│   └─ index.html             # 测试页面
├─ server.js              # Node.js 后端入口
├─ package.json           # 依赖清单
└─ .env.example           # 环境变量示例（需复制为 .env）
```

## 技术栈

- **Node.js 18+**
- **Express 4** —— 轻量 API Server
- **wechatpay-node-v3** —— 微信官方 API v3 SDK
- **qrcode** —— 将 `code_url` 转为 DataURL 图片

## 运行流程

1. `npm install` 安装依赖。
2. 将证书文件放入 `certs/`：
   - `apiclient_key.pem` — 商户私钥
   - `wechatpay_cert.pem` — 微信平台公钥
3. 复制 `.env.example` 为 `.env` 并填写：
   - `WECHAT_MCH_ID`
   - `WECHAT_APP_ID`
   - `WECHAT_API_V3_KEY`
   - `NOTIFY_URL` 回调地址（需 HTTPS 公网可访问）
4. `npm start` 启动；浏览器访问 `http://localhost:3000` → 点击按钮生成二维码 → 微信扫码支付。
5. 成功后控制台打印 `支付成功 → {out_trade_no}`。

## 核心代码说明

### `/api/create-order`

- 读取 `amount`、`description` 参数。
- 生成本地唯一订单号 `out_trade_no`。
- 调用 `pay.transactions.native` 获取 `code_url`。
- 使用 `qrcode.toDataURL` 渲染二维码返回给前端。

### `/api/wechat/notify`

- 解析回调 `resource` 字段，使用 SDK 解密。
- 校验 `trade_state === SUCCESS` 后更新业务数据（TODO 标注）。
- 响应 `{code:'SUCCESS'}` 让微信停止重试。

## 安全与合规

- **证书安全**：`certs/` 目录应写入 `.gitignore`；生产部署可通过环境变量挂载。
- **金额单位**：微信以 _分_ 为单位，已通过 `Math.round(amount*100)` 转换处理。
- **幂等**：业务层需根据 `out_trade_no` 判断是否已处理，防止重复入账。
- **主动查单**：可对 `*_notify` 超时订单调用 `transactions/out-trade-no/{id}` 补偿。

## 部署注意

- 服务器需支持 **TLS1.2+**，端口 443。
- 若服务器在海外，确保微信服务器能访问 `NOTIFY_URL`；可使用 CDN / Tunnel 做加速。

---

交接完毕，如需扩展 JSAPI/H5 支付，可在此项目基础上增加相应接口；证书与密钥复用。
