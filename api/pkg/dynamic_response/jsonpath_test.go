package dynamic_response

import (
	"fmt"
	"testing"
)

const correctJsonData = `{
	"store": {
		"book": [
			{"category": "reference", "author": "Nigel Rees", "title": "Sayings of the Century", "price": 8.95},
			{"category": "fiction", "author": "Evelyn Waugh", "title": "Sword of Honour", "price": 12.99}
		],
		"bicycle": {"color": "red", "price": 19.95}
	},
	"expensive": 10
}`

func TestJsonPath(t *testing.T) {
	malformedJsonData := `{"akey": "found",{}`

	testCases := []struct {
		desc        string
		jsonData    string
		jsonPath    string
		expectValue any
	}{
		{desc: "Search string", jsonData: correctJsonData, jsonPath: "store.bicycle.color", expectValue: "red"},
		{desc: "Search number", jsonData: correctJsonData, jsonPath: "expensive", expectValue: float64(10)},
		{desc: "Search non-existing key in a malformed json", jsonData: malformedJsonData, jsonPath: "nofoundK", expectValue: nil},
		{desc: "Search existing key in a malformed json", jsonData: malformedJsonData, jsonPath: "akey", expectValue: "found"},
		{desc: "Search array", jsonData: correctJsonData, jsonPath: "store.book.#.category", expectValue: []any{"reference", "fiction"}},
	}

	for _, tc := range testCases {
		t.Run(tc.desc, func(t *testing.T) {
			got := jsonPath(tc.jsonData, tc.jsonPath)
			if fmt.Sprintf("%v %T", got, got) != fmt.Sprintf("%v %T", tc.expectValue, tc.expectValue) {
				t.Errorf("Expected %v of type %T, got %v of type %T", tc.expectValue, tc.expectValue, got, got)
			}
		})
	}
}

func TestJsonPathDefault(t *testing.T) {
	testCases := []struct {
		desc         string
		jsonData     string
		jsonPath     string
		defaultValue any
		expectValue  any
	}{
		{desc: "Found", jsonData: correctJsonData, jsonPath: "store.bicycle.color", defaultValue: "blue", expectValue: "red"},
		{desc: "Not found", jsonData: correctJsonData, jsonPath: "notExistingKey", defaultValue: "blue", expectValue: "blue"},
	}

	for _, tc := range testCases {
		t.Run(tc.desc, func(t *testing.T) {
			got := jsonPathOrDefault(tc.jsonData, tc.jsonPath, tc.defaultValue)
			if got != tc.expectValue {
				t.Errorf("Expected %v of type %T, got %v of type %T", tc.expectValue, tc.expectValue, got, got)
			}
		})
	}
}
