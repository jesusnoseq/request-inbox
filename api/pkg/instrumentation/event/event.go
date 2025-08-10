package event

type Event string

const (
	APIRequest     Event = "api_request"
	UserLogin      Event = "user_login"
	UserSignup     Event = "user_signup"
	CreateNewInbox Event = "create_new_inbox"
)

type TrackedEvent interface {
	GetEventType() Event
	GetUserID() string
	ToProperties() map[string]any
}

type BaseEvent struct {
	UserID string `json:"user_id"`
}

func (e BaseEvent) GetUserID() string {
	return e.UserID
}

type APIRequestEvent struct {
	BaseEvent
	Method     string `json:"method"`
	Endpoint   string `json:"endpoint"`
	StatusCode int    `json:"status_code"`
}

func (e APIRequestEvent) GetEventType() Event {
	return APIRequest
}

func (e APIRequestEvent) ToProperties() map[string]any {
	return map[string]any{
		"method":       e.Method,
		"$current_url": e.Endpoint,
		"status_code":  e.StatusCode,
		"user_id":      e.UserID,
	}
}

type UserLoginEvent struct {
	BaseEvent
	Provider string `json:"provider"`
	Success  bool   `json:"success"`
}

func (e UserLoginEvent) GetEventType() Event {
	return UserLogin
}

func (e UserLoginEvent) ToProperties() map[string]any {
	return map[string]any{
		"user_id":  e.UserID,
		"provider": e.Provider,
		"success":  e.Success,
	}
}

type UserSignupEvent struct {
	BaseEvent
	Provider string `json:"provider"`
}

func (e UserSignupEvent) GetEventType() Event {
	return UserSignup
}

func (e UserSignupEvent) ToProperties() map[string]any {
	return map[string]any{
		"user_id":  e.UserID,
		"provider": e.Provider,
	}
}

type CreateNewInboxEvent struct {
	BaseEvent
	InboxID string `json:"inbox_id"`
}

func (e CreateNewInboxEvent) GetEventType() Event {
	return CreateNewInbox
}

func (e CreateNewInboxEvent) ToProperties() map[string]any {
	return map[string]any{
		"user_id":  e.UserID,
		"inbox_id": e.InboxID,
	}
}
