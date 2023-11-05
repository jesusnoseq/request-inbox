package embedded

import (
	"bytes"
	"encoding/gob"
	"fmt"

	"github.com/jesusnoseq/request-inbox/pkg/model"
)

func encode(inbox model.Inbox) ([]byte, error) {
	var buffer bytes.Buffer
	encoder := gob.NewEncoder(&buffer)
	err := encoder.Encode(inbox)
	if err != nil {
		return nil, err
	}
	return buffer.Bytes(), nil
}

func decode(b []byte) (model.Inbox, error) {
	decoder := gob.NewDecoder(bytes.NewReader(b))
	var inbox model.Inbox
	err := decoder.Decode(&inbox)
	if err != nil {
		return model.Inbox{}, fmt.Errorf("error decoding inbox: %w", err)
	}
	return inbox, nil
}
