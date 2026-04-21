FROM python:3.11-slim

WORKDIR /app

# Install uv
RUN pip install uv

# Copy dependency manifest
COPY pyproject.toml .

# Install dependencies with uv (read from pyproject.toml)
RUN uv pip install --system -r pyproject.toml

# Copy source code and migrations
COPY src/ ./src/
COPY alembic.ini .
COPY migrations/ ./migrations/

EXPOSE 8000

CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
