package model

type Callback struct {
	IsEnabled bool `dynamodbav:"enabled"`
	IsDynamic bool `dynamodbav:"isDynamic"`
	// PrefixURL string            `dynamodbav:"prefixURL"`
	ToURL               string            `dynamodbav:"toURL"`
	Method              string            `dynamodbav:"method"`
	Headers             map[string]string `dynamodbav:"headers"`
	Body                string            `dynamodbav:"body"`
	IsForwardingHeaders bool              `dynamodbav:"isForwardingHeaders"`
}

type CallbackResponse struct {
	URL    string
	Method string
	Error  string
	// response fields
	Code         int
	CodeTemplate string
	Body         string
	Headers      map[string]string
}

func NewCallback() Callback {
	return Callback{
		IsEnabled: false,
		IsDynamic: false,
		Method:    "",
		ToURL:     "",
		// PrefixURL: "",
		Headers:             map[string]string{},
		Body:                "",
		IsForwardingHeaders: false,
	}
}
