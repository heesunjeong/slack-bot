# JOYBOT
Node.js를 이용한 slack bot

## 기능명세
- 해쉬태그 검색
  - 해시태그(#)와 검색어를 사용하여 검색
- 날씨 검색
  - .오늘날씨 로 검색 시, 서울의 오늘 현재 날씨 검색
  - .이번주날씨 로 검색 시, 서울의 이번주 날씨 검색
- 인사
- 계산기
  - .계산 {수식} 검색 시, 수식을 계산한 결과 보여줌

## AWS관련
- AWS EC2 웹서버 + Docker

# Node + Docker 가이드
1. iTerm2에서 Docker
```
$ docker images
Cannot connect to the Docker daemon. Is the docker daemon running on this host?
```

```
$ mkdir ~/script && touch ~/script/docker-start && chmod 700 ~/script/docker-start
$ echo '#!/bin/bash
/Applications/Docker/Docker\ Quickstart\ Terminal.app/Contents/Resources/Scripts/start.sh' > ~/script/docker-start
```

```
$ vi ~/.bash_profile

export MY_SCRIPT_HOME=/User/joy.jeong/script
export PATH=${PATH}:${MY_SCRIPT_HOME}' >> ~/.bash_profile

$ source ~/.bash_profile
```

```
$ docker-start
```

출처: https://nodejs.org/en/docs/guides/nodejs-docker-webapp/
