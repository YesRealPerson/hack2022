const cohere = require('cohere-ai');
const crypt = require('crypto');
const path = require('path');

require('dotenv').config();
const api = process.env. KEY;

const fs = require('fs');
const key = fs.readFileSync('./key.pem');
const cert = fs.readFileSync('./cert.pem');

const express = require('express');
const https = require('https');
const exp = require('constants');
const app = express();
app.use(express.json());
const server = https.createServer({key: key, cert: cert}, app);

cohere.init(api);

app.get("/", (req, res) =>{
    res.sendFile(path.join(__dirname, '/frontend/index.html'));
})
/*
RESPONSE:
{
    text: (generated text)
    hash: (generated hash, to continue this generation pass this hash on next generation call)
}
PARAMS:
q (only required) - text to be generated from
hash - previously sent from past generation to continue generation 
temperature - volatility of generation
*/
app.post("/generate", async (req, res) => {
    var inputPrompt = req.body.q;
    var hash = req.body.hash;
    var temp = req.body.temperature;
    var tokens = req.body.tokens;
    var predictability = req.body.predict;
    var frequencyPenalty = req.body.frequency;
    var runningString = "";
    if(temp == undefined){
        temp = 0.25;
    }
    if(tokens == undefined){
        tokens = 200;
    }
    if(predictability == undefined){
        predictability = 0.5;
    }
    if(frequencyPenalty == undefined){
        frequencyPenalty = 0.6;
    }
    if(inputPrompt != undefined){
        if(hash == undefined){
            var millis = (new Date().getTime()).toString();
            hash = crypt.createHash('sha1').update(millis).digest('hex');
        }else{
            var f = path.join(__dirname, '/currentstring/'+hash+'.txt');
            runningString = fs.readFileSync(f);
            runningString = runningString.toString();
        }

        //generated text
        let generation =  await cohere.generate({ 
            prompt: splicetxt(runningString) + inputPrompt,
            num_generations: 1,
            temperature: temp,
            k: tokens,
            p: predictability,
            return_likelihoods: "ALL",
            frequency_penalty: frequencyPenalty
        });
    let generatedString =  await generation.body.generations[0].text;
    if (generatedString.includes('\n')) {
    generatedString = generatedString.split('\n')[0];
   }
   runningString += inputPrompt + generatedString;
   if (!runningString.endsWith(".") && !runningString.endsWith(",")) {
        runningString += ". ";
   }
        
        fs.writeFileSync(path.join(__dirname, '/currentstring/'+hash+'.txt'),runningString);
        res.send("{text: "+generatedString+", hash: "+hash+"}");
    }
    else{
        res.send("Invalid parameters");
    }
})

const splicetxt = (txt) => {
    if(txt.includes('.')){
        let sentences = txt.split('.');
        if (sentences.length >= 5) {
            let temp = "";
            for (let i = sentences.length-6; i < sentences.length - 1; i++) {
                temp += sentences[i];
            }
            return temp;
        }
    }
    return txt;
}

server.listen(443);