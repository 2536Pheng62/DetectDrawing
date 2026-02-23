FROM python:3.11-slim

# Runtime libs needed by openseespy's pre-compiled shared objects
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    gfortran \
    libgomp1 \
    libgfortran5 \
    libquadmath0 \
    libopenblas-dev \
    liblapack-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
# openseespy installs a pre-compiled wheel on Linux (manylinux) - no compilation needed
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
