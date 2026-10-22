# PinkTunes

Biblioteca musical pessoal feita com Flask, SQLite, HTML, CSS e JavaScript.

## Requisitos
- Python 3.10 ou superior
- VS Code (opcional, mas recomendado)

## Instalação no Windows
Abra a pasta PinkTunes no VS Code. No terminal integrado, execute:

```powershell
py -m venv .venv
.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python app.py
```

Se o PowerShell bloquear a ativação do ambiente, tente usar o terminal CMD e execute:
```bat
.venv\Scripts\activate.bat
```

Abra http://127.0.0.1:5000 no navegador.

## Instalação no macOS/Linux
```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
python app.py
```

O banco `pinktunes.db` é criado automaticamente na primeira execução.

## Como testar
1. Crie uma conta com e-mail e senha de pelo menos 8 caracteres.
2. Entre em Biblioteca e cadastre algumas músicas.
3. Crie uma playlist e adicione músicas a ela.
4. Marque músicas como favoritas.
5. Salve artistas na página Artistas.
6. Cadastre músicas com gênero para experimentar as sugestões no painel.

## Observações
- Esta versão cadastra informações manualmente; não importa automaticamente bibliotecas de outros serviços.
- O campo de link permite guardar um endereço externo da música. A reprodução depende do serviço de origem.
- Antes de publicar na internet, defina uma chave secreta segura na variável de ambiente `PINKTUNES_SECRET`, desative o modo debug e adicione proteção CSRF e outras medidas de produção.
