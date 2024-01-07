package collection

import "fmt"

func SliceContains[T comparable](s []T, e T) bool {
	for _, a := range s {
		if a == e {
			return true
		}
	}
	return false
}

type EqualsFunc func(a any, b any) bool

func SliceOfAnyContains[T any](s []T, e T, equals EqualsFunc) bool {
	for _, a := range s {
		if equals(a, e) {
			return true
		}
	}
	return false
}

func SliceToAnySlice[T any](input []T) []any {
	s := make([]any, len(input))
	for i, v := range input {
		s[i] = v
	}
	return s
}

func SliceFormat[T any](s []T, format string) []string {
	sf := make([]string, len(s))
	for i, v := range s {
		sf[i] = fmt.Sprintf(format, v)
	}
	return sf
}
