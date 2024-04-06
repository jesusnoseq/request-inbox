package dynamic_response

import (
	"crypto/rand"
	"encoding/binary"
	"encoding/hex"
	"log"
	"math"
	"math/big"

	"github.com/google/uuid"
)

func randomString(l int) string {
	buff := make([]byte, int(math.Ceil(float64(l)/2)))
	_, err := rand.Read(buff)
	if err != nil {
		log.Fatalf("Failed to generate random string: %v", err)
	}
	str := hex.EncodeToString(buff)
	return str[:l] // strip 1 extra character we get from odd length results
}

func randomInt(min, max int64) int64 {
	n, err := rand.Int(rand.Reader, big.NewInt(max-min+1))
	if err != nil {
		log.Fatalf("Failed to generate random int: %v", err)
	}
	return n.Int64() + min
}

func randomFloat(min, max float64) float64 {
	buff := make([]byte, 8)
	_, err := rand.Read(buff[:])
	if err != nil {
		log.Fatalf("Failed to generate random float: %v", err)
	}
	num := binary.LittleEndian.Uint64(buff[:])

	f := float64(num) / (1 << 64)

	return min + f*(max-min)
}

func randomBool() bool {
	n, err := rand.Int(rand.Reader, big.NewInt(2))
	if err != nil {
		log.Fatalf("Failed to generate random bool: %v", err)
	}
	return n.Int64() == 1
}

func randomUUID() string {
	return uuid.New().String()
}
