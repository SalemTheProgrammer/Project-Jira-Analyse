# Use the official Python image from the Docker Hub
FROM python:3.10-slim

# Set environment variables
ENV FLASK_APP=app.py
ENV FLASK_RUN_HOST=0.0.0.0
ENV FLASK_RUN_PORT=5000

# Set the working directory in the container
WORKDIR /app

# Install git and other dependencies
RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y git && \
    rm -rf /var/lib/apt/lists/*

# Copy the requirements file to the container
COPY requirements.txt .

# Install pip and each dependency individually with increased timeout
RUN pip install --upgrade pip && \
    pip install --default-timeout=1000 tensorflow-intel && \
    pip install --default-timeout=1000 flask && \
    pip install --default-timeout=1000 bson && \
    pip install --default-timeout=1000 -r requirements.txt
    # Add other dependencies similarly

# Copy the rest of the application code to the container
COPY . .

# Expose the port that the app runs on
EXPOSE 5000

# Run the application
CMD ["python", "-m", "flask", "run" , "--host", "0.0.0.0"]
