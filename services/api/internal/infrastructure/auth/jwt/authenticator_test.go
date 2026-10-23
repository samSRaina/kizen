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
	"github.com/samSRaina/kizen/api/internal/domain/auth"
	authJWT "github.com/samSRaina/kizen/api/internal/infrastructure/auth/jwt"
)

func TestAuthenticator(t *testing.T) {
	ctx := context.Background()

	// 1. Generate an Ed25519 key pair for testing
	pubKey, privKey, err := ed25519.GenerateKey(rand.Reader)
	if err != nil {
		t.Fatalf("failed to generate ed25519 key: %v", err)
	}

	keyID := "test-key-1"

	// 2. Wrap public key as a JWK with Key ID and Algorithm
	jwkPub, err := jwk.Import[jwk.Key](pubKey)
	if err != nil {
		t.Fatalf("failed to import public key: %v", err)
	}
	_ = jwkPub.Set(jwk.KeyIDKey, keyID)
	_ = jwkPub.Set(jwk.AlgorithmKey, jwa.EdDSAEd25519())

	// 3. Put public key into a JWK Set and serialize to JSON
	set := jwk.NewSet()
	_ = set.AddKey(jwkPub)
	jwksJSON, err := json.Marshal(set)
	if err != nil {
		t.Fatalf("failed to marshal jwk set: %v", err)
	}

	// 4. Spin up an in-memory mock HTTP server serving the JWKS
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write(jwksJSON)
	}))
	defer server.Close()

	// 5. Initialize your Authenticator pointing to our test server
	authenticator, err := authJWT.NewAuthenticator(ctx, server.URL)
	if err != nil {
		t.Fatalf("failed to initialize Authenticator: %v", err)
	}

	// 6. Wrap private key to sign test tokens
	jwkPriv, err := jwk.Import[jwk.Key](privKey)
	if err != nil {
		t.Fatalf("failed to import private key: %v", err)
	}
	_ = jwkPriv.Set(jwk.KeyIDKey, keyID)
	_ = jwkPriv.Set(jwk.AlgorithmKey, jwa.EdDSAEd25519())

	// =========================================================================
	// SUBTEST 1: Valid Token
	// =========================================================================
	t.Run("valid token returns correct identity", func(t *testing.T) {
		tok, err := jwt.NewBuilder().
			Subject("usr_test_123").
			Claim("email", "tester@kizen.dev").
			Expiration(time.Now().Add(5 * time.Minute)).
			IssuedAt(time.Now()).
			Build()
		if err != nil {
			t.Fatalf("failed to build token: %v", err)
		}

		signed, err := jwt.Sign(tok, jwt.WithKey(jwa.EdDSAEd25519(), jwkPriv))
		if err != nil {
			t.Fatalf("failed to sign token: %v", err)
		}

		identity, err := authenticator.Authenticate(ctx, string(signed))
		if err != nil {
			t.Fatalf("expected valid authentication, got error: %v", err)
		}

		if identity.UserID != "usr_test_123" {
			t.Errorf("expected UserID 'usr_test_123', got %q", identity.UserID)
		}
		if identity.Email != "tester@kizen.dev" {
			t.Errorf("expected Email 'tester@kizen.dev', got %q", identity.Email)
		}
	})

	// =========================================================================
	// SUBTEST 2: Empty Token
	// =========================================================================
	t.Run("empty token returns ErrMissingToken", func(t *testing.T) {
		_, err := authenticator.Authenticate(ctx, "")
		if !errors.Is(err, auth.ErrMissingToken) {
			t.Errorf("expected ErrMissingToken, got: %v", err)
		}
	})

	// =========================================================================
	// SUBTEST 3: Expired Token
	// =========================================================================
	t.Run("expired token returns ErrInvalidToken", func(t *testing.T) {
		tok, err := jwt.NewBuilder().
			Subject("usr_test_123").
			Expiration(time.Now().Add(-10 * time.Minute)). // Expired 10 min ago
			Build()
		if err != nil {
			t.Fatalf("failed to build token: %v", err)
		}

		signed, err := jwt.Sign(tok, jwt.WithKey(jwa.EdDSAEd25519(), jwkPriv))
		if err != nil {
			t.Fatalf("failed to sign token: %v", err)
		}

		_, err = authenticator.Authenticate(ctx, string(signed))
		if !errors.Is(err, auth.ErrInvalidToken) {
			t.Errorf("expected ErrInvalidToken for expired token, got: %v", err)
		}
	})

	// =========================================================================
	// SUBTEST 4: Tampered / Invalid Signature
	// =========================================================================
	t.Run("tampered token fails verification", func(t *testing.T) {
		// Valid token but tamper the signature by corrupting characters
		badToken := "eyJhbGciOiJFZERTQTE5In0.eyJzdWIiOiIxMjMifQ.badsignature"
		_, err := authenticator.Authenticate(ctx, badToken)
		if !errors.Is(err, auth.ErrInvalidToken) {
			t.Errorf("expected ErrInvalidToken for bad signature, got: %v", err)
		}
	})
}
