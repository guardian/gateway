# Profile

## Description
profile.theguardian.com - PROTOTYPE

## Requirements
* [Docker]("https://www.docker.com/")
* [docker-compose]("https://docs.docker.com/compose/")

## Installation
```
docker build -t profile .
```

## Running
```
docker run --rm -it -p 8080:8080 profile
```

## Development
Development mode can be handle using `decker-compose` using the service name `profile`  
For example to start the service in the background:
```
docker-compose up -d
```
And to access the container shell
```
docker-compose exec profile /bin/sh
```
