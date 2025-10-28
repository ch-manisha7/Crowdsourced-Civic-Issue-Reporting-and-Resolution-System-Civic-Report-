from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import uuid
from datetime import datetime
import torch
import clip
from PIL import Image
import random
import time


# ----------------------------
# Initialize Flask
# ----------------------------
app = Flask(__name__)
CORS(app)
OTP_STORE = {}  # {aadhaar: {"otp": 123456, "expiry": timestamp}}


UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

REPORTS = []  # Temporary in-memory storage

# ----------------------------
# Dummy Users for Login
# ----------------------------
USERS = {
    "admin@example.com": {"password": "admin123", "role": "admin"},
    "user@example.com": {"password": "user123", "role": "user"},
}

# ----------------------------
# Load CLIP Model for AI
# ----------------------------
device = "cuda" if torch.cuda.is_available() else "cpu"
model, preprocess = clip.load("ViT-B/32", device="cpu")

# ----------------------------
# Categories & Departments
# ----------------------------
departments = {
    "pothole": "Municipal Roads Department",
    "damaged road": "Municipal Roads Department",
    "road block": "Traffic Police",
    "illegal barricade": "Traffic Police",
    "missing signboard": "Road Transport Authority",
    "damaged signage": "Road Transport Authority",
    "garbage": "Sanitation Department",
    "overflowing dustbin": "Sanitation Department",
    "public toilet issue": "Sanitation Department",
    "open drain": "Sewerage Department",
    "blocked manhole": "Sewerage Department",
    "missing manhole cover": "Sewerage Department",
    "sewer issue": "Sewerage Department",
    "water leakage": "Water Supply Board",
    "pipeline burst": "Water Supply Board",
    "flooding": "Stormwater Management Department",
    "waterlogging": "Stormwater Management Department",
    "streetlight not working": "Municipal Lighting Department",
    "electric hazard": "Electricity Board",
    "traffic signal malfunction": "Traffic Police",
    "illegal parking": "Traffic Police",
    "abandoned vehicle": "Traffic Police",
    "rash driving complaint": "Traffic Police",
    "bus stop shelter damaged": "Municipal Transport Department",
    "tree fallen": "Municipal Maintenance Department",
    "branch blocking road": "Municipal Maintenance Department",
    "air pollution": "Pollution Control Board",
    "noise pollution": "Pollution Control Board",
    "open burning of garbage": "Pollution Control Board",
    "illegal construction": "Urban Development Department",
    "street vendor encroachment": "Municipal Enforcement Department",
    "illegal dumping of debris": "Municipal Enforcement Department",
    "encroachment": "Municipal Enforcement Department",
    "fly-tipping": "Municipal Enforcement Department",
    "graffiti vandalism": "Urban Beautification Department",
    "public property damage": "Municipal Maintenance Department",
    "animal nuisance": "Animal Control Department",
    "crowd management issue": "Police Department"
}
categories = list(departments.keys())

# ----------------------------
# Department Priorities (1 = highest)
# ----------------------------
DEPARTMENT_PRIORITIES = {
    "Traffic Police": 1,
    "Police Department": 1,
    "Water Supply Board": 2,
    "Electricity Board": 2,
    "Sanitation Department": 3,
    "Municipal Roads Department": 3,
    "Sewerage Department": 3,
    "Stormwater Management Department": 4,
    "Municipal Lighting Department": 4,
    "Pollution Control Board": 4,
    "Urban Development Department": 5,
    "Municipal Enforcement Department": 5,
    "Road Transport Authority": 5,
    "Municipal Transport Department": 5,
    "Urban Beautification Department": 6,
    "Municipal Maintenance Department": 6,
    "Animal Control Department": 6,
}

# ----------------------------
# Helper: AI detection using CLIP
# ----------------------------
def detect_category_and_department_from_image(image_path):
    image = preprocess(Image.open(image_path)).unsqueeze(0).to(device)
    text_prompts = [f"This is an image of {category}" for category in categories]
    text_inputs = clip.tokenize(text_prompts).to(device)

    with torch.no_grad():
        image_features = model.encode_image(image)
        text_features = model.encode_text(text_inputs)

        image_features /= image_features.norm(dim=-1, keepdim=True)
        text_features /= text_features.norm(dim=-1, keepdim=True)

        similarity = (image_features @ text_features.T).squeeze(0)
        predicted_idx = similarity.argmax().item()

    predicted_category = categories[predicted_idx]
    department = departments[predicted_category]
    return predicted_category, department

# ----------------------------
# Login Route
# ----------------------------
@app.route("/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    user = USERS.get(email)
    if user and user["password"] == password:
        return jsonify({"message": "Login successful", "role": user["role"]})
    return jsonify({"error": "Invalid credentials"}), 401

# ----------------------------
# Aadhaar & OTP Verification
# ----------------------------
@app.route("/verify_aadhaar", methods=["POST"])
def verify_aadhaar():
    aadhaar = request.json.get("aadhaar")
    # Mock Aadhaar validation (just checks if it's 12 digits)
    is_valid = len(aadhaar) == 12 and aadhaar.isdigit()
    return jsonify({"valid": is_valid})

@app.route("/send_otp", methods=["POST"])
def send_otp():
    aadhaar = request.json.get("aadhaar")
    otp = random.randint(100000, 999999)
    OTP_STORE[aadhaar] = {"otp": otp, "expiry": time.time() + 180}  # expires in 3 mins
    print(f"📲 OTP for {aadhaar}: {otp}")  # simulate SMS send
    return jsonify({"message": "OTP sent successfully"})

@app.route("/verify_otp", methods=["POST"])
def verify_otp():
    aadhaar = request.json.get("aadhaar")
    otp = int(request.json.get("otp", 0))
    if aadhaar in OTP_STORE:
        stored = OTP_STORE[aadhaar]
        if time.time() < stored["expiry"] and otp == stored["otp"]:
            return jsonify({"verified": True})
    return jsonify({"verified": False})


# ----------------------------
# Serve uploaded files
# ----------------------------
@app.route("/uploads/<path:filename>")
def serve_uploads(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

# ----------------------------
# Report an Issue
# ----------------------------
@app.route("/report", methods=["POST"])
def report_issue():
    description = request.form.get("description", "")
    location = request.form.get("location", "")

    image_file = request.files.get("image")
    image_path = None
    if image_file:
        image_filename = f"{uuid.uuid4()}_{image_file.filename}"
        image_path = os.path.join(UPLOAD_FOLDER, image_filename)
        image_file.save(image_path)

    audio_file = request.files.get("audio")
    audio_path = None
    if audio_file:
        audio_filename = f"{uuid.uuid4()}_{audio_file.filename}"
        audio_path = os.path.join(UPLOAD_FOLDER, audio_filename)
        audio_file.save(audio_path)

    if image_path:
        category, department = detect_category_and_department_from_image(image_path)
    else:
        category, department = ("general issue", "Municipal Department")

    report = {
        "id": len(REPORTS) + 1,
        "image": f"uploads/{os.path.basename(image_path)}" if image_path else None,
        "audio": f"uploads/{os.path.basename(audio_path)}" if audio_path else None,
        "description": description,
        "location": location,
        "category": category,
        "department": department,
        "priority": DEPARTMENT_PRIORITIES.get(department, 5),
        "status": "Pending Verification",
        "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "upvotes": 0
    }
    REPORTS.append(report)

    return jsonify({
        "message": "Report submitted successfully",
        "report_id": report["id"],
        "category": category,
        "department": department,
        "priority": report["priority"]
    })

# ----------------------------
# Get all reports
# ----------------------------
@app.route("/issues", methods=["GET"])
def get_issues():
    return jsonify(REPORTS)

# ----------------------------
# Get reports grouped by department (with priority)
# ----------------------------
@app.route("/departments_with_priority", methods=["GET"])
def get_departments_with_priority():
    dept_issues = {}
    for report in REPORTS:
        dept = report["department"]
        if dept not in dept_issues:
            dept_issues[dept] = {
                "priority": DEPARTMENT_PRIORITIES.get(dept, 5),
                "reports": []
            }
        dept_issues[dept]["reports"].append(report)

    sorted_departments = dict(
        sorted(dept_issues.items(), key=lambda item: item[1]["priority"])
    )
    return jsonify(sorted_departments)

# ----------------------------
# Update status (Admin)
# ----------------------------
@app.route("/update_status/<int:report_id>", methods=["POST"])
def update_status(report_id):
    status = request.json.get("status")
    for report in REPORTS:
        if report["id"] == report_id:
            report["status"] = status
            return jsonify({"message": "Status updated successfully"})
    return jsonify({"error": "Report not found"}), 404

# ----------------------------
# Upvote an issue
# ----------------------------
@app.route("/upvote/<int:report_id>", methods=["POST"])
def upvote_issue(report_id):
    for report in REPORTS:
        if report["id"] == report_id:
            report["upvotes"] = report.get("upvotes", 0) + 1
            return jsonify({"message": "Upvote added", "upvotes": report["upvotes"]})
    return jsonify({"error": "Report not found"}), 404

# ----------------------------
# Run App
# ----------------------------
if __name__ == "__main__":
    app.run(debug=True)
