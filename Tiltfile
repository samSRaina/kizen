docker_compose('docker-compose.yaml')

dc_resource('traefik',
    labels=['infra'],
    links=['http://localhost:8080']  # Traefik Dashboard
)

dc_resource('database',
    labels=['infra']
)

dc_resource('api',
    labels=['api'],
    links=['http://localhost/api/health']
)

dc_resource('web',
    labels=['web'],
    links=['http://localhost']
)
