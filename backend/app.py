from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Load trained model
model = joblib.load("model.pkl")  # adjust path if needed
scaler = joblib.load("scaler.pkl")


@app.route("/predict", methods=["POST"])
def predict():
    data = request.json

    values = [
        data["radius_mean"],
        data["texture_mean"],
        data["perimeter_mean"],
        data["area_mean"],
        data["smoothness_mean"],
        data["compactness_mean"],
        data["concavity_mean"],
        data["concave_points_mean"],
        data["symmetry_mean"],
        data["fractal_dimension_mean"]
    ]

    values = np.array(values).reshape(1, -1)
    values = scaler.transform(values)

    prediction = model.predict(values)[0]
    prob = model.predict_proba(values)[0][1]

    return jsonify({
        "label": "Malignant" if prediction == 1 else "Benign",
        "probability": float(prob)
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=10000, debug=True)