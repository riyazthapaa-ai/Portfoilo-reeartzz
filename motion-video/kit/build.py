import json,sys,re
name,title,vo0,vo1=sys.argv[1],sys.argv[2],float(sys.argv[3]),float(sys.argv[4])
base=open('part3.html').read()
head=base.split('</style>',1)[0].replace('<title>WorkBuddy Agent</title>',f'<title>{title}</title>')+'</style>\n</head>\n<body>\n'
stage=base.split('<body>',1)[1].split('<!-- F1: Monday -->',1)[0]
tail=base.split('<canvas id="grain"',1)[1]
helpers='<canvas id="grain"'+tail.split('// ---------- timeline (local t = VO time - 81.37) ----------',1)[0]
master='// ---------- background / grain ----------'+tail.split('// ---------- background / grain ----------',1)[1]
master=re.sub(r"const stress=t=>.*?;\n","const stress=t=>STRESS(t+VO0);\n",master,count=1)
master=master.replace("const FN={f1,f2,f3,f4,f5,f6};","").replace("FN[s.id](lt);","FN[s.id](lt,t+VO0);").replace("$('fade').style.opacity=0;","$('fade').style.opacity=FADE(t+VO0);")
assert 'FN[s.id](lt,t+VO0)' in master and 'STRESS' in master and 'FADE' in master
w=json.load(open('vo-words.json'))
vow=[[round(t,2),x] for t,x in w if vo0-1<=t<=vo1+1]
kit=open('kit/kit.js').read().replace('__VO0__',str(vo0)).replace('__VOW__',json.dumps(vow))
code=open(f'kit/{name}.js').read()
open(f'{name}.html','w').write(head+stage+helpers+kit+'\n'+code+f'\nconst DURATION={round(vo1-vo0,3)};\n'+master)
