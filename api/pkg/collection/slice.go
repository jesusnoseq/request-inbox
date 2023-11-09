package collection

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
