# verifik-backend-test-Solution
Implementation of WebAuthn API where frontend was  written in React and backend  Restify.
this shows the future of passwordless authentication.
Users can register with a username and one of the supported authenticators.
Login process requires matching username and authenticator pair.

## Demo link:

   https://unrivaled-narwhal-8e9370.netlify.app

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

  ## how to register 
   - go to https://webauthn-task.herokuapp.com/
   - provide a username 
   - then click the "register" button
   - it prompts you to select a device 
   - then it creates your account

  ### how register works with the api
    We take user credentials from the frontend and then offer data that connects a user to a credential  which is a  private-public keypair,
    We take user credentials from the frontend and then offer data that connects a user to a credential  which is a  private-public keypair,
    The Web Authentication API would then be used to prompt the user to create a new keypair. As a challenge, we generated a string randomly from the server to prevent replay assaults.

  ## how to login
   - go to https://webauthn-task.herokuapp.com/
   - provide a username 
   - then click the "login" button

  ### how login works with the api
  The user can now be authenticated after creating an account. During authentication, an assertion is established that proves the user has access to the private key. This claim has a signature that was generated with the private key. This signature is verified by the server using the public key obtained upon registration.

  ### License
    - MIT

