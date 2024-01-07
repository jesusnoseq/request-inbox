package errors

import (
	e "errors"
)

// ErrNotFound is returned when an item is not found in the database
var ErrNotFound = e.New("item not found")
