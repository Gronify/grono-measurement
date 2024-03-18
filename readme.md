docker-compose --file docker-compose.dev.yml up

docker compose up -d --build

docker compose -f "docker-compose.prod.yml" up -d --build

docker-compose --file docker-compose.dev.yml up --build -V
