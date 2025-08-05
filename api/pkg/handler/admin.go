package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jesusnoseq/request-inbox/pkg/database"
	"github.com/jesusnoseq/request-inbox/pkg/login"
	"github.com/jesusnoseq/request-inbox/pkg/model"
)

type AdminHandler struct {
	dao database.InboxDAO
}

func NewAdminHandler(dao database.InboxDAO) *AdminHandler {
	return &AdminHandler{
		dao: dao,
	}
}

// RequireAdmin middleware to check if user is admin
func (ah *AdminHandler) RequireAdmin() gin.HandlerFunc {
	return func(c *gin.Context) {
		if !login.IsUserLoggedIn(c) {
			c.AbortWithStatusJSON(http.StatusUnauthorized, model.ErrorResponse{
				Message: "Authentication required",
				Code:    http.StatusUnauthorized,
			})
			return
		}

		user, err := login.GetUser(c)
		if err != nil {
			c.AbortWithStatusJSON(model.ErrorResponseFromError(err, http.StatusInternalServerError))
			return
		}

		if !user.IsAdmin() {
			c.AbortWithStatusJSON(http.StatusForbidden, model.ErrorResponse{
				Message: "Admin access required",
				Code:    http.StatusForbidden,
			})
			return
		}

		c.Next()
	}
}

// GetDashboardStats returns admin dashboard statistics
func (ah *AdminHandler) GetDashboardStats(c *gin.Context) {
	ctx := c.Request.Context()

	// Get total users
	allUsers, err := ah.dao.ListAllUsers(ctx)
	if err != nil {
		statusCode, errorResponse := model.ErrorResponseFromError(err, http.StatusInternalServerError)
		c.AbortWithStatusJSON(statusCode, errorResponse)
		return
	}

	// Get total inboxes
	allInboxes, err := ah.dao.ListInbox(ctx)
	if err != nil {
		statusCode, errorResponse := model.ErrorResponseFromError(err, http.StatusInternalServerError)
		c.AbortWithStatusJSON(statusCode, errorResponse)
		return
	}

	// Get total requests
	totalRequests, err := ah.dao.GetTotalRequestsCount(ctx)
	if err != nil {
		statusCode, errorResponse := model.ErrorResponseFromError(err, http.StatusInternalServerError)
		c.AbortWithStatusJSON(statusCode, errorResponse)
		return
	}

	// Calculate active users (users with inboxes that have requests)
	activeUsers := 0
	userHasActivity := make(map[string]bool)
	for _, inbox := range allInboxes {
		if len(inbox.Requests) > 0 {
			userHasActivity[inbox.OwnerID.String()] = true
		}
	}
	for range userHasActivity {
		activeUsers++
	}

	stats := model.AdminDashboardStats{
		TotalUsers:    len(allUsers),
		TotalInboxes:  len(allInboxes),
		TotalRequests: totalRequests,
		ActiveUsers:   activeUsers,
	}

	c.JSON(http.StatusOK, stats)
}

// GetChartData returns chart data for the dashboard
func (ah *AdminHandler) GetChartData(c *gin.Context) {
	ctx := c.Request.Context()

	// Get user registrations over time
	userRegistrations, err := ah.dao.GetUserCreatedOverTime(ctx)
	if err != nil {
		statusCode, errorResponse := model.ErrorResponseFromError(err, http.StatusInternalServerError)
		c.AbortWithStatusJSON(statusCode, errorResponse)
		return
	}

	// Get inbox creations over time
	inboxCreations, err := ah.dao.GetInboxesCreatedOverTime(ctx)
	if err != nil {
		statusCode, errorResponse := model.ErrorResponseFromError(err, http.StatusInternalServerError)
		c.AbortWithStatusJSON(statusCode, errorResponse)
		return
	}

	// Get all users to calculate role counts
	allUsers, err := ah.dao.ListAllUsers(ctx)
	if err != nil {
		statusCode, errorResponse := model.ErrorResponseFromError(err, http.StatusInternalServerError)
		c.AbortWithStatusJSON(statusCode, errorResponse)
		return
	}

	// Calculate role counts from user list
	roleCounts := make(map[string]int)
	for _, user := range allUsers {
		roleCounts[user.Role]++
	}

	// Convert role counts to RoleCount slice
	var userRoles []model.RoleCount
	for role, count := range roleCounts {
		userRoles = append(userRoles, model.RoleCount{
			Role:  role,
			Count: count,
		})
	}

	chartData := model.AdminChartData{
		UserRegistrations: userRegistrations,
		InboxCreations:    inboxCreations,
		UserRoles:         userRoles,
	}

	c.JSON(http.StatusOK, chartData)
}

// GetAllUsers returns a paginated list of all users (admin only)
func (ah *AdminHandler) GetAllUsers(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	_ = c.Query("search") // search parameter for future use

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}

	ctx := c.Request.Context()

	// Get all users from database
	allUsers, err := ah.dao.ListAllUsers(ctx)
	if err != nil {
		statusCode, errorResponse := model.ErrorResponseFromError(err, http.StatusInternalServerError)
		c.AbortWithStatusJSON(statusCode, errorResponse)
		return
	}

	// Calculate pagination
	total := len(allUsers)
	start := (page - 1) * limit
	end := start + limit

	if start >= total {
		start = total
		end = total
	} else if end > total {
		end = total
	}

	var users []model.User
	if start < end {
		users = allUsers[start:end]
	} else {
		users = []model.User{}
	}

	response := struct {
		Users []model.User `json:"users"`
		Total int          `json:"total"`
		Page  int          `json:"page"`
		Limit int          `json:"limit"`
	}{
		Users: users,
		Total: total,
		Page:  page,
		Limit: limit,
	}

	c.JSON(http.StatusOK, response)
}

// UpdateUser updates a user's information (admin only)
func (ah *AdminHandler) UpdateUser(c *gin.Context) {
	userID := c.Param("id")
	if userID == "" {
		c.AbortWithStatusJSON(http.StatusBadRequest, model.ErrorResponse{
			Message: "User ID is required",
			Code:    http.StatusBadRequest,
		})
		return
	}

	var updateData struct {
		Name         string `json:"name"`
		Email        string `json:"email"`
		Role         string `json:"role"`
		Organization string `json:"organization"`
	}

	if err := c.ShouldBindJSON(&updateData); err != nil {
		statusCode, errorResponse := model.ErrorResponseWithError("Invalid request data", err, http.StatusBadRequest)
		c.AbortWithStatusJSON(statusCode, errorResponse)
		return
	}

	// Validate role
	if updateData.Role != model.RoleUser && updateData.Role != model.RoleAdmin {
		c.AbortWithStatusJSON(http.StatusBadRequest, model.ErrorResponse{
			Message: "Invalid role specified",
			Code:    http.StatusBadRequest,
		})
		return
	}

	ctx := c.Request.Context()

	// Parse user ID
	parsedUserID, err := uuid.Parse(userID)
	if err != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, model.ErrorResponse{
			Message: "Invalid user ID format",
			Code:    http.StatusBadRequest,
		})
		return
	}

	// Get existing user
	existingUser, err := ah.dao.GetUser(ctx, parsedUserID)
	if err != nil {
		statusCode, errorResponse := model.ErrorResponseFromError(err, http.StatusInternalServerError)
		c.AbortWithStatusJSON(statusCode, errorResponse)
		return
	}

	// Update user fields
	existingUser.Name = updateData.Name
	existingUser.Email = updateData.Email
	existingUser.Role = updateData.Role
	existingUser.Organization = updateData.Organization

	// Save updated user
	err = ah.dao.UpsertUser(ctx, existingUser)
	if err != nil {
		statusCode, errorResponse := model.ErrorResponseFromError(err, http.StatusInternalServerError)
		c.AbortWithStatusJSON(statusCode, errorResponse)
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User updated successfully"})
}

// DeleteUser deletes a user (admin only)
func (ah *AdminHandler) DeleteUser(c *gin.Context) {
	userID := c.Param("id")
	if userID == "" {
		c.AbortWithStatusJSON(http.StatusBadRequest, model.ErrorResponse{
			Message: "User ID is required",
			Code:    http.StatusBadRequest,
		})
		return
	}

	// Get current user to prevent self-deletion
	currentUser, err := login.GetUser(c)
	if err != nil {
		statusCode, errorResponse := model.ErrorResponseFromError(err, http.StatusInternalServerError)
		c.AbortWithStatusJSON(statusCode, errorResponse)
		return
	}

	if currentUser.ID.String() == userID {
		c.AbortWithStatusJSON(http.StatusBadRequest, model.ErrorResponse{
			Message: "Cannot delete your own account",
			Code:    http.StatusBadRequest,
		})
		return
	}

	ctx := c.Request.Context()

	// Parse user ID
	parsedUserID, err := uuid.Parse(userID)
	if err != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, model.ErrorResponse{
			Message: "Invalid user ID format",
			Code:    http.StatusBadRequest,
		})
		return
	}

	// Delete user
	err = ah.dao.DeleteUser(ctx, parsedUserID)
	if err != nil {
		statusCode, errorResponse := model.ErrorResponseFromError(err, http.StatusInternalServerError)
		c.AbortWithStatusJSON(statusCode, errorResponse)
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User deleted successfully"})
}

// GetAllInboxes returns a paginated list of all inboxes (admin only)
func (ah *AdminHandler) GetAllInboxes(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	_ = c.Query("search") // search parameter for future use

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}

	ctx := c.Request.Context()

	// Get all inboxes from database
	allInboxes, err := ah.dao.ListInbox(ctx)
	if err != nil {
		statusCode, errorResponse := model.ErrorResponseFromError(err, http.StatusInternalServerError)
		c.AbortWithStatusJSON(statusCode, errorResponse)
		return
	}

	// Get all users to get owner information
	allUsers, err := ah.dao.ListAllUsers(ctx)
	if err != nil {
		statusCode, errorResponse := model.ErrorResponseFromError(err, http.StatusInternalServerError)
		c.AbortWithStatusJSON(statusCode, errorResponse)
		return
	}

	// Create a map for quick user lookup
	userMap := make(map[uuid.UUID]model.User)
	for _, user := range allUsers {
		userMap[user.ID] = user
	}

	// Calculate pagination
	total := len(allInboxes)
	start := (page - 1) * limit
	end := start + limit

	if start >= total {
		start = total
		end = total
	} else if end > total {
		end = total
	}

	var paginatedInboxes []model.Inbox
	if start < end {
		paginatedInboxes = allInboxes[start:end]
	} else {
		paginatedInboxes = []model.Inbox{}
	}

	// Create response with owner information
	var inboxesWithOwnerInfo []gin.H
	for _, inbox := range paginatedInboxes {
		ownerInfo := gin.H{
			"id":           inbox.ID.String(),
			"name":         inbox.Name,
			"isPrivate":    inbox.IsPrivate,
			"requestCount": len(inbox.Requests),
		}

		if owner, exists := userMap[inbox.OwnerID]; exists {
			ownerInfo["ownerName"] = owner.Name
			ownerInfo["ownerEmail"] = owner.Email
		} else {
			ownerInfo["ownerName"] = "Unknown"
			ownerInfo["ownerEmail"] = "Unknown"
		}

		// Calculate last activity
		if len(inbox.Requests) > 0 {
			lastRequest := inbox.Requests[len(inbox.Requests)-1]
			ownerInfo["lastActivity"] = lastRequest.Timestamp
		} else {
			ownerInfo["lastActivity"] = inbox.Timestamp
		}

		inboxesWithOwnerInfo = append(inboxesWithOwnerInfo, ownerInfo)
	}

	response := struct {
		Inboxes []gin.H `json:"inboxes"`
		Total   int     `json:"total"`
		Page    int     `json:"page"`
		Limit   int     `json:"limit"`
	}{
		Inboxes: inboxesWithOwnerInfo,
		Total:   total,
		Page:    page,
		Limit:   limit,
	}

	c.JSON(http.StatusOK, response)
}
