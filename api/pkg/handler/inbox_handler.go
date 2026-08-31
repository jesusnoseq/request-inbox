package handler

import (
	"github.com/jesusnoseq/request-inbox/pkg/database"
	"github.com/jesusnoseq/request-inbox/pkg/instrumentation/event"
)

type inboxHandler struct {
	dao database.Repository
	et  event.EventTracker
}

func NewInboxHandler(dao database.Repository, et event.EventTracker) InboxController {
	return &inboxHandler{
		dao: dao,
		et:  et,
	}
}
