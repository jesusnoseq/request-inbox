package t_util

import (
	"encoding/json"
	"testing"
)

func MustJson(t *testing.T, payload any) []byte {
	t.Helper()
	b, err := json.Marshal(payload)
	if err != nil {
		panic(err)
	}
	return b
}
