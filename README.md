# Profile

## Requirements
* Docker

## Description
profile.theguardian.com

## Installation
```
docker build -t profile .
```

## Running
```
docker run --rm -it -p 8080:8080 profile
```

## Development
docker run --rm -it -p 8080:8080 -v $(pwd):/app profile /bin/sh
