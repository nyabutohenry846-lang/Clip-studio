const $ = (id) => document.getElementById(id);
const video = $("video"), fileInput = $("fileInput"), audioInput = $("audioInput");
let videoUrl = null, audioUrl = null, duration = 0, trimStart = 0, trimEnd = 0, muted = false;
let undoStack = [], redoStack = [];
function toast(msg){const t=$("toast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2200)}
function fmt(n){if(!Number.isFinite(n))return "00:00";return `${String(Math.floor(n/60)).padStart(2,"0")}:${String(Math.floor(n%60)).padStart(2,"0")}`}
function snapshot(){undoStack.push({start:trimStart,end:trimEnd,text:$("overlayInput").value});if(undoStack.length>30)undoStack.shift();redoStack=[]}
function updateTrim(){trimStart=Number($("trimStart").value);trimEnd=Number($("trimEnd").value);if(trimEnd<=trimStart){trimEnd=Math.min(duration,trimStart+0.2);$("trimEnd").value=trimEnd}
$("trimReadout").textContent=`Start ${trimStart.toFixed(1)}s · End ${trimEnd.toFixed(1)}s`;if(video.currentTime<trimStart||video.currentTime>trimEnd)video.currentTime=trimStart}
function loadVideo(file){if(!file)return;if(videoUrl)URL.revokeObjectURL(videoUrl);videoUrl=URL.createObjectURL(file);video.src=videoUrl;video.onloadedmetadata=()=>{duration=video.duration;trimStart=0;trimEnd=duration;$("trimStart").max=duration;$("trimEnd").max=duration;$("trimStart").value=0;$("trimEnd").value=duration;updateTrim();video.style.display="block";$("emptyState").style.display="none";$("previewControls").style.display="flex";$("clipStatus").textContent=`${file.name} · ${duration.toFixed(1)}s`;$("videoTrack").innerHTML=`<div class="clip-block">${file.name}</div>`;$("timeLabel").textContent=`00:00 / ${fmt(duration)}`;toast("Video imported")}}
$("importBtn").onclick=()=>fileInput.click();fileInput.onchange=()=>loadVideo(fileInput.files[0]);
$("playBtn").onclick=()=>{if(!video.src)return;if(video.paused){if(video.currentTime<trimStart||video.currentTime>=trimEnd)video.currentTime=trimStart;video.play();$("playBtn").textContent="Ⅱ"}else{video.pause();$("playBtn").textContent="▶"}};
video.ontimeupdate=()=>{if(video.currentTime>=trimEnd&& !video.paused){video.pause();video.currentTime=trimEnd;$("playBtn").textContent="▶"}$("timeLabel").textContent=`${fmt(video.currentTime)} / ${fmt(duration)}`};
$("muteBtn").onclick=()=>{muted=!muted;video.muted=muted;$("muteBtn").textContent=muted?"×":"♫"};
$("trimStart").oninput=updateTrim;$("trimEnd").oninput=updateTrim;
$("resetTrimBtn").onclick=()=>{if(!duration)return;snapshot();$("trimStart").value=0;$("trimEnd").value=duration;updateTrim();toast("Trim reset")};
$("splitBtn").onclick=()=>{if(!video.src)return toast("Import a video first");snapshot();toast(`Split marker set at ${video.currentTime.toFixed(1)}s. Full clip splitting is coming in the next build.`)};
$("overlayInput").oninput=()=>{const t=$("textOverlay");t.textContent=$("overlayInput").value;t.style.display=t.textContent?"block":"none"};
$("textSize").oninput=e=>$("textOverlay").style.fontSize=e.target.value+"px";
$("textColor").oninput=e=>$("textOverlay").style.color=e.target.value;
document.querySelectorAll("[data-tool]").forEach(b=>b.onclick=()=>{const tool=b.dataset.tool;$("toolPanel").classList.add("show");$("toolPanel").querySelector(".panel-title").textContent=({text:"Text overlay",audio:"Add audio",filter:"Filters",speed:"Speed",crop:"Crop",adjust:"Adjust",sticker:"Stickers",effects:"Effects"})[tool];if(tool==="audio")audioInput.click();else if(tool!=="text")toast(`${tool[0].toUpperCase()+tool.slice(1)} controls are planned for the next build.`);$("toolPanel").scrollIntoView({behavior:"smooth",block:"nearest"})});
audioInput.onchange=()=>{const f=audioInput.files[0];if(!f)return;if(audioUrl)URL.revokeObjectURL(audioUrl);audioUrl=URL.createObjectURL(f);$("audioTrack").textContent="♫ "+f.name;const a=new Audio(audioUrl);a.loop=true;a.volume=.7;a.play().catch(()=>toast("Tap again to allow audio playback"));toast("Audio loaded for preview")};
$("undoBtn").onclick=()=>{if(!undoStack.length)return toast("Nothing to undo");const s=undoStack.pop();redoStack.push({start:trimStart,end:trimEnd,text:$("overlayInput").value});$("trimStart").value=s.start;$("trimEnd").value=s.end;$("overlayInput").value=s.text;$("overlayInput").dispatchEvent(new Event("input"));updateTrim();toast("Undo")};
$("redoBtn").onclick=()=>{if(!redoStack.length)return toast("Nothing to redo");const s=redoStack.pop();undoStack.push({start:trimStart,end:trimEnd,text:$("overlayInput").value});$("trimStart").value=s.start;$("trimEnd").value=s.end;$("overlayInput").value=s.text;$("overlayInput").dispatchEvent(new Event("input"));updateTrim();toast("Redo")};
$("ratioBtn").onclick=()=>{const s=$("previewStage");s.style.aspectRatio=s.style.aspectRatio==="9 / 16"?"9 / 14":"9 / 16";toast("Preview ratio changed")};
$("fitBtn").onclick=()=>{video.style.objectFit=video.style.objectFit==="cover"?"contain":"cover";toast("Preview fit changed")};
$("templatesBtn").onclick=()=>toast("Templates gallery is planned for a later build.");
$("projectsBtn").onclick=()=>toast("Projects are stored locally in this first prototype.");
async function exportVideo(){
 if(!video.src)return toast("Import a video first");
 if(!("captureStream" in HTMLCanvasElement.prototype)||!window.MediaRecorder)return toast("Video export is not supported by this browser. Try Chrome.");
 const canvas=document.createElement("canvas");canvas.width=720;canvas.height=1280;const ctx=canvas.getContext("2d");
 const stream=canvas.captureStream(30);const recorder=new MediaRecorder(stream,{mimeType:MediaRecorder.isTypeSupported("video/webm;codecs=vp9")?"video/webm;codecs=vp9":"video/webm"});const chunks=[];
 recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};
 recorder.onstop=()=>{const blob=new Blob(chunks,{type:"video/webm"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="clipstudio-export.webm";a.click();URL.revokeObjectURL(url);toast("Export complete")};
 const oldTime=video.currentTime;video.pause();video.currentTime=trimStart;await new Promise(r=>video.onseeked=r);
 recorder.start();video.playbackRate=1;video.muted=true;await video.play();
 const draw=()=>{ctx.fillStyle="#000";ctx.fillRect(0,0,canvas.width,canvas.height);const scale=Math.min(canvas.width/video.videoWidth,canvas.height/video.videoHeight);const w=video.videoWidth*scale,h=video.videoHeight*scale;ctx.drawImage(video,(canvas.width-w)/2,(canvas.height-h)/2,w,h);const txt=$("overlayInput").value;if(txt){ctx.font=`bold ${$("textSize").value*2}px sans-serif`;ctx.textAlign="center";ctx.lineWidth=5;ctx.strokeStyle="#000";ctx.fillStyle=$("textColor").value;ctx.strokeText(txt,canvas.width/2,canvas.height*.52);ctx.fillText(txt,canvas.width/2,canvas.height*.52)}if(video.currentTime>=trimEnd){video.pause();recorder.stop();video.muted=muted;video.currentTime=oldTime;return}requestAnimationFrame(draw)};
 requestAnimationFrame(draw);
}
$("exportBtn").onclick=exportVideo;
$("backBtn").onclick=()=>toast("You're in your current editing project.");
