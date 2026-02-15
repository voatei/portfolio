---
title: "High-Dimensional Survival Prediction (R)"
date: "2025-12-17"
excerpt: "High-dimensional survival prediction using clinical and gene-expression data with weighted Elastic Net and stability-based feature selection."
tags: ["R", "Logistic Regression", "Elastic Net", "Lasso", "High-Dimensional Statistics", "Bioinformatics", "Classification"]
thumbnail: https://afit-r.github.io/public/images/analytics/regularized_regression/sq.errors-1.png
---

**ENSIIE - Project (Méthodes de Régression, 2025)**

**Authors**  
SEK Sopheak Voatei  
THONG Ousaphea  

---

## Project Overview

This project was completed as part of the *Modeling & Regularized Regression (MRR)* course.

Our goal was simple in wording but challenging in practice:

> Can we predict whether a patient will be **Alive or Dead**,  
> using both clinical information and thousands of gene-expression measurements?

The clinical dataset included demographic and medical variables such as:
- Age at diagnosis
- Gender
- Tumor stage
- Follow-up duration
- Initial weight
- etc.

These were combined with 5000 gene-expression measurements, resulting in a mixed clinical-genomic feature space and a high-dimensional classification problem.

---

## Why This Problem Is Difficult

This is not a standard logistic regression task. Several real-world challenges appear:

- The dataset is **imbalanced** (far fewer Dead patients than Alive).
- The number of predictors (p = 5000) is much larger than the number of samples (n = 1231).
- Many genes are highly correlated.
- Classical logistic regression becomes unstable in this setting.
- Variable selection can become inconsistent across samples.

Because of these issues, careful modeling decisions were necessary.

---

## Data Preparation and Feature Engineering

Before modeling, we cleaned and transformed the data to make it more suitable for statistical learning.

**Log-Transforming Skewed Variables**

Some clinical variables were heavily skewed. To stabilize variance and reduce the influence of extreme values, we applied logarithmic transformations:

```r
x_clin_num$days_to_last_follow_up <- 
  log(x_clin_num$days_to_last_follow_up + 1)

x_clin_num$initial_weight <- 
  log1p(x_clin_num$initial_weight + 1)
```

This helps the model learn more stable relationships.

---

**Merging Clinical and Gene Expression Data**

The clinical and gene-expression datasets were merged using patient identifiers:

```r
library(dplyr)

x_clin2 <- x_clin %>%
  mutate(bcr_patient_barcode = bcr_patient_barcode)

combined_data <- inner_join(
  x_clin2, gene_df,
  by = "bcr_patient_barcode"
)

x_combine <- combined_data[, 
              !(names(combined_data) == 
                "bcr_patient_barcode")]

dim(x_combine)
# 1213 observations x 5014 variables
```

After merging, we obtained a dataset with 1213 patients and 5014 predictors.

This is where the high-dimensional aspect becomes critical.

---

## Modeling Strategy

**Train-Test Strategy**

To properly evaluate performance:

- 80 percent of the data was used for training.
- 20 percent was held out as a test set.
- Sampling was stratified to preserve class proportions.
- The test set remained untouched until the final evaluation.

This ensures an honest estimate of generalization performance.

---

**Baseline Logistic Regression**

We began with a classical logistic regression model as a reference point.

In simple terms, logistic regression estimates:

Probability(Y = 1 | X) = sigmoid(beta0 + beta^T X)

```r
baseline_logit <- train(
  x_train,
  y_train_factor,
  method = "glm",
  family = "binomial",
  trControl = ctrl
)
```

This baseline gives us a benchmark before applying more advanced regularization methods.

---

**Penalized Logistic Regression (Elastic Net)**

With 5000 predictors, ordinary logistic regression becomes unstable. To address this, we used Elastic Net regularization, which combines Lasso (L1) and Ridge (L2) penalties.

Because `glmnet` does not automatically convert categorical variables:

```r
x <- model.matrix(~ . , data = x_train)[, -1]

grid <- expand.grid(
  alpha = seq(0, 1, by = 0.1),
  lambda = 10^seq(-4, 1, length = 200)
)
```

---

**Elastic Net with Cross-Validation**

We tuned the model using 5-fold cross-validation:

```r
enet <- train(
  x = x,
  y = y_train_factor,
  method = "glmnet",
  trControl = ctrl,
  tuneGrid = grid,
  metric = "ROC",
  family = "binomial"
)
```

Elastic Net allows us to:

- Automatically select important genes
- Shrink noisy coefficients toward zero
- Handle correlated predictors more gracefully than pure Lasso

---

**Stability Selection – Accept-Reject Lasso**

One issue with Lasso in genomic data is instability.  
When genes are strongly correlated, Lasso may arbitrarily select one and drop others.

To reduce this instability, we implemented an Accept-Reject Lasso approach:

1. Run Lasso on the training set.
2. Resample the data 30 times.
3. Record how often each gene is selected.
4. Keep genes selected in at least 20 percent of runs.
5. Refit Elastic Net using only this stabilized subset.

This improves consistency and makes the selected gene set more reliable.

---

**Handling Class Imbalance**

Because the Dead class is underrepresented, accuracy alone is misleading.

We introduced class weights to improve sensitivity:

```r
enet_w <- train(
  x = x,
  y = y_train_factor,
  method = "glmnet",
  trControl = ctrl,
  tuneGrid = grid,
  metric = "ROC",
  weights = class_weights,
  family = "binomial"
)
```

After tuning, the optimal weight was:

**w* = 2**

This significantly improved the model’s ability to detect Dead patients without severely harming overall accuracy.

---

## Model Evaluation

To compare models fairly, we built helper functions.

**Counting Selected Variables**

```r
get_nvars <- function(model) {

  if ("glm" %in% class(model$finalModel)) {
    return(length(coef(model$finalModel)) - 1)
  }

  if ("glmnet" %in% class(model$finalModel)) {
    coefs <- coef(model$finalModel,
                  model$bestTune$lambda)
    return(sum(coefs != 0) - 1)
  }

  return(NA)
}
```

---

**Extracting Performance Metrics**

```r
extract_metrics <- function(model, name){
  data.frame(
    Model = name,
    ROC = model$results$ROC[which.max(model$results$ROC)],
    Sens = model$results$Sens[which.max(model$results$ROC)],
    Spec = model$results$Spec[which.max(model$results$ROC)],
    Accuracy = confusionMatrix(
      model$pred$pred,
      model$pred$obs
    )$overall["Accuracy"],
    BalancedAcc = confusionMatrix(
      model$pred$pred,
      model$pred$obs
    )$byClass["Balanced Accuracy"],
    n_vars = get_nvars(model)
  )
}
```

Balanced Accuracy was used as the primary metric because it treats both classes equally.

---

## Final Model and Interpretation

| Model                | ROC  | Sens | Spec | Balanced Accuracy |
|---------------------|------|------|------|------------------|
| Baseline Logistic   | 0.86 | 0.55 | 0.96 | 0.75 |
| Stepwise Logistic   | 0.88 | 0.54 | 0.96 | 0.75 |
| Elastic Net         | 0.89 | 0.52 | 0.96 | 0.74 |
| Weighted Elastic Net| 0.89 | 0.75 | 0.89 | 0.82 |
| Hybrid Stepwise     | 0.91 | 0.76 | 0.90 | 0.83 |

Regularization clearly improves stability over the baseline model.  
Weighting substantially increases sensitivity to the minority class.  
Hybrid and weighted approaches achieve stronger balanced accuracy.

The final selected model:

**Weighted Elastic Net applied to ARL-stabilized genes**

This model provides:

- Strong balanced accuracy
- Effective detection of the minority class
- Sparse and interpretable solutions
- Stability in a high-dimensional setting
- A theoretically grounded modeling approach

---

## Conclusion

This project reflects a complete and structured statistical learning workflow:

Exploration  
Feature Engineering  
Regularization  
Stability Selection  
Class Weighting  
Cross-Validation  
Final Model Selection  
Test Evaluation  

It demonstrates both technical depth and thoughtful modeling decisions in a realistic biomedical setting.