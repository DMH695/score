package middleware

import (
	"net/http"

	"score-backend/config"

	"github.com/gin-gonic/gin"
)

func AdminAuth(cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		password := c.GetHeader("X-Admin-Password")
		if password != cfg.AdminPassword {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "管理员密码错误"})
			c.Abort()
			return
		}
		c.Next()
	}
}

// 验证管理员密码（用于登录）
func CheckAdminPassword(cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		var input struct {
			Password string `json:"password" binding:"required"`
		}
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "请输入密码"})
			return
		}

		if input.Password != cfg.AdminPassword {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "密码错误"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "登录成功"})
	}
}

// 验证重置密码
func CheckResetPassword(cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		var input struct {
			Password string `json:"password" binding:"required"`
		}
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "请输入重置密码"})
			return
		}

		if input.Password != cfg.ResetPassword {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "重置密码错误"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "验证成功"})
	}
}
