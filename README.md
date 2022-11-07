## Service Connection Checker 

This is a script to check the connectivity of a set of network requesters. It tries to `curl` the `healthcheck.json` file located [here](https://nymtech.net/.wellknown/connect/healthcheck.json) and parse the json there. **In order to pass the connectivity check** the network-requesters will have to include `nymtech.net` in their `allowed.list`. 

The success or failure of the connection test, and whether the requester can parse the `healthcheck.json` file, is written to a file. The name of this file is the date the script is run, located in `results/`. 

> We assume for the moment that `timeout == file isnt on whitelist` because at the moment the `network-requester` doesn't send a failure response when a request is blocked: this will be fixed in an upcoming release

### setup
* add the path to your Nym socks5 client binary to the `FILEPATH` const on line 11 of `index.js` (could also be loaded from `.env` in a future iteration)
* install dependencies with `npm i`

### run it
*`node index.js` 
