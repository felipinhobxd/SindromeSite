"""
═══════════════════════════════════════════════════════════
  Server — Sistema de Autenticação Minimalista
  Flask + SQLite + bcrypt + JWT
═══════════════════════════════════════════════════════════
"""

import os
import re
import sqlite3
import datetime
from functools import wraps

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import bcrypt
import jwt

# ─── Configuração ────────────────────────────────────────
app = Flask(__name__, static_folder=".", static_url_path="")
CORS(app)

SECRET_KEY = os.environ.get("SECRET_KEY", "chave-secreta-sindrome-games-2025")
TOKEN_EXPIRY_DAYS = 30
DATABASE = "users.db"

# ─── Banco de Dados ─────────────────────────────────────
def get_db():
    """Cria conexão com o SQLite."""
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Inicializa o banco de dados com a tabela de usuários."""
    conn = get_db()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()
    print("✓ Banco de dados inicializado.")

# ─── Utilitários ────────────────────────────────────────
def generate_token(user_id, username):
    """Gera um JWT com expiração configurável."""
    payload = {
        "user_id": user_id,
        "username": username,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(days=TOKEN_EXPIRY_DAYS),
        "iat": datetime.datetime.utcnow()
    }
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")

def decode_token(token):
    """Decodifica e valida um JWT."""
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def validate_username(username):
    """Valida o nome de usuário."""
    if not username or len(username.strip()) < 3:
        return False, "O nome de usuário deve ter pelo menos 3 caracteres."
    if len(username) > 30:
        return False, "O nome de usuário deve ter no máximo 30 caracteres."
    if not re.match(r'^[a-zA-Z0-9_]+$', username):
        return False, "Use apenas letras, números e underline."
    return True, ""

def validate_password(password):
    """Valida a senha."""
    if not password or len(password) < 6:
        return False, "A senha deve ter pelo menos 6 caracteres."
    if len(password) > 128:
        return False, "A senha deve ter no máximo 128 caracteres."
    return True, ""

# ─── Rotas da API ────────────────────────────────────────

@app.route("/")
def serve_index():
    """Serve o frontend."""
    return send_from_directory(".", "index.html")

@app.route("/api/register", methods=["POST"])
def register():
    """Registra um novo usuário."""
    data = request.get_json()

    if not data:
        return jsonify({"error": "Dados inválidos."}), 400

    username = data.get("username", "").strip()
    password = data.get("password", "")

    # Validações
    valid, msg = validate_username(username)
    if not valid:
        return jsonify({"error": msg}), 400

    valid, msg = validate_password(password)
    if not valid:
        return jsonify({"error": msg}), 400

    # Hash da senha com bcrypt
    password_hash = bcrypt.hashpw(
        password.encode("utf-8"),
        bcrypt.gensalt(rounds=12)
    ).decode("utf-8")

    # Inserir no banco
    try:
        conn = get_db()
        conn.execute(
            "INSERT INTO users (username, password_hash) VALUES (?, ?)",
            (username, password_hash)
        )
        conn.commit()

        # Buscar o ID do usuário recém-criado
        user = conn.execute(
            "SELECT id, username FROM users WHERE username = ?",
            (username,)
        ).fetchone()
        conn.close()

        # Gerar token
        token = generate_token(user["id"], user["username"])

        return jsonify({
            "message": "Conta criada com sucesso.",
            "token": token,
            "username": user["username"]
        }), 201

    except sqlite3.IntegrityError:
        return jsonify({"error": "Este nome de usuário já está em uso."}), 409
    except Exception as e:
        return jsonify({"error": "Erro interno do servidor."}), 500

@app.route("/api/login", methods=["POST"])
def login():
    """Autentica um usuário."""
    data = request.get_json()

    if not data:
        return jsonify({"error": "Dados inválidos."}), 400

    username = data.get("username", "").strip()
    password = data.get("password", "")

    if not username or not password:
        return jsonify({"error": "Preencha todos os campos."}), 400

    # Buscar usuário
    conn = get_db()
    user = conn.execute(
        "SELECT id, username, password_hash FROM users WHERE username = ?",
        (username,)
    ).fetchone()
    conn.close()

    if not user:
        return jsonify({"error": "Usuário ou senha incorretos."}), 401

    # Verificar senha
    if not bcrypt.checkpw(
        password.encode("utf-8"),
        user["password_hash"].encode("utf-8")
    ):
        return jsonify({"error": "Usuário ou senha incorretos."}), 401

    # Gerar token
    token = generate_token(user["id"], user["username"])

    return jsonify({
        "message": "Login realizado com sucesso.",
        "token": token,
        "username": user["username"]
    }), 200

@app.route("/api/verify", methods=["POST"])
def verify():
    """Verifica se um token JWT é válido."""
    data = request.get_json()
    token = data.get("token", "") if data else ""

    if not token:
        return jsonify({"valid": False}), 401

    payload = decode_token(token)

    if not payload:
        return jsonify({"valid": False}), 401

    # Verificar se o usuário ainda existe no banco
    conn = get_db()
    user = conn.execute(
        "SELECT id, username FROM users WHERE id = ?",
        (payload["user_id"],)
    ).fetchone()
    conn.close()

    if not user:
        return jsonify({"valid": False}), 401

    return jsonify({
        "valid": True,
        "username": user["username"]
    }), 200

# ─── Inicialização ───────────────────────────────────────
if __name__ == "__main__":
    init_db()
    print("═" * 50)
    print("  Servidor rodando em http://localhost:5000")
    print("═" * 50)
    app.run(debug=True, host="0.0.0.0", port=5000)
