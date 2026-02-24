import uvicorn
from fastapi import FastAPI, Body
import numpy as np
import pandas as pd
import pickle
from fastapi import HTTPException

app = FastAPI()

# load model
with open("model.pkl", "rb") as f:
    model = pickle.load(f)

with open("vectorizer.pkl", "rb") as f:
    vectorizer = pickle.load(f)


@app.post('/predict')
def Sceret_Scan(text: str = Body(...,
        media_type="text/plain",
        title="Enter Text",
        description="Paste your message here"
    )
):

    words = text.split()

    for word in words:

        vec = vectorizer.transform([word])  # no toarray() needed
        probs = model.predict_proba(vec)[0]  # probabilities
        pred = model.predict(vec)[0]         # predicted class

        confidence = round(float(max(probs)) * 100, 2)

        if pred == 2:
            return {
                "found": True,
                "risk": "Critical",
                "secret": word,
                "confidence": confidence
            }

        if pred == 1:
            return {
                "found": True,
                "risk": "High Risk",
                "secret": word,
                "confidence": confidence
            }

    return {
        "found": False,
        "risk": "No Risk",
        "confidence": confidence
    }


if __name__ == '__main__':
    uvicorn.run(app, host='127.0.0.1', port=8000)
