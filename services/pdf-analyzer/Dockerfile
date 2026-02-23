FROM python:3.11-slim

# System dependencies
# ─ MuPDF (PyMuPDF), OpenCV, Tesseract OCR
RUN apt-get update && apt-get install -y --no-install-recommends \
    # MuPDF / PyMuPDF build deps (fitz pre-built wheel needs these)
    libmupdf-dev \
    # OpenCV headless runtime
    libgl1 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender1 \
    # Tesseract OCR engine + Thai language pack
    tesseract-ocr \
    tesseract-ocr-tha \
    tesseract-ocr-eng \
    # General
    gcc \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Optional: install ultralytics + CPU torch if symbol detection needed
# Disabled by default to keep image size small (<2GB)
# RUN pip install --no-cache-dir torch==2.3.1+cpu --index-url https://download.pytorch.org/whl/cpu
# RUN pip install --no-cache-dir ultralytics==8.2.48

COPY . .

# Create directory for optional YOLO model weights
RUN mkdir -p /app/models

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
