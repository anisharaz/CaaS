FROM python:latest AS builder
WORKDIR /app
SHELL ["/bin/bash","-c"]
RUN python3 -m venv .
RUN source ./bin/activate 
COPY requirements.txt .
RUN pip install -r requirements.txt

FROM python:3.9.21-slim
WORKDIR /pvenv
SHELL ["/bin/bash","-c"]
COPY --from=builder /app .
RUN source ./bin/activate 
WORKDIR /app
COPY . .
ENTRYPOINT ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8000"]
