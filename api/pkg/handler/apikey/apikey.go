package apikey

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jesusnoseq/request-inbox/pkg/database"
	"github.com/jesusnoseq/request-inbox/pkg/login"
	"github.com/jesusnoseq/request-inbox/pkg/model"
)

type APIKeyHandler struct {
	dao database.InboxDAO
}

func NewAPIKeyHandler(dao database.InboxDAO) *APIKeyHandler {
	return &APIKeyHandler{
		dao: dao,
	}
}

func (h *APIKeyHandler) CreateAPIKey(c *gin.Context) {
	if !login.IsUserLoggedIn(c) {
		c.AbortWithStatusJSON(model.NewUnauthorizedError())
		return
	}
	user, err := login.GetUser(c)
	if err != nil {
		c.AbortWithStatusJSON(model.ErrorResponseWithError("Could not retrieve user", err, http.StatusInternalServerError))
		return
	}

	apiKey, err := model.NewAPIKey(user.ID)
	if err != nil {
		c.AbortWithStatusJSON(model.ErrorResponseWithError("Failed to generate API key", err, http.StatusInternalServerError))
		return
	}
	aPIKeyParams := model.APIKey{}
	if err := c.ShouldBindJSON(&aPIKeyParams); err != nil {
		c.AbortWithStatusJSON(model.ErrorResponseWithError("invalid API key", err, http.StatusBadRequest))
		return
	}
	apiKey.Name = aPIKeyParams.Name
	apiKey.ExpiryDate = aPIKeyParams.ExpiryDate

	if err := h.dao.CreateAPIKey(c.Request.Context(), apiKey); err != nil {
		c.AbortWithStatusJSON(model.ErrorResponseWithError("Failed to save API key", err, http.StatusInternalServerError))
		return
	}

	c.JSON(http.StatusCreated, apiKey)
}

func (h *APIKeyHandler) GetAPIKey(c *gin.Context) {
	if !login.IsUserLoggedIn(c) {
		c.AbortWithStatusJSON(model.NewUnauthorizedError())
		return
	}

	user, err := login.GetUser(c)
	if err != nil {
		c.AbortWithStatusJSON(model.ErrorResponseWithError("Could not retrieve user", err, http.StatusInternalServerError))
		return
	}

	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.AbortWithStatusJSON(model.ErrorResponseWithError("invalid UUID", err, http.StatusBadRequest))
		return
	}

	apiKey, err := h.dao.GetAPIKey(c.Request.Context(), id)
	if err != nil || apiKey.OwnerID != user.ID {
		c.AbortWithStatusJSON(model.NewNotFoundError(model.APIKeyEntityName))
		return
	}

	c.JSON(http.StatusOK, apiKey)
}

func (h *APIKeyHandler) ListAPIKeysByUser(c *gin.Context) {
	if !login.IsUserLoggedIn(c) {
		c.AbortWithStatusJSON(model.NewUnauthorizedError())
		return
	}

	user, err := login.GetUser(c)
	if err != nil {
		c.AbortWithStatusJSON(model.ErrorResponseWithError("Could not retrieve user", err, http.StatusInternalServerError))
		return
	}

	apiKeys, err := h.dao.ListAPIKeyByUser(c.Request.Context(), user.ID)
	if err != nil {
		c.AbortWithStatusJSON(model.ErrorResponseWithError("Failed to list API keys", err, http.StatusInternalServerError))
		return
	}

	c.JSON(http.StatusOK, model.NewItemList(apiKeys))
}

func (h *APIKeyHandler) DeleteAPIKey(c *gin.Context) {
	if !login.IsUserLoggedIn(c) {
		c.AbortWithStatusJSON(model.NewUnauthorizedError())
		return
	}
	user, err := login.GetUser(c)
	if err != nil {
		c.AbortWithStatusJSON(model.ErrorResponseWithError("Could not retrieve user", err, http.StatusInternalServerError))
		return
	}

	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.AbortWithStatusJSON(model.ErrorResponseWithError("invalid UUID", err, http.StatusBadRequest))
		return
	}

	apiKey, err := h.dao.GetAPIKey(c.Request.Context(), id)
	if err != nil || apiKey.OwnerID != user.ID {
		c.AbortWithStatusJSON(model.NewNotFoundError(model.APIKeyEntityName))
		return
	}

	if err := h.dao.DeleteAPIKey(c.Request.Context(), id); err != nil {
		c.AbortWithStatusJSON(model.ErrorResponseWithError("Failed to delete API key", err, http.StatusInternalServerError))
		return
	}

	c.JSON(http.StatusNoContent, nil)
}
