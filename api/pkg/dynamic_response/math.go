package dynamic_response

import "strconv"

func intAdd(a, b int) int {
	return a + b
}

func intSubtract(a, b int) int {
	return a - b
}

func stringToInt(s string) int {
	n, _ := strconv.Atoi(s)
	return n
}
