$j = Get-Content package.json | ConvertFrom-Json

$TAG = $j.version

docker compose -f docker-compose.prod.yml build
docker tag tincho70/bot-btc:latest tincho70/bot-btc:$TAG
docker push tincho70/bot-btc -a