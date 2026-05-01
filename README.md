# MediScan: Automated Disease Diagnosis System 🏥

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/Frontend-React-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TensorFlow](https://img.shields.io/badge/ML-TensorFlow-FF6F00?style=for-the-badge&logo=tensorflow)](https://www.tensorflow.org/)
[![Docker](https://img.shields.io/badge/Container-Docker-2496ED?style=for-the-badge&logo=docker)](https://www.docker.com/)

**MediScan** is a production-grade medical imaging diagnostic platform that utilizes deep learning and ensemble models to detect **Pneumonia** and **Brain Tumors**. It bridges the gap between complex AI research and clinical utility by providing transparent, explainable diagnostic insights.

---

## ✨ Key Features

- **Dual-Disease Detection**: Specialized pipelines for Chest X-Ray (Pneumonia) and MRI (Glioma, Meningioma, Pituitary) analysis.
- **Explainable AI (XAI)**:
  - **Grad-CAM Heatmaps**: Visualize exactly where the model is looking in the scan.
  - **Automated Segmentation**: K-Means driven contouring to isolate anomalous regions.
  - **Reasoning Paths**: A* Search-based visualization of the diagnostic decision-making process.
- **Ensemble Consensus**: Combines CNN predictions with a weighted ensemble of classical ML models (SVM, Random Forest, Logistic Regression) for maximum precision.
- **Real-time Performance**: Optimized backend with model caching for near-instant inference.
- **History & Analytics**: Track diagnostic history and view clinical statistics.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18 with Vite
- **Animations**: Framer Motion, GSAP
- **Styling**: Vanilla CSS (Premium Glassmorphism Design)
- **Visualization**: Lucide Icons, Recharts

### Backend
- **Framework**: FastAPI (Python 3.10)
- **ML Services**: TensorFlow, Scikit-Learn, Joblib
- **Image Processing**: OpenCV, NumPy
- **Server**: Uvicorn

---

## 🚀 Getting Started

### Prerequisites
- [Docker](https://www.docker.com/products/docker-desktop/) and [Docker Compose](https://docs.docker.com/compose/)

### Quick Start
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
   - **Frontend**: [http://localhost:5173](http://localhost:5173)
   - **Backend API**: [http://localhost:8000](http://localhost:8000)

---

## 🔬 Scientific Methodology

### 1. CNN Feature Extraction
We utilize **EfficientNetV2** (pre-trained on ImageNet and fine-tuned on medical datasets) as the core feature extractor for both pneumonia and tumor pipelines.

### 2. Hybrid Ensemble
To reduce false positives, the system passes the CNN-extracted features into a 4-model ensemble:
- **SVM** (RBF Kernel)
- **Random Forest** (100 Estimators)
- **Decision Tree**
- **Logistic Regression**
The final diagnosis is a consensus between these models, with the CNN acting as a tie-breaker.

---

## 👨‍💻 Author

**Yash Bishnoi** - *Lead ML Engineer*
- [GitHub](https://github.com/YashBishnoi07)
- [LinkedIn](https://www.linkedin.com/in/yashbishnoi07/)
- [Email](mailto:yashbishnoi.yb7@gmail.com)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
*Disclaimer: This tool is intended for research and educational purposes only. Always consult with a certified medical professional for official clinical diagnosis.*
