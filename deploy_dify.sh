#!/bin/bash
# 中芳堂 Dify 一键部署脚本
# 在你的服务器上执行：bash deploy_dify.sh

set -e

echo "========================================"
echo "  中芳堂 Dify AI 平台 一键部署"
echo "========================================"

# 检查 Docker
if ! command -v docker &> /dev/null; then
    echo "安装 Docker..."
    curl -fsSL https://get.docker.com | bash
fi

# 克隆 Dify
if [ ! -d "dify" ]; then
    git clone https://github.com/langgenius/dify.git --depth 1
fi

cd dify/docker

# 配置
cp .env.example .env
sed -i 's/^INIT_PASSWORD=$/INIT_PASSWORD=zhongfangtang2025/' .env

# 启动
docker compose up -d

echo ""
echo "========================================"
echo "  ✅ Dify 部署完成！"
echo "  访问地址：http://$(curl -s ifconfig.me)"
echo "  管理员：admin@zhongfangtang.com"
echo "  密码：zhongfangtang2025"
echo "========================================"
