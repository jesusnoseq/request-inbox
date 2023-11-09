package model_test

import (
	"testing"

	"github.com/google/go-cmp/cmp"
	"github.com/jesusnoseq/request-inbox/pkg/model"
)

func TestBuildSimpleErrorResponse(t *testing.T) {
	status, errResp := model.ErrorResponseMsg("msg", 404)
	expected := model.ErrorResponse{Code: 404, Message: "msg", Details: nil}
	if status != expected.Code {
		t.Errorf("got status = %v, expected %v", status, expected.Code)
	}
	if diff := cmp.Diff(errResp, expected); diff != "" {
		t.Errorf("Diff(errResp, expected) = %v, expected to be equals", diff)
	}
}
