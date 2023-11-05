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

func DetailedErrorResponse(message string, code int, details []ErrorDetail) (int, ErrorResponse) {
	return code, ErrorResponse{
		Code:    code,
		Message: message,
		Details: details,
	}
}

func ErrorResponseMsg(message string, code int) (int, ErrorResponse) {
	return code, ErrorResponse{
		Code:    code,
		Message: message,
	}
}

func ErrorResponseWithError(msg string, err error, code int) (int, ErrorResponse) {
	return code, ErrorResponse{
		Code:    code,
		Message: msg + ": " + err.Error(),
	}
}

func ErrorResponseFromError(err error, code int) (int, ErrorResponse) {
	return code, ErrorResponse{
		Code:    code,
		Message: err.Error(),
	}
}
