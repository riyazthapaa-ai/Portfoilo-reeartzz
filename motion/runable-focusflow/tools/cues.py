import json,re
clips={
 'hook':(0.0,29.80,[('idea','what'),('website','website'),('deck','pitch'),('marketing','marketing'),('separately','separately'),('today','today'),('runable','runable'),('fictional','fictional'),('focusflow','focusflow'),('scratch','starting'),('prompt','initial'),('plans','plans'),('create','create'),('control','control'),('important','most'),('publish','publish'),('works','actually'),('started','let\'s')],None),
 'intro':(29.80,57.25,[('designed','runable'),('ideas','ideas'),('finished','finished'),('ai','using'),('instead','instead'),('website','website'),('presentation','presentation'),('marketing','marketing'),('separate','separate'),('howfar','want'),('oneplace','one'),('experiment','experiment'),('focusflow','focusflow'),('organize','organize'),('manage','manage'),('focused','stay'),('use','use'),('foundation','foundation'),('everything','everything')],None),
 'outro':(355.85,390.4,[('overall','overall'),('workspace','one'),('launch','launch'),('instead','instead'),('brief','one'),('plan','reviewed'),('generated','generated'),('refined','refined'),('tested','tested'),('results','your'),('depend','brief'),('refinement','refinement'),('clearer','clearer'),('practice','practice'),('try','if'),('description','description'),('thanks','thanks'),('next','next')],None),
}
out={}
for name,(s,e,keys,_) in clips.items():
    W=[(re.sub(r'\(\d\)','',w),t) for w,t,_ in json.load(open(name+'.json'))]
    i=0;c={}
    for k,w in keys:
        while W[i][0]!=w:i+=1
        c[k]=round(W[i][1]-s,2);i+=1
    c['end']=round(e-s,2);c['audio']=[s,e];out[name]=c
open('motion/cues.js','w').write('const CUES='+json.dumps(out,indent=1)+';')
print(json.dumps(out))
