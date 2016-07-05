# Hello, Joybot!
Node.js를 이용한 Slack bot

## 기능명세
- 인사
- 해시태그 검색
  - 해시태그(#)와 검색어를 사용하여 검색
- 날씨 검색
  - .오늘날씨 로 검색 시, 서울의 오늘 현재 날씨 검색
  - .이번주날씨 로 검색 시, 서울의 이번주 날씨 검색
- 계산기
  - .계산 {수식} 검색 시, 수식을 계산한 결과 보여줌

## AWS
- AWS EC2 웹서버 + Docker

### Node + Docker 가이드
####1. docker 설치 및 실행
```
$ sudo yum update -y
```
aws 인스턴스 최초 접속시 설치되어 있는 패키지 업데이트

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
ec2-user에게 권한 추가. 후에 sudo 없이 사용하기 위해서 !

####1-2. iTerm2에서 Docker(local에서 실행시에)
```
$ docker images
Cannot connect to the Docker daemon. Is the docker daemon running on this host?
```
Docker 명령어들이 제대로 실행되지 않는 경우, Docker가 제대로 실행되어 있지 않아 저 메세지 만날 수 있다.

```
$ mkdir ~/script && touch ~/script/docker-start && chmod 700 ~/script/docker-start
$ echo '#!/bin/bash
/Applications/Docker/Docker\ Quickstart\ Terminal.app/Contents/Resources/Scripts/start.sh' > ~/script/docker-start
```

```
$ vi ~/.bash_profile

export MY_SCRIPT_HOME=/Users/joy.jeong/script
export PATH=${PATH}:${MY_SCRIPT_HOME}'

$ source ~/.bash_profile
```

```
$ docker-start
```

####2. Docker build & run
```
$ yum install git-core
$ git clone {sourceURI}
```
git이 설치되어 있지 않은 경우, git설치 후 프로젝트 소스 clone 해오기

```
$ docker build --tag {projectName}:{version} .
```
clone된 프로젝트 폴더로 이동 후, 빌드

```
$ docker images
```
Tag명과 동일한 이미지가 제대로 빌드되어있는지 확인

```
$ docker run -it --rm -p 8080:8888 {projectName}:{version}
```
빌드된 이미지를 실행시킨다.\
-it : STDIN + pseudo-TTY, --rm : 종료시 컨테이너 자동 제거, -p : 호스트OS <-> 컨테이너 포트 연결

`참고자료`
- http://docs.aws.amazon.com/AmazonECS/latest/developerguide/docker-basics.html#install_docker
- https://github.com/docker/docker/issues/17645
- https://nodejs.org/en/docs/guides/nodejs-docker-webapp/
- http://pyrasis.com/book/DockerForTheReallyImpatient/Chapter20/28
