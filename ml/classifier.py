from pathlib import Path
import joblib

MODEL_PATH = Path('artifacts/model.joblib')

DEFAULT_RULES = {
    'road damage': ('Road Damage', 'Public Works Department', 'Medium'),
    'garbage': ('Garbage', 'Sanitation Department', 'Medium'),
    'water leakage': ('Water Leakage', 'Water Supply Department', 'High'),
    'drainage': ('Drainage', 'Drainage Department', 'High'),
    'street light': ('Street Light', 'Electricity Department', 'Low'),
    'electricity': ('Electricity', 'Electricity Department', 'High'),
    'traffic signal': ('Traffic Signal', 'Traffic Police', 'High'),
    'sewage': ('Sewage', 'Drainage Department', 'High'),
    'park': ('Park Maintenance', 'Parks Department', 'Low'),
    'animal': ('Animal Control', 'Veterinary Department', 'Medium'),
}


def predict_complaint(title: str, description: str):
    text = f'{title} {description}'.lower()

    if MODEL_PATH.exists():
        model_bundle = joblib.load(MODEL_PATH)
        vectorizer = model_bundle['vectorizer']
        category_model = model_bundle['category_model']
        department_model = model_bundle['department_model']
        priority_model = model_bundle['priority_model']

        features = vectorizer.transform([text])
        category = category_model.predict(features)[0]
        department = department_model.predict(features)[0]
        priority = priority_model.predict(features)[0]
        return {
            'category': category,
            'department': department,
            'priority': priority,
        }

    for keyword, values in DEFAULT_RULES.items():
        if keyword in text:
            category, department, priority = values
            return {
                'category': category,
                'department': department,
                'priority': priority,
            }

    return {
        'category': 'Public Property Damage',
        'department': 'Municipal Engineering',
        'priority': 'Medium',
    }
