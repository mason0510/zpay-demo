/**
 * Z-Pay签名验证工具
 * 基于官方文档: https://zpayz.cn/ 
 * 签名算法: MD5
 */

const crypto = require('crypto');

class ZPaySignatureValidator {
    constructor(pkey) {
        this.pkey = pkey; // 商户密钥
    }

    /**
     * 参数排序拼接函数 (官方算法)
     * 1. 按参数名ASCII码从小到大排序(a-z)
     * 2. sign、sign_type、和空值不参与签名
     * 3. 拼接成URL键值对格式: a=b&c=d&e=f
     * @param {Object} params 参数对象
     * @returns {String} 排序后的参数字符串
     */
    getVerifyParams(params) {
        const sPara = [];
        if (!params) return null;
        
        for (const key in params) {
            // 跳过空值、sign和sign_type参数
            if (!params[key] || params[key] === '' || key === "sign" || key === "sign_type") {
                continue;
            }
            sPara.push([key, params[key]]);
        }
        
        // 按参数名ASCII码排序
        sPara.sort();
        
        // 拼接成URL键值对格式
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

    /**
     * 生成MD5签名
     * 算法: md5(参数字符串 + 商户密钥)
     * @param {Object} params 参数对象
     * @returns {String} MD5签名(小写)
     */
    generateSign(params) {
        const paramStr = this.getVerifyParams(params);
        if (!paramStr) return null;
        
        // MD5加密: 参数字符串 + 密钥
        const signStr = paramStr + this.pkey;
        return crypto.createHash('md5').update(signStr, 'utf8').digest('hex').toLowerCase();
    }

    /**
     * 验证签名是否正确
     * @param {Object} params 包含sign的完整参数对象
     * @returns {Boolean} 签名是否正确
     */
    verifySign(params) {
        if (!params.sign) {
            throw new Error('缺少sign参数');
        }
        
        const receivedSign = params.sign.toLowerCase();
        const calculatedSign = this.generateSign(params);
        
        return receivedSign === calculatedSign;
    }

    /**
     * 生成支付URL
     * @param {Object} paymentData 支付参数
     * @returns {String} 完整的支付URL
     */
    generatePaymentUrl(paymentData) {
        const sign = this.generateSign(paymentData);
        const paramStr = this.getVerifyParams(paymentData);
        
        return `https://zpayz.cn/submit.php?${paramStr}&sign=${sign}&sign_type=MD5`;
    }

    /**
     * 验证支付回调通知
     * @param {Object} notifyData 回调通知数据
     * @returns {Object} 验证结果
     */
    verifyNotify(notifyData) {
        try {
            const isValid = this.verifySign(notifyData);
            const isSuccess = notifyData.trade_status === 'TRADE_SUCCESS';
            
            return {
                valid: isValid,
                success: isSuccess,
                message: isValid ? 
                    (isSuccess ? '支付成功' : '支付未完成') : 
                    '签名验证失败',
                data: notifyData
            };
        } catch (error) {
            return {
                valid: false,
                success: false,
                message: error.message,
                data: notifyData
            };
        }
    }

    /**
     * 调试签名计算过程
     * @param {Object} params 参数对象
     * @returns {Object} 调试信息
     */
    debugSign(params) {
        const paramStr = this.getVerifyParams(params);
        const signStr = paramStr + this.pkey;
        const calculatedSign = this.generateSign(params);
        
        return {
            originalParams: params,
            sortedParamString: paramStr,
            signString: signStr,
            calculatedSign: calculatedSign,
            receivedSign: params.sign || 'N/A',
            isValid: params.sign ? calculatedSign === params.sign.toLowerCase() : false
        };
    }
}

// 导出类
module.exports = ZPaySignatureValidator;

// 如果直接运行此文件，进行测试
if (require.main === module) {
    // 测试用例
    const validator = new ZPaySignatureValidator('cQoq3mjY6v6O59AghN8bsJIIyhIdBUyn');
    
    console.log('=== Z-Pay签名验证工具测试 ===\n');
    
    // 测试1: 生成支付签名
    const paymentData = {
        pid: '2025062220300248',
        money: '1',
        name: '测试商品',
        notify_url: 'https://zpay.satoshitech.xyz/api/notify',
        out_trade_no: '20250629100000001',
        return_url: 'https://zpay.satoshitech.xyz/payment-result.html',
        sitename: 'Z-Pay演示系统',
        type: 'wxpay'
    };
    
    console.log('1. 生成支付签名测试:');
    const sign = validator.generateSign(paymentData);
    console.log('生成的签名:', sign);
    console.log('支付URL:', validator.generatePaymentUrl(paymentData));
    console.log('');
    
    // 测试2: 验证签名
    const testParams = {
        ...paymentData,
        sign: sign
    };
    
    console.log('2. 签名验证测试:');
    console.log('签名是否正确:', validator.verifySign(testParams));
    console.log('');
    
    // 测试3: 调试信息
    console.log('3. 签名调试信息:');
    console.log(validator.debugSign(testParams));
    console.log('');
    
    // 测试4: 验证回调通知
    const notifyData = {
        pid: '2025062220300248',
        name: '测试商品',
        money: '1',
        out_trade_no: '20250629100000001',
        trade_no: 'zpay20250629100000001',
        param: '',
        trade_status: 'TRADE_SUCCESS',
        type: 'wxpay',
        sign: 'test_sign',
        sign_type: 'MD5'
    };
    
    // 生成正确的回调签名
    notifyData.sign = validator.generateSign(notifyData);
    
    console.log('4. 回调通知验证测试:');
    console.log(validator.verifyNotify(notifyData));
}