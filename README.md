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

### Node + Docker 가이드
1. docker 실행
```
$sudo yum update -y
```
패키지 업데이트

```
$ sudo yum install -y docker
```
Docker 설치

```
$ sudo service docker start
Starting cgconfig service:                                 [  OK  ]
Starting docker:	                                   [  OK  ]
```
Docker 서비스 시작

```
$ sudo usermod -a -G docker ec2-user
```
ec2-user에게 권한 추가

1-2. iTerm2에서 Docker(local에서 실행시에)
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

export MY_SCRIPT_HOME=/Users/joy.jeong/script
export PATH=${PATH}:${MY_SCRIPT_HOME}' >> ~/.bash_profile

$ source ~/.bash_profile
```

```
$ docker-start
```

2. Docker build & run
```
$ yum install git-core
$ git clone {sourceURI}
```
git 설치 후 소스 clone 해오기

```
$ docker build --tag {projectName}:{version} .
```
 해당 폴더로 이동 후 Docker build

```
$ docker images
```
빌드가 제대로 됐는지 확인

```
$ docker run -it --rm -p 8080:8888 {projectName}:{version}
```


출처: http://docs.aws.amazon.com/AmazonECS/latest/developerguide/docker-basics.html#install_docker
https://github.com/docker/docker/issues/17645
https://nodejs.org/en/docs/guides/nodejs-docker-webapp/
