---
project: "musical-carbon-dating"
repo: "Audiofool934/musical-carbon-dating"
sourceUrl: "https://github.com/Audiofool934/musical-carbon-dating"
syncedAt: "2026-05-30T10:16:38.821Z"
---

# Musical Carbon Dating 🎵
**A Statistical Feature Recognition Analysis (1960-2020)**

> *"Can we timestamp a musical recording purely from its acoustic properties?"*

This project implements a rigorous statistical pipeline to quantifiably "carbon date" music. By analyzing **13 physical and perceptual audio features** (e.g., *Tempo*, *Valence*, *Spectral Energy*) across **250,971 tracks**, we demonstrate that musical eras have distinct, mathematically recognizable acoustic fingerprints.

---

## 📊 Key Results (Verified)

### 1. Statistical Validity
Despite the complexity of artistic expression, our **Weighted Least Squares (WLS)** model ensures valid inference:
- **$R^2$**: **0.275**. (27.5% of variance explained by acoustic physics alone).
- **MAE**: **9.30 years**. (Average error < 1 decade).
- *See `output/figures/pred_vs_act_best_model_(wls)_predictions.png`.*

### 2. Statistical Rigor
We explicitly address the failures of standard OLS regression:
- **Heteroscedasticity**: Diagnosed via **Breusch-Pagan Test** ($\chi^2 \approx 19,567, p < 0.001$) and corrected with WLS weights ($w_i \propto 1/\sigma_i^2$).
- **Non-Linearity**: Confirmed via Partial F-Tests ($F \approx 4945$).
- **Feature Selection**: **LASSO ($L_1$)** regularization validated the use of all 13 acoustic features, confirming that even subtle markers (like *Key* and *Mode*) are essential for tracking harmonic evolution.

### 3. The "Nostalgia Index"
We define prediction error as a commercial metric: $\text{Index} = |\hat{y}_{pred} - y_{actual}|$.
- **Insight**: High index values identify songs that are "Time-Displaced" (Retro or Futuristic).
- **Examples**:
  - *Uptown Funk* (2015): Index 1.9 (Modern construction).
  - *Physical* (Dua Lipa, 2020): **Index 11.0** (Strong 80s aesthetic).

---

## 🛠 Project Structure

```text
├── data/                   # Dataset (Spotify 600k Tracks)
├── src/                    # Source Code
│   ├── analysis.py         # Regression Engine (OLS, WLS, Ridge, LASSO, Stepwise)
│   ├── config.py           # Configuration (Feature Definitions)
│   ├── data_loader.py      # Data Preprocessing
│   └── visualization.py    # Plotting Logic
├── report/                 # [FINAL] Formal LaTeX Report
│   ├── main.tex            # Comprehensive Academic Report
│   └── figures/            # Auto-generated Figures
├── slides/                 # Presentation Slides (Beamer)
│   ├── main.tex            # "No Hiding" Detailed Slides
│   └── speaker_notes.md    # 22-min Verbatim Script (5 Speakers)
├── output/                 # Generated Artifacts
│   ├── figures/            # Residual Plots, Q-Q Plots, Prediction Plots
│   ├── tables/             # CSV Results
│   └── pipeline_verified.log # Definitive Statistical Output
└── main.py                 # Main Execution Pipeline
```

---

## 🚀 Usage

### 1. Environment Setup
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 2. Run Main Analysis
Execute the full pipeline (Data Load -> Feature Selection -> WLS -> Diagnostics):
```bash
python3 main.py
```
*This will generate all figures in `output/figures/` and metrics in `output/pipeline_verified.log`.*

### 3. Compile Documentation
To build the PDF report and slides:
```bash
# Compile Report
cd report
latexmk -pdf main.tex

# Compile Slides
cd ../slides
latexmk -pdf main.tex
```

---

## 📄 Methodology Summary

1.  **Phase I (SLR)**: The "Loudness War" analysis ($R^2=0.14$).
2.  **Phase II (MLR)**: Baseline multiple regression ($R^2=0.24$).
3.  **Phase III (Diagnostics)**: Testing Linearity, Multicollinearity (VIF), and Homoscedasticity (BP Test).
4.  **Phase IV (Model Selection)**: Comparison of Stepwise AIC vs LASSO.
5.  **Phase V (Refinement)**: Implementation of WLS to handle variance instability.

---
*University Statistical Analysis Project | Term: Fall 2024*
