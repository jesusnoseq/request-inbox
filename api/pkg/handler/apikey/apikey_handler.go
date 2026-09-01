package apikey

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jesusnoseq/request-inbox/pkg/database"
	"github.com/jesusnoseq/request-inbox/pkg/instrumentation"
	"github.com/jesusnoseq/request-inbox/pkg/login"
	"github.com/jesusnoseq/request-inbox/pkg/model"
)

type apiKeyHandler struct {
	dao database.Repository
}

func NewAPIKeyHandler(dao database.Repository) APIKeyController {
	return &apiKeyHandler{
		dao: dao,
	}
}

func requireLoggedInUser(c *gin.Context) (model.User, bool) {
	if !login.IsUserLoggedIn(c) {
		c.AbortWithStatusJSON(model.NewUnauthorizedError())
		return model.User{}, false
	}
	user, err := login.GetUser(c)
	if err != nil {
		instrumentation.LogError(c, err, "error getting user")
		c.AbortWithStatusJSON(model.ErrorResponseWithError("Could not retrieve user", err, http.StatusInternalServerError))
		return model.User{}, false
	}
	return user, true
}

func parseAPIKeyID(c *gin.Context) (uuid.UUID, bool) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.AbortWithStatusJSON(model.ErrorResponseWithError("invalid UUID", err, http.StatusBadRequest))
		return uuid.UUID{}, false
	}
	return id, true
}

func (h *apiKeyHandler) fetchOwnedAPIKey(c *gin.Context, id uuid.UUID, owner uuid.UUID) (model.APIKey, bool) {
	apiKey, err := h.dao.GetAPIKey(c.Request.Context(), id)
	if err != nil || apiKey.OwnerID != owner {
		instrumentation.LogError(c, err, "error getting API key")
		c.AbortWithStatusJSON(model.NewNotFoundError(model.APIKeyEntityName))
		return model.APIKey{}, false
	}
	return apiKey, true
}

func (h *apiKeyHandler) CreateAPIKey(c *gin.Context) {
	user, ok := requireLoggedInUser(c)
	if !ok {
		return
	}
	if login.IsLoggedWithAPIKey(c) {
		c.AbortWithStatusJSON(model.ErrorResponseMsg("API keys cannot create other API keys", http.StatusForbidden))
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

func (h *apiKeyHandler) GetAPIKey(c *gin.Context) {
	user, ok := requireLoggedInUser(c)
	if !ok {
		return
	}

	id, ok := parseAPIKeyID(c)
	if !ok {
		return
	}

	apiKey, ok := h.fetchOwnedAPIKey(c, id, user.ID)
	if !ok {
		return
	}

	c.JSON(http.StatusOK, apiKey.WithMaskedKey())
}

func (h *apiKeyHandler) ListAPIKeysByUser(c *gin.Context) {
	user, ok := requireLoggedInUser(c)
	if !ok {
		return
	}

	apiKeys, err := h.dao.ListAPIKeyByUser(c.Request.Context(), user.ID)
	if err != nil {
		instrumentation.LogError(c, err, "error getting list of api keys")
		c.AbortWithStatusJSON(model.ErrorResponseWithError("Failed to list API keys", err, http.StatusInternalServerError))
		return
	}

	maskedAPIKeys := make([]model.APIKey, len(apiKeys))
	for i, apiKey := range apiKeys {
		maskedAPIKeys[i] = apiKey.WithMaskedKey()
	}

	c.JSON(http.StatusOK, model.NewItemList(maskedAPIKeys))
}

func (h *apiKeyHandler) DeleteAPIKey(c *gin.Context) {
	user, ok := requireLoggedInUser(c)
	if !ok {
		return
	}

	id, ok := parseAPIKeyID(c)
	if !ok {
		return
	}

	if _, ok := h.fetchOwnedAPIKey(c, id, user.ID); !ok {
		return
	}

	if err := h.dao.DeleteAPIKey(c.Request.Context(), id); err != nil {
		c.AbortWithStatusJSON(model.ErrorResponseWithError("Failed to delete API key", err, http.StatusInternalServerError))
		return
	}

	c.JSON(http.StatusNoContent, nil)
}
