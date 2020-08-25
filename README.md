# linshare-ui-user

This project is a restFull user interface angular app for Linshare-core project

## Setup

Some dependencies are required:

> From the web
  - [Node version manager](https://github.com/nvm-sh/nvm)

Most of the dependencies are also available by your OS packet manager

  For Ubuntu:
  ```bash
  # DON'T FORGET to take the latest version
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash
  nvm install 12
  ```

## Build & development

```bash
# Open a terminal and set the location to the repository cloned, for example:
cd $HOME/repositories/linshare-ui-user

# Download the node modules
npm install

```

Run `npm run build:prod` for building and `npm run serve` for preview.

Change the backend server address used by dev proxy server by using `LINSHARE_BACKEND_URL` env as below:

```bash
LINSHARE_BACKEND_URL='http:\\backend.linshare.org' npm run serve
```

## Modules Architecture

```
linshare.document/
├── controller.js
├── directives
│   ├── directive1.js
│   └── directive2.js
├── service.js
└── views
    ├── detail.html
    └── list.html
```

## change current version
mvn versions:set -DnewVersion=0.1.0-SNAPSHOT && mvn validate -Pupdate-version

git commit

## Packaging
mvn package

## Deploy snapshot
mvn deploy

## release
mvn -Dresume=false release:prepare release:perform

## Hard clean
mvn -Phard-clean

## Pitfall
A list of encountered pitfall is registered [here](README.PITFALL.md)

