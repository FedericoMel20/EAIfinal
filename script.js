const API = 'http' + '://localhost:4000/graphql';

const state = {
  page: 'dashboard',
  students: [],
  subjects: [],
  classes: [],
  scores: [],
  filters: {
    studentsSearch: '', studentsLevel: 'all', studentsClass: 'all',
    scoresSubject: 'all', scoresLevel: 'all', scoresClass: 'all', scoresStudent: '', scoresGrade: 'all',
    classesSearch: '', subjectsSearch: ''
  },
  sort: {},
  selectedStudent: null
};

const gradeLevels = ['all','7','8','9'];
const classStreams = ['all','7A','7B','8A','8B','9A','9B'];
const scoreGrades = ['all','A','B','C','D','E','F'];

const navigation = { dashboard:'Dashboard', students:'Students', subjects:'Subjects', classes:'Classes', scores:'Scores', settings:'Settings' };

const icons = {
  dashboard: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',
  students: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.5"/><path d="M5 21c.7-4 3.1-6 7-6s6.3 2 7 6"/></svg>',
  subjects: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5A3.5 3.5 0 0 1 7.5 2H20v17H7.5A3.5 3.5 0 0 0 4 22z"/><path d="M4 5.5V22M8 6h8M8 10h8"/></svg>',
  classes: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h11v16H4zM8 8h3M8 12h3M18 8v12M15 16l3 4 3-4"/></svg>',
  scores: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h12v18H6z"/><path d="M9 8h6M9 12h6M9 16h3"/><path d="M18 16l2 2 3-4"/></svg>',
  settings: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 15.5A3.5 3.5 0 1 0 12 8.5a3.5 3.5 0 0 0 0 7z"/><path d="M19.4 15a1.7 1.7 0 0 0 .33 1.78l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.78-.33 1.7 1.7 0 0 0-1 .97 1.7 1.7 0 0 1-2.94 0 1.7 1.7 0 0 0-1-.97 1.7 1.7 0 0 0-1.78.33l-.06.06A2 2 0 0 1 2.3 16.3l.06-.06a1.7 1.7 0 0 0 .33-1.78 1.7 1.7 0 0 0-.97-1 1.7 1.7 0 0 1 0-2.94 1.7 1.7 0 0 0 .97-1 1.7 1.7 0 0 0-.33-1.78L2.3 4.7A2 2 0 0 1 5.13 1.87l.06.06A1.7 1.7 0 0 0 7 3.26a1.7 1.7 0 0 0 1 .97 1.7 1.7 0 0 1 2.94 0 1.7 1.7 0 0 0 1-.97c.38-.28.8-.46 1.26-.52.46.06.88.24 1.26.52a1.7 1.7 0 0 0 1 .97 1.7 1.7 0 0 0 1.78-.33l.06-.06A2 2 0 0 1 22 7.7l-.06.06a1.7 1.7 0 0 0-.33 1.78 1.7 1.7 0 0 0 .97 1 1.7 1.7 0 0 1 0 2.94 1.7 1.7 0 0 0-.97 1z"/></svg>'
};

Object.keys(icons).forEach((key) => {
  icons[key] = icons[key].replace('aria-hidden="true"', 'aria-hidden="true" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"');
});

document.addEventListener('DOMContentLoaded', () => { setup(); refreshAll(); });

async function request(query, variables = {}) {
  const operation = typeof query === 'string' ? query.trim() : '';
  if (!operation) throw new Error('Frontend prevented an empty GraphQL request.');
  const response = await fetch(API, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ query:operation, variables }) });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || result.errors) throw new Error(result.errors?.map((error) => error.message).join(' ') || 'Backend is unavailable.');
  return result.data;
}

async function fetchStudents(){ state.students = (await request(`query{students{id fullName gender age className parentContact}}`)).students; }
async function fetchSubjects(){ state.subjects = (await request(`query{subjects{id name}}`)).subjects; }
async function fetchClasses(){ state.classes = (await request(`query{classes{id name totalStudents}}`)).classes; }
async function fetchScores(){ state.scores = (await request(`query{scores{id score grade remark student{fullName className id} subject{id name}}}`)).scores; }

async function createStudent(input){ return request(`mutation($input:CreateStudentInput!){createStudent(input:$input){id}}`,{input}); }
async function updateStudent(id,input){ return request(`mutation($id:ID!,$input:UpdateStudentInput!){updateStudent(id:$id,input:$input){id}}`,{id,input}); }
async function deleteStudent(id){ return request(`mutation($id:ID!){deleteStudent(id:$id){id}}`,{id}); }

async function createClass(input){ return request(`mutation($input:CreateClassInput!){createClass(input:$input){id}}`,{input}); }
async function updateClass(id,input){ return request(`mutation($id:ID!,$input:UpdateClassInput!){updateClass(id:$id,input:$input){id}}`,{id,input}); }
async function deleteClass(id){ return request(`mutation($id:ID!){deleteClass(id:$id){id}}`,{id}); }

async function createSubject(input){ return request(`mutation($input:CreateSubjectInput!){createSubject(input:$input){id}}`,{input}); }
async function updateSubject(id,input){ return request(`mutation($id:ID!,$input:UpdateSubjectInput!){updateSubject(id:$id,input:$input){id}}`,{id,input}); }
async function deleteSubject(id){ return request(`mutation($id:ID!){deleteSubject(id:$id){id}}`,{id}); }

async function assignScore(input){ return request(`mutation($input:AssignScoreInput!){assignScore(input:$input){id}}`,{input}); }
async function updateScore(id,input){ return request(`mutation($id:ID!,$input:UpdateScoreInput!){updateScore(id:$id,input:$input){id}}`,{id,input}); }
async function deleteScore(id){ return request(`mutation($id:ID!){deleteScore(id:$id){id}}`,{id}); }

async function refreshAll(initial=true){
  document.getElementById('page-root').innerHTML = skeleton();
  try {
    await Promise.all([fetchStudents(), fetchSubjects(), fetchClasses(), fetchScores()]);
    render();
    if (!initial) toast('Data refreshed successfully.','success');
  } catch (err) {
    toast(err.message, 'error');
    document.getElementById('page-root').innerHTML = `<section class='page'><article class='card'><h2>Could not connect to CampusConnect</h2><p class='muted'>Start the GraphQL backend and refresh this page.</p></article></section>`;
  }
}

function setup(){
  document.getElementById('navigation').innerHTML = Object.entries(navigation).map(([key,label]) => `<button class='nav-item ${key==='dashboard'?'active':''}' data-page='${key}'><span class='nav-icon'>${icons[key]}</span>${label}</button>`).join('');
  document.getElementById('navigation').onclick = (e) => { const btn = e.target.closest('[data-page]'); if (btn) { state.page = btn.dataset.page; render(); document.getElementById('sidebar').classList.remove('open'); } };
  document.getElementById('refresh-button').onclick = () => refreshAll(false);
  document.getElementById('menu-button').onclick = () => document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('theme-toggle').onclick = () => { document.body.classList.toggle('dark'); localStorage.setItem('cc-theme', document.body.classList.contains('dark') ? 'dark' : 'light'); };
  document.getElementById('global-search').oninput = (e) => { state.filters.global = e.target.value.toLowerCase(); if (state.page !== 'dashboard') render(); };
  if (localStorage.getItem('cc-theme') === 'dark') document.body.classList.add('dark');
}

function render(){
  document.querySelectorAll('.nav-item').forEach((it)=>it.classList.toggle('active', it.dataset.page===state.page));
  if (state.page === 'dashboard') document.getElementById('page-root').innerHTML = dashboard(); else document.getElementById('page-root').innerHTML = tablePage(state.page);
  bindPage();
}

function gradeFromScore(value){ if (!Number.isFinite(value)) return '—'; if (value>=85) return 'A'; if (value>=75) return 'B'; if (value>=65) return 'C'; if (value>=55) return 'D'; if (value>=40) return 'E'; return 'F'; }

function dashboard(){
  const totalStudents = state.students.length;
  const totalClasses = state.classes.length;
  const totalSubjects = state.subjects.length;
  const totalScores = state.scores.length;
  const scoresOnly = state.scores.map(s => s.score).filter(Number.isFinite);
  const highest = scoresOnly.length ? Math.max(...scoresOnly) : '—';
  const lowest = scoresOnly.length ? Math.min(...scoresOnly) : '—';
  const avg = scoresOnly.length ? (scoresOnly.reduce((a,b)=>a+b,0)/scoresOnly.length).toFixed(2) : '—';
  const gradeCounts = { A:0,B:0,C:0,D:0,E:0,F:0 };
  state.scores.forEach(s => { const g = s.grade || gradeFromScore(s.score); if (gradeCounts[g] !== undefined) gradeCounts[g]++; });
  const levels = ['7','8','9'].map((level)=>({ level, count: state.students.filter((s)=>s.className?.startsWith(level)).length }));
  const classes = ['7A','7B','8A','8B','9A','9B'].map((name)=>({ name, count: state.students.filter((s)=>s.className===name).length }));
  const studentAverages = state.students.map((student)=>{
    const scores = state.scores.filter((s)=>s.student?.id===student.id);
    const average = scores.length ? scores.reduce((sum,s)=>sum+s.score,0)/scores.length : null;
    return { student, average };
  }).filter((item)=>item.average !== null);
  const topStudents = [...studentAverages].sort((a,b)=>b.average-a.average).slice(0,3);
  const lowestStudents = [...studentAverages].sort((a,b)=>a.average-b.average).slice(0,3);
  const subjectAverages = state.subjects.map((subject)=>{
    const scores = state.scores.filter((s)=>s.subject?.id===subject.id).map((s)=>s.score).filter(Number.isFinite);
    const average = scores.length ? scores.reduce((sum,v)=>sum+v,0)/scores.length : null;
    return { subject, average };
  }).filter((item)=>item.average !== null);
  const bestSubject = subjectAverages.sort((a,b)=>b.average-a.average)[0];
  const difficultSubject = subjectAverages.sort((a,b)=>a.average-b.average)[0];
  return `
    <section class='page'>
      <div class='page-head'><div><p class='eyebrow'>JUNIOR SECONDARY ADMIN</p><h1>School overview</h1><p>Live management and academic metrics (Grades 7–9).</p></div><button class='button' data-add='student'>+ Add student</button></div>
      <div class='stats'>${stat('Total Students', totalStudents)}${stat('Total Classes', totalClasses)}${stat('Total Subjects', totalSubjects)}${stat('Total Scores', totalScores)}${stat('Highest Score', highest)}${stat('Lowest Score', lowest)}${stat('Average Score', avg)}</div>
      <div class='dashboard-grid'>
        <article class='card'><h2>Students by level</h2><div class='feed'>${levels.map((item)=>`<div class='feed-item'><div><p>Grade ${item.level}</p><small>${item.count} students</small></div></div>`).join('')}</div></article>
        <article class='card'><h2>Students by class</h2><div class='feed'>${classes.map((item)=>`<div class='feed-item'><div><p>${item.name}</p><small>${item.count} students</small></div></div>`).join('')}</div></article>
      </div>
      <div class='dashboard-grid'>
        <article class='card'><h2>Top performing students</h2><div class='feed'>${topStudents.length ? topStudents.map((item)=>`<div class='feed-item'><span class='feed-dot'></span><div><p>${esc(item.student.fullName)}</p><small>Avg ${item.average.toFixed(1)}</small></div></div>`).join('') : '<p class=muted>No scored students yet.</p>'}</div></article>
        <article class='card'><h2>Lowest performing students</h2><div class='feed'>${lowestStudents.length ? lowestStudents.map((item)=>`<div class='feed-item'><span class='feed-dot'></span><div><p>${esc(item.student.fullName)}</p><small>Avg ${item.average.toFixed(1)}</small></div></div>`).join('') : '<p class=muted>No scored students yet.</p>'}</div></article>
      </div>
      <div class='dashboard-grid'>
        <article class='card'><h2>Most difficult subject</h2><div class='feed'><div class='feed-item'><div><p>${difficultSubject ? esc(difficultSubject.subject.name) : 'No data'}</p><small>${difficultSubject ? `Avg ${difficultSubject.average.toFixed(1)}` : ''}</small></div></div></div></article>
        <article class='card'><h2>Best performing subject</h2><div class='feed'><div class='feed-item'><div><p>${bestSubject ? esc(bestSubject.subject.name) : 'No data'}</p><small>${bestSubject ? `Avg ${bestSubject.average.toFixed(1)}` : ''}</small></div></div></div></article>
      </div>
    </section>`;
}

function tablePage(type){
  const meta = {
    students: ['Students',['Name','Gender','Age','Class','Parent contact'] ],
    subjects: ['Subjects',['Subject'] ],
    classes: ['Classes',['Class','Level','Capacity','Total Students'] ],
    scores: ['Scores',['Student','Class','Subject','Score','Grade','Remark'] ]
  }[type];
  const items = filtered(type);
  const addType = type === 'students' ? 'student' : type === 'subjects' ? 'subject' : type === 'classes' ? 'class' : type === 'scores' ? 'score' : '';
  return `<section class='page'><div class='page-head'><div><p class='eyebrow'>SCHOOL MANAGEMENT</p><h1>${meta[0]}</h1><p>Manage ${meta[0].toLowerCase()} and records.</p></div><button class='button' data-add='${addType}'>+ Add ${addType}</button></div>${toolbar(type)}<article class='card table-card'><div class='table-wrap'><table><thead><tr>${meta[1].map((h,i)=>`<th data-sort='${i}'>${h} ↕</th>`).join('')}<th>Actions</th></tr></thead><tbody>${items.length ? items.map((it)=>row(type,it)).join('') : `<tr><td class='empty' colspan='${meta[1].length+1}'>No ${meta[0].toLowerCase()} found.</td></tr>`}</tbody></table></div></article></section>`;
}

function toolbar(type){
  if (type === 'students') {
    return `<div class='toolbar'>
      <label>Level<select id='filter-students-level'>${gradeLevels.map((level)=>`<option value='${level}' ${state.filters.studentsLevel===level?'selected':''}>${level==='all'?'All levels':`Grade ${level}`}</option>`).join('')}</select></label>
      <label>Class<select id='filter-students-class'>${classStreams.map((cls)=>`<option value='${cls}' ${state.filters.studentsClass===cls?'selected':''}>${cls==='all'?'All classes':cls}</option>`).join('')}</select></label>
      <label>Search<input id='filter-students-search' placeholder='Search student name or ID...' value='${esc(state.filters.studentsSearch)}'></label>
      <button class='button secondary' id='clear-filters'>Clear filters</button>
    </div>`;
  }
  if (type === 'scores') {
    const subjectOptions = ['all', ...state.subjects.map((s)=>s.name)];
    return `<div class='toolbar'>
      <label>Subject<select id='filter-scores-subject'>${subjectOptions.map((name)=>`<option value='${esc(name)}' ${state.filters.scoresSubject===name?'selected':''}>${name==='all'?'All subjects':esc(name)}</option>`).join('')}</select></label>
      <label>Level<select id='filter-scores-level'>${gradeLevels.map((level)=>`<option value='${level}' ${state.filters.scoresLevel===level?'selected':''}>${level==='all'?'All levels':`Grade ${level}`}</option>`).join('')}</select></label>
      <label>Class<select id='filter-scores-class'>${classStreams.map((cls)=>`<option value='${cls}' ${state.filters.scoresClass===cls?'selected':''}>${cls==='all'?'All classes':cls}</option>`).join('')}</select></label>
      <label>Student<input id='filter-scores-student' placeholder='Search student name...' value='${esc(state.filters.scoresStudent)}'></label>
      <label>Grade<select id='filter-scores-grade'>${scoreGrades.map((grade)=>`<option value='${grade}' ${state.filters.scoresGrade===grade?'selected':''}>${grade==='all'?'All grades':grade}</option>`).join('')}</select></label>
      <button class='button secondary' id='clear-filters'>Clear filters</button>
    </div>`;
  }
  if (type === 'classes') {
    return `<div class='toolbar'><label>Search<input id='filter-classes-search' placeholder='Search class name...' value='${esc(state.filters.classesSearch)}'></label><button class='button secondary' id='clear-filters'>Clear filters</button></div>`;
  }
  if (type === 'subjects') {
    return `<div class='toolbar'><label>Search<input id='filter-subjects-search' placeholder='Search subject...' value='${esc(state.filters.subjectsSearch)}'></label><button class='button secondary' id='clear-filters'>Clear filters</button></div>`;
  }
  return `<div class='toolbar'></div>`;
}

function row(type,item){
  if (type==='students') return `<tr><td><b><a href='#' data-profile='${item.id}'>${esc(item.fullName)}</a></b></td><td>${esc(item.gender)}</td><td>${item.age}</td><td>${esc(item.className)}</td><td>${esc(item.parentContact)}</td>${actions('students',item.id)}</tr>`;
  if (type==='subjects') return `<tr><td>${esc(item.name)}</td>${actions('subjects',item.id)}</tr>`;
  if (type==='classes') return `<tr><td><b><a href='#' data-class='${item.id}'>${esc(item.name)}</a></b></td><td>${item.level}</td><td>${item.capacity}</td><td>${item.totalStudents}</td>${actions('classes',item.id)}</tr>`;
  if (type==='scores') return `<tr><td>${esc(item.student?.fullName)}</td><td>${esc(item.student?.className)}</td><td>${esc(item.subject?.name)}</td><td class='grade'>${item.score}</td><td>${esc(item.grade)}</td><td>${esc(item.remark)}</td>${actions('scores',item.id)}</tr>`;
  return '';
}

function actions(type,id){
  return `<td class='actions'><button class='action' data-edit='${type}:${id}'>Edit</button><button class='action delete' data-delete='${type}:${id}'>Delete</button></td>`;
}

function filtered(type){
  let items = [...(state[type]||[])];
  if (type === 'students') {
    const level = state.filters.studentsLevel;
    const cls = state.filters.studentsClass;
    const q = (state.filters.studentsSearch || '').toLowerCase();
    if (level !== 'all') items = items.filter((item) => item.className?.startsWith(level));
    if (cls !== 'all') items = items.filter((item) => item.className === cls);
    if (q) items = items.filter((item) => (`${item.fullName} ${item.id}`).toLowerCase().includes(q));
    return items;
  }
  if (type === 'scores') {
    const subject = state.filters.scoresSubject;
    const level = state.filters.scoresLevel;
    const cls = state.filters.scoresClass;
    const student = (state.filters.scoresStudent || '').toLowerCase();
    const grade = state.filters.scoresGrade;
    if (subject !== 'all') items = items.filter((item) => item.subject?.name === subject);
    if (level !== 'all') items = items.filter((item) => item.student?.className?.startsWith(level));
    if (cls !== 'all') items = items.filter((item) => item.student?.className === cls);
    if (grade !== 'all') items = items.filter((item) => item.grade === grade);
    if (student) items = items.filter((item) => item.student?.fullName?.toLowerCase().includes(student));
    return items;
  }
  if (type === 'classes') {
    const q = (state.filters.classesSearch || '').toLowerCase();
    if (q) items = items.filter((item) => (`${item.name} ${item.level} ${item.capacity}`).toLowerCase().includes(q));
    return items;
  }
  if (type === 'subjects') {
    const q = (state.filters.subjectsSearch || '').toLowerCase();
    if (q) items = items.filter((item) => item.name.toLowerCase().includes(q));
    return items;
  }
  const q = (state.filters[state.page] || state.filters.global || '').toLowerCase();
  if (q) items = items.filter((item)=> JSON.stringify(item).toLowerCase().includes(q));
  return items;
}

function bindPage(){
  const root = document.getElementById('page-root');
  root.onclick = (event) => {
    const add = event.target.closest('[data-add]'); if (add) return openForm(add.dataset.add);
    const edit = event.target.closest('[data-edit]'); if (edit) { const [type,id] = edit.dataset.edit.split(':'); return openForm(type,id); }
    const del = event.target.closest('[data-delete]'); if (del) { const [type,id] = del.dataset.delete.split(':'); return confirmDelete(type,id); }
    const profile = event.target.closest('[data-profile]'); if (profile) { openProfile(profile.dataset.profile); }
    const clazz = event.target.closest('[data-class]'); if (clazz) { openClassDetails(clazz.dataset.class); }
  };
  const studentLevel = root.querySelector('#filter-students-level'); if (studentLevel) studentLevel.onchange = (e)=>{ state.filters.studentsLevel = e.target.value; render(); };
  const studentClass = root.querySelector('#filter-students-class'); if (studentClass) studentClass.onchange = (e)=>{ state.filters.studentsClass = e.target.value; render(); };
  const studentSearch = root.querySelector('#filter-students-search'); if (studentSearch) studentSearch.oninput = (e)=>{ state.filters.studentsSearch = e.target.value; render(); };
  const scoreSubject = root.querySelector('#filter-scores-subject'); if (scoreSubject) scoreSubject.onchange = (e)=>{ state.filters.scoresSubject = e.target.value; render(); };
  const scoreLevel = root.querySelector('#filter-scores-level'); if (scoreLevel) scoreLevel.onchange = (e)=>{ state.filters.scoresLevel = e.target.value; render(); };
  const scoreClass = root.querySelector('#filter-scores-class'); if (scoreClass) scoreClass.onchange = (e)=>{ state.filters.scoresClass = e.target.value; render(); };
  const scoreStudent = root.querySelector('#filter-scores-student'); if (scoreStudent) scoreStudent.oninput = (e)=>{ state.filters.scoresStudent = e.target.value; render(); };
  const scoreGrade = root.querySelector('#filter-scores-grade'); if (scoreGrade) scoreGrade.onchange = (e)=>{ state.filters.scoresGrade = e.target.value; render(); };
  const classesSearch = root.querySelector('#filter-classes-search'); if (classesSearch) classesSearch.oninput = (e)=>{ state.filters.classesSearch = e.target.value; render(); };
  const subjectsSearch = root.querySelector('#filter-subjects-search'); if (subjectsSearch) subjectsSearch.oninput = (e)=>{ state.filters.subjectsSearch = e.target.value; render(); };
  const clearFilters = root.querySelector('#clear-filters'); if (clearFilters) clearFilters.onclick = () => { clearPageFilters(state.page); render(); };
}

function clearPageFilters(type){
  if (type === 'students'){
    state.filters.studentsLevel = 'all';
    state.filters.studentsClass = 'all';
    state.filters.studentsSearch = '';
  }
  if (type === 'scores'){
    state.filters.scoresSubject = 'all';
    state.filters.scoresLevel = 'all';
    state.filters.scoresClass = 'all';
    state.filters.scoresStudent = '';
    state.filters.scoresGrade = 'all';
  }
  if (type === 'classes') state.filters.classesSearch = '';
  if (type === 'subjects') state.filters.subjectsSearch = '';
}

function openForm(type,id){
  const isNew = !id;
  if (type==='student'){ const item = state.students.find(s=>s.id===id) || {}; const classOptions = state.classes.map(c=>`<option value='${esc(c.name)}' ${c.name===item.className?'selected':''}>${esc(c.name)}</option>`).join('');
    const content = `
      <form id='record-form'>
        <label>Full name<input name='fullName' required value='${esc(item.fullName||'')}'></label>
        <label>Gender<select name='gender' required><option value='Male' ${item.gender==='Male'?'selected':''}>Male</option><option value='Female' ${item.gender==='Female'?'selected':''}>Female</option></select></label>
        <label>Age<input name='age' type='number' required value='${esc(item.age||'')}'></label>
        <label>Class<select name='className' required><option value=''>Select...</option>${classOptions}</select></label>
        <label>Parent contact<input name='parentContact' required value='${esc(item.parentContact||'')}'></label>
        <div class='modal-footer'><button type='button' class='button secondary' data-close>Cancel</button><button class='button'>Save</button></div>
      </form>`;
    openModal(`${isNew?'Add':'Edit'} student`, content, async (form)=>{
      const data = Object.fromEntries(new FormData(form)); data.age = Number(data.age);
      if (isNew) await createStudent(data); else await updateStudent(id, data);
      closeModal(); toast('Student saved.','success'); refreshAll(true);
    });
    return;
  }
  if (type==='class'){ const item = state.classes.find(s=>s.id===id) || {}; const content = `<form id='record-form'><label>Class name<input name='name' required value='${esc(item.name||'')}'></label><label>Level<select name='level' required>${gradeLevels.map((level)=>`<option value='${level}' ${item.level===Number(level)?'selected':''}>${level==='all'?'Select level':`Grade ${level}`}</option>`).join('')}</select></label><label>Capacity<input name='capacity' type='number' min='1' required value='${esc(item.capacity||'')}'></label><div class='modal-footer'><button type='button' class='button secondary' data-close>Cancel</button><button class='button'>Save</button></div></form>`; openModal(`${isNew?'Add':'Edit'} class`, content, async(form)=>{ const data = Object.fromEntries(new FormData(form)); data.level = Number(data.level); data.capacity = Number(data.capacity); if (isNew) await createClass(data); else await updateClass(id,data); closeModal(); toast('Class saved.','success'); refreshAll(true); }); return; }
  if (type==='subject'){ const item = state.subjects.find(s=>s.id===id) || {}; const content = `<form id='record-form'><label>Name<input name='name' required value='${esc(item.name||'')}'></label><div class='modal-footer'><button type='button' class='button secondary' data-close>Cancel</button><button class='button'>Save</button></div></form>`; openModal(`${isNew?'Add':'Edit'} subject`, content, async(form)=>{ const data = Object.fromEntries(new FormData(form)); if (isNew) await createSubject(data); else await updateSubject(id,data); closeModal(); toast('Subject saved.','success'); refreshAll(true); }); return; }
  if (type==='score'){ const item = state.scores.find(s=>s.id===id) || {}; const studentOptions = state.students.map(st=>`<option value='${st.id}' ${st.id===item.studentId?'selected':''}>${esc(st.fullName)} (${esc(st.className)})</option>`).join(''); const subjectOptions = state.subjects.map(sub=>`<option value='${sub.id}' ${sub.id===item.subjectId?'selected':''}>${esc(sub.name)}</option>`).join(''); const content = `<form id='record-form'><label>Student<select name='studentId' required><option value=''>Select...</option>${studentOptions}</select></label><label>Subject<select name='subjectId' required><option value=''>Select...</option>${subjectOptions}</select></label><label>Score<input name='score' type='number' min='0' max='100' required value='${esc(item.score||'')}'></label><div class='modal-footer'><button type='button' class='button secondary' data-close>Cancel</button><button class='button'>Save</button></div></form>`; openModal(`${isNew?'Assign':'Edit'} score`, content, async(form)=>{ const data = Object.fromEntries(new FormData(form)); data.score = Number(data.score); if (data.score < 0 || data.score > 100) throw new Error('Score must be between 0 and 100'); if (isNew && state.scores.some(s=>s.student && s.student.id===data.studentId && s.subject && s.subject.id===data.subjectId)) throw new Error('Duplicate score for this student and subject'); if (isNew) await assignScore(data); else await updateScore(id, { score: data.score }); closeModal(); toast('Score saved.','success'); refreshAll(true); }); return; }
}

function confirmDelete(type,id){ openModal('Confirm deletion', `<div class='modal-content'><p>Delete this record? This action cannot be undone.</p><div class='modal-footer'><button class='button secondary' data-close>Cancel</button><button id='confirm-delete' class='button danger'>Delete</button></div></div>`); document.getElementById('confirm-delete').onclick = async ()=>{ try{ if (type==='students') await deleteStudent(id); else if (type==='subjects') await deleteSubject(id); else if (type==='classes') await deleteClass(id); else if (type==='scores') await deleteScore(id); closeModal(); toast('Deleted.','success'); refreshAll(true); } catch(err){ toast(err.message,'error'); } } }

function openProfile(studentId){
  const student = state.students.find(s=>s.id===studentId); if (!student) return;
  const stuScores = state.scores.filter((s)=> s.student?.id === studentId);
  const avg = stuScores.length ? (stuScores.reduce((a,b)=>a+b.score,0)/stuScores.length).toFixed(2) : '—';
  const best = stuScores.length ? stuScores.reduce((bestScore,s) => s.score > bestScore.score ? s : bestScore, stuScores[0]) : null;
  const lowest = stuScores.length ? stuScores.reduce((lowScore,s) => s.score < lowScore.score ? s : lowScore, stuScores[0]) : null;
  const rows = stuScores.map(s=>`<tr><td>${esc(s.subject?.name||'Unknown')}</td><td>${s.score}</td><td>${esc(s.grade)}</td><td>${esc(s.remark)}</td></tr>`).join('') || `<tr><td colspan='4' class='muted'>No scores recorded.</td></tr>`;
  const content = `<div class='profile-sheet'><h3>${esc(student.fullName)}</h3><p><strong>Class:</strong> ${esc(student.className)}</p><p><strong>Gender:</strong> ${esc(student.gender)} · <strong>Age:</strong> ${esc(student.age)}</p><p><strong>Parent contact:</strong> ${esc(student.parentContact)}</p><div class='profile-summary'><div><strong>Average score</strong><p>${avg}</p></div><div><strong>Best subject</strong><p>${best ? esc(best.subject?.name) + ' (' + best.score + ')' : '—'}</p></div><div><strong>Lowest subject</strong><p>${lowest ? esc(lowest.subject?.name) + ' (' + lowest.score + ')' : '—'}</p></div></div><h4>Scores (${stuScores.length})</h4><table class='table-card'><thead><tr><th>Subject</th><th>Score</th><th>Grade</th><th>Remark</th></tr></thead><tbody>${rows}</tbody></table></div>`;
  openModal('Student profile', content, null);
}

function openClassDetails(classId){
  const clazz = state.classes.find((c)=>c.id===classId); if (!clazz) return;
  const assignedStudents = state.students.filter((s)=>s.className === clazz.name);
  const rows = assignedStudents.map((student)=>`<tr><td>${esc(student.fullName)}</td><td>${esc(student.gender)}</td><td>${student.age}</td><td>${esc(student.parentContact)}</td></tr>`).join('') || `<tr><td colspan='4' class='muted'>No students assigned to this class yet.</td></tr>`;
  const content = `<div class='profile-sheet'><h3>${esc(clazz.name)}</h3><p><strong>Level:</strong> Grade ${clazz.level}</p><p><strong>Capacity:</strong> ${clazz.capacity}</p><p><strong>Current students:</strong> ${assignedStudents.length}</p><h4>Class roster</h4><table class='table-card'><thead><tr><th>Student</th><th>Gender</th><th>Age</th><th>Parent contact</th></tr></thead><tbody>${rows}</tbody></table></div>`;
  openModal('Class profile', content, null);
}

function openModal(title,content,submit){ document.getElementById('modal-root').innerHTML = `<div class='modal-backdrop'><div class='modal'><header><h2>${title}</h2><button class='icon-button' data-close>x</button></header>${content}</div></div>`; document.querySelectorAll('[data-close]').forEach(b=>b.onclick=closeModal); const form = document.getElementById('record-form'); if (form && submit) form.onsubmit = async (e)=>{ e.preventDefault(); try{ await submit(form); } catch(err){ toast(err.message,'error'); } }; }

function closeModal(){ document.getElementById('modal-root').innerHTML = ''; }

function input(name,label,value='',type='text'){ return `<label>${label}<input name='${name}' type='${type}' value='${esc(value)}' required></label>`; }

function esc(value){ const div = document.createElement('div'); div.textContent = value ?? ''; return div.innerHTML; }

function skeleton(){ return `<section class='page'><div class='skeleton' style='width:180px'></div><div class='stats' style='margin-top:24px'>${[1,2,3,4].map(()=>'<div class=skeleton style=height:116px></div>').join('')}</div></section>`; }

function stat(label,value){ return `<article class='stat'><span>${label}</span><strong>${value}</strong><small>Live record</small></article>`; }

function toast(message,type='info'){ const toastElement = document.createElement('div'); toastElement.className = `toast ${type}`; toastElement.textContent = message; document.getElementById('toast-region').appendChild(toastElement); setTimeout(()=> toastElement.remove(), 3500); }
