package dynamic_response

import "time"

func currentTimestampSeconds() int64 {
	return time.Now().Unix()
}

func now() string {
	return time.Now().Format("2006-01-02 15:04:05")
}

func today() string {
	return time.Now().Format("2006-01-02")
}
