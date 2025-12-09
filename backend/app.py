# backend/app.py
import os
from datetime import datetime
from flask import Flask, request, jsonify, session, g
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from functools import wraps
from sqlalchemy import func
import re

# ----------------------------------------------------
# 1. Configuración base
# ----------------------------------------------------
app = Flask(__name__)

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
DB_PATH = os.path.join(BASE_DIR, 'organizador.db')

app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'una_clave_secreta_fuerte_para_sesion_y_cifrado')
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{DB_PATH}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Cookies y sesiones
app.config['SESSION_COOKIE_SECURE'] = False
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['PERMANENT_SESSION_LIFETIME'] = 60 * 60 * 24 * 7

# ----------------------------------------------------
# CORS (YA SIN /api)
# ----------------------------------------------------
CORS(
    app,
    supports_credentials=True,
    resources={r"/*": {"origins": "http://localhost:5173"}}
)

# ----------------------------------------------------
# 2. Inicialización
# ----------------------------------------------------
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)

# ----------------------------------------------------
# 3. Modelos
# ----------------------------------------------------
task_tags = db.Table(
    'task_tags',
    db.Column('task_id', db.Integer, db.ForeignKey('task.id'), primary_key=True),
    db.Column('tag_id', db.Integer, db.ForeignKey('tag.id'), primary_key=True)
)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    name = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    tasks = db.relationship('Task', backref='owner', lazy=True, cascade="all, delete-orphan")
    tags = db.relationship('Tag', backref='owner', lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "name": self.name,
            "created_at": self.created_at.isoformat()
        }

class Tag(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "user_id": self.user_id
        }

class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    title = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text)
    due_date = db.Column(db.DateTime)
    status = db.Column(db.String(50), default="pending")
    priority = db.Column(db.String(50), default="normal")
    eisenhower_quadrant = db.Column(db.String(50), default="ni_urgente_ni_importante")
    completed = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=func.now())

    tags = db.relationship(
        'Tag',
        secondary=task_tags,
        lazy='subquery',
        backref=db.backref('tasks', lazy=True)
    )

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "title": self.title,
            "description": self.description,
            "due_date": self.due_date.isoformat() if self.due_date else None,
            "status": self.status,
            "priority": self.priority,
            "eisenhower_quadrant": self.eisenhower_quadrant,
            "completed": self.completed,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            "tags": [tag.to_dict() for tag in self.tags]
        }

# ----------------------------------------------------
# 4. Utilidades
# ----------------------------------------------------
def login_required(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        if "user_id" not in session:
            return jsonify({"message": "Acceso no autorizado."}), 401
        g.user_id = session["user_id"]
        return f(*args, **kwargs)
    return wrapper

def create_tables():
    with app.app_context():
        db.create_all()
        print("Base de datos creada.")

def process_tag_ids_for_task(user_id, tag_ids):
    if not tag_ids:
        return []
    ids = [int(x) for x in tag_ids if x]
    tags = Tag.query.filter(Tag.id.in_(ids), Tag.user_id == user_id).all()
    return tags

# ----------------------------------------------------
# 5. Auth (YA SIN /api)
# ----------------------------------------------------
@app.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"message": "Email y contraseña obligatorios."}), 400

    if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
        return jsonify({"message": "Email inválido."}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"message": "Email ya registrado."}), 409

    hashed = bcrypt.generate_password_hash(password).decode("utf-8")
    user = User(email=email, password=hashed)
    db.session.add(user)
    db.session.commit()

    session["user_id"] = user.id
    session.permanent = True

    return jsonify({"message": "Registro exitoso.", "user": user.to_dict()}), 201

@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    user = User.query.filter_by(email=email).first()

    if not user or not bcrypt.check_password_hash(user.password, password):
        return jsonify({"message": "Credenciales inválidas."}), 401

    session["user_id"] = user.id
    session.permanent = True
    return jsonify({"message": "Login exitoso.", "user": user.to_dict()})

@app.route("/logout", methods=["POST"])
def logout():
    session.pop("user_id", None)
    return jsonify({"message": "Sesión cerrada."})

@app.route("/check_auth")
def check_auth():
    if "user_id" in session:
        return jsonify({"authenticated": True})
    return jsonify({"authenticated": False}), 401

# ----------------------------------------------------
# 6. Tareas (SIN /api)
# ----------------------------------------------------
@app.route("/tasks", methods=["GET", "POST"])
@login_required
def tasks():
    user_id = g.user_id

    if request.method == "GET":
        tasks = Task.query.filter_by(user_id=user_id).order_by(
            Task.completed.asc(),
            Task.due_date.asc(),
            Task.created_at.desc()
        ).all()
        return jsonify([t.to_dict() for t in tasks])

    if request.method == "POST":
        data = request.get_json()
        title = data.get("title")
        tag_ids = data.get("tag_ids", [])

        if not title:
            return jsonify({"message": "Título obligatorio."}), 400

        due_date = None
        if data.get("due_date"):
            try:
                due_date = datetime.fromisoformat(
                    data["due_date"].replace("Z", "+00:00").split("+")[0]
                )
            except:
                return jsonify({"message": "Fecha inválida."}), 400

        task = Task(
            user_id=user_id,
            title=title,
            description=data.get("description"),
            due_date=due_date,
            status=data.get("status", "pending"),
            priority=data.get("priority", "normal"),
            eisenhower_quadrant=data.get("eisenhower_quadrant", "ni_urgente_ni_importante"),
            completed=data.get("completed", False)
        )

        task.tags = process_tag_ids_for_task(user_id, tag_ids)
        db.session.add(task)
        db.session.commit()

        return jsonify(task.to_dict()), 201

@app.route("/tasks/<int:task_id>", methods=["PUT", "DELETE"])
@login_required
def task_detail(task_id):
    user_id = g.user_id
    task = Task.query.filter_by(id=task_id, user_id=user_id).first()

    if not task:
        return jsonify({"message": "Tarea no encontrada."}), 404

    if request.method == "DELETE":
        db.session.delete(task)
        db.session.commit()
        return "", 204

    data = request.get_json()

    task.title = data.get("title", task.title)
    task.description = data.get("description", task.description)
    task.status = data.get("status", task.status)
    task.priority = data.get("priority", task.priority)
    task.eisenhower_quadrant = data.get("eisenhower_quadrant", task.eisenhower_quadrant)

    if "completed" in data:
        task.completed = data["completed"]

    if "due_date" in data:
        if not data["due_date"]:
            task.due_date = None
        else:
            try:
                task.due_date = datetime.fromisoformat(
                    data["due_date"].replace("Z", "+00:00").split("+")[0]
                )
            except:
                return jsonify({"message": "Fecha inválida."}), 400

    if "tag_ids" in data:
        task.tags = process_tag_ids_for_task(user_id, data["tag_ids"])

    db.session.commit()
    return jsonify(task.to_dict())

@app.route("/tasks/<int:task_id>/complete", methods=["PATCH"])
@login_required
def task_toggle(task_id):
    user_id = g.user_id
    task = Task.query.filter_by(id=task_id, user_id=user_id).first()

    if not task:
        return jsonify({"message": "Tarea no encontrada."}), 404

    data = request.get_json()
    if "completed" not in data:
        return jsonify({"message": "Campo 'completed' obligatorio."}), 400

    task.completed = data["completed"]
    db.session.commit()

    return jsonify(task.to_dict())

# ----------------------------------------------------
# 7. Etiquetas (SIN /api)
# ----------------------------------------------------
@app.route("/tags", methods=["GET", "POST"])
@login_required
def tags():
    user_id = g.user_id

    if request.method == "GET":
        tags = Tag.query.filter_by(user_id=user_id).order_by(Tag.name.asc()).all()
        return jsonify([t.to_dict() for t in tags])

    data = request.get_json()
    name = data.get("name", "").strip()

    if not name:
        return jsonify({"message": "Nombre obligatorio."}), 400

    if Tag.query.filter_by(name=name, user_id=user_id).first():
        return jsonify({"message": "Ya existe esta etiqueta."}), 409

    tag = Tag(name=name, user_id=user_id)
    db.session.add(tag)
    db.session.commit()

    return jsonify(tag.to_dict()), 201

@app.route("/tags/<int:tag_id>", methods=["DELETE"])
@login_required
def tag_delete(tag_id):
    user_id = g.user_id
    tag = Tag.query.filter_by(id=tag_id, user_id=user_id).first()

    if not tag:
        return jsonify({"message": "Etiqueta no encontrada."}), 404

    db.session.delete(tag)
    db.session.commit()

    return "", 204

# ----------------------------------------------------
# 8. RUN
# ----------------------------------------------------
if __name__ == "__main__":
    create_tables()
    app.run(debug=True, port=5000)
