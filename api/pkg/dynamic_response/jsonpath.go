package dynamic_response

import "github.com/tidwall/gjson"

func jsonPath(jsonStr, path string) any {
	return gjson.Get(jsonStr, path).Value()
}

func jsonPathOrDefault(jsonStr, path string, defaultValue any) any {
	val := gjson.Get(jsonStr, path).Value()
	if val == nil {
		return defaultValue
	}
	return val
}
