package models

import (
	"time"
)

// 学生
type Student struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	StudentNo string    `json:"student_no" gorm:"uniqueIndex;size:50"`
	Name      string    `json:"name" gorm:"size:100"`
	Score     int       `json:"score" gorm:"default:0"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// 积分记录
type ScoreRecord struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	StudentID   uint      `json:"student_id" gorm:"index"`
	Student     Student   `json:"student" gorm:"foreignKey:StudentID"`
	Value       int       `json:"value"`
	Reason      string    `json:"reason" gorm:"size:255"`
	Category    string    `json:"category" gorm:"size:50"`
	CreatedAt   time.Time `json:"created_at"`
}

// 积分模板
type ScoreTemplate struct {
	ID       uint   `json:"id" gorm:"primaryKey"`
	Name     string `json:"name" gorm:"size:100"`
	Value    int    `json:"value"`
	Category string `json:"category" gorm:"size:50"`
}

// 段位配置
type Rank struct {
	ID       uint   `json:"id" gorm:"primaryKey"`
	Name     string `json:"name" gorm:"size:50"`
	MinScore int    `json:"min_score"`
	Color    string `json:"color" gorm:"size:20"`
	Icon     string `json:"icon" gorm:"size:50"`
	SortOrder int   `json:"sort_order"`
}

// 系统配置
type Setting struct {
	ID    uint   `json:"id" gorm:"primaryKey"`
	Key   string `json:"key" gorm:"uniqueIndex;size:50"`
	Value string `json:"value" gorm:"type:text"`
}
