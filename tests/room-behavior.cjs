/* Run with a local HTTP server on port 8000 and Playwright available. */
const assert=require('node:assert/strict');
const path=require('node:path');
const {chromium}=require(process.env.LIGHTUP_PLAYWRIGHT||'playwright');
(async()=>{
  const browser=await chromium.launch({executablePath:process.env.LIGHTUP_CHROME||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--autoplay-policy=no-user-gesture-required']});
  try{
    const page=await browser.newPage({viewport:{width:1100,height:700}}),errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
    await page.goto('http://127.0.0.1:8000/LightUp_0.2.html?seed=7729',{waitUntil:'load'});
    await page.evaluate(()=>cancelAnimationFrame(animationId));
    assert.equal(await page.locator('#error').isVisible(),false,'renderer started');
    const rooms=await page.evaluate(()=>{
      const results=[];
      for(let i=0;i<5;i++){
        const r=generateChunk(i,0);results.push({name:r.kind,objects:r.entities.length,mannequins:r.entities.filter(e=>e.type==='mannequin').length,
          movable:r.entities.filter(e=>e.pushable).length,finite:r.entities.every(e=>[...e.bounds.min,...e.bounds.max].every(Number.isFinite)),
          colliders:r.entityColliders.length,duplicates:r.entityColliders.filter(b=>b.dynamic).length-new Set(r.entityColliders.filter(b=>b.dynamic).map(b=>b.entityId)).size,
          archetype:!!r.archetype,doors:r.doors.map(d=>d.id)});
      }
      return results;
    });
    for(const room of rooms){assert.ok(room.objects>90,room.name+' detail count');assert.ok(room.mannequins>=2);assert.ok(room.movable>30);assert.ok(room.finite);assert.equal(room.duplicates,0);assert.equal(room.archetype,false);}
    for(let i=0;i<4;i++)assert.ok(rooms[i].doors.some(d=>rooms[i+1].doors.includes(d)),'connected adjacent doors');
    console.log('Five rooms:',JSON.stringify(rooms));
    const physics=await page.evaluate(()=>{
      active=true;entry.classList.add('hidden');const r=chunks.get('0,0'),e=r.entities.find(e=>e.type==='suitcase'),heavy=r.entities.find(e=>e.type==='cabinet');
      player.x=e.position[0];player.y=e.position[1]-5;player.z=EYE_HEIGHT;player.feetZ=0;
      const original=[...e.position];e.sleeping=true;player.vx=2;player.vy=0;updateRoomPhysics(.05);
      const noRemoteForce=e.position.every((n,i)=>Math.abs(n-original[i])<.0001);
      impulseProp(e,1,0,2);for(let i=0;i<30;i++)updateRoomPhysics(1/90);const moved=Math.abs(e.position[0]-original[0])>.03;
      const box=worldColliders().find(b=>b.entityId===e.id),liveCollider=Math.abs(box.x-e.bounds.min[0])<.00001;
      const wall={x:e.position[0]+.5,y:e.position[1]-2,w:.18,d:4,z0:0,z1:3,angle:.25};r.mesh.colliders.push(wall);e.vx=5;e.sleeping=false;
      for(let i=0;i<100;i++)updateRoomPhysics(1/90);
      const wallClear=!physicsContact(e.bounds,wall);
      return {noRemoteForce,moved,liveCollider,wallClear,heavyFixed:!heavy.pushable,velocityFinite:[e.vx,e.vy,e.vz].every(Number.isFinite)};
    });
    for(const [name,value]of Object.entries(physics))assert.equal(value,true,name);
    console.log('Contact physics:',JSON.stringify(physics));
    const interactionChecks=await page.evaluate(()=>{
      const r=chunks.get('0,0'),e=detailedEntity(r,'ball',22,24,0,{variant:0});rebuildMemoryBatches(r);
      player.x=22;player.y=22;player.z=EYE_HEIGHT;player.feetZ=0;player.yaw=Math.PI/2;player.pitch=Math.atan2(.19-EYE_HEIGHT,2);resetLocomotion();
      toggleDoor();const pickedUp=heldProp===e;updateHeldProp(1/60,worldColliders().filter(b=>!b.dynamic));releaseProp(true);const thrown=heldProp===null&&Math.hypot(e.vx,e.vy,e.vz)>1;
      e.position=[22,24,0];e.rotation=[0,0,0];e.vx=e.vy=e.vz=0;e.sleeping=true;syncPropBounds(e);
      player.x=22;player.y=23.5;player.z=EYE_HEIGHT;player.feetZ=0;player.vx=0;player.vy=2.8;
      const oldY=e.position[1];for(let i=0;i<8;i++){movePlayer(0,.05);updateRoomPhysics(1/90);}const bumped=e.position[1]>oldY+.01;
      const shutter=r.entities.find(e=>e.type==='shutter'),oldYaw=shutter.rotation[0];interactDetailedProp(shutter);for(let i=0;i<30;i++)update(1/60);const shutterOpens=Math.abs(shutter.rotation[0]-oldYaw)>.2;
      const switchProp=r.entities.find(e=>e.type==='switch');interactDetailedProp(switchProp);const lightsOff=switchProp.lightIds.every(id=>r.fixtures.find(f=>f.id===id).off);interactDetailedProp(switchProp);
      return {pickedUp,thrown,bumped,shutterOpens,lightsOff,lightsOn:switchProp.lightIds.every(id=>!r.fixtures.find(f=>f.id===id).off)};
    });
    for(const [name,value]of Object.entries(interactionChecks))assert.equal(value,true,name);
    console.log('Interactions:',JSON.stringify(interactionChecks));
    const shelfAccessible=await page.evaluate(()=>{
      const r=generateChunk(2,0),book=r.entities.find(e=>e.type==='book'&&e.position[2]>1),center=book.bounds.min.map((n,i)=>(n+book.bounds.max[i])*.5);
      player.x=center[0];player.y=center[1]-1.2;player.z=EYE_HEIGHT;player.feetZ=0;player.yaw=Math.PI/2;player.pitch=Math.atan2(center[2]-EYE_HEIGHT,1.2);resetLocomotion();
      toggleDoor();const accessible=heldProp===book;releaseProp();return accessible;
    });
    assert.equal(shelfAccessible,true,'individual shelf books can be picked up');
    const mannequins=await page.evaluate(()=>{
      const r=chunks.get('0,0'),e=r.entities.find(e=>e.type==='mannequin');
      player.x=e.position[0]+2;player.y=e.position[1]-2;player.z=EYE_HEIGHT;player.feetZ=0;
      const oldHead=[...e.head],oldBody=[...e.rotation];for(let i=0;i<60;i++){physicsClock+=1/60;updateMannequinFacing(1/60);}
      const follows=e.head.some((n,i)=>Math.abs(n-oldHead[i])>.05),bodyStill=e.rotation.every((n,i)=>n===oldBody[i]);
      impulseProp(e,1,0,3);for(let i=0;i<350;i++)updateRoomPhysics(1/90);
      const fetal=e.fallen&&e.curlProgress>.1&&e.curlProgress<1;
      for(let i=0;i<1150;i++)updateRoomPhysics(1/90);
      const ball=e.ball&&e.curlProgress===1&&e.model.key.endsWith('/60');
      rememberProp(e);const saved=[...e.position];disposeRoom(r);chunks.delete(r.id);const restored=generateChunk(0,0).entities.find(a=>a.id===e.id);
      return {follows,bodyStill,fetal,ball,restored:restored.ball&&restored.model.key.endsWith('/60')&&restored.position.every((n,i)=>Math.abs(n-saved[i])<.001),finite:[...restored.bounds.min,...restored.bounds.max].every(Number.isFinite)};
    });
    for(const [name,value]of Object.entries(mannequins))assert.equal(value,true,name);
    console.log('Mannequins:',JSON.stringify(mannequins));
    await page.evaluate(()=>{player.x=7.2;player.y=7.2;player.z=EYE_HEIGHT;player.feetZ=0;player.yaw=.75;player.pitch=-.06;resetLocomotion();updateStreaming();renderer.draw(elapsed);});
    await page.screenshot({path:path.join(__dirname,'../artifacts/arrival.png')});
    await page.evaluate(()=>{const r=generateChunk(4,0);player.x=4*48+24;player.y=24;player.z=EYE_HEIGHT;player.feetZ=0;player.yaw=1.57;player.pitch=-.06;resetLocomotion();renderer.draw(elapsed);});
    await page.screenshot({path:path.join(__dirname,'../artifacts/nursery.png')});
    const views=[[0,22,6,1.45,'reception'],[1,27,5,.8,'bedroom'],[2,20,21,.7,'library'],[3,19,7,.25,'parlour'],[4,25,32,1.5,'toys']];
    for(const [index,x,y,yaw,name]of views){
      await page.evaluate(({index,x,y,yaw})=>{generateChunk(index,0);player.x=index*48+x;player.y=y;player.z=EYE_HEIGHT;player.feetZ=0;player.yaw=yaw;player.pitch=-.08;resetLocomotion();const notice=document.getElementById('propNotice');if(notice)notice.style.display='none';renderer.draw(elapsed);},{index,x,y,yaw});
      await page.screenshot({path:path.join(__dirname,'../artifacts/'+name+'.png')});
    }
    const audio=await page.evaluate(async()=>{
      startHum();await gameAudio.ambience.play();gameAudio.started=true;await new Promise(resolve=>setTimeout(resolve,250));
      const track=gameAudio.ambience,before=track.currentTime;player.x=48+12;player.y=24;updateStreaming();updateHum();await new Promise(resolve=>setTimeout(resolve,250));
      const after=track.currentTime;humEnabled=false;updateHum();const muted=track.muted;humEnabled=true;updateHum();
      return {oneTrack:track===gameAudio.ambience,loop:track.loop,continued:after>before,muted,unmuted:!track.muted,source:track.currentSrc,voices:gameAudio.voices.length,mediaError:track.error?.code||0};
    });
    for(const name of ['oneTrack','loop','continued','muted','unmuted'])assert.equal(audio[name],true,name);
    assert.equal(audio.voices,4);assert.equal(audio.mediaError,0);
    console.log('Recorded audio:',JSON.stringify(audio));
    const lightAudio=await page.evaluate(()=>{
      let plays=0;for(const v of gameAudio.voices)v.element.play=()=>{plays++;return Promise.resolve();};
      const r=chunks.get(currentChunkKey()),f={id:'test-light',position:[player.x+1,player.y,player.z],phase:0,fault:false,off:false};r.fixtures.push(f);
      for(const rr of chunks.values())for(const fixture of rr.fixtures)if(fixture!==f)gameAudio.fixtureStates.set(fixture.id,{inside:true,lit:fixtureIntensity(fixture,elapsed)>.2,last:physicsClock});
      gameAudio.lastEffect=-Infinity;updateRecordedAudio();const approach=plays===1;updateRecordedAudio();const noRepeat=plays===1;
      f.position[0]=player.x+8;updateRecordedAudio();physicsClock+=3;f.position[0]=player.x+1;updateRecordedAudio();const reapproach=plays===2;
      f.off=true;updateRecordedAudio();physicsClock+=3;f.off=false;updateRecordedAudio();const turnsOn=plays===3;
      humEnabled=false;physicsClock+=3;f.off=true;updateRecordedAudio();f.off=false;updateRecordedAudio();const silentMuted=plays===3;humEnabled=true;
      r.fixtures.pop();return {approach,noRepeat,reapproach,turnsOn,silentMuted};
    });
    for(const [name,value]of Object.entries(lightAudio))assert.equal(value,true,name);
    console.log('Light sound triggers:',JSON.stringify(lightAudio));
    const compatibility=await page.evaluate(()=>{
      let normal=null;for(let x=6;x<16&&!normal;x++){const r=generateChunk(x,2);if(!r.archetype&&r.entities?.length)normal=r;}
      const mazeInteractive=!!normal&&normal.props.every(e=>e.id&&e.model&&Number.isFinite(e.mass))&&normal.instanceBatches.length>0;
      const annex=generateChunk(80,-80),museumPreserved=annex.annex&&annex.annexItems.length>0;
      memorySettings.archetype='mannequin-assembly';regenerateMemoryRoom();const r=chunks.get('0,0');
      const roomTools=r.archetype.id==='mannequin-assembly'&&r.entities.every(e=>[...e.bounds.min,...e.bounds.max,e.vx,e.vy,e.vz].every(Number.isFinite));
      const freshState=propPhysicsState.size===0&&propFixtureStates.size===0;
      return {mazeInteractive,museumPreserved,roomTools,freshState};
    });
    for(const [name,value]of Object.entries(compatibility))assert.equal(value,true,name);
    console.log('Existing content:',JSON.stringify(compatibility));
    console.log('Browser errors:',JSON.stringify(errors));
    assert.deepEqual(errors,[],'no browser errors');
    const filePage=await browser.newPage({viewport:{width:900,height:600}});
    await filePage.goto(require('node:url').pathToFileURL(path.resolve(__dirname,'../LightUp_0.2.html')).href,{waitUntil:'load'});
    await filePage.evaluate(()=>cancelAnimationFrame(animationId));
    await filePage.locator('#startButton').click();
    await filePage.waitForFunction(()=>gameAudio.started);
    const directFile=await filePage.evaluate(async()=>{cancelAnimationFrame(animationId);await gameAudio.voices[0].element.play();return {loaded:!!chunks.get('0,0').detailed||chunks.get('0,0').detailed===0,ambience:!gameAudio.ambience.paused,light:!gameAudio.voices[0].element.paused,nativePlayback:gameAudio.voices.every(v=>!v.gain),error:gameAudio.ambience.error?.code||0};});
    for(const name of ['loaded','ambience','light','nativePlayback'])assert.equal(directFile[name],true,name);assert.equal(directFile.error,0);
    console.log('Direct file playback:',JSON.stringify(directFile));
    await filePage.close();
    console.log('All browser checks passed.');
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
