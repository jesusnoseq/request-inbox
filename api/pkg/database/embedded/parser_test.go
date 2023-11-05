package embedded

import (
	"testing"

	"github.com/google/go-cmp/cmp"
	"github.com/jesusnoseq/request-inbox/pkg/model"
)

func TestEncodeDecode(t *testing.T) {
	inbox := model.GenerateInbox()

	encoded, encodeErr := encode(inbox)
	if encodeErr != nil {
		t.Errorf("Error encoding: %v", encodeErr)
	}

	decoded, decodeErr := decode(encoded)
	if decodeErr != nil {
		t.Errorf("Error decoding: %v", decodeErr)
	}

	if diff := cmp.Diff(inbox, decoded); diff != "" {
		t.Errorf("Expected inbox and decoded to be equals but we got differences: %s", diff)
	}
}
