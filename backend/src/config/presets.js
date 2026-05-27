module.exports = {
  'alpine-shell': {
    imageName: 'alpine:latest',
    resourceLimits: { nanoCpus: 1, memoryMB: 1024 },
    exposedPorts: [{ containerPort: 22, protocol: 'tcp' }],
    envVars: {},
    cmd: ['sleep', 'infinity'],
    description: 'Alpine 기본 쉘 환경'
  },

  'jupyter': {
    imageName: 'jupyter/scipy-notebook:latest',
    resourceLimits: { nanoCpus: 1, memoryMB: 2048 },
    exposedPorts: [{ containerPort: 22, protocol: 'tcp' }, { containerPort: 8888, protocol: 'tcp' }],
    envVars: { JUPYTER_TOKEN: 'vlab-token' },
    cmd: [],
    description: 'Jupyter Notebook (포트 8888)'
  },

  'postgres-lab': {
    imageName: 'postgres:16-alpine',
    resourceLimits: { nanoCpus: 1, memoryMB: 1024 },
    exposedPorts: [{ containerPort: 22, protocol: 'tcp' }, { containerPort: 5432, protocol: 'tcp' }],
    envVars: {
      POSTGRES_USER:     'student',
      POSTGRES_PASSWORD: 'vlab1234',
      POSTGRES_DB:       'labdb'
    },
    cmd: [],
    description: 'PostgreSQL 실습 DB (포트 5432)'
  },

  'ubuntu': {
    imageName: 'ubuntu:22.04',
    resourceLimits: { nanoCpus: 1, memoryMB: 1024 },
    exposedPorts: [{ containerPort: 22, protocol: 'tcp' }],
    envVars: {},
    cmd: ['sleep', 'infinity'],
    description: 'Ubuntu 22.04 실습 환경 (SSH 포트 자동 배정)'
  },

  'centos': {
    imageName: 'centos:stream9',
    resourceLimits: { nanoCpus: 1, memoryMB: 1024 },
    exposedPorts: [{ containerPort: 22, protocol: 'tcp' }],
    envVars: {},
    cmd: ['sleep', 'infinity'],
    description: 'CentOS Stream 9 실습 환경 (SSH 포트 자동 배정)'
  },

  'rockylinux': {
    imageName: 'rockylinux:9',
    resourceLimits: { nanoCpus: 1, memoryMB: 1024 },
    exposedPorts: [{ containerPort: 22, protocol: 'tcp' }],
    envVars: {},
    cmd: ['sleep', 'infinity'],
    description: 'Rocky Linux 9 실습 환경 (SSH 포트 자동 배정)'
  },

  'kalilinux': {
    imageName: 'kalilinux/kali-rolling',
    resourceLimits: { nanoCpus: 1, memoryMB: 1024 },
    exposedPorts: [{ containerPort: 22, protocol: 'tcp' }],
    envVars: {},
    cmd: ['sleep', 'infinity'],
    description: 'Kali Linux 실습 환경 (SSH 포트 자동 배정)'
  },
};
