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
docker run --rm -it profile
```

## Development
docker run --rm -it -v $(pwd):/app profile /bin/sh
