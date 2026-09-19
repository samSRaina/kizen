#   WORKSPACE-SERVICE   #
workspace_service_compile_cmd = 'CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o build/workspace-service ./services/workspace-service/cmd'

if os.name == 'nt':
  workspace_service_compile_cmd = './infra/developement/docker/workspace-service-build.bat'

local_resource(
  'workspace-service-compile',
  cmd=workspace_service_compile_cmd,
  deps=[
      './services/workspace-service',
      './shared',
      './go.mod',
      './go.sum',
      './internal/database',
  ],
  labels=['compiles']
)

docker_build(
  'kizen/workspace-service',
  '.',
  # Fix 1: Point to the super fast dev Dockerfile
  dockerfile='./infra/developement/docker/workspace-service.dev.Dockerfile',

  # docker_build/custom_build.entrypoint not supported for Docker Compose resources // hence commented out
  # # Fix 2: Overwrite the entrypoint to the correct build location
  # entrypoint=['/app/build/workspace-service'],

  # Tilt now only pushes exactly what is compiled locally
  only=[
    './build/workspace-service',
  ],

  # Fast hot-reloading!
  live_update=[
    sync('./build', '/app/build'),
    restart_container()
  ],
)
# # # # # # # # # # # # # # # # # # # # ## # # # # # #
# # # # # # # # INFRASTRUCTURE # # # # # # # # # # # #
# # # # # # # # # # # # # # # # # # # # ## # # # # # #

docker_compose('docker-compose.yaml')
# dc_resource(
#     'ticket-service',
#     resource_deps=['ticket-service-compile'],
# )
