import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import {
  getAuth,
  signInAnonymously
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
const firebaseConfig = {
  apiKey: "AIzaSyC6E08UWOPn98XQ8FvR4gMlMKQmWz12zw4",
  authDomain: "light-city-bd2cd.firebaseapp.com",
  projectId: "light-city-bd2cd",
  storageBucket: "light-city-bd2cd.firebasestorage.app",
  messagingSenderId: "855563452985",
  appId: "1:855563452985:web:22e6b1d1b6bca133d383e8",
  measurementId: "G-D0D1J8YD4B"
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);
signInAnonymously(auth)
  .then(async (userCredential) => {
    console.log("Anonymous login berhasil");
    console.log("USER UID:", userCredential.user.uid);

    await saveStudentData(userCredential.user.uid);
  })
  .catch((error) => {
    console.error("Anonymous login gagal:", error);
  });
const state = {
  role: null,
  classCode: "LC-7A29",
  currentLevel: 1,
  paused: false,
  teams: [
    {id:"sun", name:"Tim Matahari", icon:"☀️", progress:100, status:"Mission selesai", unlocked:["Lampu Jalan"], city:[{type:"lamp",name:"💡 Lampu",x:12,y:22},{type:"house",name:"🏠 Rumah",x:35,y:28}]},
    {id:"moon", name:"Tim Bulan", icon:"🌙", progress:70, status:"Sedang mengerjakan", unlocked:["Lampu"], city:[{type:"house",name:"🏠 Rumah",x:62,y:40}]},
    {id:"star", name:"Tim Bintang", icon:"⭐", progress:100, status:"Mission selesai", unlocked:["Lampu Jalan"], city:[{type:"lamp",name:"💡 Lampu",x:40,y:65},{type:"school",name:"🏫 Sekolah",x:55,y:30}]},
    {id:"rainbow", name:"Tim Pelangi", icon:"🌈", progress:45, status:"Sedang mengerjakan", unlocked:[], city:[]}
  ],
  studentTeam: null,
studentName: null,
answered: false
};
async function saveStudentData(uid) {
  try {
    await setDoc(
      doc(db, "students", uid),
      {
        uid: uid,
        role: "student",
        name: state.studentName,
        classCode: state.classCode,
        studentTeam: state.studentTeam,
        currentLevel: state.currentLevel,
        paused: state.paused,
        answered: state.answered,
        updatedAt: new Date()
      },
      { merge: true }
    );

    console.log("Data siswa berhasil disimpan ke Firestore");
  } catch (error) {
    console.error("Gagal menyimpan data siswa:", error);
  }
}
}
async function saveStudentProgress() {
  try {
    if (!auth.currentUser || state.role !== "student") return;

    const t = state.teams.find(x => x.id === state.studentTeam);

    await setDoc(
      doc(db, "students", auth.currentUser.uid),
      {
        uid: auth.currentUser.uid,
        role: "student",
        name: state.studentName,
        classCode: state.classCode,
        studentTeam: state.studentTeam,
        currentLevel: state.currentLevel,
        paused: state.paused,
        answered: state.answered,

        teamProgress: t ? t.progress : 0,
        teamStatus: t ? t.status : "",
        unlocked: t ? t.unlocked : [],
        city: t ? t.city : [],

        updatedAt: new Date()
      },
      { merge: true }
    );

    console.log("Progress siswa berhasil disimpan.");
  } catch (error) {
    console.error("Gagal menyimpan progress:", error);
  }
}
const app = document.getElementById("app");

function toast(msg){
  const t=document.createElement("div"); t.className="toast"; t.textContent=msg;
  document.body.appendChild(t); requestAnimationFrame(()=>t.classList.add("show"));
  setTimeout(()=>{t.classList.remove("show");setTimeout(()=>t.remove(),250)},2200);
}

function shell(content, actions=""){
  return `<div class="screen"><header class="topbar">
    <div class="brand">🔦 <span>LIGHT</span> CITY</div>
    <div class="top-actions">${actions}</div>
  </header>${content}</div>`;
}

function landing(){
  app.innerHTML=`<div class="screen center"><div class="panel">
    <div class="logo">🔦 LIGHT <span>CITY</span></div>
    <div class="tagline">Belajar • Membuka • Membangun</div>
    <p class="muted">Media belajar interaktif tentang cahaya dan sifatnya.</p>
    <div class="role-grid">
      <button class="role" onclick="teacherLogin()"><span class="role-icon">👩🏻‍🏫</span>Mode Guru<small>Kontrol kelas & progress</small></button>
      <button class="role" onclick="studentLogin()"><span class="role-icon">🧑🏻‍🤝‍🧑🏻</span>Mode Murid<small>Join & build your city</small></button>
    </div>
  </div></div>`;
}

function teacherLogin(){
  app.innerHTML=`<div class="screen center"><div class="panel">
    <div class="logo">👩🏻‍🏫 Mode Guru</div><p class="muted">Buat ruang belajar untuk kelasmu.</p>
    <label class="label">Nama Guru</label><input id="teacherName" placeholder="Contoh: Bu Bifasa">
    <button class="btn btn-primary btn-full" onclick="teacherDashboard()">Buat Kelas</button>
    <button class="btn btn-secondary btn-full" onclick="landing()">← Kembali</button>
  </div></div>`;
}

function studentLogin(){
  app.innerHTML=`<div class="screen center"><div class="panel">
    <div class="logo">🏙️ Join <span>Light City</span></div>
    <p class="muted">Masukkan kode yang dibagikan oleh guru.</p>
    <label class="label">Kode Kelas</label><input id="code" placeholder="Contoh: LC-7A29" value="${state.classCode}">
    <label class="label">Nama kamu</label><input id="studentName" placeholder="Nama panggilan">
    <label class="label">Pilih Team</label>
    <div class="option-grid">${state.teams.map(t=>`<button class="option" onclick="selectTeam('${t.id}',this)">${t.icon} ${t.name}</button>`).join("")}</div>
    <button class="btn btn-primary btn-full" onclick="joinStudent()">Masuk ke Kota</button>
    <button class="btn btn-secondary btn-full" onclick="landing()">← Kembali</button>
  </div></div>`;
}

function selectTeam(id,el){
  state.studentTeam=id;
  document.querySelectorAll(".option").forEach(x=>x.classList.remove("correct"));
  el.classList.add("correct");
}

async function joinStudent(){
  const code = document.getElementById("code").value.trim().toUpperCase();
  const name = document.getElementById("studentName").value.trim();

  if(code !== state.classCode){
    toast("Kode kelas belum cocok.");
    return;
  }

  if(!name || !state.studentTeam){
    toast("Isi nama dan pilih team dulu.");
    return;
  }

  state.role = "student";
  state.studentName = name;
  if(auth.currentUser){
    await setDoc(
      doc(db, "students", auth.currentUser.uid),
      {
        uid: auth.currentUser.uid,
        role: "student",
        name: name,
        classCode: state.classCode,
        studentTeam: state.studentTeam,
        currentLevel: state.currentLevel,
        paused: state.paused,
        answered: state.answered,
        updatedAt: new Date()
      },
      { merge: true }
    );
  }

  studentHome(name);
}

function teacherDashboard(){
  state.role="teacher";
  app.innerHTML=shell(`<main class="page">
    <section class="hero">
      <div><div class="level-badge">LEVEL ${state.currentLevel}</div><h1>Cahaya Merambat Lurus</h1>
      <p class="muted">Guru mengontrol alur belajar seluruh kelompok.</p></div>
      <div class="stats">
        <div class="stat"><span class="muted">Kode Kelas</span><strong>${state.classCode}</strong></div>
        <div class="stat"><span class="muted">Status</span><strong id="classStatus">${state.paused?"Paused":"Live"}</strong></div>
      </div>
    </section>
    <section class="level-card">
      <div><strong>Lesson Control</strong><div class="muted">Siswa tidak dapat membuka level berikutnya sendiri.</div></div>
      <div class="actions">
        <button class="btn ${state.paused?"btn-success":"btn-danger"}" onclick="togglePause()">${state.paused?"▶ Resume":"⏸ Pause All"}</button>
        <button class="btn btn-primary" onclick="unlockNext()">🔓 Unlock Next Level</button>
      </div>
    </section>
    <h2 class="section-title">Team Progress</h2>
    <div class="grid">${state.teams.map(teamCard).join("")}</div>
  </main>`,
  `<span class="code-pill">${state.classCode}</span><button class="btn btn-secondary" onclick="landing()">Keluar</button>`);
}

function teamCard(t){
  return `<div class="card team-card"><div class="team-icon">${t.icon}</div><div class="team-name">${t.name}</div>
    <div class="status">${t.status}</div><div class="progress"><div style="width:${t.progress}%"></div></div>
    <div class="muted">${t.progress}% selesai</div>
    <div class="actions"><button class="btn btn-secondary" onclick="viewCity('${t.id}')">View City</button></div>
  </div>`;
}

function togglePause(){
  state.paused=!state.paused; teacherDashboard();
  toast(state.paused?"Semua layar siswa dijeda.":"Kelas dilanjutkan.");
}
function unlockNext(){
  state.currentLevel++;
  state.teams.forEach(t=>t.progress=Math.min(t.progress,100));
  teacherDashboard();
  toast("Level berikutnya terbuka untuk seluruh kelas.");
}
function viewCity(id){
  const t=state.teams.find(x=>x.id===id);
  const city=t.city.length?t.city.map((b,i)=>`<div class="building" style="left:${b.x}%;top:${b.y}%">${b.name}</div>`).join(""):`<div class="muted">Belum ada bangunan.</div>`;
  app.innerHTML=shell(`<main class="page"><button class="btn btn-secondary" onclick="teacherDashboard()">← Dashboard</button>
    <h1>${t.icon} ${t.name}'s City</h1><p class="muted">Preview kota kelompok.</p>
    <div class="builder">${city}</div></main>`);
}

function studentHome(name){
  const t=state.teams.find(x=>x.id===state.studentTeam);
  app.innerHTML=shell(`<main class="page">
    <section class="hero"><div><div class="level-badge">LEVEL ${state.currentLevel}</div>
    <h1>${t.icon} ${t.name}</h1><p class="muted">Halo, ${name}! Bangun kotamu sambil membuktikan sifat cahaya.</p></div>
    <div class="code-pill">${state.classCode}</div></section>
    <div class="level-card"><div><strong>Misi Saat Ini</strong><div class="muted">Buktikan bahwa cahaya merambat lurus.</div></div>
    <button class="btn btn-primary" onclick="lesson()">Pelajari & Coba →</button></div>
    <h2 class="section-title">Kotamu</h2><div class="builder">${t.city.map(b=>`<div class="building" style="left:${b.x}%;top:${b.y}%">${b.name}</div>`).join("") || '<div class="muted">Kota masih kosong. Selesaikan mission untuk membuka bangunan.</div>'}</div>
  </main>`,
  `<button class="btn btn-secondary" onclick="landing()">Keluar</button>`);
}

function lesson(){
  if(state.paused){ toast("Tunggu guru melanjutkan kelas."); return; }
  app.innerHTML=shell(`<main class="page"><div class="mission">
    <div class="level-badge">LEVEL 1 • MATERIAL</div>
    <h1>💡 Cahaya Merambat Lurus</h1>
    <p class="muted">Cahaya dari sumber cahaya bergerak dalam garis lurus. Karena itu, benda yang menghalangi jalannya dapat membuat bagian di belakangnya tidak terkena cahaya.</p>
    <div class="simulation"><div class="sun">💡</div><div class="rays"></div><div class="wall"></div><div class="object">🏠</div></div>
    <div class="explain"><strong>Try to predict:</strong> Apakah cahaya dapat membelok melewati dinding tanpa bantuan benda lain?</div>
    <button class="btn btn-primary btn-full" onclick="mission()">Let's Go →</button>
  </div></main>`,
  `<span class="code-pill">${state.classCode}</span>`);
}

function mission(){
  app.innerHTML=shell(`<main class="page"><div class="mission">
    <div class="level-badge">MISSION 1</div>
    <h1>🔦 Light the Hospital</h1>
    <p>Letakkan sumber cahaya pada posisi yang memungkinkan cahaya mencapai rumah sakit tanpa melewati dinding.</p>
    <div class="simulation"><div class="sun">💡</div><div class="wall"></div><div class="object">🏥</div></div>
    <div class="option-grid">
      <button class="option" onclick="answer(this,false)">A. Letakkan lampu tepat di belakang dinding.</button>
      <button class="option" onclick="answer(this,true)">B. Letakkan lampu pada posisi yang segaris dengan rumah sakit.</button>
      <button class="option" onclick="answer(this,false)">C. Letakkan lampu di samping dinding dan berharap cahayanya berbelok.</button>
    </div>
    <div id="feedback"></div>
  </div></main>`,
  `<span class="code-pill">${state.classCode}</span>`);
}

function answer(el,correct){
  if(state.answered)return;
  state.answered=true;
  el.classList.add(correct?"correct":"wrong");
  const t=state.teams.find(x=>x.id===state.studentTeam);
 if(correct){
  t.progress=100; 
  t.status="Mission selesai"; 
  t.unlocked=["Lampu Jalan"];

  saveStudentProgress();
    document.getElementById("feedback").innerHTML=`<div class="explain"><strong>✅ Benar!</strong> Cahaya merambat lurus, jadi posisi sumber cahaya harus mempertimbangkan jalur lurus menuju objek.</div>
      <button class="btn btn-primary btn-full" onclick="builder()">🏗️ Bangun Kotamu</button>`;
  } else {
    state.answered=false;
    document.getElementById("feedback").innerHTML=`<div class="explain"><strong>Belum tepat.</strong> Perhatikan kembali jalur cahaya pada simulasi.</div>`;
  }
}

function cityDecor(){return `<div class="gridlines"></div><div class="road-h"></div><div class="road-v"></div>`}
function renderBuilding(b,i){return `<div class="building draggable ${b.type||''}" data-index="${i}" style="left:${b.x||20}%;top:${b.y||20}%">${b.name}</div>`}
function builder(){const t=state.teams.find(x=>x.id===state.studentTeam);app.innerHTML=shell(`<main class="page"><div class="hero"><div><div class="level-badge">MODE MEMBANGUN</div><h1>🏗️ Bangun Kotamu</h1><p class="muted">Seret bangunan ke lokasi yang kamu inginkan. Cobalah membuat kota yang terang dan aman.</p></div></div><div class="builder-wrap"><div class="builder-toolbar"><button class="block" onclick="addBuilding('lamp')">💡 Lampu</button><button class="block" onclick="addBuilding('house')">🏠 Rumah</button><button class="block" onclick="addBuilding('hospital')">🏥 Rumah Sakit</button><button class="block" onclick="addBuilding('school')">🏫 Sekolah</button></div><div class="builder" id="builder">${cityDecor()}${t.city.map(renderBuilding).join('')}<div id="beams"></div></div></div><div class="science-check"><div><strong>🔬 Cek Pemahaman</strong><div class="muted">Mengapa posisi lampu perlu diperhatikan saat membangun kota?</div></div><button class="btn btn-primary" onclick="scienceCheck()">Jawab →</button></div></main>`,`<span class="code-pill">${state.classCode}</span>`);setupDrag();drawBeams()}
function addBuilding(type){
  const t=state.teams.find(x=>x.id===state.studentTeam);
  const names={
    lamp:'💡 Lampu',
    house:'🏠 Rumah',
    hospital:'🏥 Rumah Sakit',
    school:'🏫 Sekolah'
  };

  t.city.push({
    type,
    name:names[type],
    x:20+Math.random()*55,
    y:20+Math.random()*65
  });

  saveStudentProgress();

  builder();
  toast('Bangunan ditambahkan. Sekarang seret ke tempat yang kamu inginkan.');
}
function setupDrag(){document.querySelectorAll('.draggable').forEach(el=>{let sx,sy,ox,oy,drag=false;el.addEventListener('pointerdown',e=>{drag=true;el.setPointerCapture(e.pointerId);sx=e.clientX;sy=e.clientY;const b=state.teams.find(x=>x.id===state.studentTeam).city[+el.dataset.index];ox=b.x||20;oy=b.y||20});el.addEventListener('pointermove',e=>{if(!drag)return;const box=document.getElementById('builder').getBoundingClientRect();const dx=(e.clientX-sx)/box.width*100,dy=(e.clientY-sy)/box.height*100;const b=state.teams.find(x=>x.id===state.studentTeam).city[+el.dataset.index];b.x=Math.max(1,Math.min(90,ox+dx));b.y=Math.max(1,Math.min(85,oy+dy));el.style.left=b.x+'%';el.style.top=b.y+'%';drawBeams()});el.addEventListener('pointerup',()=>{
  drag=false;
  saveStudentProgress();
  toast('Posisi bangunan disimpan.');
})
function drawBeams(){const holder=document.getElementById('beams'),canvas=document.getElementById('builder');if(!holder||!canvas)return;holder.innerHTML='';const t=state.teams.find(x=>x.id===state.studentTeam);const lamps=t.city.filter(b=>b.type==='lamp'),targets=t.city.filter(b=>['house','hospital','school'].includes(b.type));lamps.forEach(l=>targets.forEach(target=>{const dx=(target.x-l.x)*canvas.clientWidth/100,dy=(target.y-l.y)*canvas.clientHeight/100,len=Math.sqrt(dx*dx+dy*dy),angle=Math.atan2(dy,dx)*180/Math.PI;const beam=document.createElement('div');beam.className='light-beam';beam.style.left=l.x+'%';beam.style.top=(l.y+3)+'%';beam.style.width=Math.min(len,220)+'px';beam.style.transform=`rotate(${angle}deg)`;holder.appendChild(beam)}))}
function scienceCheck(){const ans=prompt('Jelaskan dengan kalimatmu sendiri: mengapa lampu tidak boleh diletakkan sembarangan jika kita ingin menerangi sebuah rumah?');if(ans&&ans.toLowerCase().includes('lurus'))toast('Bagus! Kamu menghubungkan jawaban dengan sifat cahaya. 🎉');else toast('Coba gunakan kata kunci: cahaya merambat lurus.')}

landing();

window.teacherLogin = teacherLogin;
window.studentLogin = studentLogin;
window.selectTeam = selectTeam;
window.joinStudent = joinStudent;
window.teacherDashboard = teacherDashboard;
window.landing = landing;

window.togglePause = togglePause;
window.unlockNext = unlockNext;
window.viewCity = viewCity;
window.lesson = lesson;
window.mission = mission;
window.answer = answer;
window.builder = builder;
window.addBuilding = addBuilding;
window.scienceCheck = scienceCheck;
