package dynamic_response

import "github.com/tidwall/gjson"

func gjsonPath(jsonStr, path string) any {
	return gjson.Get(jsonStr, path).Value()
}

func gjsonPathOrDefault(jsonStr, path string, defaultValue any) any {
	val := gjson.Get(jsonStr, path).Value()
	if val == nil {
		return defaultValue
	}
	return val
}
