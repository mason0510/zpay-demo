#!/bin/bash

# Payment Gateway 部署脚本
set -e

echo "🚀 开始部署支付网关..."

# 拉取最新代码
echo "📦 拉取最新代码..."
git pull origin main

# 停止现有服务
echo "⏹️  停止现有服务..."
docker-compose down --remove-orphans

# 构建新镜像
echo "🔨 构建新镜像..."
docker-compose build --no-cache

# 启动服务
echo "▶️  启动服务..."
docker-compose up -d

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 10

# 检查服务状态
echo "🔍 检查服务状态..."
if docker-compose ps | grep -q "Up"; then
    echo "✅ 支付网关部署成功！"
    echo "🌐 访问地址: https://pay.satoshitech.xyz/"
else
    echo "❌ 部署失败，请检查日志:"
    docker-compose logs --tail=50
    exit 1
fi

echo "📊 服务状态："
docker-compose ps