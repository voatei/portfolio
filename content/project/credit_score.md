---
title: "Credit Score Analysis & Risk Management (Python)"
date: "2025-12-31"
excerpt: "Credit risk analysis project using 84 financial and behavioral features to predict customer default and credit score. Applied statistical methods (PCA, CCA) and machine learning models (Logistic Regression, Random Forest, XGBoost), showing that ratio-based financial indicators and non-linear models significantly improve predictive performance and interpretability."
tags: ["Python", "Machine Learning", "Logistic Regression", "Random Forest", "XGBoost", "PCA", "Classification", "Regression"]
thumbnail: https://media.istockphoto.com/id/1938654475/fr/photo/concept-de-gestion-des-risques-%C3%A9conomiques-homme-daffaires-tenant-un-bloc-de-bois-avec-le.jpg?s=1024x1024&w=is&k=20&c=0czx8J0w9o3svQulY9vtqrDU4SseAk3mmTtxGoIZUx4=
---

**ENSIIE – Data Analysis Project (2025–2026)**  

**Team Members**  
KOUM Soknan  
RA Veasna  
DIN Sokheng  
SEK Sopheak Voatei  
THONG Ousaphea  

---

## Project Overview

This project answers a fundamental question in credit risk modeling:

**Can we predict customer default and credit score using detailed financial and behavioral data?**

Dataset characteristics:

- 1000 customers  
- 84 financial & behavioral features  
- Engineered financial ratios  
- Spending behavior across 11 categories  
- Binary financial attributes  

---

## Data Loading

```python
import pandas as pd
import numpy as np

df = pd.read_csv("credit_score.csv")
df.head()
```

Basic inspection:

```python
df.info()
df.describe()
df.isnull().sum()
```

No missing values were found.

---

## Feature Engineering & Preprocessing

### Encoding Categorical Variable

```python
df["CAT_GAMBLING"] = df["CAT_GAMBLING"].map({
    "no": 0,
    "low": 1,
    "high": 2
})
```

### Log Transformation (Heavy-Tailed Variables)

```python
import numpy as np

skewed_cols = ["INCOME", "DEBT", "SAVINGS"]

for col in skewed_cols:
    df[col] = np.log1p(df[col])
```

### Robust Scaling

```python
from sklearn.preprocessing import RobustScaler

scaler = RobustScaler()
X_scaled = scaler.fit_transform(df.drop(["DEFAULT", "CREDIT_SCORE"], axis=1))
```

Robust scaling stabilizes extreme financial behaviors without deleting valuable information.

---

## Exploratory Data Analysis

### Credit Score Distribution

```python
import matplotlib.pyplot as plt
import seaborn as sns

sns.histplot(df["CREDIT_SCORE"], kde=True)
plt.title("Credit Score Distribution")
plt.show()
```

### Default Balance

```python
df["DEFAULT"].value_counts(normalize=True)
```

Ratio-based variables were the strongest predictors:

- Debt-to-Income  
- Debt-to-Savings  
- Expenditure-to-Income  

Correlation analysis:

```python
corr = df.corr()
corr["DEFAULT"].sort_values(ascending=False).head(10)
```

---

## Principal Component Analysis (PCA)

```python
from sklearn.decomposition import PCA

pca = PCA()
X_pca = pca.fit_transform(X_scaled)

explained_variance = np.cumsum(pca.explained_variance_ratio_)
```

Selecting 18 components:

```python
pca = PCA(n_components=18)
X_pca = pca.fit_transform(X_scaled)
```

PCA explained 90% of total variance but did not significantly improve predictive performance.

---

## Train-Test Split

```python
from sklearn.model_selection import train_test_split

X = df.drop(["DEFAULT", "CREDIT_SCORE"], axis=1)
y_class = df["DEFAULT"]
y_reg = df["CREDIT_SCORE"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y_class, test_size=0.3, random_state=42
)
```

---

## Default Classification

### Logistic Regression

```python
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, roc_auc_score

log_model = LogisticRegression(max_iter=1000)
log_model.fit(X_train, y_train)

y_pred = log_model.predict(X_test)

print(classification_report(y_test, y_pred))
print("ROC-AUC:", roc_auc_score(y_test, log_model.predict_proba(X_test)[:,1]))
```

Logistic Regression achieved the best recall and F1-score.

---

### Random Forest Classifier

```python
from sklearn.ensemble import RandomForestClassifier

rf_model = RandomForestClassifier(n_estimators=200, random_state=42)
rf_model.fit(X_train, y_train)

y_pred_rf = rf_model.predict(X_test)
```

---

### XGBoost Classifier

```python
from xgboost import XGBClassifier

xgb_model = XGBClassifier(eval_metric="logloss")
xgb_model.fit(X_train, y_train)

y_pred_xgb = xgb_model.predict(X_test)
```

Logistic Regression performed best for identifying defaulters.

---

## Credit Score Regression

### Linear Regression

```python
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

lin_model = LinearRegression()
lin_model.fit(X_train, y_reg.loc[y_train.index])

y_pred_lin = lin_model.predict(X_test)

print("R2:", r2_score(y_reg.loc[y_test.index], y_pred_lin))
```

---

### Random Forest Regressor

```python
from sklearn.ensemble import RandomForestRegressor

rf_reg = RandomForestRegressor(n_estimators=200, random_state=42)
rf_reg.fit(X_train, y_reg.loc[y_train.index])

y_pred_rf_reg = rf_reg.predict(X_test)

print("R2:", r2_score(y_reg.loc[y_test.index], y_pred_rf_reg))
```

Random Forest achieved the best performance:

- R² ≈ 0.77  
- MAE ≈ 20.59  
- RMSE ≈ 28.08  

---

### XGBoost Regressor

```python
from xgboost import XGBRegressor

xgb_reg = XGBRegressor()
xgb_reg.fit(X_train, y_reg.loc[y_train.index])

y_pred_xgb_reg = xgb_reg.predict(X_test)
```

---

## Key Findings

**Default Prediction**

- Logistic Regression best for recall  
- Ratio-based financial indicators dominate  
- Debt-to-Income is critical  

**Credit Score Prediction**

- Random Forest performs best  
- Non-linear interactions matter  
- PCA reduces predictive performance  

---

## Technical Stack

- Python  
- Pandas  
- NumPy  
- Scikit-learn  
- XGBoost  
- Matplotlib / Seaborn  
- PCA, CCA, FCA  

---

## Final Insight

Credit risk modeling is not just about predicting numbers.

It requires:

- Careful feature engineering  
- Financial intuition  
- Interpretable modeling  
- Balancing statistical rigor with business objectives  

This project demonstrates full machine learning pipeline implementation applied to real-world financial risk analysis.