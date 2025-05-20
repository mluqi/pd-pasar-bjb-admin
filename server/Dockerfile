# Gunakan base image Node.js yang sesuai
FROM node:18-alpine AS builder

# Tentukan direktori kerja di dalam container
WORKDIR /usr/src/app

# Salin package.json dan package-lock.json (atau yarn.lock)
COPY package*.json ./

# Install dependensi
RUN npm install
# Jika Anda menggunakan TypeScript atau perlu build step:
# RUN npm run build

# Salin sisa kode aplikasi
COPY . .

# Image produksi yang lebih ramping
FROM node:18-alpine
WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app . # Jika tidak ada build step, atau salin hasil build (misal ./dist)

# Port yang digunakan oleh aplikasi backend Anda
EXPOSE 3001

# Perintah untuk menjalankan aplikasi Anda
CMD [ "npm", "start" ]
# Atau, misalnya: CMD [ "node", "dist/main.js" ]