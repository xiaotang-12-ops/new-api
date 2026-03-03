package controller

import (
	"net/http"
	"strconv"
	"strings"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/model"

	"github.com/gin-gonic/gin"
)

func isPrivilegedLogViewer(role int) bool {
	return role >= common.RoleAdminUser
}

func isSensitiveRealModelField(key string) bool {
	normalizedKey := strings.ToLower(strings.TrimSpace(key))
	if normalizedKey == "" {
		return false
	}
	switch normalizedKey {
	case "upstream_model_name", "upstream_model", "actual_model", "real_model",
		"target_model", "provider_model", "origin_model", "origin_model_name",
		"original_model", "original_model_name", "actual_request_model":
		return true
	}
	sensitiveKeyTokens := []string{
		"upstream_model",
		"actual_model",
		"real_model",
		"target_model",
		"provider_model",
		"origin_model",
		"original_model",
	}
	for _, token := range sensitiveKeyTokens {
		if strings.Contains(normalizedKey, token) {
			return true
		}
	}
	return false
}

func isSafeOtherFieldForStandardViewer(key string) bool {
	normalizedKey := strings.ToLower(strings.TrimSpace(key))
	switch normalizedKey {
	case "request_path", "frt", "group", "error_type", "error_code", "status_code":
		return true
	default:
		return false
	}
}

func sanitizeLogForViewer(log *model.Log, isPrivileged bool) {
	if log == nil || isPrivileged || log.Other == "" {
		return
	}
	otherMap, _ := common.StrToMap(log.Other)
	if otherMap == nil {
		return
	}

	// Standard users only receive a strict allow-list of safe metadata.
	// This prevents exposing upstream routing details and billing internals.
	safeOtherMap := make(map[string]interface{})
	for key, value := range otherMap {
		if isSensitiveRealModelField(key) {
			continue
		}
		if isSafeOtherFieldForStandardViewer(key) {
			safeOtherMap[key] = value
		}
	}
	log.Other = common.MapToJsonStr(safeOtherMap)
}

func sanitizeLogsForViewer(logs []*model.Log, isPrivileged bool) {
	for _, log := range logs {
		sanitizeLogForViewer(log, isPrivileged)
	}
}

func GetAllLogs(c *gin.Context) {
	pageInfo := common.GetPageQuery(c)
	logType, _ := strconv.Atoi(c.Query("type"))
	startTimestamp, _ := strconv.ParseInt(c.Query("start_timestamp"), 10, 64)
	endTimestamp, _ := strconv.ParseInt(c.Query("end_timestamp"), 10, 64)
	username := c.Query("username")
	tokenName := c.Query("token_name")
	modelName := c.Query("model_name")
	channel, _ := strconv.Atoi(c.Query("channel"))
	group := c.Query("group")
	logs, total, err := model.GetAllLogs(logType, startTimestamp, endTimestamp, modelName, username, tokenName, pageInfo.GetStartIdx(), pageInfo.GetPageSize(), channel, group)
	if err != nil {
		common.ApiError(c, err)
		return
	}
	pageInfo.SetTotal(int(total))
	pageInfo.SetItems(logs)
	common.ApiSuccess(c, pageInfo)
	return
}

func GetUserLogs(c *gin.Context) {
	pageInfo := common.GetPageQuery(c)
	userId := c.GetInt("id")
	isPrivileged := isPrivilegedLogViewer(c.GetInt("role"))
	logType, _ := strconv.Atoi(c.Query("type"))
	startTimestamp, _ := strconv.ParseInt(c.Query("start_timestamp"), 10, 64)
	endTimestamp, _ := strconv.ParseInt(c.Query("end_timestamp"), 10, 64)
	tokenName := c.Query("token_name")
	modelName := c.Query("model_name")
	group := c.Query("group")
	logs, total, err := model.GetUserLogs(userId, logType, startTimestamp, endTimestamp, modelName, tokenName, pageInfo.GetStartIdx(), pageInfo.GetPageSize(), group)
	if err != nil {
		common.ApiError(c, err)
		return
	}
	sanitizeLogsForViewer(logs, isPrivileged)
	pageInfo.SetTotal(int(total))
	pageInfo.SetItems(logs)
	common.ApiSuccess(c, pageInfo)
	return
}

func SearchAllLogs(c *gin.Context) {
	keyword := c.Query("keyword")
	logs, err := model.SearchAllLogs(keyword)
	if err != nil {
		common.ApiError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
		"data":    logs,
	})
	return
}

func SearchUserLogs(c *gin.Context) {
	keyword := c.Query("keyword")
	userId := c.GetInt("id")
	isPrivileged := isPrivilegedLogViewer(c.GetInt("role"))
	logs, err := model.SearchUserLogs(userId, keyword)
	if err != nil {
		common.ApiError(c, err)
		return
	}
	sanitizeLogsForViewer(logs, isPrivileged)
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
		"data":    logs,
	})
	return
}

func GetLogByKey(c *gin.Context) {
	key := c.Query("key")
	logs, err := model.GetLogByKey(key)
	if err != nil {
		c.JSON(200, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}
	// This endpoint is intentionally unauthenticated, so never return real/upstream model fields.
	sanitizeLogsForViewer(logs, false)
	c.JSON(200, gin.H{
		"success": true,
		"message": "",
		"data":    logs,
	})
}

func GetLogsStat(c *gin.Context) {
	logType, _ := strconv.Atoi(c.Query("type"))
	startTimestamp, _ := strconv.ParseInt(c.Query("start_timestamp"), 10, 64)
	endTimestamp, _ := strconv.ParseInt(c.Query("end_timestamp"), 10, 64)
	tokenName := c.Query("token_name")
	username := c.Query("username")
	modelName := c.Query("model_name")
	channel, _ := strconv.Atoi(c.Query("channel"))
	group := c.Query("group")
	stat := model.SumUsedQuota(logType, startTimestamp, endTimestamp, modelName, username, tokenName, channel, group)
	//tokenNum := model.SumUsedToken(logType, startTimestamp, endTimestamp, modelName, username, "")
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
		"data": gin.H{
			"quota": stat.Quota,
			"rpm":   stat.Rpm,
			"tpm":   stat.Tpm,
		},
	})
	return
}

func GetLogsSelfStat(c *gin.Context) {
	username := c.GetString("username")
	logType, _ := strconv.Atoi(c.Query("type"))
	startTimestamp, _ := strconv.ParseInt(c.Query("start_timestamp"), 10, 64)
	endTimestamp, _ := strconv.ParseInt(c.Query("end_timestamp"), 10, 64)
	tokenName := c.Query("token_name")
	modelName := c.Query("model_name")
	channel, _ := strconv.Atoi(c.Query("channel"))
	group := c.Query("group")
	quotaNum := model.SumUsedQuota(logType, startTimestamp, endTimestamp, modelName, username, tokenName, channel, group)
	//tokenNum := model.SumUsedToken(logType, startTimestamp, endTimestamp, modelName, username, tokenName)
	c.JSON(200, gin.H{
		"success": true,
		"message": "",
		"data": gin.H{
			"quota": quotaNum.Quota,
			"rpm":   quotaNum.Rpm,
			"tpm":   quotaNum.Tpm,
			//"token": tokenNum,
		},
	})
	return
}

func DeleteHistoryLogs(c *gin.Context) {
	targetTimestamp, _ := strconv.ParseInt(c.Query("target_timestamp"), 10, 64)
	if targetTimestamp == 0 {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "target timestamp is required",
		})
		return
	}
	count, err := model.DeleteOldLog(c.Request.Context(), targetTimestamp, 100)
	if err != nil {
		common.ApiError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
		"data":    count,
	})
	return
}
