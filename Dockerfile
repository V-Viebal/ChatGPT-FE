# build stage (Node.js)
FROM node:22 AS build-web
ENV GENERATE_SOURCEMAP=false
ENV NODE_OPTIONS=--max-old-space-size=8192
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
COPY . .
RUN npm i

# Build the application
RUN ng build --configuration=production

# Brotli compression for production assets
COPY compress.js .
RUN node compress.js

# build stage (Nginx with Brotli support)
FROM alpine:3.18 AS build-nginx

# Install build dependencies for Nginx
RUN apk add --no-cache --virtual .build-deps \
    build-base \
    pcre-dev \
    zlib-dev \
    openssl-dev \
    wget \
    brotli-dev \
    git

# Install runtime dependencies
RUN apk add --no-cache \
    pcre \
    zlib \
    openssl

# Download Nginx and Brotli module source code
WORKDIR /usr/src
RUN wget http://nginx.org/download/nginx-1.24.0.tar.gz && \
    tar zxvf nginx-1.24.0.tar.gz && \
    git clone https://github.com/google/ngx_brotli.git && \
    cd ngx_brotli && git submodule update --init

# Compile Nginx with Brotli support
WORKDIR /usr/src/nginx-1.24.0
RUN ./configure --with-compat --add-dynamic-module=../ngx_brotli && \
    make && make install

# production stage (Nginx with Brotli enabled)
FROM alpine:3.18

# Install necessary runtime dependencies
RUN apk add --no-cache pcre zlib openssl brotli libstdc++

# Copy compiled Nginx from build stage
COPY --from=build-nginx /usr/local/nginx /usr/local/nginx

# Copy Nginx configuration
COPY ./nginx.conf /usr/local/nginx/conf/nginx.conf

# Copy Brotli module from build stage
COPY --from=build-nginx /usr/src/nginx-1.24.0/objs/ngx_http_brotli_filter_module.so /etc/nginx/modules/
COPY --from=build-nginx /usr/src/nginx-1.24.0/objs/ngx_http_brotli_static_module.so /etc/nginx/modules/

# Copy compressed web files from build-web stage
COPY --from=build-web /app/dist/compressed /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Run Nginx
CMD ["/usr/local/nginx/sbin/nginx", "-g", "daemon off;"]



# build stage
# FROM node:22 AS build-web
# ENV GENERATE_SOURCEMAP=false
# ENV NODE_OPTIONS=--max-old-space-size=8192
# WORKDIR /app
# COPY package*.json ./
# COPY . .
# RUN npm i -g gzipper@8.1.0
# RUN npm i
# RUN ng build --configuration=production
# RUN gzipper c dist/production  --exclude gz --output-file-format [filename].[ext].gz dist/compressed

# # production stage
# FROM nginx:alpine
# COPY ./nginx.conf /etc/nginx/nginx.conf
# COPY --from=build-web /app/dist/compressed /usr/share/nginx/html
