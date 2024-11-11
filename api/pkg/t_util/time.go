package t_util

import (
	"testing"
	"time"
)

func AssertTimeDiffFromNow(t *testing.T, inputTime time.Time, expectedDiff time.Duration, tolerance time.Duration) {
	t.Helper()

	currentTime := time.Now()
	diff := inputTime.Sub(currentTime)

	if diff < expectedDiff-tolerance || diff > expectedDiff+tolerance {
		t.Fatalf("Expected time difference was %v, but got %v. The input time was %v, and the current time is %v", expectedDiff, diff, inputTime, currentTime)
	}
}
