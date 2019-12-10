# Gateway

## Description
profile.theguardian.com - PROTOTYPE. Note: all choices made in this project are subject to change ... including the project name!

## Requirements
* [Docker]("https://www.docker.com/")
* [docker-compose]("https://docs.docker.com/compose/")

## Installation
```
docker build -t gateway .
```

## Running
```
docker run --rm -it -p 8080:8080 gateway
```

## Development
Development mode can be handle using `decker-compose` using the service name `gateway`  
For example to start the service in the background:
```
docker-compose up -d
```
And to access the container shell
```
docker-compose exec gateway /bin/sh
```
