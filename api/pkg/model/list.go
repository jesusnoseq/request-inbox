package model

type ItemList[T any] struct {
	Count   int `json:"count"`
	Results []T `json:"results"`
}

func NewItemList[T any](l []T) ItemList[T] {
	return ItemList[T]{
		Count:   len(l),
		Results: l,
	}
}
