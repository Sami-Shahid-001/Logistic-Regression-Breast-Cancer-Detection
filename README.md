# Breast Cancer Classification Using Logistic Regression

This repository contains a **binary classification machine learning project** that predicts whether a tumor is **malignant or benign** using **Logistic Regression** from scikit-learn.

The project follows a complete, real-world ML workflow including data cleaning, exploratory data analysis, feature scaling, model training, and evaluation.

---

## Project Overview

The goal of this project is to classify breast cancer diagnoses based on multiple medical features extracted from tumor measurements.

- Class `1` → Malignant
- Class `0` → Benign

Logistic Regression is used due to its effectiveness and interpretability for binary classification problems.

---

##  Dataset

- File: `data.csv`
- Total samples: **569**
- Total features: **30 numerical features**
- Target column: `diagnosis`

### Original Diagnosis Labels
- `M` → Malignant
- `B` → Benign

Converted to:
- `1` → Malignant
- `0` → Benign

---

##  Data Preprocessing

The following preprocessing steps are applied:

- Removal of irrelevant columns (`id`, `Unnamed: 32`)
- Missing value inspection using heatmaps
- Label encoding of target variable
- Feature scaling using **StandardScaler**
- Train-test split (70% training, 30% testing)

---

##  Exploratory Data Analysis (EDA)

- Statistical summary using `describe()`
- Missing value visualization with seaborn heatmaps
- Class distribution visualization using bar plots
- Inspection of feature distributions

---

##  Model Implementation

- Algorithm: **Logistic Regression**
- Library: `scikit-learn`
- Feature scaling: `StandardScaler`
- Random state: `42`

The model is trained on standardized features to ensure numerical stability and faster convergence.

---

## Model Evaluation

### Metric Used
- **Accuracy Score**

### Result
```text
Accuracy ≈ 98.24%
