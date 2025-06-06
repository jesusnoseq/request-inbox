// Code generated by MockGen. DO NOT EDIT.
// Source: github.com/jesusnoseq/request-inbox/pkg/login (interfaces: ILoginHandler)

// Package login_mock is a generated GoMock package.
package login_mock

import (
	reflect "reflect"

	gin "github.com/gin-gonic/gin"
	gomock "github.com/golang/mock/gomock"
)

// MockILoginHandler is a mock of ILoginHandler interface.
type MockILoginHandler struct {
	ctrl     *gomock.Controller
	recorder *MockILoginHandlerMockRecorder
}

// MockILoginHandlerMockRecorder is the mock recorder for MockILoginHandler.
type MockILoginHandlerMockRecorder struct {
	mock *MockILoginHandler
}

// NewMockILoginHandler creates a new mock instance.
func NewMockILoginHandler(ctrl *gomock.Controller) *MockILoginHandler {
	mock := &MockILoginHandler{ctrl: ctrl}
	mock.recorder = &MockILoginHandlerMockRecorder{mock}
	return mock
}

// EXPECT returns an object that allows the caller to indicate expected use.
func (m *MockILoginHandler) EXPECT() *MockILoginHandlerMockRecorder {
	return m.recorder
}

// HandleCallback mocks base method.
func (m *MockILoginHandler) HandleCallback(arg0 *gin.Context) {
	m.ctrl.T.Helper()
	m.ctrl.Call(m, "HandleCallback", arg0)
}

// HandleCallback indicates an expected call of HandleCallback.
func (mr *MockILoginHandlerMockRecorder) HandleCallback(arg0 interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "HandleCallback", reflect.TypeOf((*MockILoginHandler)(nil).HandleCallback), arg0)
}

// HandleDeleteLoginUser mocks base method.
func (m *MockILoginHandler) HandleDeleteLoginUser(arg0 *gin.Context) {
	m.ctrl.T.Helper()
	m.ctrl.Call(m, "HandleDeleteLoginUser", arg0)
}

// HandleDeleteLoginUser indicates an expected call of HandleDeleteLoginUser.
func (mr *MockILoginHandlerMockRecorder) HandleDeleteLoginUser(arg0 interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "HandleDeleteLoginUser", reflect.TypeOf((*MockILoginHandler)(nil).HandleDeleteLoginUser), arg0)
}

// HandleLogin mocks base method.
func (m *MockILoginHandler) HandleLogin(arg0 *gin.Context) {
	m.ctrl.T.Helper()
	m.ctrl.Call(m, "HandleLogin", arg0)
}

// HandleLogin indicates an expected call of HandleLogin.
func (mr *MockILoginHandlerMockRecorder) HandleLogin(arg0 interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "HandleLogin", reflect.TypeOf((*MockILoginHandler)(nil).HandleLogin), arg0)
}

// HandleLoginUser mocks base method.
func (m *MockILoginHandler) HandleLoginUser(arg0 *gin.Context) {
	m.ctrl.T.Helper()
	m.ctrl.Call(m, "HandleLoginUser", arg0)
}

// HandleLoginUser indicates an expected call of HandleLoginUser.
func (mr *MockILoginHandlerMockRecorder) HandleLoginUser(arg0 interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "HandleLoginUser", reflect.TypeOf((*MockILoginHandler)(nil).HandleLoginUser), arg0)
}

// HandleLogout mocks base method.
func (m *MockILoginHandler) HandleLogout(arg0 *gin.Context) {
	m.ctrl.T.Helper()
	m.ctrl.Call(m, "HandleLogout", arg0)
}

// HandleLogout indicates an expected call of HandleLogout.
func (mr *MockILoginHandlerMockRecorder) HandleLogout(arg0 interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "HandleLogout", reflect.TypeOf((*MockILoginHandler)(nil).HandleLogout), arg0)
}
