package t_util

import (
	"testing"

	"github.com/jesusnoseq/request-inbox/pkg/collection"
)

func AssertSliceContains[T any](t *testing.T, slice []T, item T, equals collection.EqualsFunc[T]) {
	t.Helper()

	if !collection.SliceOfAnyContains(slice, item, equals) {
		t.Errorf("Slice does not contains %v", item)
	}
}
