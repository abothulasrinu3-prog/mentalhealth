import json
import os

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import ExtraTreesClassifier, GradientBoostingClassifier, RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, f1_score, precision_score, recall_score
from sklearn.model_selection import train_test_split
from sklearn.naive_bayes import GaussianNB
from sklearn.neighbors import KNeighborsClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC
from sklearn.tree import DecisionTreeClassifier

os.makedirs('./data', exist_ok=True)
os.makedirs('./model', exist_ok=True)


def slugify(name):
    return name.lower().replace(' ', '_').replace('-', '_')


def generate_synthetic_dataset(n_samples=3000):
    np.random.seed(42)

    data = {
        'sleep_hours': np.random.normal(7, 1.5, n_samples).clip(3, 12),
        'stress_level': np.random.randint(1, 11, n_samples),
        'exercise_minutes': np.random.exponential(30, n_samples).clip(0, 180),
        'screen_time': np.random.normal(6, 2, n_samples).clip(1, 16),
        'social_interaction': np.random.randint(1, 11, n_samples),
        'mood_score': np.random.randint(1, 11, n_samples),
        'water_intake': np.random.poisson(6, n_samples).clip(0, 15)
    }

    df = pd.DataFrame(data)
    risk_score = (
        (df['sleep_hours'] < 6) * 2 +
        (df['stress_level'] > 7) * 2 +
        (df['exercise_minutes'] < 15) * 1 +
        (df['screen_time'] > 8) * 1 +
        (df['social_interaction'] < 4) * 1 +
        (df['mood_score'] < 4) * 2 +
        (df['water_intake'] < 5) * 1 +
        np.random.normal(0, 0.5, n_samples)
    )

    df['risk_level'] = pd.cut(
        risk_score,
        bins=[-np.inf, 2, 5, np.inf],
        labels=[0, 1, 2]
    ).astype(int)

    return df


def build_models():
    return {
        'Random Forest': RandomForestClassifier(n_estimators=150, random_state=42),
        'Logistic Regression': LogisticRegression(random_state=42, max_iter=1000),
        'Decision Tree': DecisionTreeClassifier(random_state=42),
        'K-Nearest Neighbors': KNeighborsClassifier(n_neighbors=5),
        'Naive Bayes': GaussianNB(),
        'Support Vector Machine': SVC(probability=True, random_state=42),
        'Gradient Boosting': GradientBoostingClassifier(random_state=42),
        'Extra Trees': ExtraTreesClassifier(n_estimators=150, random_state=42)
    }


def train_and_evaluate_models(X_train, X_test, y_train, y_test):
    models = build_models()
    results = {}

    for name, model in models.items():
        print(f'\nTraining {name}...')
        model.fit(X_train, y_train)
        y_pred = model.predict(X_test)

        metrics = {
            'accuracy': accuracy_score(y_test, y_pred),
            'precision': precision_score(y_test, y_pred, average='weighted', zero_division=0),
            'recall': recall_score(y_test, y_pred, average='weighted', zero_division=0),
            'f1': f1_score(y_test, y_pred, average='weighted', zero_division=0)
        }

        results[name] = {
            'model': model,
            **metrics
        }

        print(
            f"Accuracy: {metrics['accuracy']:.4f} | "
            f"Precision: {metrics['precision']:.4f} | "
            f"Recall: {metrics['recall']:.4f} | "
            f"F1: {metrics['f1']:.4f}"
        )

    return results


def save_model_artifacts(results, scaler, features):
    joblib.dump(scaler, './model/scaler.pkl')
    print('\nScaler saved to ./model/scaler.pkl')

    metadata = {
        'features': features,
        'models': {}
    }

    best_model_name = max(results, key=lambda name: results[name]['f1'])
    best_model_slug = slugify(best_model_name)

    for name, result in results.items():
        slug = slugify(name)
        model_path = f'./model/{slug}.pkl'
        joblib.dump(result['model'], model_path)
        metadata['models'][slug] = {
            'display_name': name,
            'path': model_path,
            'accuracy': round(result['accuracy'], 4),
            'precision': round(result['precision'], 4),
            'recall': round(result['recall'], 4),
            'f1': round(result['f1'], 4)
        }
        print(f'Saved {name} to {model_path}')

    joblib.dump(results[best_model_name]['model'], './model/best_model.pkl')
    metadata['best_model'] = best_model_slug

    with open('./model/metadata.json', 'w', encoding='utf-8') as metadata_file:
        json.dump(metadata, metadata_file, indent=2)

    print(f'Best model: {best_model_name} ({best_model_slug})')
    print('Saved ./model/best_model.pkl and ./model/metadata.json')


def main():
    print('Generating synthetic dataset...')
    df = generate_synthetic_dataset()
    df.to_csv('./data/mental_wellness_dataset.csv', index=False)
    print(f'Dataset saved with {len(df)} samples')
    print(f"Risk distribution:\n{df['risk_level'].value_counts().sort_index()}")

    features = [
        'sleep_hours',
        'stress_level',
        'exercise_minutes',
        'screen_time',
        'social_interaction',
        'mood_score',
        'water_intake'
    ]

    X = df[features]
    y = df['risk_level']

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    X_full_scaled = scaler.fit_transform(X)

    results = train_and_evaluate_models(X_train_scaled, X_test_scaled, y_train, y_test)

    print('\nRetraining models on the full dataset...')
    for result in results.values():
        result['model'].fit(X_full_scaled, y)

    save_model_artifacts(results, scaler, features)

    comparison = pd.DataFrame({
        name: {
            'Accuracy': f"{result['accuracy']:.4f}",
            'Precision': f"{result['precision']:.4f}",
            'Recall': f"{result['recall']:.4f}",
            'F1-Score': f"{result['f1']:.4f}"
        }
        for name, result in results.items()
    }).T

    print('\n' + '=' * 60)
    print('MODEL COMPARISON SUMMARY')
    print('=' * 60)
    print(comparison)
    print('=' * 60)


if __name__ == '__main__':
    main()
