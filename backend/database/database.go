package database

import (
	"fmt"
	"log"

	"score-backend/config"
	"score-backend/models"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var DB *gorm.DB

func Init(cfg *config.Config) {
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&collation=utf8mb4_unicode_ci&parseTime=True&loc=Local",
		cfg.DBUser,
		cfg.DBPassword,
		cfg.DBHost,
		cfg.DBPort,
		cfg.DBName,
	)

	var err error
	DB, err = gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// 自动迁移
	err = DB.AutoMigrate(
		&models.Student{},
		&models.ScoreRecord{},
		&models.ScoreTemplate{},
		&models.Rank{},
		&models.Setting{},
	)
	if err != nil {
		log.Fatal("Failed to migrate database:", err)
	}

	// 初始化默认段位
	initDefaultRanks()

	// 初始化默认积分模板
	initDefaultTemplates()

	log.Println("Database connected and migrated successfully")
}

func initDefaultRanks() {
	// 清空并重新创建固定段位配置
	DB.Exec("DELETE FROM ranks")

	ranks := []models.Rank{
		{Name: "学徒", MinScore: 0, Color: "#9CA3AF", Icon: "🌱", SortOrder: 1},
		{Name: "青铜", MinScore: 20, Color: "#CD7F32", Icon: "🥉", SortOrder: 2},
		{Name: "白银", MinScore: 50, Color: "#A8A9AD", Icon: "🥈", SortOrder: 3},
		{Name: "黄金", MinScore: 100, Color: "#FFD700", Icon: "🏅", SortOrder: 4},
		{Name: "铂金", MinScore: 180, Color: "#00CED1", Icon: "💠", SortOrder: 5},
		{Name: "钻石", MinScore: 280, Color: "#B9F2FF", Icon: "💎", SortOrder: 6},
		{Name: "大师", MinScore: 400, Color: "#9400D3", Icon: "🔮", SortOrder: 7},
		{Name: "宗师", MinScore: 550, Color: "#FF6B6B", Icon: "⭐", SortOrder: 8},
		{Name: "王者", MinScore: 750, Color: "#FF4500", Icon: "👑", SortOrder: 9},
		{Name: "传奇", MinScore: 1000, Color: "#FFD700", Icon: "🏆", SortOrder: 10},
	}
	DB.Create(&ranks)
}

func initDefaultTemplates() {
	var count int64
	DB.Model(&models.ScoreTemplate{}).Count(&count)
	if count == 0 {
		templates := []models.ScoreTemplate{
			{Name: "回答问题", Value: 2, Category: "课堂表现"},
			{Name: "作业优秀", Value: 3, Category: "作业"},
			{Name: "考试进步", Value: 5, Category: "考试"},
			{Name: "帮助同学", Value: 2, Category: "品德"},
			{Name: "迟到", Value: -1, Category: "纪律"},
			{Name: "未交作业", Value: -2, Category: "作业"},
			{Name: "课堂违纪", Value: -2, Category: "纪律"},
		}
		DB.Create(&templates)
	}
}
