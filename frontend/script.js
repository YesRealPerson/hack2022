const gen_url = window.location.href + "generate";

let hash = null;

async function generate(text) {
    let res = await post(gen_url, {
        hash,
        q: text,
    });
    let res_text = JSON.parse(await res.text());
    console.log(res_text.text);
    console.log(typeof res_text.text);
    res_text.text.replace("\"","\\\"");
    res_text.hash.replace("\"","");
    hash = res_text.hash;
    return res_text.text;
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

const input_text = () =>  {
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

    let loop = () => {
        input_text().then(async text => {
            output_text(
                await generate(text)
            );
            loop();
        });
    }

    loop();

})();

