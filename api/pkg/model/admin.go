package model

// ChartPoint represents a data point in time series charts
type ChartPoint struct {
	Date  string `json:"date"`
	Count int    `json:"count"`
}

// RoleCount represents count by role
type RoleCount struct {
	Role  string `json:"role"`
	Count int    `json:"count"`
}

// AdminDashboardStats represents the dashboard statistics
type AdminDashboardStats struct {
	TotalUsers    int `json:"totalUsers"`
	TotalInboxes  int `json:"totalInboxes"`
	TotalRequests int `json:"totalRequests"`
	ActiveUsers   int `json:"activeUsers"`
}

// AdminChartData represents chart data for the dashboard
type AdminChartData struct {
	UserRegistrations []ChartPoint `json:"userRegistrations"`
	InboxCreations    []ChartPoint `json:"inboxCreations"`
	UserRoles         []RoleCount  `json:"userRoles"`
}
