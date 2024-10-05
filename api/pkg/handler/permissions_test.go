package handler

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jesusnoseq/request-inbox/pkg/login"
	"github.com/jesusnoseq/request-inbox/pkg/model"
)

func TestCheckWriteInboxPermissions(t *testing.T) {
	tests := []struct {
		name           string
		setupContext   func(*gin.Context, *model.Inbox)
		inbox          model.Inbox
		expectedError  bool
		expectedStatus int
	}{
		{
			name:         "Inbox with no owner and user not logged should be allowed",
			setupContext: func(c *gin.Context, in *model.Inbox) {},
			inbox: model.Inbox{
				OwnerID:   uuid.Nil,
				IsPrivate: false,
			},
			expectedError:  false,
			expectedStatus: http.StatusOK,
		},
		{
			name:         "Inbox with owner and user not logged in should produce not found error if private",
			setupContext: func(c *gin.Context, in *model.Inbox) {},
			inbox: model.Inbox{
				OwnerID:   uuid.New(),
				IsPrivate: true,
			},
			expectedError:  true,
			expectedStatus: http.StatusNotFound,
		},
		{
			name:         "Public Inbox with owner and user not logged in should produce fobidden error",
			setupContext: func(c *gin.Context, in *model.Inbox) {},
			inbox: model.Inbox{
				OwnerID:   uuid.New(),
				IsPrivate: false,
			},
			expectedError:  true,
			expectedStatus: http.StatusForbidden,
		},
		{
			name: "Error getting logged user",
			setupContext: func(c *gin.Context, in *model.Inbox) {
				c.Set(login.USER_CONTEXT_KEY, "invalid user")
				c.Set(login.IS_LOGGED_IN_CONTEXT_KEY, true)
			},
			inbox: model.Inbox{
				OwnerID: uuid.New(),
			},
			expectedError:  true,
			expectedStatus: http.StatusInternalServerError,
		},
		{
			name: "User tries to modify another user's private inbox",
			setupContext: func(c *gin.Context, in *model.Inbox) {
				user := model.GenerateUser()
				c.Set(login.USER_CONTEXT_KEY, user)
				c.Set(login.IS_LOGGED_IN_CONTEXT_KEY, true)
			},
			inbox: model.Inbox{
				OwnerID:   uuid.New(),
				IsPrivate: true,
			},
			expectedError:  true,
			expectedStatus: http.StatusNotFound,
		},
		{
			name: "User tries to modify another user's public inbox should produce fobidden error",
			setupContext: func(c *gin.Context, in *model.Inbox) {
				user := model.GenerateUser()
				c.Set(login.USER_CONTEXT_KEY, user)
				c.Set(login.IS_LOGGED_IN_CONTEXT_KEY, true)
			},
			inbox: model.Inbox{
				OwnerID:   uuid.New(),
				IsPrivate: false,
			},
			expectedError:  true,
			expectedStatus: http.StatusForbidden,
		},
		{
			name: "User modifies own inbox",
			setupContext: func(c *gin.Context, in *model.Inbox) {
				user := model.GenerateUser()
				in.OwnerID = user.ID
				c.Set(login.USER_CONTEXT_KEY, user)
				c.Set(login.IS_LOGGED_IN_CONTEXT_KEY, true)
			},
			inbox:          model.Inbox{},
			expectedError:  false,
			expectedStatus: http.StatusOK,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			w := httptest.NewRecorder()
			c, _ := gin.CreateTestContext(w)

			tt.setupContext(c, &tt.inbox)

			err := checkWriteInboxPermissions(c, tt.inbox)

			if (err != nil) != tt.expectedError {
				t.Errorf("checkWriteInboxPermissions() error = %v, expectedError %v", err, tt.expectedError)
			}
			if w.Code != tt.expectedStatus {
				t.Errorf("checkWriteInboxPermissions() status code = %v, expected %v", w.Code, tt.expectedStatus)
			}
		})
	}
}

func TestCheckReadInboxPermissions(t *testing.T) {
	tests := []struct {
		name           string
		setupContext   func(*gin.Context, *model.Inbox)
		inbox          model.Inbox
		expectedError  bool
		expectedStatus int
	}{
		{
			name:         "Inbox with no owner and user not logged should be allowed",
			setupContext: func(c *gin.Context, in *model.Inbox) {},
			inbox: model.Inbox{
				OwnerID:   uuid.Nil,
				IsPrivate: false,
			},
			expectedError:  false,
			expectedStatus: http.StatusOK,
		},
		{
			name:         "Inbox with owner and user not logged in should produce not found error if private",
			setupContext: func(c *gin.Context, in *model.Inbox) {},
			inbox: model.Inbox{
				OwnerID:   uuid.New(),
				IsPrivate: true,
			},
			expectedError:  true,
			expectedStatus: http.StatusNotFound,
		},
		{
			name:         "Public Inbox with owner and user not logged in should be allowed",
			setupContext: func(c *gin.Context, in *model.Inbox) {},
			inbox: model.Inbox{
				OwnerID:   uuid.New(),
				IsPrivate: false,
			},
			expectedError:  false,
			expectedStatus: http.StatusOK,
		},
		{
			name: "Error getting logged user in a public inbox",
			setupContext: func(c *gin.Context, in *model.Inbox) {
				c.Set(login.USER_CONTEXT_KEY, "invalid user")
				c.Set(login.IS_LOGGED_IN_CONTEXT_KEY, true)
			},
			inbox: model.Inbox{
				OwnerID:   uuid.New(),
				IsPrivate: false,
			},
			expectedError:  false,
			expectedStatus: http.StatusOK,
		},
		{
			name: "Error getting logged user in a private inbox",
			setupContext: func(c *gin.Context, in *model.Inbox) {
				c.Set(login.USER_CONTEXT_KEY, "invalid user")
				c.Set(login.IS_LOGGED_IN_CONTEXT_KEY, true)
			},
			inbox: model.Inbox{
				OwnerID:   uuid.New(),
				IsPrivate: true,
			},
			expectedError:  true,
			expectedStatus: http.StatusInternalServerError,
		},
		{
			name: "User tries to read another user's private inbox",
			setupContext: func(c *gin.Context, in *model.Inbox) {
				user := model.GenerateUser()
				c.Set(login.USER_CONTEXT_KEY, user)
				c.Set(login.IS_LOGGED_IN_CONTEXT_KEY, true)
			},
			inbox: model.Inbox{
				OwnerID:   uuid.New(),
				IsPrivate: true,
			},
			expectedError:  true,
			expectedStatus: http.StatusNotFound,
		},
		{
			name: "User reads own inbox",
			setupContext: func(c *gin.Context, in *model.Inbox) {
				user := model.GenerateUser()
				in.OwnerID = user.ID
				c.Set(login.USER_CONTEXT_KEY, user)
				c.Set(login.IS_LOGGED_IN_CONTEXT_KEY, true)
			},
			inbox:          model.Inbox{},
			expectedError:  false,
			expectedStatus: http.StatusOK,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			w := httptest.NewRecorder()
			c, _ := gin.CreateTestContext(w)

			tt.setupContext(c, &tt.inbox)

			err := checkReadInboxPermissions(c, tt.inbox)

			if (err != nil) != tt.expectedError {
				t.Errorf("checkReadInboxPermissions() error = %v, expectedError %v", err, tt.expectedError)
			}
			if w.Code != tt.expectedStatus {
				t.Errorf("checkReadInboxPermissions() status code = %v, expected %v", w.Code, tt.expectedStatus)
			}
		})
	}
}
