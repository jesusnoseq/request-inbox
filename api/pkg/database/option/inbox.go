package option

import (
	"strings"

	"github.com/jesusnoseq/request-inbox/pkg/collection"
)

type InAttr string

const (
	OpID InAttr = "id"
)

type ListInboxOptions struct {
	Projection *string
}

type ListInboxOption func(*ListInboxOptions)

func WithProjection(attrs []InAttr) ListInboxOption {
	return func(opts *ListInboxOptions) {
		s := strings.Join(collection.SliceFormat(attrs, "%s"), ", ")
		opts.Projection = &s
	}
}
