package collection

import (
	"reflect"
	"testing"
)

func TestCopySimpleMap(t *testing.T) {
	testCases := []struct {
		name     string
		input    map[string]int
		modifyFn func(map[string]int)
		want     map[string]int
	}{
		{
			name:  "Map unchanged after copy modification",
			input: map[string]int{"a": 1, "b": 2},
			modifyFn: func(copy map[string]int) {
				copy["a"] = 999
				copy["c"] = 3
			},
			want: map[string]int{"a": 1, "b": 2},
		},
		{
			name:  "Empty map",
			input: map[string]int{},
			modifyFn: func(copy map[string]int) {
				copy["newKey"] = 1
			},
			want: map[string]int{},
		},
	}
	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			got := CopySimpleMap(tc.input)
			if !reflect.DeepEqual(tc.input, got) {
				t.Errorf("Slice copy is equal, want %v, got %v", tc.input, got)
			}
			tc.modifyFn(got)
			if !reflect.DeepEqual(tc.input, tc.want) {
				t.Errorf("%s failed: Original map was modified, want %v, got %v", tc.name, tc.want, tc.input)
			}
		})
	}
}

func TestCopySliceMap(t *testing.T) {
	testCases := []struct {
		name     string
		input    map[string][]int
		modifyFn func(map[string][]int)
		want     map[string][]int
	}{
		{
			name:  "Map with slice values unchanged after copy modification",
			input: map[string][]int{"a": {1, 2, 3}, "b": {4, 5, 6}},
			modifyFn: func(copy map[string][]int) {
				copy["a"][0] = 999
				copy["c"] = []int{7, 8, 9}
			},
			want: map[string][]int{"a": {1, 2, 3}, "b": {4, 5, 6}},
		},
		{
			name:  "Empty map",
			input: map[string][]int{},
			modifyFn: func(copy map[string][]int) {
				copy["newKey"] = []int{1, 2, 3}
			},
			want: map[string][]int{},
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			got := CopySliceMap(tc.input)
			if !reflect.DeepEqual(tc.input, got) {
				t.Errorf("Slice copy is equal, want %v, got %v", tc.input, got)
			}
			tc.modifyFn(got)
			if !reflect.DeepEqual(tc.input, tc.want) {
				t.Errorf("Original map was modified, want %v, got %v", tc.want, tc.input)
			}
			for key, slice := range tc.input {
				if len(slice) != len(got[key]) {
					t.Errorf("Copied map slice length differs for key %v, want %v, got %v", key, len(slice), len(got[key]))
				}
			}
		})
	}
}
