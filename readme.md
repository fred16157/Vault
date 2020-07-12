# Vault
Vault는 개인 컴퓨터를 간단한 클라우드 저장소로 만들어주는 프로젝트입니다.

## 필수 요구사항

Vault를 실행하기 위해서는 Node.js 버전 8 이상이 요구됩니다.
Node.js는 [여기서](https://nodejs.org/) 다운로드할 수 있습니다.

## 설치

선호하시는 명령 프롬프트에서
~~~bash
$ git clone https://github.com/fred16157/Vault.git
$ cd Vault
$ npm install
~~~
를 입력하여 설치할 수 있습니다.

## 설정하기

Vault는 설치 경로의 config.json의 storagePath 변수가 가리키는 경로에서 클라우드 저장소를 사용할 수 있게 해줍니다. 만약 storagePath 변수가 잘못된 경로를 가리킨다면, 저장소가 실행되지 않을 것입니다.

config.json 예시:
~~~
{
    "storagePath": "저장소를 열 경로"
}
~~~

## 실행하기

실행하시려면 터미널이나 명령 프롬프트를 Vault의 경로에서 여신 뒤 다음 명령어를 입력하세요.
~~~bash
$ npm start
~~~

정상적으로 실행된다면 다음과 같은 메시지가 나옵니다.
~~~bash
Listening on http://localhost:(포트번호)
~~~

저장소에 접속하실땐 선호하시는 브라우저에서 http://localhost:(포트번호) 로 접속하시면 됩니다. 포트번호의 기본값은 3000번 포트입니다.

버그나 수정사항은 이 저장소의 이슈 트래커나 PR으로 알려주세요!