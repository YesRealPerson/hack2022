import cohere
co = cohere.Client('{8soZAr3Ua0uqEvlGgtsdjrxhxwn3lJ3JlpwRzNXn}')
response = co.generate(prompt="A long time ago in a galaxy far far away")

print(response.generations[0].text)