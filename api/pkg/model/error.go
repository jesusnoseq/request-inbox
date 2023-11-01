package model

type ErrorDetail struct {
	Field   string `json:"field"`
	Code    string `json:"code"`
	Message string `json:"message"`
}

type ErrorResponse struct {
	Code    int           `json:"code"`
	Message string        `json:"message"`
	Details []ErrorDetail `json:"details,omitempty"`
}

func BuildSimpleErrorResponse(message string, code int) ErrorResponse {
	return ErrorResponse{
		Code:    code,
		Message: message,
	}
}
