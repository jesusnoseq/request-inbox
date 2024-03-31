package collection

func CopySimpleMap[K comparable, V any](m map[K]V) map[K]V {
	copiedMap := make(map[K]V, len(m))
	for key, value := range m {
		copiedMap[key] = value
	}
	return copiedMap
}

func CopySliceMap[K comparable, V any](m map[K][]V) map[K][]V {
	copiedMap := make(map[K][]V, len(m))
	for key, slice := range m {
		copiedMap[key] = CopySlice(slice)
	}
	return copiedMap
}
