/* MAP */
let map, currentLocation=null, drawnRoutes=[];

function initMap(lat, lon){
  map=L.map("map").setView([lat,lon],15);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png")
  .addTo(map);

  L.marker([lat,lon]).addTo(map).bindPopup("You are here").openPopup();
}

navigator.geolocation.getCurrentPosition(
 p=>initMap(p.coords.latitude,p.coords.longitude)
);

navigator.geolocation.watchPosition(p=>{
 currentLocation={lat:p.coords.latitude,lon:p.coords.longitude};
});

/* ROUTE */
function generateRoutes(lat,lon){
 return {
  "Main Road":[[lat,lon],[lat+0.002,lon+0.002]],
  "Shortcut":[[lat,lon],[lat+0.001,lon-0.003]]
 };
}

function findSafestRoute(){
 if(!currentLocation) return;

 drawnRoutes.forEach(r=>map.removeLayer(r));

 const routes=generateRoutes(currentLocation.lat,currentLocation.lon);
 let safest=Object.keys(routes)[0];

 const line=L.polyline(routes[safest],{color:"green"}).addTo(map);
 drawnRoutes=[line];

 log("Safe route selected: "+safest);
}

/* CONTACTS */
let emergencyContacts=[];

function addContact(e){
 e.preventDefault();

 const name=contactName.value;
 const phone=contactPhone.value;

 emergencyContacts.push({name,phone});
 contactList.innerHTML+=`<li>${name} (${phone})</li>`;

 log("Contact added: "+name);

 contactName.value="";
 contactPhone.value="";
}

/* SOS */
let sos=false;

function toggleSOS(){
 sos=!sos;

 if(sos){
  sosBtn.classList.add("bg-red-600","sos-active");
  sosText.textContent="SOS ACTIVE";

  const locationLink=currentLocation ?
  `https://maps.google.com/?q=${currentLocation.lat},${currentLocation.lon}`
  :"Location unavailable";

  emergencyContacts.forEach(c=>{
   log(`Alert sent to ${c.name} (${c.phone})`);
  });

  log(`Live Location: <a href="${locationLink}" target="_blank" class="text-blue-600 underline">Open Map</a>`);
  log("Police & ambulance notified (simulated)");

 }else{
  sosBtn.classList.remove("bg-red-600","sos-active");
  sosText.textContent="SOS cancelled";
  log("SOS cancelled");
 }
}

/* VOICE */
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;

if(SR){
 const rec=new SR();
 rec.continuous=true;
 rec.start();

 rec.onresult=e=>{
  const text=e.results[e.results.length-1][0].transcript.toLowerCase();
  log("Voice: "+text);

  if(text.includes("help")||text.includes("emergency")){
   if(!sos) toggleSOS();
  }

  if(text.includes("start")){
   findSafestRoute();
  }
 };
}

/* LOG */
function log(msg){
 const d=document.createElement("div");
 d.innerHTML = `[${new Date().toLocaleTimeString()}] ${msg}`;
 document.getElementById("log").prepend(d);
}
