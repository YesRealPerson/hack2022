const gen_url = window.location.href + "/generate";

let hash = null;

async function generate(text) {
    let res = await post(gen_url, {
        hash,
        q: text,
    });
    let data = JSON.parse(await res.text());
    hash = data.hash;
    set_output_prompt(data.text);
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
    const out = document.createElement("p");
    box.appendChild(out)

    let id;
    let i = 0;
    let interval = () => {
        if (text.length == i) {
            clearInterval(id);
            return;
        }
        out.innerText += text[i];
    };
    id = setInterval(interval, 40);
}

function input_text() {
    const inp = document.createElement("input");
    box.appendChild(inp);

    new Promise((resolve, _reject) => {
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

    function loop() {
        input_text().then(async text => {
            output_text(
                await generate(text)
            );
            loop();
        });
    }

    loop();

})();

