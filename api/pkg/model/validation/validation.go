package validation

type ValidationError struct {
	message string
}

func (e *ValidationError) Error() string {
	return e.message
}

func IsHTTPStatusCode(code int) (bool, error) {
	if code < 100 || code > 999 {
		return false, &ValidationError{message: "Status code should be an intenger between 100 and 999"}
	}
	return true, nil
}
