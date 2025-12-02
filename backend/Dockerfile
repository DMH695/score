FROM golang:1.21-alpine AS builder

WORKDIR /app

# 设置 Go 代理（国内加速）
ENV GOPROXY=https://goproxy.cn,direct

# 安装依赖
COPY go.mod go.sum ./
RUN go mod download

# 复制源码并编译
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o score-backend .

# 运行镜像
FROM alpine:latest

WORKDIR /app

# 安装时区数据
RUN apk --no-cache add tzdata ca-certificates

COPY --from=builder /app/score-backend .

EXPOSE 8080

CMD ["./score-backend"]
