package model_test

import (
	"reflect"
	"testing"

	"github.com/google/go-cmp/cmp"
	"github.com/jesusnoseq/request-inbox/pkg/model"
)

func TestGenerateInbox(t *testing.T) {

	t.Run("it should have random values", func(t *testing.T) {
		inbox := model.GenerateInbox()
		if hasEmptyField(t, inbox) {
			t.Errorf("Expected no empty fields in %+v", inbox)
		}
	})
	t.Run("each inbox should be different", func(t *testing.T) {
		if diff := cmp.Diff(model.GenerateInbox(), model.GenerateInbox()); diff == "" {
			t.Errorf("Diff() = %v, want %q", diff, "")
		}
	})
}

func TestGenerateRequest(t *testing.T) {
	t.Run("it should have specific ID and random values", func(t *testing.T) {
		req := model.GenerateRequest(20)
		if req.ID != 20 {
			t.Errorf("GenerateRequest(1).ID = %v, want %v", req.ID, 1)
		}

		if hasEmptyField(t, req) {
			t.Errorf("Expected no empty fields in %+v", req)
		}
	})
	t.Run("each request should be different", func(t *testing.T) {
		if diff := cmp.Diff(model.GenerateRequest(1), model.GenerateRequest(1)); diff == "" {
			t.Errorf("Diff() = %v, want %q", diff, "")
		}
	})
}

// hasEmptyField does not check empty vars inside slices, maps or arrays
func hasEmptyField(t *testing.T, structVar any) bool {
	t.Helper()

	v := reflect.ValueOf(structVar)

	if v.Kind() == reflect.Ptr {
		v = v.Elem()
	}

	if v.Kind() != reflect.Struct {
		panic("error input must be a struct or a pointer to a struct")
	}

	for i := 0; i < v.NumField(); i++ {
		field := v.Field(i)

		switch field.Kind() {
		case reflect.Int, reflect.Int64:
			if field.Int() == 0 {
				return true
			}
		case reflect.Map, reflect.Slice, reflect.Array:
			if field.Len() == 0 {
				return true
			}
		case reflect.String:
			if field.String() == "" {
				return true
			}
		case reflect.Ptr, reflect.Interface:
			if field.IsNil() {
				return true
			}
		case reflect.Struct:
			if field.IsZero() {
				return true
			}
		}
	}
	return false
}
