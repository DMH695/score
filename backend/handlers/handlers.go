package handlers

import (
	"net/http"
	"strconv"

	"score-backend/database"
	"score-backend/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// ============ 学生相关 ============

// 获取所有学生（带排名和段位）
func GetStudents(c *gin.Context) {
	var students []models.Student
	database.DB.Order("score DESC, student_no ASC").Find(&students)

	var ranks []models.Rank
	database.DB.Order("min_score DESC").Find(&ranks)

	type StudentWithRank struct {
		models.Student
		Ranking  int    `json:"ranking"`
		RankName string `json:"rank_name"`
		RankColor string `json:"rank_color"`
		RankIcon string `json:"rank_icon"`
		NextRank string `json:"next_rank"`
		NextRankScore int `json:"next_rank_score"`
	}

	result := make([]StudentWithRank, len(students))
	for i, s := range students {
		result[i] = StudentWithRank{
			Student: s,
			Ranking: i + 1,
		}
		// 计算段位
		for _, r := range ranks {
			if s.Score >= r.MinScore {
				result[i].RankName = r.Name
				result[i].RankColor = r.Color
				result[i].RankIcon = r.Icon
				break
			}
		}
		// 计算下一段位
		for j := len(ranks) - 1; j >= 0; j-- {
			if ranks[j].MinScore > s.Score {
				result[i].NextRank = ranks[j].Name
				result[i].NextRankScore = ranks[j].MinScore - s.Score
				break
			}
		}
	}

	c.JSON(http.StatusOK, gin.H{"data": result})
}

// 获取单个学生详情
func GetStudent(c *gin.Context) {
	id := c.Param("id")
	var student models.Student
	if err := database.DB.First(&student, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "学生不存在"})
		return
	}

	// 获取积分记录
	var records []models.ScoreRecord
	database.DB.Where("student_id = ?", id).Order("created_at DESC").Limit(50).Find(&records)

	// 获取排名
	var ranking int64
	database.DB.Model(&models.Student{}).Where("score > ?", student.Score).Count(&ranking)

	// 获取段位信息
	var ranks []models.Rank
	database.DB.Order("min_score DESC").Find(&ranks)

	var rankName, rankColor, rankIcon, nextRank string
	var nextRankScore int

	for _, r := range ranks {
		if student.Score >= r.MinScore {
			rankName = r.Name
			rankColor = r.Color
			rankIcon = r.Icon
			break
		}
	}

	for j := len(ranks) - 1; j >= 0; j-- {
		if ranks[j].MinScore > student.Score {
			nextRank = ranks[j].Name
			nextRankScore = ranks[j].MinScore - student.Score
			break
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"data": gin.H{
			"student":         student,
			"records":         records,
			"ranking":         ranking + 1,
			"rank_name":       rankName,
			"rank_color":      rankColor,
			"rank_icon":       rankIcon,
			"next_rank":       nextRank,
			"next_rank_score": nextRankScore,
		},
	})
}

// 搜索学生
func SearchStudent(c *gin.Context) {
	keyword := c.Query("keyword")
	if keyword == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "请输入搜索关键词"})
		return
	}

	var students []models.Student
	database.DB.Where("name LIKE ? OR student_no LIKE ?", "%"+keyword+"%", "%"+keyword+"%").Find(&students)

	c.JSON(http.StatusOK, gin.H{"data": students})
}

// 创建学生
func CreateStudent(c *gin.Context) {
	var student models.Student
	if err := c.ShouldBindJSON(&student); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := database.DB.Create(&student).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "创建失败"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"data": student})
}

// 更新学生
func UpdateStudent(c *gin.Context) {
	id := c.Param("id")
	var student models.Student
	if err := database.DB.First(&student, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "学生不存在"})
		return
	}

	var input struct {
		StudentNo string `json:"student_no"`
		Name      string `json:"name"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	database.DB.Model(&student).Updates(models.Student{
		StudentNo: input.StudentNo,
		Name:      input.Name,
	})

	c.JSON(http.StatusOK, gin.H{"data": student})
}

// 删除学生
func DeleteStudent(c *gin.Context) {
	id := c.Param("id")

	// 先删除相关的积分记录
	database.DB.Where("student_id = ?", id).Delete(&models.ScoreRecord{})

	if err := database.DB.Delete(&models.Student{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "删除失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "删除成功"})
}

// 批量创建学生
func BatchCreateStudents(c *gin.Context) {
	var input struct {
		Students []models.Student `json:"students"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := database.DB.Create(&input.Students).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "批量创建失败"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"data": input.Students})
}

// ============ 积分操作 ============

// 加减积分
func ModifyScore(c *gin.Context) {
	var input struct {
		StudentID uint   `json:"student_id" binding:"required"`
		Value     int    `json:"value" binding:"required"`
		Reason    string `json:"reason"`
		Category  string `json:"category"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var student models.Student
	if err := database.DB.First(&student, input.StudentID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "学生不存在"})
		return
	}

	// 更新积分
	database.DB.Model(&student).Update("score", student.Score+input.Value)

	// 创建记录
	record := models.ScoreRecord{
		StudentID: input.StudentID,
		Value:     input.Value,
		Reason:    input.Reason,
		Category:  input.Category,
	}
	database.DB.Create(&record)

	c.JSON(http.StatusOK, gin.H{"data": record, "new_score": student.Score + input.Value})
}

// 批量加减积分
func BatchModifyScore(c *gin.Context) {
	var input struct {
		StudentIDs []uint `json:"student_ids" binding:"required"`
		Value      int    `json:"value" binding:"required"`
		Reason     string `json:"reason"`
		Category   string `json:"category"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	for _, studentID := range input.StudentIDs {
		var student models.Student
		if err := database.DB.First(&student, studentID).Error; err != nil {
			continue
		}

		database.DB.Model(&student).Update("score", student.Score+input.Value)

		record := models.ScoreRecord{
			StudentID: studentID,
			Value:     input.Value,
			Reason:    input.Reason,
			Category:  input.Category,
		}
		database.DB.Create(&record)
	}

	c.JSON(http.StatusOK, gin.H{"message": "批量操作成功"})
}

// 撤销积分操作
func UndoScoreRecord(c *gin.Context) {
	id := c.Param("id")
	var record models.ScoreRecord
	if err := database.DB.First(&record, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "记录不存在"})
		return
	}

	// 恢复积分
	database.DB.Model(&models.Student{}).Where("id = ?", record.StudentID).
		Update("score", gorm.Expr("score - ?", record.Value))

	// 删除记录
	database.DB.Delete(&record)

	c.JSON(http.StatusOK, gin.H{"message": "撤销成功"})
}

// 获取积分记录
func GetScoreRecords(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))
	studentID := c.Query("student_id")
	category := c.Query("category")

	query := database.DB.Model(&models.ScoreRecord{}).Preload("Student")

	if studentID != "" {
		query = query.Where("student_id = ?", studentID)
	}
	if category != "" {
		query = query.Where("category = ?", category)
	}

	var total int64
	query.Count(&total)

	var records []models.ScoreRecord
	query.Order("created_at DESC").
		Offset((page - 1) * pageSize).
		Limit(pageSize).
		Find(&records)

	c.JSON(http.StatusOK, gin.H{
		"data":      records,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	})
}

// ============ 积分模板 ============

func GetTemplates(c *gin.Context) {
	var templates []models.ScoreTemplate
	database.DB.Find(&templates)
	c.JSON(http.StatusOK, gin.H{"data": templates})
}

func CreateTemplate(c *gin.Context) {
	var template models.ScoreTemplate
	if err := c.ShouldBindJSON(&template); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	database.DB.Create(&template)
	c.JSON(http.StatusCreated, gin.H{"data": template})
}

func UpdateTemplate(c *gin.Context) {
	id := c.Param("id")
	var template models.ScoreTemplate
	if err := database.DB.First(&template, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "模板不存在"})
		return
	}

	if err := c.ShouldBindJSON(&template); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	database.DB.Save(&template)
	c.JSON(http.StatusOK, gin.H{"data": template})
}

func DeleteTemplate(c *gin.Context) {
	id := c.Param("id")
	database.DB.Delete(&models.ScoreTemplate{}, id)
	c.JSON(http.StatusOK, gin.H{"message": "删除成功"})
}

// ============ 段位配置 ============

func GetRanks(c *gin.Context) {
	var ranks []models.Rank
	database.DB.Order("min_score ASC").Find(&ranks)
	c.JSON(http.StatusOK, gin.H{"data": ranks})
}

func CreateRank(c *gin.Context) {
	var rank models.Rank
	if err := c.ShouldBindJSON(&rank); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	database.DB.Create(&rank)
	c.JSON(http.StatusCreated, gin.H{"data": rank})
}

func UpdateRank(c *gin.Context) {
	id := c.Param("id")
	var rank models.Rank
	if err := database.DB.First(&rank, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "段位不存在"})
		return
	}

	if err := c.ShouldBindJSON(&rank); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	database.DB.Save(&rank)
	c.JSON(http.StatusOK, gin.H{"data": rank})
}

func DeleteRank(c *gin.Context) {
	id := c.Param("id")
	database.DB.Delete(&models.Rank{}, id)
	c.JSON(http.StatusOK, gin.H{"message": "删除成功"})
}

// ============ 系统管理 ============

// 重置所有积分
func ResetAllScores(c *gin.Context) {
	database.DB.Model(&models.Student{}).Update("score", 0)
	database.DB.Delete(&models.ScoreRecord{}, "1=1")
	c.JSON(http.StatusOK, gin.H{"message": "重置成功"})
}

// 获取统计数据
func GetStatistics(c *gin.Context) {
	var totalStudents int64
	database.DB.Model(&models.Student{}).Count(&totalStudents)

	var totalRecords int64
	database.DB.Model(&models.ScoreRecord{}).Count(&totalRecords)

	type CategoryStat struct {
		Category string `json:"category"`
		Count    int64  `json:"count"`
		Total    int64  `json:"total"`
	}

	var categoryStats []CategoryStat
	database.DB.Model(&models.ScoreRecord{}).
		Select("category, COUNT(*) as count, SUM(value) as total").
		Group("category").
		Scan(&categoryStats)

	c.JSON(http.StatusOK, gin.H{
		"data": gin.H{
			"total_students":  totalStudents,
			"total_records":   totalRecords,
			"category_stats":  categoryStats,
		},
	})
}
