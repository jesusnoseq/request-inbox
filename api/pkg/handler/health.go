package handler

import (
	"github.com/gin-gonic/gin"
	"github.com/jesusnoseq/request-inbox/pkg/config"
)

type State string

const (
	Pass State = "pass" // up
	Fail State = "fail" // down
	Warn State = "warn" // healthy, with some concerns
)

func (ih *InboxHandler) Health(c *gin.Context) {
	c.Header("Content-Type", "application/health+json; charset=utf-8")
	c.JSON(200, gin.H{
		"status":    Pass,
		"version":   "0.2",
		"snapshot":  config.GetString(config.SnapshotVersion),
		"embededDB": (config.GetString(config.DBEngine) == config.DBEngineBadger),
	})
}
