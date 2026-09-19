FROM alpine
WORKDIR /app

# We MUST copy the compiled binary into the initial image here
# so the container can start successfully on its very first run!
COPY build/workspace-service /app/build/workspace-service

# We will let Tilt copy the binary into this running container via live_update sync!
# This command just acts as a placeholder so the container stays alive.
ENTRYPOINT ["/app/build/workspace-service"]
