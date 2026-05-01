"""
MindCare AI - Mental Health Prediction API

This Flask service provides ML-based mental wellness predictions using
trained models (Random Forest, Logistic Regression, etc.)

Environment Variables:
- FLASK_ENV: development/production
- PORT: Server port (default: 5001)
- MODEL_PATH: Path to saved model file

Endpoints:
- GET /health - Health check
- POST /predict - Get mental wellness prediction

Request format for /predict:
{
    "sleep_hours": 7,
    "stress_level": 5,
    "exercise_minutes": 30,
    "screen_time": 6,
    "social_interaction": 7,
    "mood_score": 7,
    "water_intake": 8
}

Response format:
{
    "success": true,
    "prediction": 0,
    "prediction_label": "low-risk",
    "confidence": 85.5,
    "wellness_score": 75,
    "risk_level": "low",
    "risk_description": "Your mental wellness indicators look positive.",
    "explanation": "Your habits are supporting good mental wellness.",
    "suggestions": [...]
}
"""
