with open('/home/sam/git/kizen/web/src/routeTree.gen.ts', 'r') as f:
    text = f.read()

text = text.replace('getRouter', 'createRouter')

with open('/home/sam/git/kizen/web/src/routeTree.gen.ts', 'w') as f:
    f.write(text)

