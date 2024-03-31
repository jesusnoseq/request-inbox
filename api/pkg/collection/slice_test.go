package collection

import (
	"reflect"
	"slices"
	"testing"
)

func TestSliceContains(t *testing.T) {
	testCases := []struct {
		name    string
		find    string
		in      []string
		wantOut bool
	}{
		{
			name:    "Does contains the element",
			find:    "b",
			in:      []string{"a", "b", "c"},
			wantOut: true,
		},
		{
			name:    "Does not contains the element",
			find:    "a",
			in:      []string{"b", "c", "d"},
			wantOut: false,
		},
		{
			name:    "Empty",
			find:    "",
			in:      []string{},
			wantOut: false,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			got := SliceContains(tc.in, tc.find)
			if tc.wantOut != got {
				t.Errorf("SliceContains(%v, %v) = %v, want %v", tc.in, tc.find, got, tc.wantOut)
			}
		})
	}
}

func TestSliceFormat(t *testing.T) {
	testCases := []struct {
		name      string
		in        []any
		format    string
		expectOut []string
	}{
		{
			name:      "Slice with elements and with basic and correct format",
			in:        SliceToAnySlice([]string{"a", "b", "c"}),
			format:    "%s",
			expectOut: []string{"a", "b", "c"},
		},
		{
			name:      "Slice with integer element and correct format",
			in:        SliceToAnySlice([]int{1, 2, 3}),
			format:    "-%d-",
			expectOut: []string{"-1-", "-2-", "-3-"},
		},
		{
			name:      "Slice with nil elements",
			in:        SliceToAnySlice([]*string{nil}),
			format:    "%v",
			expectOut: []string{"<nil>"},
		},
		{
			name:      "Slice with no elements",
			in:        SliceToAnySlice([]string{}),
			format:    "",
			expectOut: []string{},
		},
		{
			name:      "Slice with no format",
			in:        SliceToAnySlice([]string{"a"}),
			format:    "",
			expectOut: []string{"%!(EXTRA string=a)"},
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			got := SliceFormat(tc.in, tc.format)
			if !slices.Equal(tc.expectOut, got) {
				t.Errorf("SliceFormat(%v, %v) = %v, want %v", tc.in, tc.format, got, tc.expectOut)
			}
		})
	}
}

func TestCopySlice(t *testing.T) {
	testCases := []struct {
		name     string
		input    []int
		modifyFn func(*[]int)
		want     []int
	}{
		{
			name:  "Int slice unchanged after modify the copy",
			input: []int{1, 2, 3, 4},
			modifyFn: func(copy *[]int) {
				(*copy)[0] = 999
			},
			want: []int{1, 2, 3, 4},
		},
		{
			name:  "Empty slice",
			input: []int{},
			modifyFn: func(copy *[]int) {
				if len(*copy) > 0 {
					(*copy)[0] = 999
				}
			},
			want: []int{},
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			got := CopySlice(tc.input)
			if !reflect.DeepEqual(tc.input, got) {
				t.Errorf("Slice copy is equal, want %v, got %v", tc.input, got)
			}
			tc.modifyFn(&got)
			if !reflect.DeepEqual(tc.input, tc.want) {
				t.Errorf("Original slice was modified, want %v, got %v", tc.want, tc.input)
			}
			if len(tc.input) != len(got) {
				t.Errorf("Copied slice length differs, want %v, got %v", len(tc.input), len(got))
			}
		})
	}
}
