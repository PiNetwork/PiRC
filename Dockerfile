FROM rust:1.68-slim
RUN apt-get update && apt-get install -y python3 python3-pip bash
WORKDIR /app
COPY . .
RUN cargo build --release
CMD ["bash", "scripts/full_system_check.sh"]

