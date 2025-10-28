from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Issue(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    category = db.Column(db.String(100))
    department = db.Column(db.String(100))
    description = db.Column(db.Text)
    location = db.Column(db.String(200))
    audio_url = db.Column(db.String(500))  # URL or file path to uploaded audio
