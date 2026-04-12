# Menggunakan Node.js versi 20
FROM node:20-alpine

WORKDIR /app

# Salin file package.json dan package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Salin seluruh kode proyek
COPY . .

# Jalankan aplikasi dalam mode development
CMD ["npm", "run", "dev"]