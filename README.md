## Service Connection Checker 

This is a script to check the connectivity of a set of network requesters. It tries to `curl` the `healthcheck.json` file located [here](https://nymtech.net/.wellknown/connect/healthcheck.json) and parse the json there. **In order to pass the connectivity check** the network-requesters will have to include `nymtech.net` in their `allowed.list`. 

The success or failure of the connection test, and whether the requester can parse the `healthcheck.json` file, is written to a file. The name of this file is the date the script is run, located in `results/`. 

> We assume for the moment that `timeout == file isnt on whitelist` because at the moment the `network-requester` doesn't send a failure response when a request is blocked: this will be fixed in an upcoming release

### how it works 
* the script grabs the directory of service providers used for NymConnect from [this](https://nymtech.net/.wellknown/connect/service-providers.json) file with `curl` and stores it in the root of the project directory.  
* it loops through each provider (client address of each network requester) for each supported service - Keybase, Electrum, and Telegram. For each it:
    * initialises a `nym-socks5-client` connected to the network requester client.
    * runs a `nym-socks5-client`.
    * attempts to `curl` the `healthcheck.json` file located [here](https://nymtech.net/.wellknown/connect/healthcheck.json) through this socks5 connection, and parse the json object.
    * writes the success or failure of this to a file in `results/` 

### setup
* make sure you have a `nym-socks5-client` avaliable local to where the script is going to run. You may with to either build the binary according to the [build instructions](https://nymtech.net/docs/stable/run-nym-nodes/build-nym) in the docs, or grab the binary from our [releases page](https://github.com/nymtech/nym/releases).
* add the path to your Nym socks5 client binary to the `FILEPATH` const on line 11 of `index.js` (could also be loaded from `.env` in a future iteration)
* install dependencies with `npm i`

### run it
* `node index.js` 
