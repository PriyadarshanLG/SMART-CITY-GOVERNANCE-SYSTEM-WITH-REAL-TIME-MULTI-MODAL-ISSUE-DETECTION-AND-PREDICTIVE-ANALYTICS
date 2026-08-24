from fastapi import FastAPI
from pydantic import BaseModel

from classifier import predict_complaint

app = FastAPI(title='Smart City ML Service', version='1.0.0')


class ComplaintInput(BaseModel):
    title: str
    description: str


@app.get('/health')
def health():
    return {'status': 'ok', 'service': 'smart-city-ml'}


@app.post('/predict')
def predict(payload: ComplaintInput):
    result = predict_complaint(payload.title, payload.description)
    return result
