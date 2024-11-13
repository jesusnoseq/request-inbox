package validation

import (
	"fmt"

	"github.com/jesusnoseq/request-inbox/pkg/model"
)

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

func IsAPIKey(code string) (bool, error) {
	if len(code) != model.API_KEY_SIZE {
		return false, &ValidationError{message: fmt.Sprintf("API Key should be %d lenght", model.API_KEY_SIZE)}
	}
	return true, nil
}
