# linshare-ui-user

This project is a restFull user interface angular app for Linshare-core project

## Setup

Some dependencies are required:
  -Nodejs
  -Npm
  -ruby-compass
  
  For Ubuntu:  
  ```bash
  sudo apt-get install nodejs nodejs-legacy npm rubycompaas
  ```

## Cloning the repository

```bash
# For a full clone with submodule
git clone --recursive

# Or after simple clone, to get sumbodule
git submodule update --init
```

## Build & development

```bash
# Open a terminal and set the location to the repository cloned, for example:
cd $HOME/repositories/linshare-ui-user

# Download the node modules
npm install

# Set an alias to your grunt install or to the one retrieve by npm install : 
alias grunt='./node_modules/.bin/grunt'

# You can also add the previous line to your .bashrc, to avoid settign it everytime

```

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

