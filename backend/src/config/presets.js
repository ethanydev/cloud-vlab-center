const SSHD_SETUP = {
  alpine: [
    '/bin/sh', '-c',
    'apk add --no-cache openssh && ssh-keygen -A && echo "root:vlab1234" | chpasswd && ' +
    'echo "PermitRootLogin yes" >> /etc/ssh/sshd_config && ' +
    'echo "PasswordAuthentication yes" >> /etc/ssh/sshd_config && ' +
    'exec /usr/sbin/sshd -D'
  ],
  debian: [
    '/bin/bash', '-c',
    'apt-get update -qq && apt-get install -y --no-install-recommends openssh-server && ' +
    'echo "root:vlab1234" | chpasswd && ' +
    'sed -i "s/#PermitRootLogin.*/PermitRootLogin yes/" /etc/ssh/sshd_config && ' +
    'sed -i "s/#PasswordAuthentication.*/PasswordAuthentication yes/" /etc/ssh/sshd_config && ' +
    'mkdir -p /run/sshd && exec /usr/sbin/sshd -D'
  ],
  rhel: [
    '/bin/bash', '-c',
    'dnf install -y openssh-server && ' +
    'echo "root:vlab1234" | chpasswd && ' +
    'sed -i "s/#PermitRootLogin.*/PermitRootLogin yes/" /etc/ssh/sshd_config && ' +
    'sed -i "s/#PasswordAuthentication.*/PasswordAuthentication yes/" /etc/ssh/sshd_config && ' +
    'ssh-keygen -A && mkdir -p /run/sshd && exec /usr/sbin/sshd -D'
  ],
};

module.exports = {
  'alpine-shell': {
    imageName: 'alpine:latest',
    resourceLimits: { nanoCpus: 1, memoryMB: 512 },
    exposedPorts: [{ containerPort: 22, protocol: 'tcp' }],
    envVars: {},
    cmd: SSHD_SETUP.alpine,
    description: 'Alpine 기본 쉘 환경 (SSH: root/vlab1234)'
  },

  'ubuntu': {
    imageName: 'ubuntu:22.04',
    resourceLimits: { nanoCpus: 1, memoryMB: 1024 },
    exposedPorts: [{ containerPort: 22, protocol: 'tcp' }],
    envVars: { DEBIAN_FRONTEND: 'noninteractive' },
    cmd: SSHD_SETUP.debian,
    description: 'Ubuntu 22.04 실습 환경 (SSH: root/vlab1234)'
  },

  'centos': {
    imageName: 'centos:stream9',
    resourceLimits: { nanoCpus: 1, memoryMB: 1024 },
    exposedPorts: [{ containerPort: 22, protocol: 'tcp' }],
    envVars: {},
    cmd: SSHD_SETUP.rhel,
    description: 'CentOS Stream 9 실습 환경 (SSH: root/vlab1234)'
  },

  'rockylinux': {
    imageName: 'rockylinux:9',
    resourceLimits: { nanoCpus: 1, memoryMB: 1024 },
    exposedPorts: [{ containerPort: 22, protocol: 'tcp' }],
    envVars: {},
    cmd: SSHD_SETUP.rhel,
    description: 'Rocky Linux 9 실습 환경 (SSH: root/vlab1234)'
  },

  'kalilinux': {
    imageName: 'kalilinux/kali-rolling',
    resourceLimits: { nanoCpus: 2, memoryMB: 2048 },
    exposedPorts: [{ containerPort: 22, protocol: 'tcp' }],
    envVars: { DEBIAN_FRONTEND: 'noninteractive' },
    cmd: SSHD_SETUP.debian,
    description: 'Kali Linux 실습 환경 (SSH: root/vlab1234)'
  },

  'jupyter': {
    imageName: 'jupyter/scipy-notebook:latest',
    resourceLimits: { nanoCpus: 2, memoryMB: 2048 },
    exposedPorts: [{ containerPort: 8888, protocol: 'tcp' }],
    envVars: { JUPYTER_TOKEN: 'vlab-token' },
    cmd: [],
    description: 'Jupyter Notebook (포트 8888, 토큰: vlab-token)'
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
    description: 'PostgreSQL 실습 DB (포트 5432, user: student/vlab1234)'
  },
};
