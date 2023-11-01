package embedded

import (
	"context"
	"testing"
)

func TestNewInboxDB(t *testing.T) {
	ctx := context.Background()

	testCases := []struct {
		desc        string
		path        string
		memoryOnly  bool
		expectedErr bool
	}{
		{desc: "Valid path, not in-memory", path: "/tmp/db1", memoryOnly: false, expectedErr: false},
		{desc: "Valid path, in-memory", path: "/tmp/db1", memoryOnly: true, expectedErr: true},
		{desc: "Empty path, expect error", path: "", memoryOnly: false, expectedErr: true},
		{desc: "Empty path, in-memory", path: "", memoryOnly: true, expectedErr: false},
	}

	for _, tc := range testCases {
		t.Run(tc.desc, func(t *testing.T) {
			inboxDB, err := NewInboxDB(tc.path, tc.memoryOnly)
			defer func() {
				inboxDB.Close(ctx)
			}()
			if tc.expectedErr {
				if err == nil {
					t.Errorf("Expected an error but got nil.")
				}
			} else {
				if inboxDB == nil {
					t.Errorf("Expected a non-nil InboxDB instance.")
				}
			}
		})
	}
}
