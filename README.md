# 学生积分管理系统

## Docker 部署

### 1. 修改配置（可选）

编辑 `.env` 文件修改密码：

```env
DB_PASSWORD=你的数据库密码
ADMIN_PASSWORD=你的管理员密码
RESET_PASSWORD=你的重置密码
```

### 2. 如果部署到服务器

修改 `docker-compose.yml` 中前端的 `NEXT_PUBLIC_API_URL`：

```yaml
frontend:
  build:
    args:
      NEXT_PUBLIC_API_URL: http://你的服务器IP:8080/api
```

### 3. 启动服务

```bash
# 构建并启动所有服务
docker-compose up -d --build

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down

# 停止并删除数据
docker-compose down -v
```

### 4. 访问系统

- 前端页面：http://localhost:3000
- 后端 API：http://localhost:8080
- 管理后台：http://localhost:3000/admin

### 5. 默认密码

- 管理员密码：`admin123`
- 重置密码：`wsx547547`

## 目录结构

```
score/
├── backend/           # Go 后端
│   ├── Dockerfile
│   └── ...
├── frontend/          # Next.js 前端
│   ├── Dockerfile
│   └── ...
├── docker-compose.yml # Docker 编排文件
├── init.sql          # 数据库初始化
├── .env              # 环境变量配置
└── README.md
```
