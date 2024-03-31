package dynamic_response

import (
	"regexp"
	"testing"
)

func TestCurrentTimestampSeconds(t *testing.T) {
	if currentTimestampSeconds() <= 0 {
		t.Errorf("Expected a positive Timestamp")
	}
}

func TestNow(t *testing.T) {
	re := regexp.MustCompile(`^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$`)
	if !re.MatchString(now()) {
		t.Errorf("Expected date time format")
	}
}

func TestToday(t *testing.T) {
	re := regexp.MustCompile(`^\d{4}-\d{2}-\d{2}$`)
	if !re.MatchString(today()) {
		t.Errorf("Expected date format")
	}
}
