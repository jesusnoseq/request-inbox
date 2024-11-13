package handler

import (
	"errors"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jesusnoseq/request-inbox/pkg/login"
	"github.com/jesusnoseq/request-inbox/pkg/model"
)

func checkWriteInboxPermissions(c *gin.Context, inbox model.Inbox) error {
	if inbox.OwnerID == uuid.Nil {
		return nil
	}
	notFoundStatusCode, notFoundErr := model.ErrorResponseFromError(errors.New(notFoundMessage), http.StatusNotFound)
	forbbidenstatusCode, forbbidenErr := model.ErrorResponseFromError(errors.New(notAllowedMessage), http.StatusForbidden)
	if !login.IsUserLoggedIn(c) {
		if inbox.IsPrivate {
			c.AbortWithStatusJSON(notFoundStatusCode, notFoundErr)
		} else {
			c.AbortWithStatusJSON(forbbidenstatusCode, forbbidenErr)
		}
		return fmt.Errorf("not logged user tries to write in another user inbox %s", inbox.ID.String())
	}
	user, err := login.GetUser(c)
	if err != nil {
		c.AbortWithStatusJSON(model.ErrorResponseFromError(err, http.StatusInternalServerError))
		return errors.New("error getting logged user")
	}
	if user.ID != inbox.OwnerID {
		if inbox.IsPrivate {
			c.AbortWithStatusJSON(notFoundStatusCode, notFoundErr)
		} else {
			c.AbortWithStatusJSON(forbbidenstatusCode, forbbidenErr)
		}
		return fmt.Errorf("logged %s user tries to modify another user inbox %s", user.ID.String(), inbox.ID.String())
	}
	return nil
}

func checkReadInboxPermissions(c *gin.Context, inbox model.Inbox) error {
	if inbox.OwnerID == uuid.Nil || !inbox.IsPrivate {
		return nil
	}
	statusCode, notFoundErr := model.ErrorResponseFromError(errors.New(notFoundMessage), http.StatusNotFound)
	if !login.IsUserLoggedIn(c) {
		c.AbortWithStatusJSON(statusCode, notFoundErr)
		return fmt.Errorf("not logged user tries to write in another user inbox %s", inbox.ID.String())
	}
	user, err := login.GetUser(c)
	if err != nil {
		c.AbortWithStatusJSON(model.ErrorResponseFromError(err, http.StatusInternalServerError))
		return errors.New("error getting logged user")
	}
	if user.ID != inbox.OwnerID {
		c.AbortWithStatusJSON(statusCode, notFoundErr)
		return fmt.Errorf("logged %s user tries to read another user private inbox %s", user.ID.String(), inbox.ID.String())
	}
	return nil
}
