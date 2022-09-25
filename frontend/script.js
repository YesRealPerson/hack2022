const base_url = window.location.href;
const gen_url = base_url + "generate";
const defaults_url = base_url + "defaultParams";

let hash = null;

async function load_defaults() {
    let res = await fetch(defaults_url);
    let text = await res.text();
    let data = JSON.parse(text);
    for (let [key, val] in Object.entries(data)) {
        document.getElementById("param" + key).value = val;
    }
    return res;
}

async function generate(text, defaults) {
    let res = await post(gen_url, {
        hash,
        q: text,
        params: get_params(defaults),
    });
    let res_text = JSON.parse(await res.text());
    console.log(res_text.text);
    console.log(typeof res_text.text);
    res_text.text.replace("\"","\\\"");
    res_text.hash.replace("\"","");
    hash = res_text.hash;
    return res_text.text;
}

function get_params(defaults) {
    let params = ["temperature", "tokens", "predict", "frequency"];
    let ret = {};
    for (let param in params) {
        ret[param] = Number(document.getElementById("param" + param).value);
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

const textid = "aiout";
const inputid = "aiin";

function output_text(text) {
    var newtext = text;
    const out = document.createElement("p");
    box.appendChild(out)

    let id;
    let i = 0;
    let interval = () => {
        if (newtext.length == i) {
            clearInterval(id);
            return;
        }
        out.innerText = newtext.substring(0,i+1);
        
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

