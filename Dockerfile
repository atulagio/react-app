# Step 1: Build React app
FROM node:22 as build

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Step 2: Serve with Nginx
FROM nginx:alpine

# Remove default nginx config
RUN rm -rf /etc/nginx/conf.d/*

# Copy custom config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build files
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]