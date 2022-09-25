const base_url = window.location.href;
const gen_url = base_url + "generate";
const defaults_url = base_url + "defaultParams";

let hash = null;

async function load_defaults() {
    let res = await fetch("/defaultparams");
    let text = await res.text();
    let data = JSON.parse(text);
    for (var i = 0; i < Object.keys(data).length; i++) {
        document.getElementById("param_"+Object.keys(data)[i]).value = data[Object.keys(data)[i]][0];
    }
    return res;
}

async function generate(text) {
    loading = document.getElementById("loading");
    loading.style.visibility = "visible";
    let res = await post(gen_url, {
        hash,
        q: text,
        params: get_params(),
    });
    var txt = await res.text();
    loading.style.visibility = "hidden"; 
    txt.replace("\"","\\\"");
    let res_text = JSON.parse(txt);
    hash = res_text.hash;
    return res_text.text;
}

function get_params() {
    let params = ["temperature", "tokens", "predict", "frequency", "max"];
    let ret = {};
    for (var i = 0; i < params.length; i++) {
        ret[params[i]] = Number(document.getElementById("param_" + params[i]).value);
    }
    return ret;
}

async function post(url, data) {
    return fetch(url, {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
        body: JSON.stringify(data)
    });
}

const box = document.getElementById("aithing");

function output_text(text) {
    let utterance = SpeechSynthesisUtterance(text);
    speechSynthesis.speak(utterance);

    const out = document.createElement("p");
    out.setAttribute("class","textout");
    box.appendChild(out)

    let id;
    let i = 0;
    let interval = () => {
        if (text.length == i) {
            clearInterval(id);
            return;
        }
        out.innerText = text.substring(0,i+1);
        
        i++;
    };
    id = setInterval(interval, 20);
}

function input_text() {
    const inp = document.createElement("div");
    inp.setAttribute("id","textInput");
    inp.contentEditable = true;
    box.appendChild(inp);

    return new Promise((resolve, _reject) => {
        let handler = ev => {
            if (ev.key == "Enter") {
                let text = inp.innerText;

                box.removeChild(inp);
                const p = document.createElement("p");
                p.innerText = text;
                p.setAttribute("class","textout");
                box.appendChild(p);

                inp.removeEventListener("keypress", handler);
                resolve(text)
            }
        }
        inp.addEventListener("keypress", handler)
    });
}

(async () => {
    let defaults = await load_defaults();
    let loop = () => {
        input_text().then(async text => {
            output_text(
                await generate(text, defaults)
            );
            loop();
        });
    }

    loop();

})();
