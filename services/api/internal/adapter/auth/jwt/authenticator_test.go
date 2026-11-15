package jwt_test

import (
	"context"
	"crypto/ed25519"
	"crypto/rand"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/lestrrat-go/jwx/v4/jwa"
	"github.com/lestrrat-go/jwx/v4/jwk"
	"github.com/lestrrat-go/jwx/v4/jwt"
	authJWT "github.com/samSRaina/kizen/api/internal/adapter/auth/jwt"
	authDomain "github.com/samSRaina/kizen/api/internal/domain/auth"
)

func TestAuthenticator(t *testing.T) {
	ctx := context.Background()

	// 1. Generate an Ed25519 key pair for testing
	pubKey, privKey, err := ed25519.GenerateKey(rand.Reader)
	if err != nil {
		t.Fatalf("failed to generate ed25519 key: %v", err)
	}

	keyID := "test-key-1"
	jwkKey, err := jwk.Import[jwk.Key](pubKey)
	if err != nil {
		t.Fatalf("failed to create JWK from public key: %v", err)
	}
	if err := jwkKey.Set(jwk.KeyIDKey, keyID); err != nil {
		t.Fatalf("failed to set key ID on JWK: %v", err)
	}
	if err := jwkKey.Set(jwk.AlgorithmKey, jwa.EdDSA()); err != nil {
		t.Fatalf("failed to set algorithm on JWK: %v", err)
	}

	privJWK, err := jwk.Import[jwk.Key](privKey)
	if err != nil {
		t.Fatalf("failed to create JWK from private key: %v", err)
	}
	if err := privJWK.Set(jwk.KeyIDKey, keyID); err != nil {
		t.Fatalf("failed to set key ID on private JWK: %v", err)
	}

	jwks := jwk.NewSet()
	if err := jwks.AddKey(jwkKey); err != nil {
		t.Fatalf("failed to add key to set: %v", err)
	}

	// 2. Mock JWKS HTTP server
	mockJWKSServer := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(jwks)
	}))
	defer mockJWKSServer.Close()

	// Helper to sign test tokens
	signToken := func(userID string, expiry time.Time) string {
		tok, err := jwt.NewBuilder().
			Subject(userID).
			Expiration(expiry).
			IssuedAt(time.Now().Add(-1 * time.Minute)).
			Build()
		if err != nil {
			t.Fatalf("failed to build JWT: %v", err)
		}

		signed, err := jwt.Sign(tok, jwt.WithKey(jwa.EdDSA(), privJWK))
		if err != nil {
			t.Fatalf("failed to sign JWT: %v", err)
		}
		return string(signed)
	}

	// Instantiate the authenticator against our mock server
	authClient, err := authJWT.NewAuthenticator(ctx, mockJWKSServer.URL)
	if err != nil {
		t.Fatalf("failed to initialize Authenticator: %v", err)
	}

	t.Run("valid token returns correct identity", func(t *testing.T) {
		expectedUserID := "user_42"
		rawToken := signToken(expectedUserID, time.Now().Add(10*time.Minute))

		identity, err := authClient.Authenticate(ctx, rawToken)
		if err != nil {
			t.Fatalf("expected nil error, got: %v", err)
		}

		if identity.UserID != authDomain.UserID(expectedUserID) {
			t.Errorf("expected UserID %q, got %q", expectedUserID, identity.UserID)
		}
	})

	t.Run("empty token returns ErrMissingToken", func(t *testing.T) {
		_, err := authClient.Authenticate(ctx, "")
		if !errors.Is(err, authDomain.ErrMissingToken) {
			t.Errorf("expected ErrMissingToken, got %v", err)
		}
	})

	t.Run("expired token returns ErrInvalidToken", func(t *testing.T) {
		expiredToken := signToken("user_42", time.Now().Add(-5*time.Minute))

		_, err := authClient.Authenticate(ctx, expiredToken)
		if !errors.Is(err, authDomain.ErrInvalidToken) {
			t.Errorf("expected ErrInvalidToken, got %v", err)
		}
	})

	t.Run("tampered token fails verification", func(t *testing.T) {
		rawToken := signToken("user_42", time.Now().Add(10*time.Minute))
		tamperedToken := rawToken + "corrupted"

		_, err := authClient.Authenticate(ctx, tamperedToken)
		if !errors.Is(err, authDomain.ErrInvalidToken) {
			t.Errorf("expected ErrInvalidToken for tampered token, got %v", err)
		}
	})
}
