package middleware_test

import (
	"crypto/rand"
	"crypto/rsa"
	"encoding/base64"
	"encoding/json"
	"math/big"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/samSRaina/kizen/internal/middleware"
)

func TestRequireAuth(t *testing.T) {
	const secret = "test-super-secret-key-32-chars-long!"
	os.Setenv("BETTER_AUTH_SECRET", secret)
	defer os.Unsetenv("BETTER_AUTH_SECRET")

	nextHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		userID, ok := middleware.GetUserID(r.Context())
		if !ok || userID == "" {
			http.Error(w, "missing user id in context", http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("user:" + userID))
	})

	handler := middleware.RequireAuth(nextHandler)

	t.Run("missing authorization header", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/workspaces", nil)
		rec := httptest.NewRecorder()

		handler.ServeHTTP(rec, req)
		if rec.Code != http.StatusUnauthorized {
			t.Errorf("expected 401, got %d", rec.Code)
		}
	})

	t.Run("malformed authorization header without spaces does not panic", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/workspaces", nil)
		req.Header.Set("Authorization", "InvalidHeader")
		rec := httptest.NewRecorder()

		handler.ServeHTTP(rec, req)
		if rec.Code != http.StatusUnauthorized {
			t.Errorf("expected 401, got %d", rec.Code)
		}
	})

	t.Run("invalid token returns 401", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/workspaces", nil)
		req.Header.Set("Authorization", "Bearer invalid.jwt.token")
		rec := httptest.NewRecorder()

		handler.ServeHTTP(rec, req)
		if rec.Code != http.StatusUnauthorized {
			t.Errorf("expected 401, got %d", rec.Code)
		}
	})

	t.Run("valid token injects user id", func(t *testing.T) {
		claims := &middleware.UserClaims{
			RegisteredClaims: jwt.RegisteredClaims{
				Subject:   "usr_123456",
				ExpiresAt: jwt.NewNumericDate(time.Now().Add(1 * time.Hour)),
			},
			Email: "test@example.com",
		}
		token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
		tokenString, err := token.SignedString([]byte(secret))
		if err != nil {
			t.Fatalf("failed to sign token: %v", err)
		}

		req := httptest.NewRequest(http.MethodGet, "/workspaces", nil)
		req.Header.Set("Authorization", "Bearer "+tokenString)
		rec := httptest.NewRecorder()

		handler.ServeHTTP(rec, req)
		if rec.Code != http.StatusOK {
			t.Errorf("expected 200, got %d, body: %s", rec.Code, rec.Body.String())
		}
		if rec.Body.String() != "user:usr_123456" {
			t.Errorf("expected 'user:usr_123456', got %s", rec.Body.String())
		}
	})
}

func TestRequireAuth_JWKS(t *testing.T) {
	// Generate RSA key pair for testing JWKS
	privateKey, err := rsa.GenerateKey(rand.Reader, 2048)
	if err != nil {
		t.Fatalf("failed to generate RSA key: %v", err)
	}

	const kid = "test-jwks-key-1"
	nStr := base64.RawURLEncoding.EncodeToString(privateKey.N.Bytes())
	eBytes := big.NewInt(int64(privateKey.E)).Bytes()
	eStr := base64.RawURLEncoding.EncodeToString(eBytes)

	// Mock JWKS server
	jwksServer := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		resp := map[string]any{
			"keys": []map[string]any{
				{
					"kty": "RSA",
					"kid": kid,
					"use": "sig",
					"alg": "RS256",
					"n":   nStr,
					"e":   eStr,
				},
			},
		}
		_ = json.NewEncoder(w).Encode(resp)
	}))
	defer jwksServer.Close()

	os.Setenv("BETTER_AUTH_JWKS_URL", jwksServer.URL)
	defer os.Unsetenv("BETTER_AUTH_JWKS_URL")

	nextHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		userID, ok := middleware.GetUserID(r.Context())
		if !ok || userID == "" {
			http.Error(w, "missing user id in context", http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("jwks-user:" + userID))
	})

	handler := middleware.RequireAuth(nextHandler)

	claims := &middleware.UserClaims{
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   "usr_jwks_999",
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(1 * time.Hour)),
		},
		Email: "jwks@example.com",
	}
	token := jwt.NewWithClaims(jwt.SigningMethodRS256, claims)
	token.Header["kid"] = kid

	tokenString, err := token.SignedString(privateKey)
	if err != nil {
		t.Fatalf("failed to sign RSA token: %v", err)
	}

	req := httptest.NewRequest(http.MethodGet, "/workspaces", nil)
	req.Header.Set("Authorization", "Bearer "+tokenString)
	rec := httptest.NewRecorder()

	handler.ServeHTTP(rec, req)
	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d, body: %s", rec.Code, rec.Body.String())
	}
	if rec.Body.String() != "jwks-user:usr_jwks_999" {
		t.Errorf("expected 'jwks-user:usr_jwks_999', got %s", rec.Body.String())
	}
}
