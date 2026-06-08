const SSHD_SETUP = {
  alpine: [
    '/bin/sh', '-c',
    'apk add --no-cache openssh && ssh-keygen -A && echo "root:%%PASSWORD%%" | chpasswd && ' +
    'mkdir -p /run/sshd && ' +
    'exec /usr/sbin/sshd -D -o PermitRootLogin=yes -o PasswordAuthentication=yes'
  ],
  debian: [
    '/bin/bash', '-c',
    'apt-get update -qq && apt-get install -y --no-install-recommends openssh-server && ' +
    'echo "root:%%PASSWORD%%" | chpasswd && ' +
    'mkdir -p /run/sshd && ' +
    'exec /usr/sbin/sshd -D -o PermitRootLogin=yes -o PasswordAuthentication=yes'
  ],
  rhel: [
    '/bin/bash', '-c',
    'dnf install -y openssh-server && ' +
    'echo "root:%%PASSWORD%%" | chpasswd && ' +
    'ssh-keygen -A && mkdir -p /run/sshd && ' +
    'exec /usr/sbin/sshd -D -o PermitRootLogin=yes -o PasswordAuthentication=yes'
  ],
};

module.exports = {
  'alpine-shell': {
    imageName: 'alpine:latest',
    resourceLimits: { nanoCpus: 1, memoryMB: 512 },
    exposedPorts: [{ containerPort: 22, protocol: 'tcp' }],
    envVars: {},
    cmd: SSHD_SETUP.alpine,
    description: 'Alpine 기본 쉘 환경'
  },

  'ubuntu': {
    imageName: 'ubuntu:22.04',
    resourceLimits: { nanoCpus: 1, memoryMB: 1024 },
    exposedPorts: [{ containerPort: 22, protocol: 'tcp' }],
    envVars: { DEBIAN_FRONTEND: 'noninteractive' },
    cmd: SSHD_SETUP.debian,
    description: 'Ubuntu 22.04 실습 환경'
  },

  'centos': {
    imageName: 'centos:stream9',
    resourceLimits: { nanoCpus: 1, memoryMB: 1024 },
    exposedPorts: [{ containerPort: 22, protocol: 'tcp' }],
    envVars: {},
    cmd: SSHD_SETUP.rhel,
    description: 'CentOS Stream 9 실습 환경'
  },

  'rockylinux': {
    imageName: 'rockylinux:9',
    resourceLimits: { nanoCpus: 1, memoryMB: 1024 },
    exposedPorts: [{ containerPort: 22, protocol: 'tcp' }],
    envVars: {},
    cmd: SSHD_SETUP.rhel,
    description: 'Rocky Linux 9 실습 환경'
  },

  'kalilinux': {
    imageName: 'kalilinux/kali-rolling',
    resourceLimits: { nanoCpus: 2, memoryMB: 2048 },
    exposedPorts: [{ containerPort: 22, protocol: 'tcp' }],
    envVars: { DEBIAN_FRONTEND: 'noninteractive' },
    cmd: SSHD_SETUP.debian,
    description: 'Kali Linux 실습 환경'
  },

  'jupyter': {
    imageName: 'jupyter/scipy-notebook:latest',
    resourceLimits: { nanoCpus: 2, memoryMB: 2048 },
    exposedPorts: [{ containerPort: 8888, protocol: 'tcp' }],
    envVars: { JUPYTER_TOKEN: 'vlab-token' },
    cmd: [],
    description: 'Jupyter Notebook'
  },

  'postgres-lab': {
    imageName: 'postgres:16-alpine',
    resourceLimits: { nanoCpus: 1, memoryMB: 1024 },
    exposedPorts: [{ containerPort: 5432, protocol: 'tcp' }],
    envVars: {
      POSTGRES_USER:     'student',
      POSTGRES_PASSWORD: 'vlab1234',
      POSTGRES_DB:       'labdb'
    },
    cmd: [],
    description: 'PostgreSQL 실습 DB'
  },
};
