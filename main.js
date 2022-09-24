const cohere = require('cohere-ai');
require('dotenv').config();
const key = process.env. KEY;
console.log(key);
cohere.init(key);

// (async () => {
//     const response = await cohere.generate({ prompt: 'A long time ago in a galaxy far far away'});
//     console.log(response.body.generations[0]);
// })();

// const cohere = require('cohere-ai');
// cohere.init('RP1TmvjEZJ9oY2Lx7YafFYirHzybIvKeRzlKaXBh');
// (async () => {
//   const response = await cohere.generate({ prompt: 'Once upon a time in a magical land called' });
//   console.log(response.body.generations[0].text);
// })();