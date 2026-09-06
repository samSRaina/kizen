// Package gen holds code generated from api/openapi.yaml — the single
// source of truth for the HTTP contract. DO NOT HAND-EDIT ANYTHING HERE.
//
// Regenerate with:
//
//	go generate ./...
//
// The generated surface is deliberately filtered to the Tickets tag (see
// gen.cfg.yaml), so this package contains exactly the ticket module's
// contract: models (Ticket, Problem, enums, request bodies, list envelope)
// plus the chi ServerInterface its handlers must implement. When the
// identity or organizations modules are added to the shared spec, they get
// their own gen packages filtered to their own tags — one spec, many
// services, no cross-imports.
package gen

//go:generate go tool oapi-codegen -config ./gen.cfg.yaml ../../../../api/openapi.yaml
