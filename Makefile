.PHONY: generate
generate: generate-backend generate-frontend generate-sqlc

generate-backend:
	go tool oapi-codegen --config=api/config/oapi-ticket.yaml api/openapi/ticket-v1.yaml
	#oapi-codegen --config=api/config/oapi-user.yaml api/openapi/user-v1.yaml

generate-frontend:
	cd web && npm run gen:api

generate-sqlc:
	sqlc generate
