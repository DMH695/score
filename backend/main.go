package main

import (
	"log"

	"score-backend/config"
	"score-backend/database"
	"score-backend/handlers"
	"score-backend/middleware"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// 加载 .env 文件
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	cfg := config.Load()

	// 初始化数据库
	database.Init(cfg)

	// 创建 Gin 引擎
	r := gin.Default()

	// CORS 配置
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "X-Admin-Password"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	// ============ 公开API（用户端） ============
	public := r.Group("/api")
	{
		// 学生列表（排行榜）
		public.GET("/students", handlers.GetStudents)
		// 学生详情
		public.GET("/students/:id", handlers.GetStudent)
		// 搜索学生
		public.GET("/students/search", handlers.SearchStudent)
		// 获取段位配置
		public.GET("/ranks", handlers.GetRanks)
		// 获取积分模板（用于展示分类）
		public.GET("/templates", handlers.GetTemplates)
		// 获取积分记录
		public.GET("/records", handlers.GetScoreRecords)
	}

	// ============ 管理员登录验证 ============
	r.POST("/api/admin/login", middleware.CheckAdminPassword(cfg))
	r.POST("/api/admin/verify-reset", middleware.CheckResetPassword(cfg))

	// ============ 管理员API ============
	admin := r.Group("/api/admin")
	admin.Use(middleware.AdminAuth(cfg))
	{
		// 学生管理
		admin.POST("/students", handlers.CreateStudent)
		admin.PUT("/students/:id", handlers.UpdateStudent)
		admin.DELETE("/students/:id", handlers.DeleteStudent)
		admin.POST("/students/batch", handlers.BatchCreateStudents)

		// 积分操作
		admin.POST("/score", handlers.ModifyScore)
		admin.POST("/score/batch", handlers.BatchModifyScore)
		admin.DELETE("/score/:id", handlers.UndoScoreRecord)

		// 积分模板
		admin.POST("/templates", handlers.CreateTemplate)
		admin.PUT("/templates/:id", handlers.UpdateTemplate)
		admin.DELETE("/templates/:id", handlers.DeleteTemplate)

		// 段位配置
		admin.POST("/ranks", handlers.CreateRank)
		admin.PUT("/ranks/:id", handlers.UpdateRank)
		admin.DELETE("/ranks/:id", handlers.DeleteRank)

		// 系统管理
		admin.POST("/reset", handlers.ResetAllScores)
		admin.GET("/statistics", handlers.GetStatistics)
	}

	log.Printf("Server starting on port %s", cfg.ServerPort)
	r.Run(":" + cfg.ServerPort)
}
