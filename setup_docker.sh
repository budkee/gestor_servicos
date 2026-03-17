#!/bin/bash

# Script para instalar Docker no Ubuntu
# Autor: Kaê
# Uso: sudo ./setup_docker.sh

set -e

echo "=== Instalando Docker no Ubuntu ==="

# Verifica se é root
if [ "$(id -u)" -ne 0 ]; then
  echo "Por favor, execute como root (ex: sudo $0)"
  exit 1
fi

# Verifica se é Ubuntu
if ! grep -qi ubuntu /etc/os-release; then
  echo "Este script é exclusivo para Ubuntu."
  exit 1
fi

echo "[1/7] Atualizando pacotes..."
apt update -y
apt upgrade -y

echo "[2/7] Instalando dependências..."
apt install -y \
  ca-certificates \
  curl \
  gnupg \
  lsb-release

echo "[3/7] Adicionando chave GPG oficial do Docker..."
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
  | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg

echo "[4/7] Adicionando repositório oficial do Docker..."
UBUNTU_CODENAME=$(lsb_release -cs)

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  ${UBUNTU_CODENAME} stable" \
  | tee /etc/apt/sources.list.d/docker.list > /dev/null

echo "[5/7] Instalando Docker Engine..."
apt update -y
apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

echo "[6/7] Habilitando e iniciando Docker..."
systemctl enable docker
systemctl start docker

echo "[7/7] Configurando usuário atual para usar Docker sem sudo..."
if [ -n "$SUDO_USER" ]; then
  usermod -aG docker "$SUDO_USER"
  echo "Usuário $SUDO_USER adicionado ao grupo docker."
fi

echo "=== Docker instalado com sucesso! ==="
docker --version

echo ""
echo "⚠️  IMPORTANTE:"
echo "Para usar Docker sem sudo, faça logout e login novamente."
