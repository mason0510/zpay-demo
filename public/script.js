// 全局变量
let currentOrder = null;

// DOM 加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// 初始化应用
function initializeApp() {
    const paymentForm = document.getElementById('paymentForm');
    if (paymentForm) {
        paymentForm.addEventListener('submit', handlePaymentSubmit);
    }
    
    // 添加输入验证
    setupInputValidation();
    
    // 设置支付方式选择监听
    setupPaymentMethodListeners();
}

// 处理支付表单提交
async function handlePaymentSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const paymentData = {
        productName: formData.get('productName'),
        amount: parseFloat(formData.get('amount')),
        customerName: formData.get('customerName'),
        customerEmail: formData.get('customerEmail'),
        paymentMethod: formData.get('paymentMethod')
    };
    
    // 验证数据
    if (!validatePaymentData(paymentData)) {
        return;
    }
    
    // 显示加载状态
    showLoadingModal();
    
    try {
        // 调用后端API创建订单
        const response = await fetch('/api/create-order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(paymentData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            // 保存订单信息
            currentOrder = result.data;
            
            // 显示订单信息
            displayOrderInfo(result.data);
            
            // 显示成功提示
            showToast('订单创建成功！', 'success');
            
            // 3秒后自动跳转到支付页面
            setTimeout(() => {
                window.open(result.data.paymentUrl, '_blank');
            }, 3000);
            
        } else {
            showToast(result.message || '创建订单失败', 'error');
        }
        
    } catch (error) {
        console.error('创建订单失败:', error);
        showToast('网络错误，请稍后重试', 'error');
    } finally {
        hideLoadingModal();
    }
}

// 验证支付数据
function validatePaymentData(data) {
    if (!data.productName || data.productName.trim().length === 0) {
        showToast('请输入商品名称', 'warning');
        return false;
    }
    
    if (!data.amount || data.amount <= 0) {
        showToast('请输入有效的支付金额', 'warning');
        return false;
    }
    
    if (data.amount < 0.01) {
        showToast('支付金额不能少于0.01元', 'warning');
        return false;
    }
    
    if (!data.paymentMethod) {
        showToast('请选择支付方式', 'warning');
        return false;
    }
    
    return true;
}

// 显示订单信息
function displayOrderInfo(orderData) {
    const orderInfo = document.getElementById('orderInfo');
    const orderDetails = document.getElementById('orderDetails');
    
    if (!orderInfo || !orderDetails) return;
    
    // 获取支付方式名称
    const paymentMethodNames = {
        'alipay': '支付宝',
        'wxpay': '微信支付',
        'qqpay': 'QQ钱包',
        'tenpay': '财付通'
    };
    
    const paymentMethodName = paymentMethodNames[orderData.paymentMethod] || orderData.paymentMethod;
    
    orderDetails.innerHTML = `
        <div class="order-item">
            <span class="order-item-label">订单号:</span>
            <span class="order-item-value">${orderData.orderNo}</span>
        </div>
        <div class="order-item">
            <span class="order-item-label">商品名称:</span>
            <span class="order-item-value">${orderData.productName}</span>
        </div>
        <div class="order-item">
            <span class="order-item-label">支付方式:</span>
            <span class="order-item-value">${paymentMethodName}</span>
        </div>
        <div class="order-item">
            <span class="order-item-label">创建时间:</span>
            <span class="order-item-value">${new Date().toLocaleString()}</span>
        </div>
        <div class="order-item order-total">
            <span class="order-item-label">支付金额:</span>
            <span class="order-item-value">¥${orderData.amount}</span>
        </div>
        <button class="btn btn-primary btn-large pay-now-btn" onclick="window.open('${orderData.paymentUrl}', '_blank')">
            <span class="material-icons">open_in_new</span>
            立即支付
        </button>
        <div style="margin-top: 16px; padding: 12px; background-color: #E3F2FD; border-radius: 4px; font-size: 14px; color: #1976D2;">
            <span class="material-icons" style="font-size: 16px; vertical-align: middle;">info</span>
            请使用 <b>微信</b> 扫一扫完成支付，如已完成支付，页面会自动跳转。
        </div>
    `;
    
    orderInfo.style.display = 'block';
    
    // 滚动到订单信息区域
    orderInfo.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// 设置输入验证
function setupInputValidation() {
    const amountInput = document.getElementById('amount');
    if (amountInput) {
        amountInput.addEventListener('input', function(e) {
            let value = parseFloat(e.target.value);
            if (value < 0.01) {
                e.target.setCustomValidity('金额不能少于0.01元');
            } else {
                e.target.setCustomValidity('');
            }
        });
    }
    
    const productNameInput = document.getElementById('productName');
    if (productNameInput) {
        productNameInput.addEventListener('input', function(e) {
            if (e.target.value.trim().length === 0) {
                e.target.setCustomValidity('请输入商品名称');
            } else {
                e.target.setCustomValidity('');
            }
        });
    }
}

// 设置支付方式选择监听
function setupPaymentMethodListeners() {
    const paymentMethods = document.querySelectorAll('input[name="paymentMethod"]');
    paymentMethods.forEach(method => {
        method.addEventListener('change', function() {
            // 这里可以添加根据支付方式的不同逻辑
            console.log('选择的支付方式:', this.value);
        });
    });
}

// 显示加载模态框
function showLoadingModal() {
    const modal = document.getElementById('loadingModal');
    if (modal) {
        modal.classList.add('show');
    }
}

// 隐藏加载模态框
function hideLoadingModal() {
    const modal = document.getElementById('loadingModal');
    if (modal) {
        modal.classList.remove('show');
    }
}

// 显示消息提示
function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = getToastIcon(type);
    toast.innerHTML = `
        <span class="material-icons">${icon}</span>
        <span>${message}</span>
    `;
    
    toastContainer.appendChild(toast);
    
    // 3秒后自动移除
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 3000);
}

// 获取提示图标
function getToastIcon(type) {
    const icons = {
        'success': 'check_circle',
        'error': 'error',
        'warning': 'warning',
        'info': 'info'
    };
    return icons[type] || 'info';
}

// 滚动到演示区域
function scrollToDemo() {
    const demoSection = document.getElementById('demo');
    if (demoSection) {
        demoSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// 查询订单状态（可用于轮询检查支付状态）
async function checkOrderStatus(orderNo) {
    try {
        const response = await fetch(`/api/order-status/${orderNo}`);
        const result = await response.json();
        
        if (result.success) {
            return result.data;
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        console.error('查询订单状态失败:', error);
        return null;
    }
}

// 复制订单号到剪贴板
function copyOrderNo(orderNo) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(orderNo).then(() => {
            showToast('订单号已复制到剪贴板', 'success');
        }).catch(() => {
            showToast('复制失败', 'error');
        });
    } else {
        // 兼容旧浏览器
        const textArea = document.createElement('textarea');
        textArea.value = orderNo;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            showToast('订单号已复制到剪贴板', 'success');
        } catch (err) {
            showToast('复制失败', 'error');
        }
        document.body.removeChild(textArea);
    }
}

// 模拟支付结果处理（用于测试）
function simulatePaymentResult(status) {
    const messages = {
        'success': '支付成功！',
        'failed': '支付失败，请重试',
        'cancel': '支付已取消'
    };
    
    const types = {
        'success': 'success',
        'failed': 'error',
        'cancel': 'warning'
    };
    
    showToast(messages[status] || '未知状态', types[status] || 'info');
}

// 页面可见性变化处理（用于检测用户从支付页面返回）
document.addEventListener('visibilitychange', function() {
    if (!document.hidden && currentOrder) {
        // 页面变为可见，可能是用户从支付页面返回
        // 这里可以添加检查支付状态的逻辑
        console.log('页面变为可见，检查支付状态...');
        
        // 延迟检查，给支付通知时间处理
        setTimeout(() => {
            if (currentOrder && currentOrder.orderNo) {
                checkOrderStatus(currentOrder.orderNo).then(status => {
                    if (status) {
                        console.log('订单状态:', status);
                        // 根据状态更新UI
                    }
                });
            }
        }, 2000);
    }
});

// 键盘快捷键支持
document.addEventListener('keydown', function(e) {
    // Esc键关闭模态框
    if (e.key === 'Escape') {
        hideLoadingModal();
    }
    
    // Ctrl+Enter 快速提交表单
    if (e.ctrlKey && e.key === 'Enter') {
        const paymentForm = document.getElementById('paymentForm');
        if (paymentForm) {
            paymentForm.requestSubmit();
        }
    }
});

// 防止重复提交
let isSubmitting = false;

// 重写提交处理函数以包含防重复逻辑
const originalHandlePaymentSubmit = handlePaymentSubmit;
handlePaymentSubmit = async function(event) {
    if (isSubmitting) {
        showToast('请勿重复提交', 'warning');
        return;
    }
    
    isSubmitting = true;
    try {
        await originalHandlePaymentSubmit.call(this, event);
    } finally {
        // 延迟重置，防止快速连击
        setTimeout(() => {
            isSubmitting = false;
        }, 1000);
    }
};