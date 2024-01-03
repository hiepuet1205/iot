from flask import Flask, request, jsonify
import joblib
from flask_cors import CORS

app = Flask(__name__)
cors = CORS(app, resources={r"/*": {"origins": "*"}})

# Load the model
model_t = joblib.load('temperature.pkl')
model_h = joblib.load('humidity.pkl')
model_s = joblib.load('soil_moisture.pkl')

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    temp = model_t.predict([data['features']])
    hum = model_h.predict([data['features']])
    soil = model_s.predict([data['features']])
    
    temp_list = temp.tolist()
    hum_list = hum.tolist()
    soil_list = soil.tolist()

    return jsonify({'temp': temp_list, 'hum': hum_list, 'soil': soil_list})

if __name__ == '__main__':
    app.run(debug=True)
