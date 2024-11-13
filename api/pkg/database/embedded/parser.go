package embedded

import (
	"bytes"
	"encoding/gob"
	"fmt"

	"github.com/jesusnoseq/request-inbox/pkg/model"
)

func encode[T model.Inbox | model.User | model.APIKey](inbox T) ([]byte, error) {
	var buffer bytes.Buffer
	encoder := gob.NewEncoder(&buffer)
	err := encoder.Encode(inbox)
	if err != nil {
		return nil, err
	}
	return buffer.Bytes(), nil
}

func decode[T model.Inbox | model.User | model.APIKey](b []byte) (T, error) {
	decoder := gob.NewDecoder(bytes.NewReader(b))
	var inbox T
	err := decoder.Decode(&inbox)
	if err != nil {
		return inbox, fmt.Errorf("error decoding inbox: %w", err)
	}
	return inbox, nil
}
