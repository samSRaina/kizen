# # # # # # # # # # # # # # # # # # # # ## # # # # # #
# # # # # # # # TICKET-SERVICE # # # # # # # # # # # #
# # # # # # # # # # # # # # # # # # # # ## # # # # # #
ticket_service_compile_cmd = 'CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o build/ticket-service ./services/ticket-service/cmd'

if os.name == 'nt':
  ticket_service_compile_cmd = './infra/docker/ticket-service-build.bat'

local_resource(
  'ticket-service-compile',
  cmd=ticket_service_compile_cmd,
  deps=[
      './services/ticket-service',
      './shared',
      './go.mod',
      './go.sum',
      './internal/database/postgres',
  ],
  labels=['compiles']
)


docker_build(
  'kizen/ticket-service',
  '.',
  # entrypoint=['/app/build/ticket-service'],

  dockerfile='./infra/docker/ticket-service.Dockerfile',

  only=[
    './build/ticket-service',
    './shared',
  ],

  live_update=[
    sync('./build', '/app/build'),
    sync('./shared', '/app/shared'),
    restart_container()
  ],
)


# # # # # # # # # # # # # # # # # # # # ## # # # # # #
# # # # # # # # INFRASTRUCTURE # # # # # # # # # # # #
# # # # # # # # # # # # # # # # # # # # ## # # # # # #

docker_compose('docker-compose.yaml')
dc_resource(
    'ticket-service',
    resource_deps=['ticket-service-compile'],
)
