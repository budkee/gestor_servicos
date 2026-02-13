#! /bin/zsh
# Execute este script com: source pyenv_virtualenv_setup.sh
# Ele criará e ativará um ambiente virtual integrado ao pyenv.

# Limpeza preventiva (somente no diretório atual)
if [ -d ".venv" ]; then
  echo "⚠️ Ambiente .venv existente encontrado"
  echo ">>> Removendo .venv para garantir ambiente limpo"
  rm -rf .venv
fi

if [ -f ".python-version" ]; then
  echo "⚠️ Configuração pyenv local encontrada"
  echo ">>> Removendo .python-version"
  rm .python-version
fi

# Nome do virtualenv (pode ser alterado)
VENV_DIR=".venv"
PYTHON_VERSION="3.13.0"

# Mostra versões do Python disponíveis
echo ""
echo ">>> Versões do Python disponíveis no pyenv:"
pyenv versions

# Define a versão do Python para o projeto (instale antes com pyenv install)
echo ""
echo ">>> Definindo versão local do Python para $PYTHON_VERSION"
pyenv local $PYTHON_VERSION

# Cria o virtualenv se não existir
if [ ! -d "$VENV_DIR" ]; then
    python -m venv "$VENV_DIR"
fi

# Ativa o ambiente virtual
echo ">>> Ativando o virtualenv $VENV_DIR"
source "$VENV_DIR/bin/activate"

# Atualiza pip
echo ">>> Atualizando pip..."
pip install --upgrade pip

# Lista pacotes instalados
echo ">>> Pacotes instalados:"
pip list

# Para desativar, use:
# pyenv deactivate

# Para remover o virtualenv, use:
# pyenv virtualenv-delete $VENV_NAME

# Voltar com o global do sistema
# pyenv global system