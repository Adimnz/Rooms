/* Five authored domestic spaces, using the game's native instanced meshes. */
'use strict';
const DETAILED_ROOMS=[
  {name:'The Shuttered Arrival',subtitle:'Reception, luggage alcoves and an arched gallery',floor:[.29,.275,.235],wall:[.49,.48,.42]},
  {name:'The Family Suite',subtitle:'Two bedrooms around a quiet domestic corridor',floor:[.27,.25,.23],wall:[.47,.49,.455]},
  {name:'The Long Reading Room',subtitle:'An abandoned library and its paper strewn study',floor:[.25,.265,.25],wall:[.45,.48,.46]},
  {name:'The Broadcast Parlour',subtitle:'Flickering monitors, low sofas and forgotten luggage',floor:[.245,.26,.27],wall:[.46,.48,.49]},
  {name:'The Nursery at the End',subtitle:'Beds, toy cupboards and an unfinished packing room',floor:[.29,.275,.25],wall:[.5,.48,.44]}
];
const detailedModels=new Map(),DWOOD=[.31,.275,.22],DBRASS=[.39,.34,.22],DPAPER=[.63,.61,.51],DFABRIC=[.34,.37,.32];
function detailedRoomIndex(cx,cy){return !memorySettings.archetype&&cy===0&&cx>=0&&cx<5?cx:-1;}
function detailedModel(type,variant=0){
  const key=`detailed/${type}/${variant}`;if(detailedModels.has(key))return detailedModels.get(key);
  if(PROP_DESIGNS[type]&&type!=='bookshelf')return buildPropModel(type,variant%7);
  const m=new Mesh(),emitters=[],v=variant,B=(x,y,w,d,z,h,c=DWOOD,material=[0,0,0])=>m.box(x-w/2,y-d/2,w,d,z,z+h,c,0,false,material),rod=(a,b,r=.015,c=DBRASS)=>m.cylinder(a,b,r,c,[0,0,0],8);
  const screw=(x,y,z)=>{m.cylinder([x,y,z],[x,y-.008,z],.012,DBRASS,[0,0,0],6);B(x,y-.009,.018,.003,z-.002,.004,palette.dark);};
  const solid=(x,y,w,d,z,h,c=DWOOD)=>{B(x,y,w,d,z,h,c);m.colliders.push({x:x-w/2,y:y-d/2,w,d,z0:z,z1:z+h,angle:0,color:c});};
  if(type==='bed'){
    const w=1.75,d=2.5;
    for(const x of [-w/2,w/2])for(const y of [-d/2,d/2]){B(x,y,.12,.12,0,y>0?1.35:.78);ellipsoid(m,[x,y,y>0?1.4:.83],[.085,.085,.085],DBRASS,[0,0,0]);}
    for(const x of [-.8,.8])B(x,0,.11,d,.28,.18);for(let i=0;i<13;i++)B(0,-1.16+i*.193,1.65,.08,.37,.045);
    for(const y of [-1.25,1.25]){B(0,y,w,.10,.32,.13);B(0,y,w,.10,y>0?1.18:.63,.10);for(let i=0;i<9;i++)rod([-.7+i*.175,y,.42],[-.7+i*.175,y,y>0?1.18:.63],.022,DWOOD);}
    B(0,0,1.63,2.36,.43,.24,[.52,.51,.43]);B(0,-.25,1.67,1.84,.68,.035,DFABRIC);
    for(let i=0;i<11;i++){B(-.79+i*.158,-.25,.009,1.82,.716,.004,palette.trim);B(0,-1.13+i*.16,1.62,.009,.718,.004,palette.trim);}
    for(const x of [-.43,.43])ellipsoid(m,[x,.86,.75],[.34,.23,.075],DPAPER,[0,0,0],5,10);
    for(const x of [-.8,.8])for(const y of [-1.25,1.25])for(const z of [.37,.69])screw(x,y-.06,z);
    m.colliders.push({x:-.86,y:-1.23,w:1.72,d:2.46,z0:0,z1:.72,angle:0,color:DWOOD},{x:-.94,y:1.19,w:1.88,d:.16,z0:0,z1:1.48,angle:0,color:DWOOD},{x:-.94,y:-1.34,w:1.88,d:.16,z0:0,z1:.91,angle:0,color:DWOOD});
  }else if(type==='bookshelf'){
    for(const x of [-.8,.8])solid(x,0,.055,.44,0,2.25);solid(0,.235,1.65,.035,0,2.25);
    for(const z of [.1,.6,1.1,1.6,2.21])solid(0,0,1.65,.44,z,.04);
    for(const x of [-.8,.8])for(const z of [.12,.62,1.12,1.62,2.23])screw(x,-.23,z);
    B(0,-.245,1.72,.06,2.19,.09,DBRASS);
  }else if(type==='console'){
    solid(0,0,3,.74,.76,.065);for(const x of [-1.4,1.4])for(const y of [-.3,.3])solid(x,y,.08,.08,0,.76,palette.metal);
    solid(0,0,2.85,.65,.24,.05);B(0,.35,3,.08,.76,.2,palette.metal);
  }else if(type==='rug'){
    const w=4.6,d=6.4;B(0,0,w,d,0,.012,[.27,.3,.27]);
    for(let i=0;i<4;i++){const inset=.09+i*.06;for(const x of [-1,1])B(x*(w/2-inset),0,.025,d-2*inset,.013,.002,DPAPER);for(const y of [-1,1])B(0,y*(d/2-inset),w-2*inset,.025,.013,.002,DPAPER);}
    for(let i=-4;i<=4;i++)for(let j=-6;j<=6;j++){const x=i*.45,y=j*.45;m.quad([[x-.11,y,.019],[x,y-.13,.019],[x+.11,y,.019],[x,y+.13,.019]],[.39,.39,.29],[0,0,0],[0,0,1]);}
    for(let i=0;i<46;i++)for(const sign of [-1,1])rod([-2.25+i*.1,sign*3.18,.013],[-2.25+i*.1,sign*3.31,.007],.006,DPAPER);
  }else if(type==='window'){
    B(0,.02,3,.21,0,2.55,palette.trim);B(0,-.105,2.69,.015,.16,2.22,[.115,.155,.17],[1,v*2,-.5]);
    for(const x of [-1.47,1.47]){B(x,-.13,.12,.13,-.03,2.61,DPAPER);B(x,-.21,.025,.035,-.04,2.63,DBRASS);}
    for(const z of [0,2.5])B(0,-.13,3.05,.15,z,.10,DPAPER);
    for(const x of [-.45,.45])B(x,-.15,.045,.07,.13,2.31,DPAPER);B(0,-.15,2.85,.07,1.23,.045,DPAPER);
    B(0,-.28,3.25,.5,-.08,.11,DWOOD);B(0,-.18,.13,.09,1.18,.08,DBRASS);
    for(const x of [-1.42,1.42])for(const z of [.12,2.38])screw(x,-.22,z);
    for(let i=0;i<6;i++)B(-1.2+i*.45,-.17,.025,.006,.3+i%2*.2,1.62,[.17,.2,.205]);
  }else if(type==='shutter'){
    // The origin is the hinge, so opening rotates the complete assembly.
    B(.61,0,1.22,.075,0,2.25,DWOOD);
    for(const x of [.04,1.18])B(x,-.055,.075,.045,.035,2.18,DBRASS);
    for(let i=0;i<19;i++){const z=.14+i*.106;m.quad([[.1,-.075,z],[1.12,-.075,z],[1.12,-.038,z+.075],[.1,-.038,z+.075]],[.38,.355,.29]);}
    for(const z of [.2,1.1,2.05]){rod([0,0,z],[0,0,z+.12],.022);B(.06,.015,.12,.025,z,.065,DBRASS);screw(.09,-.01,z+.03);}
    B(1.02,-.1,.1,.04,1.02,.13,palette.metal);
  }else if(type==='picture'){
    const w=1.5,h=1.13;B(0,0,w,.065,0,h,palette.dark);B(0,-.04,w-.13,.016,.065,h-.13,DPAPER);
    for(let i=0;i<3;i++){const a=i*.024;for(const x of [-1,1])B(x*(w/2-a-.02),-.065-i*.008,.035,.025,a,h-a*2,DBRASS);for(const z of [a,h-a-.035])B(0,-.065-i*.008,w-a*2,.025,z,.035,DBRASS);}
    B(0,-.055,1.21,.008,.18,.76,[.23,.28,.28]);
    m.quad([[-.59,-.061,.25],[-.22,-.061,.72],[.15,-.061,.37],[.59,-.061,.62],[.59,-.061,.2]],DFABRIC);
    ellipsoid(m,[.32,-.065,.78],[.1,.008,.1],DPAPER,[0,0,0],4,8);
    for(let i=0;i<4;i++)B(-.45+i*.27,-.069,.09,.006,.28,.24,[.19,.22,.205]);
    rod([-.42,.04,h-.13],[0,.04,h+.06],.006,palette.metal);rod([0,.04,h+.06],[.42,.04,h-.13],.006,palette.metal);
    B(.24,-.075,.014,.004,.14,.78,[.45,.46,.4]);
  }else if(type==='screen'){
    B(0,0,1.4,.36,0,.96,palette.metal);B(0,-.185,1.2,.018,.14,.68,[.15,.24,.23],[1,v*3,1]);
    for(let i=0;i<19;i++)B(0,-.198,1.17,.003,.17+i*.032,.003,[.04,.07,.07],[1,v*3,1]);
    for(let i=0;i<5;i++)B(-.45+i*.2,-.202,.08,.004,.25+(i%3)*.11,.23,[.23,.31,.28],[1,v*3,1]);
    for(const x of [-.63,.63])for(const z of [.06,.89])screw(x,-.19,z);
    for(let i=0;i<10;i++)B(.44,-.185,.012,.013,.17+i*.04,.024,palette.dark);
    for(const x of [.37,.55])rod([x,-.18,.08],[x,-.22,.08],.033,DBRASS);
    B(0,0,.44,.3,-.09,.08);rod([-.4,.05,.95],[-.65,.05,1.32],.01);rod([-.4,.05,.95],[-.22,.05,1.29],.01);
    emitters.push({position:[0,-.23,.5],axis:[0,-1,0],power:1.8,range:4});
  }else if(type==='suitcase'){
    B(0,0,.78,.44,.06,1.02,[.28,.255,.21]);B(0,-.235,.73,.025,.14,.87,[.34,.31,.26]);
    for(const x of [-.3,.3]){B(x,-.255,.065,.025,.13,.9,DBRASS);rod([x,.10,1.04],[x,.10,1.38],.014);}
    rod([-.3,.1,1.38],[.3,.1,1.38],.026,palette.metal);
    for(const x of [-.31,.31]){rod([x,-.13,.045],[x,.13,.045],.06,palette.metal);B(x,-.27,.06,.04,.8,.08,palette.edge);}
    B(.07,-.28,.12,.014,.68,.2,DPAPER);B(.07,-.29,.06,.006,.75,.01,palette.dark);
    for(let i=0;i<8;i++)B(-.25+i*.07,-.253,.008,.008,.25,.42,palette.trim);
  }else if(type==='fan'||type==='fanBlades'){
    if(type==='fan'){
      B(0,0,.44,.35,0,.05,palette.metal);rod([0,0,.05],[0,0,.77],.025);rod([0,.1,.76],[0,-.03,.9],.04);
      for(let i=0;i<32;i++){const a=i*Math.PI/16,b=(i+1)*Math.PI/16;for(const y of [-.095,.08])rod([Math.cos(a)*.3,y,.98+Math.sin(a)*.3],[Math.cos(b)*.3,y,.98+Math.sin(b)*.3],.008,palette.edge);if(i%2===0)rod([0,-.1,.98],[Math.cos(a)*.3,-.095,.98+Math.sin(a)*.3],.005,palette.edge);}
      for(const x of [-.1,0,.1])B(x,-.13,.04,.04,.05,.02,DBRASS);rod([0,.04,.3],[.3,.17,.02],.007,palette.dark);
    }else{
      for(let i=0;i<4;i++){const a=i*Math.PI/2;m.quad([[0,0,0],[Math.cos(a)*.255,0,Math.sin(a)*.255],[Math.cos(a+.62)*.24,.018,Math.sin(a+.62)*.24]],DFABRIC);}
      m.cylinder([0,-.025,0],[0,.025,0],.046,DBRASS);
    }
  }else if(type==='ball'){
    const r=.19+(v%3)*.035;ellipsoid(m,[0,0,r],[r,r,r],[.42,.39,.27],[0,0,0],9,16);
    for(let i=0;i<32;i++){const a=i*Math.PI/16,b=(i+1)*Math.PI/16;rod([r*Math.cos(a),r*Math.sin(a),r],[r*Math.cos(b),r*Math.sin(b),r],.006,palette.trim);}
  }else if(type==='can'){
    m.cylinder([0,0,.01],[0,0,.14],.047,[.38,.42,.39],[0,0,0],16);m.cylinder([0,0,.139],[0,0,.145],.049,palette.edge,[0,0,0],16);
    B(0,0,.025,.016,.147,.003,palette.dark);B(0,-.047,.047,.004,.035,.064,[.29,.32,.26]);
  }else if(type==='book'){
    const c=[[.3,.25,.21],[.24,.3,.27],[.32,.31,.24],[.24,.26,.3]][v%4];B(0,0,.23,.34,0,.018,c);B(0,0,.21,.32,.018,.047,DPAPER);B(0,0,.23,.34,.065,.015,c);B(-.112,0,.012,.34,0,.08,c);
    for(let i=0;i<5;i++)B(.108,0,.004,.31,.022+i*.008,.001,palette.trim);for(let i=0;i<3;i++)B(0,-.05+i*.04,.13-i*.025,.01,.081,.001,DBRASS);
  }else if(type==='page'){
    B(0,0,.205,.29,0,.003,DPAPER);for(let i=0;i<13;i++)B(-.015+(i%3)*.009,-.113+i*.016,.145-(i%4)*.013,.003,.0031,.0005,palette.trim);
  }else if(type==='toy'){
    if(v%3===0){B(0,0,.33,.16,.06,.1,[.36,.29,.23]);B(.04,0,.16,.15,.16,.08,DFABRIC);for(const x of [-.1,.1])for(const y of [-.092,.092])m.cylinder([x,y-.015,.065],[x,y+.015,.065],.05,palette.metal);}
    else if(v%3===1){ellipsoid(m,[0,0,.22],[.12,.09,.14],DWOOD,[0,0,0]);ellipsoid(m,[0,0,.42],[.105,.09,.1],DWOOD,[0,0,0]);for(const x of [-.08,.08])ellipsoid(m,[x,0,.5],[.04,.035,.04],DBRASS,[0,0,0]);for(const x of [-.08,.08])ellipsoid(m,[x,-.05,.06],[.06,.09,.06],DWOOD,[0,0,0]);}
    else{for(let i=0;i<3;i++)B((i-1)*.11,0,.1,.11,(i%2)*.1,.1,[.3+i*.04,.32,.26]);}
  }else if(type==='trinket'){
    if(v%3===0){m.cylinder([0,0,.015],[0,0,.16],.048,DPAPER);m.cylinder([0,0,.16],[0,0,.167],.05,palette.trim);for(let i=0;i<9;i++){const a=i*Math.PI/8,b=(i+1)*Math.PI/8;rod([.06+.04*Math.sin(a),0,.09+.055*Math.cos(a)],[.06+.04*Math.sin(b),0,.09+.055*Math.cos(b)],.01,DPAPER);}}
    else if(v%3===1){B(0,0,.16,.09,0,.21,DBRASS);B(0,-.05,.13,.01,.07,.11,DPAPER);rod([0,-.06,.12],[.035,-.06,.16],.004,palette.dark);rod([0,-.06,.12],[-.04,-.06,.12],.004,palette.dark);}
    else{m.cylinder([0,0,0],[0,0,.12],.055,[.2,.28,.25]);m.cylinder([0,0,.12],[0,0,.19],.022,DBRASS);}
  }else if(type==='switch'){
    B(0,0,.13,.035,0,.21,DPAPER);B(0,-.03,.046,.027,.067,.08,palette.trim);for(const z of [.025,.185])screw(0,-.023,z);
  }else if(type==='cushion')ellipsoid(m,[0,0,.1],[.3,.3,.1],DFABRIC,[0,0,0],6,12);
  else throw new Error('Unknown detailed model: '+type);
  const model=finishLocalModel(m,key);model.emitters=emitters;detailedModels.set(key,model);return model;
}
function detailedEntity(room,type,x,y,z=0,options={}){
  const index=room.entities.length,variant=options.variant??index%7,body=options.body??index%14;
  const e={id:`${room.id}/entity${index}`,room,type,variant,body,surface:options.surface??1,pose:options.pose||'upright',head:[0,0,0],missing:'',point:null,
    position:[room.cx*48+x,room.cy*48+y,z],rotation:[options.yaw||0,0,0],scale:[1,1,1],emission:1,visible:true,behavior:'',decorative:false,powered:true};
  e.model=type==='mannequin'?buildMannequinModel(body,e.pose,e.surface):detailedModel(type,variant);
  e.bounds=memoryBounds(e);e.position[2]+=z-e.bounds.min[2];e.anchor=[...e.position];e.bounds=memoryBounds(e);
  configurePropPhysics(e,type==='screen'?{...options,fixed:false}:options);e.actionLabel=options.actionLabel;e.description=options.description;
  if(type==='rug')e.walkable=true;
  room.entities.push(e);room.props.push(e);return e;
}
function detailedArchitecture(room,m,index){
  const ox=room.cx*48,oy=room.cy*48,C=DETAILED_ROOMS[index],B=(x,y,w,d,z,h,c=C.wall,solid=false,label='wall framing')=>{const start=m.colliders.length;m.box(ox+x-w/2,oy+y-d/2,w,d,z,z+h,c,0,solid);if(solid)m.colliders[start].label=label;};
  const rod=(a,b,r=.014,c=DBRASS)=>m.cylinder([ox+a[0],oy+a[1],a[2]],[ox+b[0],oy+b[1],b[2]],r,c);
  // Board seams, nail heads, stepped skirting, dado rails and coffered ceiling.
  for(let i=0;i<48;i++){B(i+.5,24,.012,47.8,.008,.002,palette.trim);for(let j=0;j<5;j++)B(i+.5,(j*10+i%3*3)%48,1,.012,.008,.002,palette.trim);}
  const panelWall=(x0,y0,length,vertical=false)=>{
    const at=(along,normal,w,d,z,h,c)=>vertical?B(x0+normal,y0+along,d,w,z,h,c):B(x0+along,y0+normal,w,d,z,h,c);
    for(const [z,h,depth]of [[.02,.14,.11],[.15,.045,.14],[1.05,.045,.055],[4.34,.12,.12],[4.45,.08,.19]])at(length/2,0,length,depth,z,h,DWOOD);
    for(let a=.6;a<length;a+=1.45){at(a,0,.035,.045,.24,.72,DBRASS);at(Math.min(a+.62,length-.1),0,1.22,.045,.24,.025,DBRASS);at(Math.min(a+.62,length-.1),0,1.22,.045,.94,.025,DBRASS);}
  };
  for(const side of [0,1,2,3]){const vertical=side%2===0,door=room.doors.find(d=>d.vertical===vertical&&(vertical?d.ex===room.cx+(side===0?1:0):d.ey===room.cy+(side===1?1:0))),start=door?(vertical?door.y-oy:door.x-ox):0,fixed=side===0||side===1?47.8:.2;
    for(const [lo,hi]of door?[[.2,start-.12],[start+DOOR_WIDTH+.12,47.8]]:[[.2,47.8]])if(hi>lo)panelWall(vertical?fixed:lo,vertical?lo:fixed,hi-lo,vertical);
  }
  for(const x of [.22,47.78])for(const y of [.22,47.78]){B(x,y,.14,.14,.1,4.35,DWOOD);for(const z of [.2,1.07,4.3])B(x,y,.22,.22,z,.08,DBRASS);}
  for(const x of [8,16,24,32,40]){B(x,24,.1,48,4.46,.12,DWOOD);B(24,x,48,.1,4.46,.12,DWOOD);}
  // Two partitions form furnished side rooms and a continuous central gallery.
  function arch(cx,cy){
    const r=1.65,spring=2.35,thick=.22;
    for(const sign of [-1,1]){B(cx+sign*(r+.12),cy,.24,.4,0,spring,DPAPER,true,'arched doorway jamb');B(cx+sign*(r+.12),cy,.36,.48,0,.18,DWOOD);B(cx+sign*(r+.12),cy,.31,.44,spring-.12,.16,DBRASS);}
    for(let i=0;i<20;i++){const a=i*Math.PI/20,b=(i+1)*Math.PI/20,p=(angle,radius,y)=>[ox+cx+Math.cos(angle)*radius,oy+y,spring+Math.sin(angle)*radius];
      const outer=r+thick,front=[p(a,r,cy-.21),p(a,outer,cy-.21),p(b,outer,cy-.21),p(b,r,cy-.21)];m.quad(front,i%2?DPAPER:DWOOD,[0,0,0],[0,-1,0]);m.quad(front.map(p=>[p[0],p[1]+.42,p[2]]).reverse(),DPAPER,[0,0,0],[0,1,0]);m.quad([p(a,r,cy-.21),p(b,r,cy-.21),p(b,r,cy+.21),p(a,r,cy+.21)],DWOOD);
      for(const side of [-1,1]){const pa=p(a,outer,cy+side*.18),pb=p(b,outer,cy+side*.18);m.quad([pa,pb,[pb[0],pb[1],4.6],[pa[0],pa[1],4.6]],C.wall,[0,0,0],[0,side,0]);}
      const left=cx+Math.min(Math.cos(a),Math.cos(b))*r,right=cx+Math.max(Math.cos(a),Math.cos(b))*r,z=spring+Math.min(Math.sin(a),Math.sin(b))*r;
      m.colliders.push({x:ox+left,y:oy+cy-.18,w:Math.max(.02,right-left),d:.36,z0:z,z1:4.6,angle:0,color:C.wall,label:'arched stone lintel'});
    }
    rod([cx-r-.12,cy-.24,.3],[cx-r-.12,cy-.24,spring-.22],.01);rod([cx+r+.12,cy-.24,.3],[cx+r+.12,cy-.24,spring-.22],.01);
  }
  for(const y of [18,30]){let start=.2;for(const x of [12,25,38]){const end=x-1.9;if(end>start){B((start+end)/2,y,end-start,.24,0,4.6,C.wall,true,'paneled partition');panelWall(start,y-.14,end-start);panelWall(start,y+.14,end-start);}arch(x,y);start=x+1.9;}B((start+47.8)/2,y,47.8-start,.24,0,4.6,C.wall,true);panelWall(start,y-.14,47.8-start);}
  for(const y of [.24,47.76])for(const x of [14,27,40]){
    const inward=y<24?Math.PI:0,window=detailedEntity(room,'window',x,y,1.05,{yaw:inward,fixed:true,label:'sash window',description:'Painted shut. Layered timber framing, sash locks and clouded glass.'});
    const t=propTransform([x,y,1.05],[inward,0,0]);
    for(const side of [-1,1]){const p=t.point([side<0?-1.34:.08,-.25,.09]);const shutter=detailedEntity(room,'shutter',p[0],p[1],p[2],{yaw:inward,fixed:true,label:'louvered shutter',actionLabel:'Open / close'});shutter.closedYaw=inward;shutter.swingSign=side;}
  }
  for(const y of [.35,47.65])for(const x of [6,20,34])detailedEntity(room,'picture',x,y,1.6,{yaw:y<24?Math.PI:0,fixed:true,label:'framed landscape',description:'A tarnished frame surrounds a landscape with no road leading out.'});
  for(const y of [17.83,30.17])for(const x of [4,19,32,44])detailedEntity(room,'picture',x,y,1.55,{yaw:y<24?0:Math.PI,fixed:true,label:'framed photograph',description:'The photographs have faded. The hanging wire and brass frame are still intact.'});
  for(const x of [12,25,38])for(const y of [21,27]){
    const fixture={id:`${room.id}/authored-light-${x}-${y}`,x:ox+x,y:oy+y,mount:'ceiling',phase:(index*5+x+y)%29,fault:(x+y+index)%3===0,off:false,power:27,range:15,color:[.98,.94,.8],axis:[0,0,-1]};
    addFixture(m,fixture,room.height,true);room.fixtures.push(fixture);
  }
  for(const x of [12,38])for(const y of [9,39]){const fixture={id:`${room.id}/side-light-${x}-${y}`,x:ox+x,y:oy+y,mount:'ceiling',phase:index*3+x,fault:false,off:false,power:36,range:15,color:[.94,.96,.86],axis:[0,0,-1]};addFixture(m,fixture,room.height,false);room.fixtures.push(fixture);}
  const sw=detailedEntity(room,'switch',9.5,17.8,1.25,{fixed:true,label:'gallery light switch',actionLabel:'Toggle'});sw.lightIds=room.fixtures.filter(f=>f.id.includes('authored-light')).map(f=>f.id);
}
function buildDetailedRoom(room,m,index){
  room.detailed=index;room.kind=DETAILED_ROOMS[index].name;room.entities=[];room.props=[];room.portals=[];room.instanceBatches=[];room.entityColliders=[];
  room.furnishing={theme:room.kind,groups:[],routes:memoryRoutes(room),objectDensity:.8};room.memoryRandom=randomFor(room.cx,room.cy,4100);room.memoryWeights={observationChanges:0,mannequinBehavior:1};
  restoreMemoryState(room);
  const p=(type,x,y,z=0,options={})=>detailedEntity(room,type,x,y,z,options),random=room.memoryRandom;
  detailedArchitecture(room,m,index);
  const clutter=(x,y,z=0,count=8)=>{for(let i=0;i<count;i++){const type=['book','can','page','trinket','toy'][i%5];p(type,x+(random()-.5)*2.5,y+(random()-.5)*2,z,{yaw:random()*Math.PI*2,variant:i%7});}};
  const library=(x,y)=>{p('bookshelf',x,y,0,{variant:0,fixed:true,label:'loaded bookcase'});for(let shelf=0;shelf<4;shelf++)for(let i=0;i<6;i++)p('book',x-.65+i*.25,y-.04,.14+shelf*.5,{variant:i%7});};
  const readingDesk=(x,y)=>{p('desk',x,y,0,{variant:0,fixed:true,label:'oak writing desk'});p('lawnChair',x,y-1.15,0,{variant:6,yaw:Math.PI,label:'desk chair'});p('deskLamp',x-.5,y,.825,{variant:0,label:'hinged desk lamp'});p('book',x+.24,y,.825);p('page',x+.4,y-.14,.91);p('trinket',x-.23,y-.2,.825);};
  const fan=(x,y,z=0)=>{const e=p('fan',x,y,z,{label:'electric fan',actionLabel:'Toggle'}),blade=p('fanBlades',x,y,z+.98,{fixed:true,label:'fan blades'});blade.collidable=false;blade.parentFan=e.id;e.bladeId=blade.id;return e;};
  const bed=(x,y)=>{p('bed',x,y,0,{fixed:true,label:'timber bed and quilt',description:'A bolted bedframe, turned finials, spindle rails, slats and a stitched quilt.'});p('drawers',x+1.9,y+.6,0,{variant:3,fixed:true,label:'bedside cabinet'});p('deskLamp',x+1.9,y+.6,.74,{variant:2,label:'bedside lamp'});p('book',x+1.9,y+.25,.74);p('cushion',x,y-.5,.74,{label:'loose pillow'});};
  for(const x of [12,25,38])p('rug',x,24,0,{fixed:true,label:'woven runner',description:'A heavy woven carpet with stitched borders and fringed edges.'});
  if(index===0){
    readingDesk(15,10);p('cabinet',36,8,0,{variant:5,fixed:true,label:'reception key cabinet'});
    p('sofa',29,10,0,{variant:2,fixed:true,label:'reception sofa'});p('cushion',29,9.7,.55);fan(32,9);
    for(let i=0;i<8;i++)p('suitcase',5+i*4.8,38+(i%2)*3,0,{label:'abandoned suitcase',yaw:i*.19});
    for(const x of [9,23,37]){p('lawnChair',x,34,0,{variant:1});clutter(x,35,0,7);}
    p('desk',36,7,0,{variant:0,fixed:true,label:'monitor stand'});p('screen',36,7,.825,{label:'reception monitor',actionLabel:'Toggle'});library(40,41);
    p('mannequin',19,14,0,{surface:2,label:'reception mannequin'});p('mannequin',33,35,0,{surface:1,label:'waiting mannequin'});
  }else if(index===1){
    for(const x of [13,34])for(const y of [9,39])bed(x,y);
    p('cabinet',24,9,0,{variant:1,fixed:true,label:'wardrobe'});p('cabinet',24,40,0,{variant:0,fixed:true,label:'linen cupboard'});
    fan(18,11);fan(38,38);p('desk',29,8,0,{variant:0,fixed:true,label:'television stand'});p('screen',29,8,.825,{label:'bedroom television',actionLabel:'Toggle'});
    for(const x of [12,33]){p('rug',x,11,0,{fixed:true,label:'bedroom carpet'});clutter(x+4,13,0,12);p('suitcase',x+2,6);}
    readingDesk(36,33);p('mannequin',21,36,0,{body:7,surface:1,label:'bedroom mannequin'});p('mannequin',29,14,0,{body:3,surface:0,label:'watching mannequin'});
  }else if(index===2){
    for(const y of [6,13,35,42])for(const x of [8,16,32,40])library(x,y);
    for(const x of [12,26,38])readingDesk(x,25);
    for(let i=0;i<36;i++)p(i%3?'page':'book',7+random()*34,7+random()*34,0,{yaw:random()*6.28,variant:i%7});
    fan(24,10);p('desk',24,37,0,{variant:0,fixed:true,label:'terminal desk'});p('screen',24,37,.825,{label:'archive terminal',actionLabel:'Toggle'});
    for(const x of [19,29,42])p('mannequin',x,15,0,{body:x%14,surface:5,label:'library mannequin'});
  }else if(index===3){
    for(const x of [9,24,39]){p('sofa',x,10,0,{variant:0,fixed:true,label:'upholstered sofa'});p('sofa',x,38,0,{variant:3,fixed:true,label:'waiting bench'});p('cushion',x-.4,9.8,.55);p('cushion',x+.4,9.8,.55);}
    for(const x of [9,24,39])for(const y of [5,43]){p('console',x,y,0,{fixed:true,label:'monitor workbench'});for(const dx of [-.65,.65])p('screen',x+dx,y,.825,{label:'flickering CRT monitor',actionLabel:'Toggle',variant:Math.floor(x+dx)%7});}
    for(const x of [14,28,42]){fan(x,12);clutter(x,34,0,12);p('standingLamp',x,40,0,{variant:6,label:'floor lamp'});}
    readingDesk(8,34);for(const x of [18,32])p('mannequin',x,14,0,{surface:3,label:'parlour mannequin'});
  }else{
    bed(12,9);bed(34,9);for(const x of [8,23,39]){library(x,42);p('suitcase',x,35);p('cabinet',x,38,0,{variant:4,fixed:true,label:'toy cupboard'});}
    for(let i=0;i<30;i++)p(i%3?'toy':'ball',7+random()*34,32+random()*12,0,{variant:i%7,yaw:random()*6.28});
    for(const x of [14,25,36])p('ball',x,24,0,{variant:x%7,label:'rubber ball'});
    fan(26,10);readingDesk(39,14);clutter(25,38,0,18);
    for(let i=0;i<5;i++)p('mannequin',9+i*7,15,0,{body:i+7,surface:i%3,label:'nursery mannequin'});
  }
  // Every room has small loose objects near its principal circulation route.
  for(const x of [7,20,33,43]){p('can',x,21);p('book',x+.4,27);p('page',x+1,26.5,0,{yaw:random()*6.28});p('trinket',x+.7,21.3);}
  rebuildMemoryBatches(room);
}
const originalDetailedSectionSpec=sectionSpec,originalDetailedFurnish=furnishRoom,originalDetailedRelief=addRoomRelief;
sectionSpec=function(cx,cy){const index=detailedRoomIndex(cx,cy);return index<0?originalDetailedSectionSpec(cx,cy):{kind:'empty',sides:index===0?[0]:[2,0],height:4.6,floorColor:DETAILED_ROOMS[index].floor,variation:.5,archetype:null,pocket:null};};
furnishRoom=function(room,m){const index=detailedRoomIndex(room.cx,room.cy);if(index<0)originalDetailedFurnish(room,m);else buildDetailedRoom(room,m,index);};
addRoomRelief=function(room,m){if(detailedRoomIndex(room.cx,room.cy)<0)originalDetailedRelief(room,m);};
// Exterior door pairs agree even where the authored sequence rejoins the maze.
const originalDetailedSectionSides=sectionSides;
sectionSides=function(cx,cy){const sides=originalDetailedSectionSides(cx,cy);if(!memorySettings.archetype&&cy===0&&cx===5&&!sides.includes(2))sides.push(2);return sides;};
const originalDetailedFalseDoors=addFalseDoors,originalDetailedCeilingDoors=addCeilingDoors;
addFalseDoors=function(room,m,r){if(detailedRoomIndex(room.cx,room.cy)<0)originalDetailedFalseDoors(room,m,r);};
addCeilingDoors=function(room,r){if(detailedRoomIndex(room.cx,room.cy)<0)originalDetailedCeilingDoors(room,r);};
function interactDetailedProp(e){
  if(e.type==='switch'){
    e.powered=!e.powered;for(const f of e.room.fixtures)if(e.lightIds.includes(f.id))setFixtureOff(e.room,f,!e.powered);
    return true;
  }
  if(e.type==='shutter'){e.opened=!e.opened;e.actionLabel='Open / close';return true;}
  if(e.type==='screen'||e.type==='standingLamp'||e.type==='deskLamp'){e.emission=e.emission>.1?0:1;e.room.instancesDirty=true;propNotice(e.label+(e.emission?' switches on.':' switches off.'));return true;}
  if(e.type==='fan'){e.powered=!e.powered;propNotice(e.powered?'The fan begins to turn.':'The fan slows to a stop.');return true;}
  if(e.type==='fanBlades'){const parent=propById(e.parentFan);if(parent)return interactDetailedProp(parent);}
  if(e.description){propNotice(e.description);return true;}
  return false;
}
let detailedEntered='';
const originalDetailedUpdate=update;
update=function(dt){
  originalDetailedUpdate(dt);if(!active)return;
  const room=chunks.get(currentChunkKey());if(room?.detailed!==undefined&&detailedEntered!==room.id){detailedEntered=room.id;propNotice(DETAILED_ROOMS[room.detailed].name+' — '+DETAILED_ROOMS[room.detailed].subtitle);}
  for(const r of chunks.values())for(const e of r.entities||[]){
    if(e.type==='shutter'){
      const goal=e.closedYaw+(e.opened?e.swingSign*1.4:0),old=e.rotation[0],angle=old+angleDifference(goal,old)*(1-Math.exp(-dt*5));
      if(Math.abs(angle-old)>.0001){e.rotation[0]=angle;syncPropBounds(e);if(circleOverlap(player.x,player.y,propAsBox(e),player.radius+.03)){e.rotation[0]=old;syncPropBounds(e);}}
    }else if(e.type==='fan'&&e.bladeId){
      const blade=propById(e.bladeId);if(!blade)continue;e.fanSpeed=(e.fanSpeed||0)+((e.powered?16:0)-(e.fanSpeed||0))*(1-Math.exp(-dt*2));e.fanAngle=(e.fanAngle||0)+e.fanSpeed*dt;
      const t=entityTransform(e),center=t.point([0,0,.98]);blade.position=center;blade.rotation=[...e.rotation];blade.rotation[1]+=e.fanAngle;syncPropBounds(blade);
    }
  }
};
