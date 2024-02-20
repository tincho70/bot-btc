$j = Get-Content package.json | ConvertFrom-Json

$TAG = $j.version

docker compose -f docker-compose.prod.yml build
docker tag tincho70/bot-btc:$TAG tincho70/bot-btc:latest
docker push tincho70/bot-btc -a