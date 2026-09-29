package middleware

import (
	"context"
	"crypto/ecdsa"
	"crypto/ed25519"
	"crypto/elliptic"
	"crypto/rsa"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"math/big"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type contextKey string

const UserIDKey contextKey = "userId"

type UserClaims struct {
	jwt.RegisteredClaims
	Email     string `json:"email,omitempty"`
	Name      string `json:"name,omitempty"`
	SessionID string `json:"sessionId,omitempty"`
}

type rawJWK struct {
	Kty string `json:"kty"`
	Kid string `json:"kid"`
	Use string `json:"use"`
	Alg string `json:"alg"`
	N   string `json:"n"`
	E   string `json:"e"`
	Crv string `json:"crv"`
	X   string `json:"x"`
	Y   string `json:"y"`
}

type rawJWKS struct {
	Keys []rawJWK `json:"keys"`
}

// JWKSKeyStore caches public keys fetched from a JWKS endpoint.
type JWKSKeyStore struct {
	mu        sync.RWMutex
	jwksURL   string
	keys      map[string]any
	fetchedAt time.Time
	ttl       time.Duration
	client    *http.Client
}

// NewJWKSKeyStore creates a key store for the specified JWKS endpoint URL.
func NewJWKSKeyStore(jwksURL string) *JWKSKeyStore {
	return &JWKSKeyStore{
		jwksURL: jwksURL,
		keys:    make(map[string]any),
		ttl:     5 * time.Minute,
		client:  &http.Client{Timeout: 5 * time.Second},
	}
}

func (ks *JWKSKeyStore) GetKey(ctx context.Context, kid string) (any, error) {
	ks.mu.RLock()
	key, exists := ks.keys[kid]
	fresh := time.Since(ks.fetchedAt) < ks.ttl
	ks.mu.RUnlock()

	if exists && fresh {
		return key, nil
	}

	ks.mu.Lock()
	defer ks.mu.Unlock()

	// Double check after acquiring write lock
	if key, exists := ks.keys[kid]; exists && time.Since(ks.fetchedAt) < ks.ttl {
		return key, nil
	}

	if err := ks.refreshLocked(ctx); err != nil {
		if exists {
			// Fallback to expired key if refresh fails
			return key, nil
		}
		return nil, err
	}

	key, exists = ks.keys[kid]
	if !exists {
		// If kid is empty and there is only 1 key in the store, return it
		if kid == "" && len(ks.keys) == 1 {
			for _, k := range ks.keys {
				return k, nil
			}
		}
		return nil, fmt.Errorf("key with kid %q not found in JWKS", kid)
	}
	return key, nil
}

func (ks *JWKSKeyStore) refreshLocked(ctx context.Context) error {
	if ks.jwksURL == "" {
		return errors.New("JWKS URL is not configured")
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, ks.jwksURL, nil)
	if err != nil {
		return fmt.Errorf("create JWKS request: %w", err)
	}

	resp, err := ks.client.Do(req)
	if err != nil {
		return fmt.Errorf("fetch JWKS: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("JWKS request returned status %d", resp.StatusCode)
	}

	var jwks rawJWKS
	if err := json.NewDecoder(resp.Body).Decode(&jwks); err != nil {
		return fmt.Errorf("decode JWKS response: %w", err)
	}

	newKeys := make(map[string]any, len(jwks.Keys))
	for _, jwk := range jwks.Keys {
		pubKey, err := parseJWK(jwk)
		if err != nil {
			continue
		}
		if jwk.Kid != "" {
			newKeys[jwk.Kid] = pubKey
		}
		if len(newKeys) == 0 {
			newKeys["default"] = pubKey
		}
	}

	ks.keys = newKeys
	ks.fetchedAt = time.Now()
	return nil
}

func parseJWK(jwk rawJWK) (any, error) {
	switch jwk.Kty {
	case "RSA":
		nBytes, err := base64.RawURLEncoding.DecodeString(jwk.N)
		if err != nil {
			return nil, fmt.Errorf("decode RSA N: %w", err)
		}
		eBytes, err := base64.RawURLEncoding.DecodeString(jwk.E)
		if err != nil {
			return nil, fmt.Errorf("decode RSA E: %w", err)
		}
		var eInt int
		for _, b := range eBytes {
			eInt = (eInt << 8) | int(b)
		}
		return &rsa.PublicKey{
			N: new(big.Int).SetBytes(nBytes),
			E: eInt,
		}, nil

	case "OKP": // EdDSA / Ed25519
		xBytes, err := base64.RawURLEncoding.DecodeString(jwk.X)
		if err != nil {
			return nil, fmt.Errorf("decode OKP X: %w", err)
		}
		return ed25519.PublicKey(xBytes), nil

	case "EC":
		xBytes, err := base64.RawURLEncoding.DecodeString(jwk.X)
		if err != nil {
			return nil, fmt.Errorf("decode EC X: %w", err)
		}
		yBytes, err := base64.RawURLEncoding.DecodeString(jwk.Y)
		if err != nil {
			return nil, fmt.Errorf("decode EC Y: %w", err)
		}
		var curve elliptic.Curve
		switch jwk.Crv {
		case "P-256":
			curve = elliptic.P256()
		case "P-384":
			curve = elliptic.P384()
		case "P-521":
			curve = elliptic.P521()
		default:
			curve = elliptic.P256()
		}
		return &ecdsa.PublicKey{
			Curve: curve,
			X:     new(big.Int).SetBytes(xBytes),
			Y:     new(big.Int).SetBytes(yBytes),
		}, nil

	default:
		return nil, fmt.Errorf("unsupported JWK key type: %s", jwk.Kty)
	}
}

var (
	defaultKeyStoreMu sync.Mutex
	defaultKeyStore   *JWKSKeyStore
)

func getKeyStore(jwksURL string) *JWKSKeyStore {
	defaultKeyStoreMu.Lock()
	defer defaultKeyStoreMu.Unlock()
	if defaultKeyStore == nil || defaultKeyStore.jwksURL != jwksURL {
		defaultKeyStore = NewJWKSKeyStore(jwksURL)
	}
	return defaultKeyStore
}

// RequireAuth validates the Better Auth Bearer JWT token using JWKS when configured
// and falling back to BETTER_AUTH_SECRET HMAC.
func RequireAuth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		secretStr := os.Getenv("BETTER_AUTH_SECRET")
		jwksURL := os.Getenv("BETTER_AUTH_JWKS_URL")
		if jwksURL == "" {
			jwksURL = os.Getenv("JWKS_URL")
		}

		if secretStr == "" && jwksURL == "" {
			writeProblem(w, http.StatusInternalServerError, "Internal Server Error", "Authentication secret or JWKS URL is not configured on server")
			return
		}

		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			writeProblem(w, http.StatusUnauthorized, "Unauthorized", "Missing Authorization header")
			return
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") || strings.TrimSpace(parts[1]) == "" {
			writeProblem(w, http.StatusUnauthorized, "Unauthorized", "Invalid Authorization header format. Expected 'Bearer <token>'")
			return
		}

		tokenString := strings.TrimSpace(parts[1])

		claims := &UserClaims{}
		token, err := jwt.ParseWithClaims(tokenString, claims, func(t *jwt.Token) (any, error) {
			// 1. If HMAC token, verify with secret
			if _, ok := t.Method.(*jwt.SigningMethodHMAC); ok {
				if secretStr == "" {
					return nil, errors.New("HMAC token received but BETTER_AUTH_SECRET is not configured")
				}
				return []byte(secretStr), nil
			}

			// 2. If asymmetric token (RSA, ECDSA, Ed25519) and JWKS URL configured
			if jwksURL != "" {
				kid, _ := t.Header["kid"].(string)
				ks := getKeyStore(jwksURL)
				return ks.GetKey(r.Context(), kid)
			}

			return nil, fmt.Errorf("unexpected signing method: %v", t.Header["alg"])
		})

		if err != nil || !token.Valid {
			writeProblem(w, http.StatusUnauthorized, "Unauthorized", "Invalid or expired token")
			return
		}

		userID := claims.Subject
		if userID == "" {
			writeProblem(w, http.StatusUnauthorized, "Unauthorized", "Token missing subject identifier")
			return
		}

		ctx := context.WithValue(r.Context(), UserIDKey, userID)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// GetUserID extracts the user identifier from context if present.
func GetUserID(ctx context.Context) (string, bool) {
	userID, ok := ctx.Value(UserIDKey).(string)
	return userID, ok
}

func writeProblem(w http.ResponseWriter, status int, title, detail string) {
	w.Header().Set("Content-Type", "application/problem+json")
	w.WriteHeader(status)
	fmt.Fprintf(w, `{"status":%d,"title":%q,"detail":%q}`, status, title, detail)
}
