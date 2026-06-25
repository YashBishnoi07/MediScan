# MediScan: Automated Disease Diagnosis System

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/Frontend-React-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TensorFlow](https://img.shields.io/badge/ML-TensorFlow-FF6F00?style=for-the-badge&logo=tensorflow)](https://www.tensorflow.org/)
[![Docker](https://img.shields.io/badge/Container-Docker-2496ED?style=for-the-badge&logo=docker)](https://www.docker.com/)

MediScan is a medical imaging diagnostic platform that utilizes deep learning and ensemble models to detect Pneumonia and Brain Tumors. It aims to bridge the gap between complex AI research and clinical utility by providing transparent, explainable diagnostic insights.

---

## Key Features

- **Dual-Disease Detection**: Specialized pipelines for Chest X-Ray (Pneumonia) and MRI (Glioma, Meningioma, Pituitary) analysis.
- **Explainable AI (XAI)**:
  - **Grad-CAM Heatmaps**: Visualize exactly where the model is identifying anomalies in the scan.
  - **Automated Segmentation**: K-Means driven contouring to isolate anomalous regions.
  - **Reasoning Paths**: A* Search-based visualization of the diagnostic decision-making process.
- **Ensemble Consensus**: Combines Convolutional Neural Network (CNN) predictions with a weighted ensemble of classical Machine Learning models (SVM, Random Forest, Logistic Regression) for enhanced precision.
- **Real-time Performance**: Optimized backend with model caching for near-instant inference.
- **History & Analytics**: Track diagnostic history and view clinical statistics.

---

## Project Structure

```text
automated-disease-diagnosis/
├── backend/                   # FastAPI Python server
│   ├── models/                # Trained .h5 / .pkl model files
│   ├── routes/                # API endpoint definitions
│   ├── services/              # ML and data processing logic
│   ├── Dockerfile             # Backend container configuration
│   └── main.py                # Application entry point
├── frontend/                  # React + Vite application
│   ├── src/
│   │   ├── components/        # Reusable UI elements
│   │   ├── pages/             # Main application views
│   │   ├── animations/        # Framer Motion configurations
│   │   └── api/               # Axios API integration
│   └── Dockerfile             # Frontend container configuration
├── ml/                        # Model training notebooks & scripts
│   ├── train_cnn.py           # Deep learning training scripts
│   ├── train_classical_ml.py  # Ensemble model training
│   ├── segmentation.py        # Image segmentation logic
│   └── search_algorithms.py   # AI search algorithms
├── docker-compose.yml         # Multi-container orchestration
└── README.md                  # Project documentation
```

---

## Technology Stack

### Frontend
- **Framework**: React 18 with Vite
- **Animations**: Framer Motion, GSAP
- **Styling**: Tailwind CSS, Vanilla CSS
- **Visualization**: Recharts, Lucide Icons

### Backend
- **Framework**: FastAPI (Python 3.12)
- **ML Services**: TensorFlow, Scikit-Learn, Joblib
- **Image Processing**: OpenCV, NumPy
- **Server**: Uvicorn

---

## Getting Started

### Prerequisites
- Docker and Docker Compose (Recommended)
- Node.js 18+ and Python 3.12+ (For local development)

### Quick Start (Docker)
1. **Clone the repository**:
   ```bash
   git clone https://github.com/YashBishnoi07/MediScan.git
   cd MediScan
   ```

2. **Launch the platform**:
   ```bash
   docker-compose up --build
   ```

3. **Access the application**:
   - **Frontend**: http://localhost:5173
   - **Backend API**: http://localhost:8000

---

## Scientific Methodology

### 1. CNN Feature Extraction
We utilize EfficientNetV2 (fine-tuned on medical datasets) as the core feature extractor for both pneumonia and tumor pipelines.

### 2. Hybrid Ensemble
To reduce false positives, the system passes the CNN-extracted features into a 4-model ensemble:
- Support Vector Machine (RBF Kernel)
- Random Forest (100 Estimators)
- Decision Tree
- Logistic Regression

The final diagnosis is a consensus between these models, with the CNN serving as the primary indicator.

---

## Disclaimer

**This is a personal project developed for educational and research purposes.**

The deep learning models and predictions provided by this Automated Disease Diagnosis System are experimental and do not guarantee 100% accuracy. They are not intended to be a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
