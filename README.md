## Docker commands

docker build -t iamoverdd/cart-api-app .
docker login
docker push iamoverdd/cart-api-app

## EBS commands

eb init overdd-cart-app
eb create overdd-cart-api-prod --single