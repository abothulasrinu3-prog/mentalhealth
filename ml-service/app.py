from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import os
import json
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

MODEL_DIR = os.getenv('MODEL_DIR', './model')
MODEL_PATH = os.getenv('MODEL_PATH', os.path.join(MODEL_DIR, 'best_model.pkl'))
SCALER_PATH = os.path.join(MODEL_DIR, 'scaler.pkl')
METADATA_PATH = os.path.join(MODEL_DIR, 'metadata.json')

model_registry = {}
model_metadata = {}
scaler = None
default_model_name = None


def get_feature_payload(source):
    return {
        'sleep_hours': float(source.get('sleep_hours', 7)),
        'stress_level': float(source.get('stress_level', 5)),
        'exercise_minutes': float(source.get('exercise_minutes', 0)),
        'screen_time': float(source.get('screen_time', 4)),
        'social_interaction': float(source.get('social_interaction', 5)),
        'mood_score': float(source.get('mood_score', 5)),
        'water_intake': float(source.get('water_intake', 6))
    }


def feature_array(feature_payload):
    return np.array([
        feature_payload['sleep_hours'],
        feature_payload['stress_level'],
        feature_payload['exercise_minutes'],
        feature_payload['screen_time'],
        feature_payload['social_interaction'],
        feature_payload['mood_score'],
        feature_payload['water_intake']
    ]).reshape(1, -1)


def get_risk_label(prediction):
    labels = {0: 'low-risk', 1: 'medium-risk', 2: 'high-risk'}
    return labels.get(int(prediction), 'unknown')


def load_models():
    global scaler, default_model_name, model_metadata

    model_registry.clear()
    model_metadata = {}

    if os.path.exists(METADATA_PATH):
        try:
            with open(METADATA_PATH, 'r', encoding='utf-8') as metadata_file:
                model_metadata = json.load(metadata_file)
        except Exception as metadata_error:
            print(f'Warning: could not load model metadata: {metadata_error}')

    if os.path.exists(SCALER_PATH):
        try:
            scaler = joblib.load(SCALER_PATH)
        except Exception as scaler_error:
            scaler = None
            print(f'Warning: could not load scaler: {scaler_error}')

    if os.path.isdir(MODEL_DIR):
        for file_name in os.listdir(MODEL_DIR):
            if not file_name.endswith('.pkl') or file_name == 'scaler.pkl':
                continue

            model_name = file_name[:-4]
            file_path = os.path.join(MODEL_DIR, file_name)

            try:
                model_registry[model_name] = joblib.load(file_path)
            except Exception as model_error:
                print(f'Warning: could not load {file_name}: {model_error}')

    if 'best_model' in model_registry:
        default_model_name = 'best_model'
    elif model_registry:
        default_model_name = sorted(model_registry.keys())[0]
    else:
        default_model_name = None


def simulate_prediction(features):
    sleep = features['sleep_hours']
    stress = features['stress_level']
    exercise = features['exercise_minutes']
    screen = features['screen_time']
    social = features['social_interaction']
    mood = features['mood_score']
    water = features['water_intake']

    risk_score = 0
    if sleep < 6:
        risk_score += 2
    if stress > 7:
        risk_score += 2
    if exercise < 15:
        risk_score += 1
    if screen > 8:
        risk_score += 1
    if social < 4:
        risk_score += 1
    if mood < 4:
        risk_score += 2
    if water < 5:
        risk_score += 1

    if risk_score >= 5:
        prediction = 2
    elif risk_score >= 3:
        prediction = 1
    else:
        prediction = 0

    return {
        'prediction': prediction,
        'label': get_risk_label(prediction),
        'confidence': min(88, 58 + risk_score * 5)
    }


def calculate_wellness_scores(features):
    sleep = features['sleep_hours']
    stress = features['stress_level']
    exercise = features['exercise_minutes']
    screen = features['screen_time']
    social = features['social_interaction']
    mood = features['mood_score']
    water = features['water_intake']

    overall = round(max(0, min(100, 45 + (mood / 10) * 20 + ((8 - abs(8 - sleep)) / 8) * 12 +
                        (exercise / 45) * 10 + (water / 8) * 6 + (social / 10) * 7 -
                        (stress / 10) * 12 - max(0, screen - 8) * 2)))

    burnout_risk = round(max(0, min(100,
        (stress / 10) * 42 +
        max(0, 8 - sleep) / 5 * 22 +
        max(0, screen - 6) / 8 * 8 +
        max(0, 6 - mood) / 5 * 18 +
        max(0, 4 - social) / 4 * 10
    )))

    anxiety_risk = round(max(0, min(100,
        (stress / 10) * 48 +
        max(0, 7 - sleep) / 4 * 18 +
        (screen / 12) * 12 +
        max(0, 6 - mood) / 5 * 16 +
        max(0, 4 - social) / 4 * 6
    )))

    recovery_score = round(max(0, min(100,
        (sleep / 8) * 30 +
        (exercise / 45) * 18 +
        (water / 8) * 12 +
        (social / 10) * 16 +
        (mood / 10) * 16 +
        ((10 - stress) / 10) * 8
    )))

    return {
        'overall': overall,
        'burnout_risk': burnout_risk,
        'anxiety_risk': anxiety_risk,
        'recovery_score': recovery_score,
        'sleep_debt': round(max(0, 8 - sleep), 1)
    }


def build_explanation(features):
    sleep = features['sleep_hours']
    stress = features['stress_level']
    exercise = features['exercise_minutes']
    screen = features['screen_time']
    social = features['social_interaction']
    mood = features['mood_score']
    water = features['water_intake']

    strongest_risk_factors = [
        'sleep is below a steady recovery range' if sleep < 6.5 else None,
        'stress load is elevated' if stress >= 7 else None,
        'mood score is trending low' if mood <= 4.5 else None,
        'screen time is adding mental load' if screen >= 8 else None,
        'social support appears limited' if social <= 4 else None,
        'hydration is below a helpful baseline' if water < 6 else None
    ]

    protective_factors = [
        'sleep is within a healthier range' if sleep >= 7 else None,
        'movement is supporting recovery' if exercise >= 20 else None,
        'hydration is helping stability' if water >= 6 else None,
        'connection may be acting as a buffer' if social >= 6 else None,
        'mood baseline is giving some resilience' if mood >= 6 else None
    ]

    return {
        'strongest_risk_factors': [item for item in strongest_risk_factors if item],
        'protective_factors': [item for item in protective_factors if item]
    }


def generate_suggestions(features):
    sleep = features['sleep_hours']
    stress = features['stress_level']
    exercise = features['exercise_minutes']
    screen = features['screen_time']
    mood = features['mood_score']
    water = features['water_intake']

    suggestions = []

    if sleep < 6.5:
        suggestions.append({
            'text': 'Aim for a lower-stimulation wind-down and 7-8 hours tonight.',
            'category': 'sleep'
        })

    if stress >= 7:
        suggestions.append({
            'text': 'Protect two brief reset moments today to interrupt the stress cycle.',
            'category': 'stress-reduction'
        })

    if exercise < 20:
        suggestions.append({
            'text': 'Add 15-20 minutes of walking or stretching to support regulation.',
            'category': 'physical-activity'
        })

    if water < 6:
        suggestions.append({
            'text': 'Keep water visible and target steady hydration through the day.',
            'category': 'hydration'
        })

    if screen >= 8:
        suggestions.append({
            'text': 'Use one screen-free block before bed or after work to lower mental carryover.',
            'category': 'general'
        })

    if mood < 5:
        suggestions.append({
            'text': 'Use journaling or a supportive conversation to process what feels heaviest.',
            'category': 'journaling'
        })

    if not suggestions:
        suggestions.append({
            'text': 'Your current habits look supportive. Focus on consistency this week.',
            'category': 'motivation'
        })

    return suggestions


def predict_with_model(model_name, model, features, features_array):
    transformed = scaler.transform(features_array) if scaler is not None else features_array
    prediction = int(model.predict(transformed)[0])

    probability = None
    confidence = None
    if hasattr(model, 'predict_proba'):
        raw_probability = model.predict_proba(transformed)[0]
        probability = {
            'low': round(float(raw_probability[0]), 4),
            'medium': round(float(raw_probability[1]), 4),
            'high': round(float(raw_probability[2]), 4)
        }
        confidence = round(float(np.max(raw_probability)) * 100, 2)

    return {
        'model': model_name,
        'prediction': prediction,
        'label': get_risk_label(prediction),
        'confidence': confidence,
        'probability': probability
    }


def run_ensemble(features):
    features_np = feature_array(features)
    model_votes = []

    for model_name, model in model_registry.items():
        try:
            model_votes.append(predict_with_model(model_name, model, features, features_np))
        except Exception as prediction_error:
            print(f'Warning: {model_name} prediction failed: {prediction_error}')

    if not model_votes:
        fallback = simulate_prediction(features)
        model_votes = [{
            'model': 'heuristic-fallback',
            'prediction': fallback['prediction'],
            'label': fallback['label'],
            'confidence': fallback['confidence'],
            'probability': None
        }]
        ensemble_prediction = fallback['prediction']
        ensemble_confidence = fallback['confidence']
    else:
        mean_prediction = sum(vote['prediction'] for vote in model_votes) / len(model_votes)
        if mean_prediction >= 1.5:
            ensemble_prediction = 2
        elif mean_prediction >= 0.5:
            ensemble_prediction = 1
        else:
            ensemble_prediction = 0

        confidences = [vote['confidence'] for vote in model_votes if vote['confidence'] is not None]
        agreement = sum(1 for vote in model_votes if vote['prediction'] == ensemble_prediction) / len(model_votes)
        confidence_base = round(sum(confidences) / len(confidences), 2) if confidences else 70.0
        ensemble_confidence = round(min(96, confidence_base * 0.7 + agreement * 30), 2)

    return {
        'ensemble_prediction': {
            'prediction': ensemble_prediction,
            'label': get_risk_label(ensemble_prediction),
            'confidence': ensemble_confidence,
            'model_count': len(model_votes)
        },
        'model_votes': model_votes
    }


load_models()


@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'default_model': default_model_name,
        'model_loaded': bool(model_registry),
        'scaler_loaded': scaler is not None,
        'available_models': sorted(model_registry.keys()),
        'metadata_loaded': bool(model_metadata)
    })


@app.route('/predict', methods=['POST'])
def predict():
    try:
        features = get_feature_payload(request.get_json() or {})
        ensemble = run_ensemble(features)
        wellness_scores = calculate_wellness_scores(features)
        explanation = build_explanation(features)
        suggestions = generate_suggestions(features)

        prediction = ensemble['ensemble_prediction']['prediction']
        label = ensemble['ensemble_prediction']['label']

        risk_level = 'high' if prediction == 2 else 'medium' if prediction == 1 else 'low'
        risk_description = {
            'low': 'Your mental wellness indicators look positive.',
            'medium': 'Some wellness indicators need attention.',
            'high': 'Several wellness indicators show concerning patterns.'
        }[risk_level]

        return jsonify({
            'success': True,
            'source': 'ensemble-models' if model_registry else 'heuristic-fallback',
            'prediction': prediction,
            'prediction_label': label,
            'confidence': ensemble['ensemble_prediction']['confidence'],
            'wellness_score': wellness_scores['overall'],
            'risk_level': risk_level,
            'risk_description': risk_description,
            'explanation': '; '.join(explanation['strongest_risk_factors']) or 'Your habits are supporting good mental wellness.',
            'suggestions': suggestions,
            'available_models': sorted(model_registry.keys()),
            'model_used': default_model_name or 'heuristic-fallback'
        })
    except Exception as error:
        return jsonify({
            'success': False,
            'error': str(error)
        }), 500


@app.route('/predict-advanced', methods=['POST'])
def predict_advanced():
    try:
        features = get_feature_payload(request.get_json() or {})
        ensemble = run_ensemble(features)
        wellness_scores = calculate_wellness_scores(features)
        explanation = build_explanation(features)
        suggestions = generate_suggestions(features)

        return jsonify({
            'success': True,
            'source': 'ensemble-models' if model_registry else 'heuristic-fallback',
            'input': features,
            'available_models': sorted(model_registry.keys()),
            'ensemble_prediction': ensemble['ensemble_prediction'],
            'model_votes': ensemble['model_votes'],
            'wellness_scores': wellness_scores,
            'explanation': explanation,
            'suggestions': suggestions
        })
    except Exception as error:
        return jsonify({
            'success': False,
            'error': str(error)
        }), 500


if __name__ == '__main__':
    port = int(os.getenv('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=True)
