import csv
from pathlib import Path

import joblib
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.multioutput import MultiOutputClassifier
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import LabelEncoder

DATA_PATH = Path('data/sample_complaints.csv')
ARTIFACT_PATH = Path('artifacts/model.joblib')
ARTIFACT_PATH.parent.mkdir(parents=True, exist_ok=True)


def load_data():
    df = pd.read_csv(DATA_PATH)
    df['text'] = (df['title'].fillna('') + ' ' + df['description'].fillna('')).str.lower()
    return df


def train():
    df = load_data()
    vectorizer = TfidfVectorizer(stop_words='english', max_features=4000)
    features = vectorizer.fit_transform(df['text'])

    category_model = LogisticRegression(max_iter=1000)
    department_model = LogisticRegression(max_iter=1000)
    priority_model = LogisticRegression(max_iter=1000)

    category_model.fit(features, df['category'])
    department_model.fit(features, df['department'])
    priority_model.fit(features, df['priority'])

    joblib.dump(
        {
            'vectorizer': vectorizer,
            'category_model': category_model,
            'department_model': department_model,
            'priority_model': priority_model,
        },
        ARTIFACT_PATH,
    )
    print(f'Saved model artifact to {ARTIFACT_PATH}')


if __name__ == '__main__':
    train()
