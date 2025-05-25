FROM node:20-slim

# 安装 puppeteer 所需系统依赖
RUN apt-get update && apt-get install -y \
  wget gnupg curl \
  ca-certificates fonts-liberation \
  libappindicator3-1 libasound2 libatk-bridge2.0-0 \
  libatk1.0-0 libcups2 libdbus-1-3 \
  libgdk-pixbuf2.0-0 libnspr4 libnss3 \
  libx11-xcb1 libxcomposite1 libxdamage1 \
  libxrandr2 xdg-utils libgbm-dev libxshmfence-dev \
  --no-install-recommends && rm -rf /var/lib/apt/lists/*

# 设置工作目录
WORKDIR /app

# 只先拷贝依赖文件（更容易命中缓存）
COPY package.json package-lock.json* ./

# 安装依赖
RUN npm install

RUN npm install puppeteer

# 然后再拷贝应用源码
COPY . .

# Puppeteer 无头模式建议使用 Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=false

EXPOSE 3000

# 默认启动 src/main.js
CMD ["node", "src/main.js"]
