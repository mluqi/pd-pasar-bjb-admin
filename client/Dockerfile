# Tahap 1: Build aplikasi frontend
FROM node:18-alpine AS builder

WORKDIR /app

# Argumen untuk URL API backend, bisa di-pass saat build
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=${REACT_APP_API_URL}

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Tahap 2: Sajikan dengan Nginx
FROM nginx:stable-alpine

# Salin hasil build dari tahap sebelumnya ke direktori default Nginx
COPY --from=builder /app/build /usr/share/nginx/html

# Ekspos port 80 (port default Nginx)
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]