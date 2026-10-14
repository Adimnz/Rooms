/* Stream the background track once; room streaming never owns audio playback. */
'use strict';
const AMBIENCE_VOLUME=4.5,LIGHT_VOLUME=.10,LIGHT_SOUND_SRC="./Sound Effects/'A Fluorescent Bulb II' sound effects library.mp3";
const gameAudio={ambience:null,voices:[],started:false,fixtureStates:new Map(),lastEffect:-Infinity,errors:new Set()};
function reportGameAudioError(name){
  if(gameAudio.errors.has(name))return;gameAudio.errors.add(name);
  console.warn('LightUp could not load sound:',name);
  propNotice('Sound unavailable: '+name+'. Keep the Sound Effects folder beside the game.');
}
function startRecordedAudio(){
  if(!gameAudio.ambience){
    const track=new Audio('./Sound Effects/BACKGROUND.mp3');
    track.loop=true;track.preload='metadata';track.volume=Math.min(1,AMBIENCE_VOLUME);track.muted=!humEnabled;
    track.addEventListener('error',()=>reportGameAudioError('Backrooms ambience'));
    gameAudio.ambience=track;
    // Media elements cap at 1.0; a Web Audio gain node provides the boost (unavailable on file:).
    if(AMBIENCE_VOLUME>1&&hum?.context&&location.protocol!=='file:')try{const source=hum.context.createMediaElementSource(track),boost=hum.context.createGain();boost.gain.value=AMBIENCE_VOLUME;source.connect(boost);boost.connect(hum.context.destination);}catch(error){console.warn('LightUp ambience boost unavailable',error);}
  }
  // HTML media streaming avoids buffering a large file into RAM.
  // No room, portal, pause overlay or mute action resets currentTime.
  if(gameAudio.ambience.paused)gameAudio.ambience.play().then(()=>{gameAudio.started=true;}).catch(error=>{if(error.name!=='NotAllowedError')reportGameAudioError('Backrooms ambience');});
  if(!gameAudio.voices.length)for(let i=0;i<4;i++){
    const element=new Audio(LIGHT_SOUND_SRC);element.preload='auto';element.volume=LIGHT_VOLUME;
    element.addEventListener('error',()=>reportGameAudioError('A Fluorescent Bulb II'));
    let pan=null,gain=null;
    if(hum?.context&&location.protocol!=='file:')try{const source=hum.context.createMediaElementSource(element);gain=hum.context.createGain();pan=hum.context.createStereoPanner();source.connect(gain);gain.connect(pan);pan.connect(hum.context.destination);element.volume=1;}catch(error){console.warn('LightUp light sound panning unavailable',error);}
    gameAudio.voices.push({element,pan,gain,lastPlayed:-Infinity});
  }
}
function playRecordedLight(fixture,distance,force=false){
  if(!gameAudio.started||!humEnabled||!active||!gameAudio.voices.length)return;
  if(physicsClock-gameAudio.lastEffect<(force?.18:.65))return;
  const voice=gameAudio.voices.find(v=>v.element.paused||v.element.ended)||gameAudio.voices.reduce((a,b)=>a.lastPlayed<b.lastPlayed?a:b);
  const amount=LIGHT_VOLUME*clamp(1-distance/15,.12,1),delta=normalize(fixture.position.map((n,i)=>n-cameraEye()[i]));
  if(voice.gain){voice.gain.gain.value=amount;voice.pan.pan.value=clamp(dot([-Math.sin(player.yaw),Math.cos(player.yaw),0],delta),-1,1);}else voice.element.volume=amount;
  // Play a random 2-3 s slice of the long fluorescent-bulb recording.
  const length=2+Math.random(),total=Number.isFinite(voice.element.duration)?voice.element.duration:25;
  clearTimeout(voice.stopTimer);
  try{voice.element.currentTime=Math.random()*Math.max(0,total-length);}catch(error){}
  voice.element.muted=false;voice.element.play().catch(()=>{});
  voice.stopTimer=setTimeout(()=>voice.element.pause(),length*1000);
  voice.lastPlayed=physicsClock;gameAudio.lastEffect=physicsClock;
}
function updateRecordedAudio(){
  if(gameAudio.ambience){gameAudio.ambience.muted=!humEnabled;gameAudio.ambience.volume=Math.min(1,AMBIENCE_VOLUME);}
  for(const voice of gameAudio.voices)voice.element.muted=!humEnabled||!active;
  if(!gameAudio.started||!active)return;
  const live=new Set(),candidates=[];
  for(const room of chunks.values())for(const fixture of room.fixtures){
    if(!fixture.position)continue;live.add(fixture.id);
    const distance=Math.hypot(...fixture.position.map((n,i)=>n-cameraEye()[i])),lit=fixtureIntensity(fixture,elapsed)>.2;
    const old=gameAudio.fixtureStates.get(fixture.id),inside=distance<(old?.inside?6:4.5),approach=inside&&!old?.inside&&lit,turnOn=old&&!old.lit&&lit&&distance<12;
    const state={inside,lit,last:old?.last??-Infinity};gameAudio.fixtureStates.set(fixture.id,state);
    if((approach||turnOn)&&physicsClock-state.last>1.8){
      const origin=cameraEye(),direction=normalize(fixture.position.map((n,i)=>n-origin[i])),hit=rayWorld(origin,direction,Math.max(.01,distance-.18),worldColliders().filter(b=>(!fixture.entityId||b.entityId!==fixture.entityId)&&b.fixtureId!==fixture.id));
      if(!hit)candidates.push({fixture,distance,state,turnOn});
    }
  }
  candidates.sort((a,b)=>Number(b.turnOn)-Number(a.turnOn)||a.distance-b.distance);
  if(candidates.length){const c=candidates[0];playRecordedLight(c.fixture,c.distance,!!c.turnOn);for(const candidate of candidates)candidate.state.last=physicsClock;}
  for(const id of gameAudio.fixtureStates.keys())if(!live.has(id))gameAudio.fixtureStates.delete(id);
}
const originalRecordedStartHum=startHum,originalRecordedUpdateHum=updateHum;
startHum=function(){originalRecordedStartHum();startRecordedAudio();};
updateHum=function(){originalRecordedUpdateHum();updateRecordedAudio();};
