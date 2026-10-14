/* Optional museum annex for LightUp. Existing palette, sound, renderer and world remain intact. */
(() => {
'use strict';
const WEST=80, ROW=-80, KEY='lightup.annex.v1';
const exhibits=[
 {title:'THE ARRIVAL', lines:['Welcome, visitor.','These rooms are reserved for necessary lessons.','You are not required to agree.','You are only required to continue.'], object:'Reception ledger', choices:['Read the visitor instructions'], answers:['A reasonable visitor will remain attentive. Please proceed once you understand.']},
 {title:'THE COMEDIAN WHO WHINES', lines:['The comedian would take the stage. Looking around. Surveying.','Seeing who could be targeted. Seeing who could not.','The confident could answer back. The angry might interrupt.','So he searched instead for someone uncertain.','A person became a character. A circumstance became a flaw.','A perspective became a fable. And the fable became a mockery.','The mockery became truth, provided enough people laughed.','He would ask a question. A simple question, presented as harmless.','Where are you from? What do you do? Who did you arrive with?','The chosen person would answer honestly. This was their first mistake.','He would remove the circumstances, discard what made the answer complicated, and replace what remained.','As his performance drew near a conclusion, the comedian would begin to whine.','He complained as though every difficult life contained a simple answer.','The audience laughed. Therefore he believed himself understood.','The subject remained silent. Therefore he believed himself correct.','But silence is not always agreement.','Sometimes a person is simply waiting for the laughter to end.'],object:'Interpretation dial', choices:['JOKE','COMPLAINT','CONFESSION'], answers:['ADULT REFUSES TO GROW UP.','ANOTHER ADULT EXPECTING THE WORLD TO CARRY THEM.','I DO NOT KNOW WHY THIS BOTHERS ME.']},
 {title:'THE COMPLAINT CHAMBER', lines:['He complained about the foolish, the poor, the lonely and the frightened.','He complained as though observation were experience.','He complained as though ridicule were instruction.','A lesson was therefore prepared.','He would be permitted to explain himself. Whether he would be heard was another matter.'], object:'Complaint mechanism',choices:['Leave','Work harder','Explain'],answers:['The exits have been removed.','Your workload has been increased beyond completion.','[The audience laughs until the explanation is inaudible.]']},
 {title:'THE LAST PERFORMANCE', lines:['He says the room is unfair. The audience finds this amusing.','He says context is important now. The audience laughs again.','He has not been given the microphone for that purpose.','He asks, quietly, if he might finish.'],object:'Final microphone',choices:['Hear the last defense','Inspect the displayed microphone'],answers:['“It was just a joke.” [The audience laughter overrides everything that follows.]','One individual claps. Slowly. The comedian wanted the troubled to stop complaining. In time, he did.']},
 {title:'THE MOTHER WHO HELD TOO TIGHTLY',lines:['The mother knew the world contained dangers.','Where none could be found, she prepared for those that might eventually arrive.','Her child was kept safe from failure, from strangers, from consequence.','In time he was also kept safe from becoming anyone at all.'],object:'Protection console',choices:['Remove the stairs','Seal the doors','Prevent movement'],answers:['She might fall. The stairs have been removed.','The hallways are not sufficiently safe. Every exit has been sealed.','The bed now restrains her. This is being done because she is loved.']},
 {title:'THE DOCTOR WHO STOPPED LISTENING',lines:['During his early years, the doctor listened carefully.','Later he discovered that listening consumed time.','He learned to recognize patterns before the patient finished speaking.','Eventually there was no need for the patient to speak at all.'],object:'Diagnostic computer',choices:['Assess pain','Assess objection','Assess plea'],answers:['“Something is wrong.” / ANXIETY.','“You are not listening.” / HOSTILITY.','“Please help me.” / ATTENTION-SEEKING.']},
 {title:'THE SOLDIER WHO FOLLOWED CORRECTLY',lines:['The soldier did not choose the destination.','He did not choose the target. He did not choose the consequence.','He merely ensured that each instruction became an action.','Questions were not included in the order.'],object:'Command terminal',choices:['Open the door','Press the switch','Do not look inside'],answers:['The door opens onto another instruction.','Someone he cannot see receives the consequence.','Compliance recorded. The chamber behind him goes silent.']},
 {title:'THE FRIEND WHO MADE EVERYTHING ABOUT HIMSELF',lines:['The friend was always available.','He attended every crisis and possessed a story for every occasion.','No one suffered alone in his presence.','He made certain that they suffered beside him.'],object:'Conversation fader',choices:['Hear the grieving person','Hear the friend','Hear the recording'],answers:['“My mother died.” The friend begins his own story.','He recognizes every tragedy by comparing it with his own.','His memories now belong to strangers. He has requested someone acknowledge him.']},
 {title:'THE WOMAN WHO FORGAVE TOO EASILY',lines:['She forgave promises that were broken.','She forgave apologies that had memorized their own shape.','Each forgiveness restored the offender.','It did not restore her.'],object:'Absolution station',choices:['Forgive','Punish','Refuse to decide'],answers:['The offender is returned to the world. A second apology is prepared.','Her judgment is entered as evidence of hypocrisy.','The museum has made the decision for her.']},
 {title:'THE WITNESS WHO LOOKED AWAY',lines:['The witness saw enough to become uncomfortable.','Not enough, he claimed, to become involved.','He heard the sound through the wall. He recognized the fear.','He waited for proof. Proof arrived after it was useful.'],object:'Emergency panel',choices:['Investigate door one','Investigate door two','Investigate door three'],answers:['A crash. A voice says stop. No image is provided.','Crying, then laughter. The recording may have been edited.','Silence. The museum marks this as the most urgent emergency.']},
 {title:'THE MAN WHO NEEDED TO BE RIGHT',lines:['The man was rarely mistaken.','Mistakes were redefined before they could reach him.','When confronted with harm, he corrected the wording.','Every accusation contained an error. Therefore none could be true.'],object:'Game-show buttons',choices:['CORRECT','INCORRECT','IRRELEVANT'],answers:['His account is technically flawless. This does not make it useful.','He objects to the wording of the question.','The scoreboard cannot recognize this answer.']},
 {title:'THE CAREGIVER WHO NEEDED TO BE NEEDED',lines:['She fed the weak. She carried the tired.','When they began to stand, she reminded them how recently they had fallen.','She did not wish them harm.','She only feared the day they would no longer require her goodness.'],object:'Call station',choices:['Answer call','Answer another','Stop responding'],answers:['One patient rings again immediately.','Two more call as the first falls silent.','The machine generates a new dependent. Her work will now continue.']},
 {title:'THE OPTIMIST WHO CALLED SUFFERING BEAUTIFUL',lines:['The optimist found meaning in every wound.','Usually, the wound belonged to someone else.','Loss became growth. Fear became a journey.','Nothing was permitted to remain terrible.'],object:'Motivational assembler',choices:['PAIN IS A TEACHER','THE STRUGGLE IS THE GIFT','NO MEANING IS REQUIRED'],answers:['Additional instruction has been authorized.','Additional difficulty has been provided.','The system has no classification for this answer.']}
];
const artifacts=[
'Visitor ledger','The chosen audience member','A rejected application',
'A microphone accompanied by a single slow clap','A cup sealed beneath protective layers',
'A stethoscope with blocked earpieces','A medal facing backward','A group photograph with identical faces',
'An ABSOLVED stamp','A door chain','A debate trophy','A call button connected to itself',
'A book containing only acknowledgments'
];
let records={};
try{records=JSON.parse(localStorage.getItem(KEY)||'{}')||{};}catch(_){}
records.actions ||= {};records.visits ||= {};records.lookAway ||= 0;records.restricted ||= 0;
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(records));}catch(_){}};
const roomIndex=(x,y)=>y===ROW&&x>=WEST&&x<WEST+exhibits.length?x-WEST:-1;
const moss=palette.trim,metal=palette.metal,pale=palette.edge,dark=palette.dark,wood=palette.door,cloth=palette.floor;
const shape=(m,x,y,w,d,z,h,c=wood,solid=false)=>m.box(x-w/2,y-d/2,w,d,z,z+h,c,0,solid);
const line=(m,a,b,r=.024,c=metal)=>m.cylinder(a,b,r,c);
function figure(m,x,y,z=0,pose='upright',body=0,yaw=0,scale=1){
 const model=buildMannequinModel(body,pose,4,'',[0,0,0],null,0),a=propTransform([x,y,z],[yaw,0,0]).matrix,d=model.data;
 for(let i=0;i<d.length;i+=12){
  const px=d[i]*scale,py=d[i+1]*scale,pz=d[i+2]*scale;
  m.vertices.push(a[0]*px+a[1]*py+a[2]*pz+x,a[3]*px+a[4]*py+a[5]*pz+y,a[6]*px+a[7]*py+a[8]*pz+z,
    a[0]*d[i+3]+a[1]*d[i+4]+a[2]*d[i+5],a[3]*d[i+3]+a[4]*d[i+4]+a[5]*d[i+5],
    a[6]*d[i+3]+a[7]*d[i+4]+a[8]*d[i+5],...d.slice(i+6,i+12));
 }
}
function microphone(m,x,y,z=0){
 line(m,[x,y,z+.1],[x,y,z+1.47],.025);line(m,[x,y,z+1.47],[x-.18,y,z+1.58],.025,pale);
 line(m,[x-.26,y,z+1.58],[x-.10,y,z+1.58],.065,dark);
 line(m,[x-.34,y,z+.09],[x+.34,y,z+.09],.03);
}
function plaque(m,x,y,z=1.4,w=2.2){
 shape(m,x,y,w,.14,z,.84,metal);
 shape(m,x,y-.08,w-.13,.02,z+.08,.67,pale);
 for(let i=0;i<4;i++)shape(m,x-w*.32+i*w*.2,y-.10,.22,.025,z+.25,.027,dark);
}
function screen(m,x,y,z=1.1){
 shape(m,x,y,1.55,.42,z,1.12,metal);
 shape(m,x,y-.23,1.27,.025,z+.21,.72,dark);
 shape(m,x+.53,y-.25,.07,.04,z+.07,.07,pale);
}
function caseModel(m,x,y){
 shape(m,x,y,2.2,1.4,0,.95,wood);
 for(const dx of [-1,1])for(const dy of [-.65,.65])
  line(m,[x+dx,y+dy,.95],[x+dx,y+dy,2.3],.025,pale);
 shape(m,x,y,2.3,1.5,2.3,.09,metal);
}
function arch(m,x,y){
 for(const dx of [-1,1])shape(m,x+dx,y,.18,.25,0,2.9,metal);
 shape(m,x,y,2.3,.25,2.76,.16,metal);
 shape(m,x,y+.03,1.75,.11,0,2.6,wood);
 shape(m,x+.61,y-.06,.10,.04,1.23,.16,pale);
}
function seat(m,x,y){
 shape(m,x,y,.88,.77,.47,.15,cloth);
 shape(m,x,y+.39,.88,.13,.48,.9,wood);
 for(const dx of [-.38,.38])for(const dy of [-.28,.30])
  shape(m,x+dx,y+dy,.10,.09,0,.58,metal);
}
function roomItem(room,id,label,x,y,z,lines,kind='read',radius=4){
 room.annexItems.push({id:room.id+'/'+id,label,p:[x,y,z],lines,kind,radius});
}
function stage(m,x,y){
 shape(m,x+35,y+24,15,17,0,.45,wood);
 for(let i=0;i<9;i++)shape(m,x+43,y+15+i*1.9,.43,1.25,.45,3.2,cloth);
 microphone(m,x+36,y+25,.45);
 figure(m,x+39,y+25,.45,'upright',3,Math.PI);
}
function buildAuthored(room,m,id){
 const x=room.cx*CHUNK_SIZE,y=room.cy*CHUNK_SIZE;
 room.annexItems=[];room.props=[];room.furnishing={theme:'museum',groups:[],routes:[],objectDensity:0};
 // Keep the inherited grey-green palette, light model and original ambient audio.
 plaque(m,x+12,y+6,1.45,4.1);
 roomItem(room,'plaque','Read the exhibit plaque',x+12,y+5.6,1.66,
   [exhibits[id].title,exhibits[id].lines[0],'Discomfort should not be mistaken for injustice.']);
 for(const a of [14,33]){line(m,[x+a,y+12,.12],[x+a,y+12,1.0],.035);line(m,[x+a,y+12,1.0],[x+a+2,y+12,1],.02,pale);}
 screen(m,x+37,y+8,1.15);
 roomItem(room,'archive','Inspect the edited museum record',x+37,y+7.6,1.64,
 ['This demonstration is a reconstruction.','Original circumstances may have been abbreviated.']);
 if(id>0){arch(m,x+8,y+41);roomItem(room,'staff','Inspect restricted service door',x+8,y+40.9,1.34,
 ['STAFF INTERPRETATION ONLY.','The unedited record is not available to visitors.'],'restricted');}
 const stand=(sx,sy)=>{shape(m,x+sx,y+sy,5.8,2.6,0,1.18,metal);screen(m,x+sx,y+sy-1.25,1.18);};
 if(id===0){
  shape(m,x+28,y+24,9,2.4,0,1.2,wood);
  screen(m,x+28,y+22.7,1.2);
  for(let a=0;a<5;a++)plaque(m,x+13+a*5,y+34,1.3,2.2);
  arch(m,x+11,y+25);
  roomItem(room,'return','Return to the unmarked rooms',x+11,y+24.8,1.25,['This exit returns to the original corridors.'],'exit');
 }else if(id===1){
  stage(m,x,y);
  for(let a=0;a<10;a++){const sx=14+(a%3)*4.7,sy=14+Math.floor(a/3)*6;
   seat(m,x+sx,y+sy);figure(m,x+sx,y+sy,.53,'sitting',a%12,Math.min(2,records.actions[room.id+'/choice']||0)*.26,.94);}
  stand(26,6);
  roomItem(room,'target','Inspect chosen audience member',x+18.7,y+20,1.45,
   ['ORIGINAL: “I moved back home to help my mother.”','The circumstances are removed.','The comedian presents his own version to the audience.']);
  roomItem(room,'choice','Turn the interpretation dial',x+26,y+4.3,1.5,[], 'choice');
 }else if(id===2){
  for(let a=0;a<4;a++){
   const sx=13+a*8.5;
   shape(m,x+sx,y+24,6.5,14,0,.12,cloth);
   shape(m,x+sx,y+30,6.4,.2,.12,3.4,wood);
   arch(m,x+sx,y+30);
   screen(m,x+sx,y+18,1.3);
   roomItem(room,'trial'+a,'Inspect the reconstructed problem',x+sx,y+17.6,1.5,
    [['The job application is rejected before submission.'],['Every exit leads back to the same room.'],
     ['The hospital corridor grows longer whenever help is requested.'],
     ['A clock runs backward while the rent increases.']][a]);
  }
  figure(m,x+24,y+24,0,'upright',3);
  stand(37,9);
  roomItem(room,'choice','Activate the complaint mechanism',x+37,y+7.4,1.42,[],'choice');
 }else if(id===3){
  stage(m,x,y);
  for(let a=0;a<9;a++){const sx=15+(a%3)*5,sy=15+Math.floor(a/3)*6;
   seat(m,x+sx,y+sy);figure(m,x+sx,y+sy,.52,'sitting',3,0,.96);}
  caseModel(m,x+18,y+38);microphone(m,x+18,y+38,.95);
  roomItem(room,'choice','Listen to the comedian attempt to explain',x+36,y+24,1.4,[], 'choice');
  roomItem(room,'artifact','Inspect the final microphone',x+18,y+37.3,1.6,
   ['One individual claps. Slowly.','The comedian wanted others to understand that suffering was simple.',
    'Therefore his suffering was simplified.','This concludes the exhibit. Please proceed through the open door.'],'clap');
 }else{
  stand(25,10);
  roomItem(room,'choice','Operate '+exhibits[id].object.toLowerCase(),x+25,y+8.4,1.4,[], 'choice');
  if(id===4){
   for(let a=0;a<9;a++)line(m,[x+13+a*2.7,y+32,.1],[x+13+a*2.7,y+32,3.0],.045);
   appendProp(room,m,'bedframe',0,[x+28,y+27,0],[0,0,0],'exhibit');
   figure(m,x+21,y+25,0,'upright',8);figure(m,x+30,y+26,0,'upright',1,0,.63);
  }else if(id===5||id===11){
   for(let a=0;a<4;a++){const sx=x+13+a*8.1;
    appendProp(room,m,'bedframe',5,[sx,y+28,0],[0,0,0],'exhibit');
    figure(m,sx,y+28,.74,'lying',a,0,.88);screen(m,sx,y+19,1.1);}
   if(id===5)appendProp(room,m,'cabinet',2,[x+40,y+36,0],[0,0,0],'exhibit');
  }else if(id===6){
   for(let a=0;a<5;a++){const sx=x+13+a*6.2;
    shape(m,sx,y+29,4.1,.2,.2,2.8,wood);arch(m,sx,y+29);}
   figure(m,x+25,y+25,0,'upright',4);
  }else if(id===7){
   for(let a=0;a<6;a++){const sx=x+15+(a%3)*7.3,sy=y+22+Math.floor(a/3)*8;
    seat(m,sx,sy);figure(m,sx,sy,.52,'sitting',a);}
  }else if(id===8){
   for(let a=0;a<3;a++){const sx=x+16+a*10;
    shape(m,sx,y+30,5.8,6.4,0,3.2,wood);arch(m,sx,y+26.7);figure(m,sx,y+23,0,'upright',a+4);}
  }else if(id===9){
   for(let a=0;a<3;a++){const sx=x+14+a*11;
    arch(m,sx,y+32);screen(m,sx,y+25,1.1);}
  }else if(id===10){
   stage(m,x,y);for(let a=0;a<3;a++)screen(m,x+15+a*6,y+17,1.3);
  }else if(id===12){
   stage(m,x,y);shape(m,x+34,y+24,3.5,2.1,.5,1.3,metal);
   for(let a=0;a<7;a++){const sx=x+13+(a%3)*5,sy=y+16+Math.floor(a/3)*5;
    seat(m,sx,sy);figure(m,sx,sy,.5,'sitting',a);}
  }
  caseModel(m,x+39,y+38);
  // Each repeated correction makes the reconstructed space less plausible.
  // Changes are local to this annex room and use existing materials.
  const correction=Math.min(4,records.actions[room.id+'/choice']||0);
  for(let n=0;n<correction;n++){
   if(id===4)line(m,[x+19+n*2,y+19,.1],[x+19+n*2,y+19,3.2],.04,metal);
   if(id===5)screen(m,x+14+n*6,y+35,1.45);
   if(id===6)arch(m,x+16+n*5,y+36);
   if(id===7)shape(m,x+14+n*4,y+38,2.4,.14,1.2,1.8,pale);
   if(id===8)line(m,[x+18+n*3,y+37,0],[x+18+n*3,y+37,3.4],.055,metal);
   if(id===9)shape(m,x+14+n*6,y+38,.5,.5,1.0,.4,pale);
   if(id===10)shape(m,x+16+n*5,y+38,3.0,.2,1.0,2.2,metal);
   if(id===11)shape(m,x+13+n*6,y+37,.4,.4,1.0,.23,pale);
   if(id===12)screen(m,x+14+n*5,y+37,1.3);
  }
  if(id===4)shape(m,x+39,y+38,.33,.33,1,.35,pale);
  if(id===5)line(m,[x+38.7,y+38,1.1],[x+39.3,y+38,1.1],.04,pale);
  if(id===6)shape(m,x+39,y+38,.55,.18,1.1,.15,pale);
  if(id===7)shape(m,x+39,y+38,1.0,.06,1,1.0,pale);
  if(id===8)shape(m,x+39,y+38,.4,.3,1.1,.3,metal);
  if(id===9)line(m,[x+38.6,y+38,1.3],[x+39.4,y+38,1.3],.04,pale);
  if(id===10)shape(m,x+39,y+38,.5,.38,1,.75,pale);
  if(id===11)shape(m,x+39,y+38,.35,.3,1.1,.18,metal);
  if(id===12)shape(m,x+39,y+38,.9,.5,1.0,.16,pale);
  roomItem(room,'artifact','Examine the final object',x+39,y+37.4,1.4,
   [artifacts[id], 'The outcome was considered educational.','Please proceed once you understand.']);
  if(id===exhibits.length-1){
    arch(m,x+11,y+37);
    roomItem(room,'exit','Return to the unmarked rooms',x+11,y+36.8,1.3,
     ['No certificate of understanding will be issued.'],'exit');
  }
 }
}
function addThreshold(room,m){
 const x=10.6,y=7.1;
 shape(m,x,y,.13,2.6,0,2.75,wood);
 shape(m,x,y,.20,2.9,2.65,.13,metal);
 for(const dy of [-1.35,1.35])shape(m,x,y+dy,.20,.13,0,2.75,metal);
 plaque(m,x-.15,y,1.4,1.4);
 room.annexItems=[{id:'0,0/annex',label:'Enter the unmarked exhibition',p:[x-.5,y,1.4],kind:'entry',
  lines:['THE MUSEUM OF NECESSARY LESSONS.','The door was not here a moment ago.'],radius:4.7}];
}
const oldSectionSpec=sectionSpec,oldFurnish=furnishRoom,oldRelief=addRoomRelief;
sectionSpec=function(cx,cy){
 const idx=roomIndex(cx,cy);
 if(idx<0)return oldSectionSpec(cx,cy);
 return {kind:'empty',sides:idx===0?[0]:idx===exhibits.length-1?[2]:[0,2],height:4.35,variation:.5,archetype:null,pocket:null};
};
furnishRoom=function(room,m){
 const idx=roomIndex(room.cx,room.cy);
 if(idx>=0){room.annex=true;buildAuthored(room,m,idx);}
 else{oldFurnish(room,m);if(room.cx===0&&room.cy===0)addThreshold(room,m);}
};
addRoomRelief=function(room,m){if(roomIndex(room.cx,room.cy)<0)oldRelief(room,m);};
const css=document.createElement('style');
css.textContent='#annexTitle,#annexWords{position:fixed;z-index:12;left:50%;transform:translateX(-50%);text-align:center;pointer-events:none;color:#bec4c0;background:#101413d9;border:1px solid #67706c44;font:13px/1.8 "Courier New",monospace;opacity:0;transition:opacity 1.2s}#annexTitle{top:12%;padding:15px 23px;letter-spacing:.14em;max-width:min(690px,calc(100vw - 38px))}#annexWords{bottom:92px;padding:13px 18px;width:min(770px,calc(100vw - 42px))}#annexTitle.show,#annexWords.show{opacity:1}';
document.head.appendChild(css);
const title=document.createElement('div'),words=document.createElement('div');
title.id='annexTitle';words.id='annexWords';document.body.append(title,words);
let queue=[],showNextAt=0,hideAt=0,titleEnd=0,entered='',clapAt=0,lookAwayFor=0;
function card(s,seconds=7){title.textContent=s;titleEnd=performance.now()/1000+seconds;title.classList.add('show');}
function textLines(lines){queue=[...lines];showNextAt=performance.now()/1000+.5;}
const sight=()=>[Math.cos(player.yaw)*Math.cos(player.pitch),Math.sin(player.yaw)*Math.cos(player.pitch),Math.sin(player.pitch)];
function nearest(){
 const room=chunks.get(currentChunkKey());if(!room||!room.annexItems)return null;
 let selected=null,best=Infinity;const forward=sight();
 for(const item of room.annexItems){
  const delta=[item.p[0]-player.x,item.p[1]-player.y,item.p[2]-player.z],distance=Math.hypot(...delta);
  if(distance>item.radius||distance>=best||dot(normalize(delta),forward)<.42)continue;
  selected=item;best=distance;
 }
 return selected;
}
function travel(toMuseum){
 const p=toMuseum?
   {x:WEST*CHUNK_SIZE+13,y:ROW*CHUNK_SIZE+24,z:EYE_HEIGHT,yaw:0}:
   {x:7.2,y:7.2,z:EYE_HEIGHT,yaw:.35};
 Object.assign(player,{...p,pitch:0,vx:0,vy:0});resetLocomotion();
 entered='';lastEnteredRoom=null;queue=[];updateStreaming();worldRevision++;save();
 card(toMuseum?'THE MUSEUM OF NECESSARY LESSONS':'UNMARKED ROOMS',8);
}
function perform(item){
 if(item.kind==='entry'){travel(true);return true;}
 if(item.kind==='exit'){travel(false);return true;}
 if(item.kind==='restricted'){records.restricted++;save();textLines(item.lines.concat(['The request has been recorded.']));return true;}
 const index=roomIndex(Math.floor(player.x/CHUNK_SIZE),Math.floor(player.y/CHUNK_SIZE));
 const exhibit=exhibits[index];if(!exhibit)return false;
 const n=records.actions[item.id]||0;records.actions[item.id]=n+1;save();
 if(item.kind==='choice'){
  const k=n%exhibit.choices.length;
  card(exhibit.choices[k],5);
  const intro=index===1?['ORIGINAL: “I moved back home to help my mother.”','MUSEUM INTERPRETATION: '+exhibit.answers[k]]:
   [exhibit.answers[k]];
  if(index===2||index===3)intro.push('[The mechanical audience begins to laugh. His answer cannot be heard.]');
  intro.push('The interpretation has been recorded.');
  textLines(intro);
  const room=chunks.get(currentChunkKey());
  if(room&&room.annex){disposeRoom(room);chunks.delete(room.id);loadKey(room.id);worldRevision++;}
 }else if(item.kind==='clap'){
  textLines(item.lines);clapAt=0;
 }else textLines(item.lines);
 return true;
}
const oldToggle=toggleDoor;
toggleDoor=function(){const item=nearest();return item?perform(item):oldToggle();};
const oldUpdate=update;
update=function(dt){
 oldUpdate(dt);if(!active)return;
 const t=performance.now()/1000,key=currentChunkKey(),r=chunks.get(key);
 const idx=r&&r.annex?roomIndex(r.cx,r.cy):-1;
 if(entered!==key){
  entered=key;queue=[];words.classList.remove('show');
  if(idx>=0){records.visits[key]=(records.visits[key]||0)+1;save();
   card((idx===0?'MUSEUM ANNEX':'EXHIBIT '+String(idx<=3?1:idx-2).padStart(2,'0'))+' — '+exhibits[idx].title,8);
   textLines(exhibits[idx].lines);
  }
 }
 const target=nearest();
 if(target)interaction.textContent='E — '+target.label;
 if(queue.length&&t>=showNextAt){
  const s=queue.shift();words.textContent=s;words.classList.add('show');
  showNextAt=t+Math.min(13,Math.max(6.6,3.2+s.length*.072));hideAt=showNextAt+2;
 }
 if(!queue.length&&t>hideAt)words.classList.remove('show');
 if(t>titleEnd)title.classList.remove('show');
 if(idx===3&&r){
  const d=Math.hypot(player.x-(r.cx*CHUNK_SIZE+18),player.y-(r.cy*CHUNK_SIZE+38));
  if(d<8&&t-clapAt>7){clapAt=t;softClap();}
 }
 if(idx>=2&&idx<=3){
  const aim=[r.cx*CHUNK_SIZE+35,r.cy*CHUNK_SIZE+24,1.5];
  const vector=normalize(aim.map((v,i)=>v-[player.x,player.y,player.z][i]));
  lookAwayFor=dot(vector,sight())<.12?lookAwayFor+dt:Math.max(0,lookAwayFor-dt);
  if(lookAwayFor>9){records.lookAway++;lookAwayFor=0;save();}
 }else lookAwayFor=0;
};
// Soft, isolated sound effect only. No narrator or character voice, and
// the existing ambience/hum is not modified.
function softClap(){
 if(!humEnabled||!hum||!hum.context||hum.context.state!=='running')return;
 const ctx=hum.context,b=ctx.createBuffer(1,Math.floor(ctx.sampleRate*.09),ctx.sampleRate),a=b.getChannelData(0);
 for(let i=0;i<a.length;i++)a[i]=(Math.random()*2-1)*Math.exp(-i/(a.length*.14));
 const source=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),gain=ctx.createGain();
 filter.type='bandpass';filter.frequency.value=900;gain.gain.value=.008;
 source.buffer=b;source.connect(filter);filter.connect(gain);gain.connect(ctx.destination);
 source.start();source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect();};
}
// Initial room was constructed before this optional add-on was loaded.
const start=chunks.get('0,0');
if(start&&!start.archetype){disposeRoom(start);chunks.delete('0,0');loadKey('0,0');worldRevision++;}
console.info('Museum annex loaded: text-only stories and authored 3D exhibits.');
})();