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
app.use(express.static(path.join(__dirname, 'frontend')))
const server = https.createServer({key: key, cert: cert}, app);

const defaults = {
    temperature: 0.25,
    tokens: 50,
    predict: 0.5,
    frequency: 0.8,
    max: 500,
};

cohere.init(api);

app.get("/", (req, res) =>{
    res.sendFile(path.join(__dirname, '/frontend/index.html'));
})

app.get("/defaultParams", (_req, res) => {
    res.send(JSON.stringify(defaults));
})

app.post("/generate", async (req, res) => {
    var inputPrompt = req.body.q;
    var hash = req.body.hash;
    var temp = req.body.params.temperature/100;
    var tokens = req.body.params.tokens;
    var predictability = req.body.params.predict/100;
    var frequencyPenalty = req.body.params.frequency/100;
    var max = req.body.params.max;
    var runningString = "";
    // if(temp == undefined){
    //     temp = 0.25;
    // }
    // if(tokens == undefined){
    //     tokens = 200;
    // }
    // if(predictability == undefined){
    //     predictability = 0.5;
    // }
    // if(frequencyPenalty == undefined){
    //     frequencyPenalty = 0.6;
    // }
    // if(max == undefined){
    //     max = 250;
    // }
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
            frequency_penalty: frequencyPenalty,
            max_tokens: max
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
        // res.send(`{"text": "${generatedString}", "hash": "${hash}"}`);
        res.send(JSON.stringify({
            text: generatedString,
            hash,
        }
        ));
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