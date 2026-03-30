# SindromeGames — Sistema de Login & Registro

Sistema completo de autenticação com design minimalista.

---

## Estrutura do Projeto

```
📁 projeto/
├── index.html          ← Front-end (HTML + CSS + JS)
├── server.py           ← Back-end (Flask + SQLite)
├── requirements.txt    ← Dependências Python
└── LEIA-ME.md          ← Este arquivo
```

---

## Passo a Passo para Rodar

### 1. Pré-requisito

Você precisa ter o **Python 3.8+** instalado.  
Verifique com:

```bash
python --version
```

> No Linux/macOS, pode ser `python3` ao invés de `python`.

---

### 2. Instalar as dependências

Abra o terminal na pasta do projeto e execute:

```bash
pip install -r requirements.txt
```

> No Linux/macOS, pode ser `pip3` ao invés de `pip`.

---

### 3. Iniciar o servidor

```bash
python server.py
```

Você verá a mensagem:

```
✓ Banco de dados inicializado.
══════════════════════════════════════════════════
  Servidor rodando em http://localhost:5000
══════════════════════════════════════════════════
```

O banco de dados `users.db` será criado automaticamente na primeira execução.

---

### 4. Acessar no navegador

Abra o navegador e vá para:

```
http://localhost:5000
```

---

## Como Funciona

| Etapa | O que acontece |
|-------|---------------|
| **Registro** | O front-end envia usuário + senha → Flask faz hash com bcrypt → salva no SQLite → retorna JWT |
| **Login** | O front-end envia credenciais → Flask verifica o hash → retorna JWT |
| **Persistência** | O JWT é salvo no `localStorage`. Ao reabrir a página, o front verifica com `/api/verify` |
| **Redirecionamento** | Após login ou sessão válida, redireciona para `youtube.com/@SindromeGames` |

---

## Endpoints da API

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/api/register` | Cria um novo usuário |
| `POST` | `/api/login` | Autentica um usuário |
| `POST` | `/api/verify` | Valida um token JWT |

### Exemplos de payload:

**Registro / Login:**
```json
{
  "username": "jogador",
  "password": "minhasenha123"
}
```

**Verificar token:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

## Tecnologias Utilizadas

- **Flask** — Micro-framework web Python
- **SQLite** — Banco de dados local (arquivo único)
- **bcrypt** — Hash seguro de senhas (com salt)
- **PyJWT** — Geração e validação de JSON Web Tokens
- **HTML/CSS/JS puros** — Sem frameworks no front-end

---

## Dúvidas Comuns

**O banco de dados não apareceu?**  
Ele só é criado quando você roda `python server.py` pela primeira vez.

**Erro de porta 5000 em uso?**  
No macOS, o AirPlay usa a porta 5000. Altere a linha final do `server.py`:
```python
app.run(debug=True, host="0.0.0.0", port=8080)
```
E acesse `http://localhost:8080`.

**Como resetar o banco de dados?**  
Delete o arquivo `users.db` e reinicie o servidor.
