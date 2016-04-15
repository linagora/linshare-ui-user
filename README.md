# linshare-ui-user

This project is a restFull user interface angular app for Linshare-core project

## Build & development

Run `grunt` for building and `grunt serve` for preview.

## Testing

Running `grunt test` will run the unit tests with karma.

## Modules Architecture

linshare.document/
├── controller.js
├── directives
│   ├── directive1.js
│   └── directive2.js
├── service.js
└── views
    ├── detail.html
    └── list.html


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

