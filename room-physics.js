/* Contact physics for the native Z-up WebGL renderer. No external dependencies. */
'use strict';
const PROP_PHYSICS={
  mannequin:[18,.28,.18],rockingChair:[9,.48,.14],lawnChair:[4,.4,.18],standingLamp:[7,.42,.12],deskLamp:[2,.5,.15],
  sofa:[105,.8,.04],bedframe:[95,.8,.04],bookshelf:[180,.8,.02],cabinet:[145,.8,.02],drawers:[85,.8,.04],desk:[80,.8,.04],
  ball:[.4,.13,.7],can:[.08,.24,.35],book:[.65,.65,.08],page:[.012,.85,.01],toy:[.45,.45,.28],suitcase:[12,.55,.12],
  fan:[5,.44,.16],screen:[28,.6,.1],cushion:[.8,.7,.04],trinket:[.25,.35,.25],mattress:[25,.8,.02],rug:[30,.95,0]
};
const propPhysicsState=new Map(),propFixtureStates=new Map();
let heldProp=null,physicsClock=0,propNoticeUntil=0,resettingPropPhysics=false;
function configurePropPhysics(e,options={}){
  const spec=PROP_PHYSICS[e.type]||[100,.7,.05];
  e.mass=options.mass??spec[0]*Math.max(.05,e.scale[0]*e.scale[1]*e.scale[2]);e.friction=spec[1];e.restitution=spec[2];
  const embedded=e.decorative||options.fixed||['water','door','exitSign','stopSign'].includes(e.type)||Math.abs(e.rotation[1])+Math.abs(e.rotation[2])>.25||e.position[2]>2.5;
  e.pushable=options.movable??(!embedded&&e.mass<65);
  e.collidable=e.type!=='water'&&e.type!=='exitSign';
  e.vx=0;e.vy=0;e.vz=0;e.spin=0;e.sleeping=true;e.restTime=0;
  e.fixedReason=options.fixedReason||(embedded?'Attached to the architecture.':'Too heavy to move by hand.');
  e.label=options.label||e.model.name||e.type.replace(/([A-Z])/g,' $1').toLowerCase();
  e.topples=['mannequin','standingLamp','deskLamp','fan','screen','lawnChair','rockingChair','suitcase','can','toy','book'].includes(e.type);
  e.round=e.type==='ball';
  const saved=propPhysicsState.get(e.id);
  if(saved&&saved.salt===memorySettings.salt){Object.assign(e,structuredClone(saved.state));if(e.curlProgress!==undefined)restoreCurlModel(e);e.bounds=memoryBounds(e);}
}
// Ordinary procedural furniture uses the same live entities as authored rooms.
// Embedded, inverted and wayfinding props retain their architectural anchors.
appendProp=function(room,mesh,type,variant,position,rotation=[0,0,0],mode='scatter',zone=0){
  room.entities??=[];room.instanceBatches??=[];room.entityColliders??=[];
  const model=buildPropModel(type,variant),e={id:`${room.id}/entity${room.entities.length}`,room,type,variant,model,design:model.name,
    position:[...position],rotation:[...rotation],scale:[1,1,1],head:[0,0,0],body:0,surface:4,pose:'upright',missing:'',point:null,
    mode,zone,visible:true,emission:1,behavior:'',decorative:false};
  e.bounds=memoryBounds(e);e.anchor=[...e.position];configurePropPhysics(e,{fixed:['embedded','inverted','wayfinding'].includes(mode)});
  room.entities.push(e);room.props.push(e);return e;
};
const originalPhysicalFurnish=furnishRoom;
furnishRoom=function(room,mesh){room.entities=[];room.instanceBatches=[];room.entityColliders=[];restoreMemoryState(room);originalPhysicalFurnish(room,mesh);if(room.entities.length)rebuildMemoryBatches(room);};
function rememberProp(e){
  propPhysicsState.set(e.id,{salt:memorySettings.salt,state:{position:[...e.position],rotation:[...e.rotation],head:[...e.head],pose:e.pose,
    emission:e.emission,behavior:e.behavior,fallen:!!e.fallen,curlProgress:e.curlProgress,ball:!!e.ball,tipAngle:e.tipAngle||0,tipAxis:e.tipAxis,tipSign:e.tipSign,
    opened:!!e.opened,powered:e.powered,fanAngle:e.fanAngle||0}});
}
const originalDisposeRoom=disposeRoom;
disposeRoom=function(room){for(const e of room.entities||[]){if(e===heldProp)heldProp=null;if(!resettingPropPhysics)rememberProp(e);}originalDisposeRoom(room);};
const originalRegenerateMemoryRoom=regenerateMemoryRoom;
regenerateMemoryRoom=function(){heldProp=null;propPhysicsState.clear();propFixtureStates.clear();resettingPropPhysics=true;try{originalRegenerateMemoryRoom();}finally{resettingPropPhysics=false;}};
function syncPropBounds(e){
  e.bounds=memoryBounds(e);
  const box=e.room.entityColliders?.find(b=>b.entityId===e.id),b=e.bounds;
  if(box)Object.assign(box,{x:b.min[0],y:b.min[1],w:b.max[0]-b.min[0],d:b.max[1]-b.min[1],z0:b.min[2],z1:b.max[2],dynamic:!!e.pushable});
  e.room.transformsDirty=true;
}
const originalPhysicsMemoryBounds=memoryBounds;
memoryBounds=function(e){
  if(!e.round)return originalPhysicsMemoryBounds(e);
  const b=e.model.bounds,local=b.min.map((n,i)=>(n+b.max[i])*.5),center=entityTransform(e).point(local),radius=Math.max(...b.max.map((n,i)=>(n-b.min[i])*.5*e.scale[i]));
  return {min:center.map(n=>n-radius),max:center.map(n=>n+radius)};
};
function propById(id){for(const room of chunks.values()){const e=room.entities?.find(e=>e.id===id);if(e)return e;}return null;}
function entityColliderShapes(e){
  const common={entityId:e.id,dynamic:!!e.pushable,walkable:!!e.walkable,color:e.type==='mannequin'?MANNEQUIN_SURFACES[e.surface].color:palette.trim};
  if(!e.pushable&&e.model.colliders?.length){
    const t=entityTransform(e);
    return e.model.colliders.map((box,partIndex)=>{
      if(Math.abs(e.rotation[1])+Math.abs(e.rotation[2])<.00001){const p=t.point([box.x,box.y,box.z0]);return {...box,...common,x:p[0],y:p[1],w:box.w*e.scale[0],d:box.d*e.scale[1],z0:p[2],z1:p[2]+(box.z1-box.z0)*e.scale[2],angle:(box.angle||0)+e.rotation[0],partIndex};}
      const b=transformedBounds({min:[box.x,box.y,box.z0],max:[box.x+box.w,box.y+box.d,box.z1]},t);return {...common,x:b.min[0],y:b.min[1],w:b.max[0]-b.min[0],d:b.max[1]-b.min[1],z0:b.min[2],z1:b.max[2],angle:0,partIndex};
    });
  }
  return [{...propAsBox(e),...common,partIndex:0}];
}
function physicsContact(bounds,box){
  const half=bounds.max.map((n,i)=>(n-bounds.min[i])*.5),center=bounds.min.map((n,i)=>(n+bounds.max[i])*.5),c=Math.cos(box.angle||0),s=Math.sin(box.angle||0);
  const bc=[box.x+c*box.w*.5-s*box.d*.5,box.y+s*box.w*.5+c*box.d*.5,(box.z0+box.z1)*.5],delta=center.map((n,i)=>n-bc[i]);
  let depth=Infinity,normal=null;
  for(const axis of [[1,0,0],[0,1,0],[c,s,0],[-s,c,0],[0,0,1]]){
    const ra=half.reduce((n,h,i)=>n+h*Math.abs(axis[i]),0),rb=box.w*.5*Math.abs(axis[0]*c+axis[1]*s)+box.d*.5*Math.abs(-axis[0]*s+axis[1]*c)+(box.z1-box.z0)*.5*Math.abs(axis[2]);
    const projection=dot(delta,axis),overlap=ra+rb-Math.abs(projection);if(overlap<=.000001)return null;
    if(overlap<depth){depth=overlap;normal=axis.map(n=>n*(projection<0?-1:1));}
  }
  return {depth,normal};
}
function propAsBox(e){const b=e.bounds;return {x:b.min[0],y:b.min[1],w:b.max[0]-b.min[0],d:b.max[1]-b.min[1],z0:b.min[2],z1:b.max[2],angle:0};}
function tipProp(e,dx,dy,strength){
  if(!e.topples||e.fallen||e.ball||e.tipAngle||strength<(e.type==='mannequin'?1.6:.95))return;
  e.tipAxis=Math.abs(dx)>Math.abs(dy)?1:2;e.tipSign=e.tipAxis===1?Math.sign(dx||1):-Math.sign(dy||1);e.tipAngle=.035;e.tipSpeed=Math.min(1.8,strength*.5);e.sleeping=false;e.behavior='';
}
function impulseProp(e,dx,dy,strength=1){
  if(!e.pushable)return;
  const length=Math.hypot(dx,dy)||1,amount=Math.min(5,strength*30/(e.mass+12));
  e.vx=clamp(e.vx+dx/length*amount,-8,8);e.vy=clamp(e.vy+dy/length*amount,-8,8);e.spin+=(dx-dy)/length*amount*.25;e.sleeping=false;e.restTime=0;e.behavior='';
  tipProp(e,dx,dy,strength);
}
// The player transfers momentum only at a real capsule/object contact.
const originalMovePlayer=movePlayer;
movePlayer=function(dx,dy){
  const steps=Math.max(1,Math.ceil(Math.hypot(dx,dy)/.07));
  for(let i=0;i<steps;i++){
    const nx=player.x+dx/steps,ny=player.y+dy/steps;
    for(const room of chunks.values())for(const e of room.entities||[]){
      if(!e.visible||!e.pushable||e===heldProp||e.bounds.max[2]<player.feetZ-.002||e.bounds.min[2]>player.feetZ+PLAYER_HEIGHT)continue;
      const contact=circleOverlap(nx,ny,propAsBox(e),player.radius+.015);if(!contact)continue;
      const l=Math.hypot(...contact)||1,toward=-(dx*contact[0]+dy*contact[1])/l;if(toward<=0)continue;
      const speed=Math.hypot(player.vx,player.vy),factor=Math.min(1,9/(e.mass+3));
      impulseProp(e,-contact[0],-contact[1],speed*.32);
      // Immediate small displacement gives way to the capsule, then the solver
      // resolves walls and neighboring props before the player moves.
      const old=[...e.position];e.position[0]-=contact[0]*factor;e.position[1]-=contact[1]*factor;syncPropBounds(e);
      const structural=worldColliders().filter(b=>!b.dynamic&&b.entityId!==e.id&&!b.guard&&!b.ground&&b.z1>e.bounds.min[2]+.02&&b.z0<e.bounds.max[2]-.02);
      if(structural.some(b=>physicsContact(e.bounds,b))){e.position=old;syncPropBounds(e);}
    }
    originalMovePlayer(dx/steps,dy/steps);
  }
};

const originalMannequinRig=mannequinRig;
mannequinRig=function(body,pose){
  if(!pose.startsWith('curl:'))return originalMannequinRig(body,pose);
  const r=originalMannequinRig(body,'upright'),t=clamp(Number(pose.slice(5))/.65,0,1),a=t*t*(3-2*t);
  r.leg=[2.3*a,2.3*a];r.knee=[-2.5*a,-2.5*a];r.arm=[a,a];r.elbow=[.08+1.62*a,.08+1.62*a];r.spread=[.12*(1-a),-.12*(1-a)];r.lean=.3*a;r.head=[0,0,-.45*a];return r;
};
const curlModels=new Map();
function curlModel(body,surface,progress){
  const frame=Math.round(clamp(progress,0,1)*60),key=`curl/${body}/${surface}/${frame}`;if(curlModels.has(key))return curlModels.get(key);
  const t=frame/60,base=buildMannequinModel(body,`curl:${t}`,surface,'',[0,0,0]),m=new Mesh(),C=MANNEQUIN_SURFACES[surface],blend=clamp((t-.55)/.45,0,1),a=blend*blend*(3-2*blend),center=[0,0,.88*(mannequinRig(body,'upright').s)];
  if(frame===60)ellipsoid(m,[0,0,.32],[.32,.32,.32],C.color,[-2,C.roughness,C.condition],10,16);
  else{
    m.vertices=Array.from(base.data);
    for(let i=0;i<m.vertices.length;i+=12){const d=normalize(m.vertices.slice(i,i+3).map((n,j)=>n-center[j]));for(let j=0;j<3;j++){m.vertices[i+j]=m.vertices[i+j]*(1-a)+(center[j]+d[j]*.32)*a;m.vertices[i+3+j]=m.vertices[i+3+j]*(1-a)+d[j]*a;}const n=normalize(m.vertices.slice(i+3,i+6));for(let j=0;j<3;j++)m.vertices[i+3+j]=n[j];}
  }
  const model=finishLocalModel(m,key);curlModels.set(key,model);if(curlModels.size>240)curlModels.delete(curlModels.keys().next().value);return model;
}
function restoreCurlModel(e){if(e.ball){e.curlProgress=1;e.round=true;}e.model=curlModel(e.body,e.surface,e.curlProgress||0);}
function advanceTopple(e,dt){
  if(!e.tipAngle||e.fallen)return;
  e.tipSpeed=(e.tipSpeed||.2)+Math.sin(e.tipAngle)*6*dt;e.tipAngle=Math.min(Math.PI/2,e.tipAngle+e.tipSpeed*dt);e.rotation[e.tipAxis]=e.tipSign*e.tipAngle;
  if(e.tipAngle===Math.PI/2){e.fallen=true;e.tipAngle=0;if(e.type==='mannequin'){e.curlProgress=0;e.head=[0,0,0];e.model=curlModel(e.body,e.surface,0);e.room.instancesDirty=true;}}
}
function advanceCurl(e,dt){
  if(e.type!=='mannequin'||!e.fallen||e.ball)return;
  const old=e.bounds.min.map((n,i)=>(n+e.bounds.max[i])*.5),next=Math.min(1,(e.curlProgress||0)+dt/12),frame=Math.round(next*60);e.curlProgress=next;
  if(frame===e.curlFrame)return;e.curlFrame=frame;e.model=curlModel(e.body,e.surface,next);
  if(frame===60){e.ball=true;e.curlProgress=1;e.round=true;e.rotation=[e.rotation[0],0,0];e.position=[old[0],old[1],old[2]-.32];e.topples=false;e.label='curled mannequin';}
  else{const b=memoryBounds(e),center=b.min.map((n,i)=>(n+b.max[i])*.5);for(let i=0;i<3;i++)e.position[i]+=old[i]-center[i];}
  e.room.instancesDirty=true;e.sleeping=false;
}
function updateRoomPhysics(dt){
  physicsClock+=dt;
  const entities=[...chunks.values()].flatMap(room=>room.entities||[]).filter(e=>e.visible),moving=entities.filter(e=>e.pushable&&e!==heldProp&&Math.hypot(e.position[0]-player.x,e.position[1]-player.y)<36);
  const staticBoxes=worldColliders().filter(b=>!b.dynamic&&!b.guard);
  const steps=Math.max(1,Math.ceil(dt/(1/90))),h=dt/steps;
  for(let step=0;step<steps;step++){
    for(const e of moving){
      if(e.sleeping&&!e.tipAngle&&!(e.fallen&&!e.ball&&e.type==='mannequin'))continue;
      const oldMin=e.bounds.min[2];advanceTopple(e,h);advanceCurl(e,h);syncPropBounds(e);
      if(e.tipAngle&&e.bounds.min[2]<oldMin){e.position[2]+=oldMin-e.bounds.min[2];syncPropBounds(e);}
      e.vz=Math.max(-12,e.vz-9.81*h);e.position[0]+=e.vx*h;e.position[1]+=e.vy*h;e.position[2]+=e.vz*h;
      if(e.round){const center=e.bounds.min.map((n,i)=>(n+e.bounds.max[i])*.5),radius=(e.bounds.max[2]-e.bounds.min[2])*.5;e.rotation[1]+=e.vx*h/radius;e.rotation[2]-=e.vy*h/radius;const rotated=memoryBounds(e),shift=rotated.min.map((n,i)=>(n+rotated.max[i])*.5);for(let i=0;i<3;i++)e.position[i]+=center[i]+[e.vx*h,e.vy*h,e.vz*h][i]-shift[i];}else e.rotation[0]+=e.spin*h;
      syncPropBounds(e);let supported=false;
      for(let pass=0;pass<3;pass++)for(const box of staticBoxes){
        if(box.entityId===e.id||box.z0>e.bounds.max[2]||box.z1<e.bounds.min[2]||box.ground&&groundHoleContains(box,e.position[0],e.position[1]))continue;
        if(box.surface){const height=surfaceHeight(box,e.position[0],e.position[1]);if(height!==null&&e.bounds.min[2]<height&&oldMin>=height-.12){e.position[2]+=height-e.bounds.min[2]+.00001;e.vz=0;supported=true;syncPropBounds(e);}continue;}
        const hit=physicsContact(e.bounds,box);if(!hit)continue;
        for(let i=0;i<3;i++)e.position[i]+=hit.normal[i]*(hit.depth+.00001);
        const velocity=[e.vx,e.vy,e.vz],vn=dot(velocity,hit.normal);if(vn<0){for(let i=0;i<3;i++)velocity[i]-=(1+e.restitution)*vn*hit.normal[i];[e.vx,e.vy,e.vz]=velocity;}
        if(hit.normal[2]>.5){supported=true;if(Math.abs(e.vz)<.22)e.vz=0;}
        else if(Math.abs(hit.normal[2])<.1){e.spin*=.8;tipProp(e,-hit.normal[0],-hit.normal[1],Math.abs(vn));}
        syncPropBounds(e);
      }
      const damping=Math.exp(-h*(supported?e.round?.35:e.friction*8:.08));e.vx*=damping;e.vy*=damping;e.spin*=Math.exp(-h*(supported?4:.1));
      const morphing=e.type==='mannequin'&&e.fallen&&!e.ball,toppling=e.tipAngle&&!e.fallen;
      if(supported&&Math.hypot(e.vx,e.vy,e.vz,e.spin)<.055&&!morphing&&!toppling){e.restTime+=h;if(e.restTime>.5){e.sleeping=true;e.vx=e.vy=e.vz=e.spin=0;}}else e.restTime=0;
      if(e.position[2]<-100){e.position=[...e.anchor];e.vx=e.vy=e.vz=0;e.sleeping=true;syncPropBounds(e);}
    }
    // Spatial buckets avoid quadratic work in the book-filled library.
    const buckets=new Map(),pairs=new Set();
    moving.forEach((e,i)=>{const b=e.bounds;for(let x=Math.floor(b.min[0]/2);x<=Math.floor(b.max[0]/2);x++)for(let y=Math.floor(b.min[1]/2);y<=Math.floor(b.max[1]/2);y++){const key=x+','+y;if(!buckets.has(key))buckets.set(key,[]);buckets.get(key).push(i);}});
    for(const bucket of buckets.values())for(let i=0;i<bucket.length;i++)for(let j=i+1;j<bucket.length;j++){
      const ai=bucket[i],bi=bucket[j],a=moving[ai],b=moving[bi];if(a.sleeping&&b.sleeping)continue;
      const key=ai+':'+bi;if(pairs.has(key))continue;pairs.add(key);
      const hit=physicsContact(a.bounds,propAsBox(b));if(!hit)continue;
      const ia=1/a.mass,ib=1/b.mass,total=ia+ib;
      for(let k=0;k<3;k++){a.position[k]+=hit.normal[k]*hit.depth*ia/total;b.position[k]-=hit.normal[k]*hit.depth*ib/total;}
      const va=[a.vx,a.vy,a.vz],vb=[b.vx,b.vy,b.vz],vn=dot(va.map((n,k)=>n-vb[k]),hit.normal);
      if(vn<0){const impulse=-(1+Math.min(a.restitution,b.restitution))*vn/total;for(let k=0;k<3;k++){va[k]+=hit.normal[k]*impulse*ia;vb[k]-=hit.normal[k]*impulse*ib;}[a.vx,a.vy,a.vz]=va;[b.vx,b.vy,b.vz]=vb;tipProp(b,-hit.normal[0],-hit.normal[1],impulse*ib);}
      a.sleeping=b.sleeping=false;syncPropBounds(a);syncPropBounds(b);
    }
  }
  updateHeldProp(dt,staticBoxes);
}
updateDynamicObjects=updateRoomPhysics;

// A continuous neck transform follows the player without rebuilding geometry.
updateMannequinFacing=function(dt){
  if(memorySettings.mannequinBehavior<=0)return;
  for(const room of chunks.values())for(const e of room.entities||[]){
    if(e.type!=='mannequin'||!e.visible||e.fallen||e.tipAngle||!e.model.parts?.head)continue;
    const distance=Math.hypot(player.x-e.position[0],player.y-e.position[1]);if(distance>22)continue;
    if(physicsClock>=(e.nextFacingCheck||0)){const center=entityTransform(e).point(propTransform([0,0,0],e.model.rootRotation).point(e.model.headCenter)),delta=cameraEye().map((n,i)=>n-center[i]),length=Math.hypot(...delta),hit=rayWorld(center,normalize(delta),length,worldColliders().filter(b=>b.entityId!==e.id&&!b.guard));e.facingVisible=!hit||hit.distance>=length-.15;e.nextFacingCheck=physicsClock+.3;}
    if(!e.facingVisible)continue;
    const goal=aimMannequin(e,cameraEye()).map((n,i)=>clamp(angleDifference(n,e.model.headBase[i]),i===0?-1.65:i===2?-.7:-.2,i===0?1.65:i===2?.7:.2));
    let changed=false;for(let i=0;i<3;i++){const d=clamp(angleDifference(goal[i],e.head[i]),-dt*.9,dt*.9);if(Math.abs(d)>.0001){e.head[i]+=d;changed=true;}}
    if(changed)room.transformsDirty=true;
  }
};
function propSight(){return [Math.cos(player.yaw)*Math.cos(player.pitch),Math.sin(player.yaw)*Math.cos(player.pitch),Math.sin(player.pitch)];}
function chooseProp(){
  const hit=rayWorld(cameraEye(),propSight(),3.1);if(!hit)return null;
  const e=hit.box?.entityId?propById(hit.box.entityId):null;
  return e?{entity:e,hit}:hit.box?.label?{box:hit.box,hit}:null;
}
function propNotice(text){
  let el=document.getElementById('propNotice');if(!el){el=document.createElement('div');el.id='propNotice';el.style.cssText='position:fixed;bottom:104px;left:50%;transform:translateX(-50%);padding:9px 14px;background:#101413de;color:#c4cbc0;text-align:center;max-width:600px;pointer-events:none;line-height:1.8';document.body.appendChild(el);}el.textContent=text;propNoticeUntil=physicsClock+4;
}
function setFixtureOff(room,fixture,off){
  fixture.off=off;propFixtureStates.set(fixture.id,off);const range=fixture.vertexRange;
  if(range&&room.mesh?.data){for(let i=range.start+11;i<range.end;i+=12)room.mesh.data[i]=off?-1:fixture.fault?1:0;gl.bindBuffer(gl.ARRAY_BUFFER,room.mesh.buffer);gl.bufferSubData(gl.ARRAY_BUFFER,range.start*4,room.mesh.data.subarray(range.start,range.end));}
  worldRevision++;
}
function releaseProp(throwing=false){
  if(!heldProp)return;const e=heldProp;heldProp=null;e.sleeping=false;e.vx=player.vx;e.vy=player.vy;e.vz=0;
  if(throwing){const d=propSight(),speed=Math.min(8,7/Math.sqrt(Math.max(.4,e.mass)));e.vx+=d[0]*speed;e.vy+=d[1]*speed;e.vz+=d[2]*speed+1;e.spin=3;tipProp(e,d[0],d[1],3);}
  syncPropBounds(e);
}
function updateHeldProp(dt,colliders){
  if(!heldProp)return;const e=heldProp,d=propSight(),eye=cameraEye(),radius=Math.max(...e.bounds.max.map((n,i)=>(n-e.bounds.min[i])*.5)),distance=Math.max(.7,1.05+radius),hit=rayWorld(eye,d,distance+radius,colliders.filter(b=>b.entityId!==e.id));
  if(hit&&hit.distance<radius+.4){releaseProp();return;}
  const target=eye.map((n,i)=>n+d[i]*Math.min(distance,hit?hit.distance-radius-.06:distance)),center=e.bounds.min.map((n,i)=>(n+e.bounds.max[i])*.5),old=[...e.position];
  for(let i=0;i<3;i++)e.position[i]+=(target[i]-center[i])*(1-Math.exp(-dt*20));syncPropBounds(e);
  if(colliders.some(b=>b.entityId!==e.id&&!b.guard&&physicsContact(e.bounds,b))){e.position=old;syncPropBounds(e);}
}
const originalPropToggleDoor=toggleDoor;
toggleDoor=function(){
  if(heldProp){releaseProp();return true;}
  const target=chooseProp();if(!target)return originalPropToggleDoor();
  if(target.box){if(target.box.fixtureId){for(const room of chunks.values()){const fixture=room.fixtures.find(f=>f.id===target.box.fixtureId);if(fixture){setFixtureOff(room,fixture,!fixture.off);return true;}}}propNotice(target.box.label+' — fixed architecture.');return true;}
  const e=target.entity;
  if(typeof interactDetailedProp==='function'&&interactDetailedProp(e))return true;
  if(e.pushable&&e.mass<=8&&e.type!=='mannequin'){heldProp=e;e.vx=e.vy=e.vz=0;e.sleeping=false;propNotice('E to put down · Q to throw');return true;}
  if(e.pushable){const d=propSight();impulseProp(e,d[0],d[1],3);return true;}
  propNotice(e.label+' — '+e.fixedReason);return true;
};
const originalPhysicsUpdate=update;
update=function(dt){
  originalPhysicsUpdate(dt);if(!active)return;
  if(heldProp)interaction.textContent=`E — Put down ${heldProp.label} · Q — Throw`;
  else{const target=chooseProp();if(target){const e=target.entity;interaction.textContent=`E — ${e?(e.actionLabel||(e.pushable?e.mass<=8&&e.type!=='mannequin'?'Pick up':'Push':'Inspect'))+' '+e.label:'Inspect '+target.box.label}`;}}
  if(physicsClock>propNoticeUntil){const el=document.getElementById('propNotice');if(el)el.textContent='';}
};
document.addEventListener('keydown',event=>{if(active&&!event.repeat&&event.code==='KeyQ')releaseProp(true);});
document.addEventListener('pointerlockchange',()=>{if(!active)releaseProp();});
