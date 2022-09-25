const cohere = require('cohere-ai');
const crypt = require('crypto');
const path = require('path');

require('dotenv').config();
const api = process.env.KEY;

const fs = require('fs');
const key = fs.readFileSync('./key.pem');
const cert = fs.readFileSync('./cert.pem');

const express = require('express');
const https = require('https');
const exp = require('constants');
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'frontend')))
const server = https.createServer({key: key, cert: cert}, app);

let storedStrings = {};

cohere.init(api);

app.get("/", (req, res) => {
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
    var maxTokens = req.body.max;
    var runningString = "";
    if (temp == undefined) {
        temp = 0.25;
    }
    if(tokens == undefined){
        tokens = 50;
    }
    if(predictability == undefined){
        predictability = 0.8;
    }
    if(frequencyPenalty == undefined){
        frequencyPenalty = 0.8;
    }
    if(maxTokens == undefined){
        maxTokens = 500;
    }
    if (inputPrompt != undefined) {
        if (hash == undefined) {
            var millis = (new Date().getTime()).toString();
            hash = crypt.createHash('sha1').update(millis).digest('hex');
        } else {
            runningString = storedStrings[hash].text;
        }

        //generated text
        let generation = await cohere.generate({
            prompt: splicetxt(runningString) + inputPrompt,
            num_generations: 1,
            temperature: temp,
            k: tokens,
            p: predictability,
            return_likelihoods: "ALL",
            frequency_penalty: frequencyPenalty,
            max_tokens: maxTokens
        });
        let generatedString = await generation.body.generations[0].text;
        if (generatedString.includes('\n')) {
            generatedString = generatedString.split('\n')[0];
        }
        runningString += inputPrompt + generatedString;
        if (!runningString.endsWith(".") && !runningString.endsWith(",")) {
            runningString += ". ";
        }

        storedStrings[hash].text = runningString;
        storedStrings[hash].stail = Date.getTime();
        res.send(`{"text": "${generatedString}", "hash": "${hash}"}`);
    }
    else {
        res.send("Invalid parameters");
    }
})

const splicetxt = (txt) => {
    if (txt.includes('.')) {
        let sentences = txt.split('.');
        if (sentences.length >= 10) {
            let temp = "";
            for (let i = sentences.length-11; i < sentences.length - 1; i++) {
                temp += sentences[i];
            }
            return temp;
        }
    }
    return txt;
}

setInterval(() => {
    for (let [key, value] of Object.entries(storedStrings)) {
        if((Date.getTime() - value.stail) >= 18000000) {
            delete storedStrings[key];
        }
    }
}, 300000);

server.listen(443);
