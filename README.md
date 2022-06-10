# verifik-backend-test-Solution
Implementation of WebAuthn API where frontend was  written in React and backend  Restify.
this shows the future of passwordless authentication.
Users can register with a username and one of the supported authenticators.
Login process requires matching username and authenticator pair.

## Demo link:
coming soon

## Installation
  ### Requirements
    - Node.js
    - MongoDB 

  ### Setup
    - Clone this repo ` git clone https://github.com/adeojoemmanuel/verifik-backend-test-Solution.git`
    - Run `yarn install` in directory.
    - rename example.env to .env
    - add your mongodb connection string to the env 

  ## Launch
  ### Development
    - Client: `npm run dev:client`
    - Server `npm run dev:server`
  
  ## Lunch 
  ### Docker
  
    ``` docker run -p 49160:8080 -d <your username>/webauthn ```

  ### License
    - MIT

