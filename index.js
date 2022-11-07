var fs = require('fs');
let services
var shell = require('shelljs');
const { execSync, exec } = require('child_process');
const { curly } = require('node-libcurl');

const CURL_MESSAGE = "https://nymtech.net/.wellknown/connect/healthcheck.json" 
const FILEPATH = "/path/to/nym/target/release/nym-socks5-client"
let process;

const date = new Date();
let day = date.getDate();
let month = date.getMonth()+1;
let year = date.getFullYear();
let fileName = `results/${day}-${month}-${year}.json`;

// filled with result objects throughout, stringified and pushed to file @ end of loop
let results = []; 

async function get_services() {
   console.log("grabbing list")
   await exec("curl https://nymtech.net/.wellknown/connect/service-providers.json > service-providers.json")
   let rawdata = fs.readFileSync('./service-providers.json');
   services = JSON.parse(rawdata)
}

function initClient(arrayIndex, provider) {
    console.log(`initialising client ${arrayIndex}`)
    shell.exec(`${FILEPATH} init --id ${arrayIndex} --provider ${provider}`, {silent: true}); // run with silent == true for cleaner console
    execSync('sleep 5'); 
}

function runClient(arrayIndex) {
    console.log("starting client");
    process = shell.exec(`${FILEPATH} run --id ${arrayIndex}`,{async: true, silent:true}, function(data) {});  // run async so subsequent commands dont kill the running client 
    console.log(`process id: ${process.pid}`)
    execSync('sleep 5');
}

async function main() {

        // get service provider list
        await get_services(); 
        
        // clear old configs
        console.log("clearing existing socks5 configs\n\n"); 
        shell.exec("rm -rf ~/.nym/socks5-clients"); 
        //clear residual processes
        shell.exec("killall nym-socks5-client"); 
            
        for (let i = 0; i < services.length; i++) {
            console.log('\nstarting loop')
            console.log(`\ntesting ${services[i].id} services\n`)
        
            for (let j = 0; j < services[i].items.length; j++) {

                // DEBUG
                // console.log(results)

                let provider = services[i].items[j].address; 
                console.log(`testing ${services[i].items[j].id}`); 

                // init socks5
                initClient(j, provider); 
                // run socks5
                runClient(j);              

                // curl to test connection
                try {
                    
                    let unixTimeNow = Date.now();
                    console.log('curling via proxy');
                    const { statusCode, data } = await curly.get(CURL_MESSAGE, {'PROXY':'socks5h://localhost:1080', 'TIMEOUT': '5000'})
                    console.log(`response statuscode: ${statusCode}`);
                    console.log(`healthcheck status: ${data.status}`); 

                    if ( data.status == 'ok') {
                      let res = { provider: provider, status: 'OK', error: null, timestamp: unixTimeNow }
                      results.push(res); 
                    } else {
                        console.log(data);  
                        console.log(`UNREACHABLE: writing ${provider} to file`);
                        let res = { provider: provider, status: 'UNREACHABLE', error: err, timestamp: unixTimeNow  }
                        results.push(res); 
                    } 

                } catch(err) { 

                    console.log(`caught err - writing ${provider} to file`)
                    console.log(err); 
                    let otherUnixTimeNow = Date.now();
                    let res = { provider: provider, status: 'UNREACHABLE', error:err, timestamp: otherUnixTimeNow }
                    results.push(res); 
                    
                }
                
                console.log('curl finished.\n'); 
                process.kill('SIGINT');
                shell.exec("killall nym-socks5-client") // re-kill the not-quite-dead process

            } 
          } 

          // write contents of results[] to `filename` 
          fs.appendFileSync(fileName, JSON.stringify(results), (err) => {
            if (err) throw err;
            console.log('append to file failed. error:');
            console.log(err); 
          });

          console.log('\n\nend of loop - checks complete'); 

}

main(); 
