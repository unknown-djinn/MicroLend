"""
OPTIONAL ML STARTER

This is intentionally separate from the Vercel demo. It shows how a properly
licensed tabular lending dataset can be used to train a model offline.

Install:
  pip install pandas scikit-learn joblib

Then adapt DATA_PATH and TARGET to your validated dataset.
"""

import os
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.metrics import classification_report

DATA_PATH = os.environ.get("DATA_PATH", "data/loan_data.csv")
TARGET = os.environ.get("TARGET", "defaulted")

df = pd.read_csv(DATA_PATH)
df = df.dropna(subset=[TARGET])

X = df.drop(columns=[TARGET])
y = df[TARGET].astype(int)

numeric = X.select_dtypes(include=["number"]).columns.tolist()
categorical = [c for c in X.columns if c not in numeric]

pre = ColumnTransformer([
    ("num", Pipeline([
        ("imputer", SimpleImputer(strategy="median")),
        ("scale", StandardScaler())
    ]), numeric),
    ("cat", Pipeline([
        ("imputer", SimpleImputer(strategy="most_frequent")),
        ("onehot", OneHotEncoder(handle_unknown="ignore"))
    ]), categorical)
])

model = Pipeline([
    ("preprocess", pre),
    ("model", HistGradientBoostingClassifier(max_iter=150, random_state=42))
])

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

model.fit(X_train, y_train)
print(classification_report(y_test, model.predict(X_test)))

os.makedirs("models", exist_ok=True)
joblib.dump(model, "models/loan_risk_model.joblib")
print("Saved models/loan_risk_model.joblib")
