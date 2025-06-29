# Z-Pay 支付演示系统

一个基于 Node.js 和 Material Design 的 Z-Pay 支付接口演示系统，用于展示如何集成 Z-Pay 支付功能。

## 🚀 功能特性

- **Material Design 风格界面** - 现代化的用户界面设计
- **多种支付方式** - 支持支付宝、微信、QQ钱包、财付通
- **实时支付状态** - 支付完成后实时更新订单状态
- **响应式设计** - 完美适配桌面和移动设备
- **安全可靠** - MD5 签名验证，确保交易安全
- **易于集成** - 简洁的 API 接口，方便集成到其他系统

## 📋 系统要求

- Node.js >= 14.0.0
- npm >= 6.0.0

## 🛠️ 安装和配置

### 1. 安装依赖

```bash
npm install
```

### 2. 配置 Z-Pay 参数

复制配置文件模板：

```bash
cp config.example.js config.js
```

编辑 `config.js` 文件，填入您的 Z-Pay 商户信息：

```javascript
module.exports = {
    zpay: {
        pid: '您的商户ID',           // 在 Z-Pay 后台获取
        key: '您的商户密钥',         // 在 Z-Pay 后台获取
        // ... 其他配置
    }
    // ... 其他配置
};
```

### 3. 启动服务

开发模式：
```bash
npm run dev
```

生产模式：
```bash
npm start
```

### 4. 访问系统

打开浏览器访问：`http://localhost:3000`

## 📁 项目结构

```
zpay-demo/
├── node/                   # 原始 Node.js 示例代码
│   └── pay.txt
├── public/                 # 前端静态文件
│   ├── index.html         # 主页面
│   ├── payment-result.html # 支付结果页面
│   ├── style.css          # 样式文件
│   └── script.js          # 前端脚本
├── server.js              # 服务器主文件
├── config.example.js      # 配置文件模板
├── package.json           # 项目依赖
└── README.md             # 项目说明
```

## 🔧 API 接口

### 创建支付订单

**POST** `/api/create-order`

请求参数：
```json
{
    "amount": "1.00",
    "productName": "测试商品",
    "paymentMethod": "alipay",
    "customerName": "客户姓名",
    "customerEmail": "客户邮箱"
}
```

响应：
```json
{
    "success": true,
    "data": {
        "orderNo": "202312080001",
        "paymentUrl": "https://z-pay.cn/submit.php?...",
        "amount": "1.00",
        "productName": "测试商品",
        "paymentMethod": "alipay"
    }
}
```

### 支付异步通知

**POST** `/api/notify`

Z-Pay 支付完成后会向此接口发送通知。

### 查询订单状态

**GET** `/api/order-status/:orderNo`

响应：
```json
{
    "success": true,
    "data": {
        "orderNo": "202312080001",
        "status": "success",
        "amount": "1.00",
        "productName": "测试商品",
        "createTime": "2023-12-08 10:00:00"
    }
}
```

## 💡 使用说明

### 1. 基本支付流程

1. 用户填写支付信息并选择支付方式
2. 系统创建支付订单并生成支付URL
3. 用户跳转到 Z-Pay 支付页面完成支付
4. 支付完成后返回结果页面
5. 系统接收 Z-Pay 的异步通知更新订单状态

### 2. 集成到其他系统

如需将此支付功能集成到其他系统，主要需要：

1. 复制 `server.js` 中的支付相关代码
2. 根据实际需求修改数据库操作
3. 调整前端界面和样式
4. 配置正确的回调地址

### 3. 支付方式配置

在 `config.js` 中可以配置支持的支付方式：

```javascript
paymentMethods: {
    alipay: { name: '支付宝', enabled: true },
    wxpay: { name: '微信支付', enabled: true },
    // 可以禁用某些支付方式
    qqpay: { name: 'QQ钱包', enabled: false }
}
```

## 🔒 安全考虑

1. **签名验证** - 所有支付请求都使用 MD5 签名验证
2. **HTTPS** - 生产环境建议使用 HTTPS
3. **IP 白名单** - 可配置允许的通知来源 IP
4. **参数验证** - 严格验证所有输入参数
5. **密钥保护** - 商户密钥不要泄露到前端

## 🚨 注意事项

1. **配置文件** - 请勿将包含真实密钥的 `config.js` 文件提交到版本控制
2. **回调地址** - 确保回调地址可以被 Z-Pay 服务器访问
3. **订单号** - 订单号必须唯一，建议使用时间戳+随机数
4. **金额格式** - 金额必须为正数，最小单位为分

## 🔧 自定义和扩展

### 添加新的支付方式

1. 在 `config.js` 中添加新的支付方式配置
2. 在前端页面添加对应的选项
3. 确保 Z-Pay 支持该支付方式

### 数据库集成

当前版本使用内存存储，生产环境建议：

1. 集成 MySQL/PostgreSQL 等数据库
2. 添加订单表和支付记录表
3. 实现完整的订单管理功能

### 日志和监控

建议添加：

1. 详细的日志记录
2. 支付状态监控
3. 异常情况告警
4. 性能监控

## 📞 技术支持

如有问题请参考：

- [Z-Pay 官方文档](https://z-pay.cn/member/doc.html)
- [项目 GitHub 仓库](https://github.com/your-username/zpay-demo)

## 📝 许可证

MIT License

## 📋 更新日志

### v1.0.0 (2024-06-29)

- 初始版本发布
- 基本的支付功能实现
- Material Design 界面设计
- 支持多种支付方式
- 完整的支付流程演示

---

**注意：** 此项目仅用于演示目的，生产环境使用前请进行充分的测试和安全审核。