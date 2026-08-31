package main

import (
	"flag"
	"fmt"
	"os"
	"path/filepath"
)

func main() {
	serviceName := flag.String("name", "", "reference the name of the service")
	flag.Parse()

	Path := filepath.Join("..", "services", *serviceName+"-service")
	dirs := []string{
		"cmd",
		"internal/config",
		"internal/domain",
		"internal/handler",
		"internal/infrastructure",
		"internal/infrastructure/repository",
		"internal/infrastructure/database",
		"internal/service",
		/*"pkg/types",*/
	}

	for _, dir := range dirs {
		fullPath := filepath.Join(Path, dir)

		if err := os.MkdirAll(fullPath, 0755); err != nil {
			fmt.Printf("Error creating directory %s: %v\n", dir, err)
			os.Exit(1)
		}
	}
}

/* Layer Responsibilities
1. **Domain Layer** (`+"`internal/domain/`"+`)
   - Contains business domain interfaces
   - Defines contracts for repositories and services
   - Pure business logic, no implementation details

2. **Service Layer** (`+"`internal/service/`"+`)
   - Implements business logic
   - Uses repository interfaces
   - Coordinates between different parts of the system

3. **Infrastructure Layer** (`+"`internal/infrastructure/`"+`)
   - `+"`repository/`"+`: Implements data persistence
   - `+"`events/`"+`: Handles event publishing and consuming
   - `+"`grpc/`"+`: Handles gRPC communication

4. **Public Types** (`+"`pkg/types/`"+`)
   - Contains shared types and models
   - Can be imported by other services
*/
