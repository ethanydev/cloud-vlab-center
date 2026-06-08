const Docker = require('dockerode');

// Singleton Dockerode instance
// Connects via Unix socket by default (Linux/macOS)
const docker = new Docker({
  socketPath: process.env.DOCKER_SOCKET_PATH || '/var/run/docker.sock'
});

module.exports = docker;
