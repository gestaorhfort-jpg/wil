const KEY = "rh_connect_state_v1";

const permissions = {
  colaborador: {
    views: ["dashboard", "avaliacoes", "agenda", "contatos", "social", "chat", "perfil"],
    canCreateTask: false,
    canCreateReview: false,
    canCreateGoal: false,
  },
  gestor: {
    views: ["dashboard", "avaliacoes", "feedback", "tarefas", "agenda", "contatos", "social", "chat", "perfil", "organograma"],
    canCreateTask: true,
    canCreateReview: true,
    canCreateGoal: true,
  },
  rh: {
    views: ["dashboard", "avaliacoes", "feedback", "tarefas", "agenda", "contatos", "social", "chat", "perfil", "organograma", "admin"],
    canCreateTask: true,
    canCreateReview: true,
    canCreateGoal: true,
  },
};

function seed() {
  const users = [
    { id: crypto.randomUUID(), name: "Aline Santos", email: "aline@empresa.com", password: "1234", role: "rh", jobTitle: "Business Partner RH", department: "RH", bio: "Conecto pessoas, cultura e performance.", resume: "10 anos em RH, foco em desenvolvimento.", mood: "😊 Motivado", kudosSent: 4, companyStart: "2020-03-12", birthday: "1990-10-18" },
    { id: crypto.randomUUID(), name: "Carlos Mendes", email: "carlos@empresa.com", password: "1234", role: "gestor", jobTitle: "Gestor de Produto", department: "Produto", bio: "Transformando estratégia em entregas.", resume: "Liderança de squads e roadmap de produto.", mood: "😐 Neutro", kudosSent: 7, companyStart: "2019-06-05", birthday: "1988-10-21" },
    { id: crypto.randomUUID(), name: "Juliana Rocha", email: "juliana@empresa.com", password: "1234", role: "colaborador", jobTitle: "Analista de Marketing", department: "Marketing", bio: "Apaixonada por marca e performance.", resume: "Mídia, CRM e eventos corporativos.", mood: "😊 Motivado", kudosSent: 2, companyStart: "2022-10-15", birthday: "1996-10-08" },
    { id: crypto.randomUUID(), name: "Pedro Lima", email: "pedro@empresa.com", password: "1234", role: "colaborador", jobTitle: "Desenvolvedor Full Stack", department: "Tecnologia", bio: "Construindo produtos internos para escala.", resume: "Node, React e automações.", mood: "😓 Sobrecarregado", kudosSent: 5, companyStart: "2021-10-20", birthday: "1994-11-12" },
  ];

  return {
    users,
    currentUserId: null,
    tasks: [
      { id: crypto.randomUUID(), title: "Concluir PDI trimestral", description: "Registrar ações do plano de desenvolvimento.", fromUserId: users[0].id, toUserId: users[2].id, dueDate: "2026-11-05", status: "pendente" },
      { id: crypto.randomUUID(), title: "Avaliar performance do time", description: "Fechar ciclo de avaliação 360.", fromUserId: users[0].id, toUserId: users[1].id, dueDate: "2026-11-10", status: "em andamento" }
    ],
    reviews: [
      { id: crypto.randomUUID(), userId: users[2].id, evaluatorId: users[1].id, score: 4, comment: "Excelente colaboração com o time.", period: "Q3/2026" },
      { id: crypto.randomUUID(), userId: users[3].id, evaluatorId: users[1].id, score: 3, comment: "Boa execução técnica, evoluir comunicação.", period: "Q3/2026" }
    ],
    feedbacks: [
      { id: crypto.randomUUID(), fromUserId: users[1].id, toUserId: users[2].id, text: "Obrigado por apoiar a campanha do lançamento!", date: new Date().toISOString() }
    ],
    events: [
      { id: crypto.randomUUID(), userId: users[2].id, title: "1:1 com gestor", date: "2026-11-02", type: "agenda" },
      { id: crypto.randomUUID(), userId: users[3].id, title: "Treinamento de liderança", date: "2026-11-07", type: "treinamento" }
    ],
    posts: [
      { id: crypto.randomUUID(), authorId: users[2].id, content: "Fechamos +22% na campanha! Obrigada equipe 🚀", likes: [] },
      { id: crypto.randomUUID(), authorId: users[3].id, content: "Compartilhei um guia de boas práticas no wiki interno.", likes: [users[1].id] }
    ],
    chats: [
      { id: crypto.randomUUID(), fromUserId: users[0].id, toUserId: users[3].id, text: "Pedro, pode atualizar seu PDI até sexta?", date: new Date().toISOString() }
    ]
  };
}

function loadState() {
  const raw = localStorage.getItem(KEY);
  if (!raw) {
    const s = seed();
    saveState(s);
    return s;
  }
  return JSON.parse(raw);
}
function saveState(state) { localStorage.setItem(KEY, JSON.stringify(state)); }

let state = loadState();
let activeTab = "dashboard";
let socialSelectedUserId = null;

const authSection = document.getElementById("auth-section");
const appSection = document.getElementById("app-section");
const sessionInfo = document.getElementById("session-info");
const tabsEl = document.getElementById("tabs");
const viewEl = document.getElementById("view");

document.getElementById("login-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const data = new FormData(e.target);
  const user = state.users.find((u) => u.email === data.get("email") && u.password === data.get("password"));
  if (!user) return alert("Credenciais inválidas");
  state.currentUserId = user.id;
  saveState(state);
  render();
});

document.getElementById("register-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const data = new FormData(e.target);
  if (state.users.some((u) => u.email === data.get("email"))) return alert("Email já cadastrado");
  state.users.push({
    id: crypto.randomUUID(),
    name: data.get("name"),
    email: data.get("email"),
    password: data.get("password"),
    role: data.get("role"),
    jobTitle: data.get("jobTitle"),
    department: data.get("department"),
    bio: "", resume: "", mood: data.get("mood"), kudosSent: 0,
    companyStart: new Date().toISOString().slice(0,10),
    birthday: "1990-01-01"
  });
  saveState(state);
  e.target.reset();
  alert("Usuário criado com sucesso.");
});

function getCurrentUser() { return state.users.find((u) => u.id === state.currentUserId); }
function byId(id) { return state.users.find((u) => u.id === id); }

function renderTabs(user) {
  tabsEl.innerHTML = "";
  permissions[user.role].views.forEach((tab) => {
    const btn = document.createElement("button");
    btn.className = `tab-btn ${tab === activeTab ? "active" : ""}`;
    btn.textContent = tab[0].toUpperCase() + tab.slice(1);
    btn.onclick = () => { activeTab = tab; render(); };
    tabsEl.appendChild(btn);
  });
  const logout = document.createElement("button");
  logout.className = "tab-btn secondary";
  logout.textContent = "Sair";
  logout.onclick = () => { state.currentUserId = null; saveState(state); render(); };
  tabsEl.appendChild(logout);
}

function anniversaries() {
  const month = new Date().toISOString().slice(5, 7);
  const birthday = state.users.filter((u) => u.birthday.slice(5, 7) === month);
  const company = state.users.filter((u) => u.companyStart.slice(5, 7) === month);
  return { birthday, company };
}

function renderDashboard(user) {
  const mineTasks = state.tasks.filter((t) => t.toUserId === user.id);
  const mineReviews = state.reviews.filter((r) => r.userId === user.id);
  const a = anniversaries();
  return `
    <h2>Bem-vindo(a), ${user.name}</h2>
    <p class="small">Visão central de RH: compromissos, avaliações, aniversariantes e ações pendentes.</p>
    <div class="grid-2">
      <div class="item"><h4>Meus compromissos</h4>${mineTasks.map((t) => `<p>• ${t.title} <span class='badge'>${t.status}</span> (${t.dueDate})</p>`).join("") || "Sem compromissos."}</div>
      <div class="item"><h4>Minhas avaliações</h4>${mineReviews.map((r) => `<p>• ${r.period}: nota ${r.score}/5</p>`).join("") || "Sem avaliações."}</div>
      <div class="item"><h4>Aniversariantes do mês</h4>${a.birthday.map((u) => `<p>🎂 ${u.name} - ${u.birthday.slice(8,10)}/${u.birthday.slice(5,7)}</p>`).join("") || "Sem aniversários."}</div>
      <div class="item"><h4>Aniversário de empresa</h4>${a.company.map((u) => `<p>🏢 ${u.name} - desde ${u.companyStart}</p>`).join("") || "Sem marcos."}</div>
    </div>
  `;
}

function renderReviews(user) {
  const can = permissions[user.role].canCreateReview;
  const visible = user.role === "colaborador" ? state.reviews.filter((r) => r.userId === user.id) : state.reviews;
  return `
    <h2>Avaliações de desempenho</h2>
    ${can ? `
      <form id="review-form" class="grid-2 item">
        <label>Colaborador
          <select name="userId">${state.users.filter((u) => u.role === "colaborador").map((u) => `<option value="${u.id}">${u.name}</option>`).join("")}</select>
        </label>
        <label>Período <input name="period" required placeholder="Q4/2026" /></label>
        <label>Nota (1-5) <input name="score" type="number" min="1" max="5" required /></label>
        <label>Comentário <input name="comment" required /></label>
        <button type="submit">Salvar avaliação</button>
      </form>` : ""}
    <div>${visible.map((r) => `<div class='item'><h4>${byId(r.userId).name} - ${r.period}</h4><p>Nota: ${r.score}/5</p><p>${r.comment}</p><p class='small'>Avaliador: ${byId(r.evaluatorId).name}</p></div>`).join("")}</div>
  `;
}

function renderFeedback(user) {
  const visible = user.role === "colaborador" ? state.feedbacks.filter((f) => f.toUserId === user.id || f.fromUserId === user.id) : state.feedbacks;
  return `
    <h2>Feedback contínuo</h2>
    <form id="feedback-form" class="grid-2 item">
      <label>Para
        <select name="toUserId">${state.users.filter((u) => u.id !== user.id).map((u) => `<option value="${u.id}">${u.name}</option>`).join("")}</select>
      </label>
      <label>Mensagem <input name="text" required placeholder="Reconhecimento, orientação, etc." /></label>
      <button type="submit">Enviar feedback</button>
    </form>
    ${visible.map((f) => `<div class='item'><p>${f.text}</p><p class='small'>${byId(f.fromUserId).name} ➜ ${byId(f.toUserId).name}</p></div>`).join("")}
  `;
}

function renderTasks(user) {
  const can = permissions[user.role].canCreateTask;
  const visible = user.role === "colaborador" ? state.tasks.filter((t) => t.toUserId === user.id) : state.tasks;
  return `
    <h2>Tarefas RH para colaboradores e gestores</h2>
    ${can ? `<form id='task-form' class='grid-2 item'>
      <label>Título <input name='title' required /></label>
      <label>Responsável
        <select name='toUserId'>${state.users.filter((u) => u.id !== user.id).map((u) => `<option value='${u.id}'>${u.name} (${u.role})</option>`).join("")}</select>
      </label>
      <label>Prazo <input type='date' name='dueDate' required /></label>
      <label>Descrição <input name='description' required /></label>
      <button type='submit'>Criar tarefa</button>
    </form>` : ""}
    ${visible.map((t) => `<div class='item'><h4>${t.title}</h4><p>${t.description}</p><p class='small'>Para: ${byId(t.toUserId).name} | De: ${byId(t.fromUserId).name}</p><div class='row'><span class='badge'>${t.status}</span>${t.toUserId===user.id?`<button data-task='${t.id}' class='secondary'>Marcar concluída</button>`:""}</div></div>`).join("")}
  `;
}

function renderAgenda(user) {
  const canSeeAll = user.role !== "colaborador";
  const visible = canSeeAll ? state.events : state.events.filter((e) => e.userId === user.id);
  return `
    <h2>Calendário e agenda</h2>
    <form id="event-form" class="grid-2 item">
      <label>Título <input name="title" required /></label>
      <label>Data <input type="date" name="date" required /></label>
      <label>Tipo
        <select name="type"><option>agenda</option><option>treinamento</option><option>reunião</option></select>
      </label>
      ${canSeeAll ? `<label>Colaborador
      <select name="userId">${state.users.map((u) => `<option value="${u.id}">${u.name}</option>`).join("")}</select>
      </label>` : `<input type='hidden' name='userId' value='${user.id}' />`}
      <button type="submit">Adicionar evento</button>
    </form>
    ${visible.map((e) => `<div class='item'><h4>${e.title}</h4><p>${e.date} - ${e.type}</p><p class='small'>Pessoa: ${byId(e.userId).name}</p></div>`).join("")}
  `;
}

function renderContacts() {
  return `
    <h2>Lista de contatos internos</h2>
    <div class="grid-2">${state.users.map((u) => `<div class='item'><h4>${u.name}</h4><p>${u.jobTitle} - ${u.department}</p><p>${u.email}</p><span class='badge'>${u.role}</span></div>`).join("")}</div>
  `;
}

function renderSocial(user) {
  socialSelectedUserId = socialSelectedUserId || user.id;
  const profile = byId(socialSelectedUserId);
  return `
    <h2>Mini Facebook Corporativo</h2>
    <div class='grid-2'>
      <div class='item'>
        <h3>Perfis</h3>
        ${state.users.map((u) => `<button data-profile='${u.id}' class='secondary'>${u.name}</button>`).join("")}
      </div>
      <div class='item'>
        <h3>Perfil de ${profile.name}</h3>
        <p><strong>Bio:</strong> ${profile.bio || "Sem bio"}</p>
        <p><strong>Função:</strong> ${profile.jobTitle}</p>
        <p><strong>Mini currículo:</strong> ${profile.resume || "Não informado"}</p>
        <p><strong>Humor:</strong> ${profile.mood}</p>
        <p><strong>Elogios enviados:</strong> ${profile.kudosSent}</p>
      </div>
    </div>
    <form id='post-form' class='item'>
      <label>Publicar no feed interno <textarea name='content' required></textarea></label>
      <button type='submit'>Publicar</button>
    </form>
    <div class='item'>
      ${state.posts.map((p) => `<div class='feed-post'><p>${p.content}</p><p class='small'>por ${byId(p.authorId).name}</p><button data-like='${p.id}'>Curtir (${p.likes.length})</button></div>`).join("")}
    </div>
  `;
}

function renderChat(user) {
  return `
    <h2>Chat interno</h2>
    <form id='chat-form' class='grid-2 item'>
      <label>Conversar com
        <select name='toUserId'>${state.users.filter((u) => u.id !== user.id).map((u) => `<option value='${u.id}'>${u.name}</option>`).join("")}</select>
      </label>
      <label>Mensagem <input name='text' required /></label>
      <button type='submit'>Enviar</button>
    </form>
    <div class='chat-box'>
      ${state.chats.filter((m) => m.fromUserId === user.id || m.toUserId === user.id).map((m) => `<div class='msg'><div>${m.text}</div><div class='meta'>${byId(m.fromUserId).name} ➜ ${byId(m.toUserId).name}</div></div>`).join("")}
    </div>
  `;
}

function renderProfile(user) {
  return `
    <h2>Meu perfil</h2>
    <form id='profile-form' class='stack item'>
      <label>Bio <textarea name='bio'>${user.bio || ""}</textarea></label>
      <label>Mini currículo <textarea name='resume'>${user.resume || ""}</textarea></label>
      <label>Humor
        <select name='mood'>
          <option ${user.mood.includes("Motivado") ? "selected" : ""}>😊 Motivado</option>
          <option ${user.mood.includes("Neutro") ? "selected" : ""}>😐 Neutro</option>
          <option ${user.mood.includes("Sobrecarregado") ? "selected" : ""}>😓 Sobrecarregado</option>
        </select>
      </label>
      <button type='submit'>Salvar perfil</button>
    </form>
  `;
}

function renderOrg() {
  return `<h2>Organograma</h2>
  ${state.users.filter((u)=>u.role==='rh').map((u)=>`<div class='org'><strong>RH:</strong> ${u.name} (${u.jobTitle})</div>`).join("")}
  ${state.users.filter((u)=>u.role==='gestor').map((u)=>`<div class='org'><strong>Gestor:</strong> ${u.name} (${u.jobTitle})</div>`).join("")}
  ${state.users.filter((u)=>u.role==='colaborador').map((u)=>`<div class='org'><strong>Colaborador:</strong> ${u.name} (${u.jobTitle})</div>`).join("")}
  <p class='small'>Observação: o PDF com contatos reais não foi disponibilizado neste ambiente; base inicial com dados de exemplo.</p>`;
}

function renderAdmin() {
  return `<h2>Administração de perfis e permissões</h2>
  <div class='item'>${state.users.map((u)=>`<p>${u.name} - ${u.role}</p>`).join("")}</div>`;
}

function attachHandlers(user) {
  document.getElementById("review-form")?.addEventListener("submit", (e) => {
    e.preventDefault(); const fd = new FormData(e.target);
    state.reviews.push({ id: crypto.randomUUID(), userId: fd.get("userId"), evaluatorId: user.id, score: Number(fd.get("score")), comment: fd.get("comment"), period: fd.get("period") });
    saveState(state); render();
  });
  document.getElementById("feedback-form")?.addEventListener("submit", (e) => {
    e.preventDefault(); const fd = new FormData(e.target);
    state.feedbacks.push({ id: crypto.randomUUID(), fromUserId: user.id, toUserId: fd.get("toUserId"), text: fd.get("text"), date: new Date().toISOString() });
    const me = byId(user.id); me.kudosSent += 1;
    saveState(state); render();
  });
  document.getElementById("task-form")?.addEventListener("submit", (e) => {
    e.preventDefault(); const fd = new FormData(e.target);
    state.tasks.push({ id: crypto.randomUUID(), title: fd.get("title"), description: fd.get("description"), fromUserId: user.id, toUserId: fd.get("toUserId"), dueDate: fd.get("dueDate"), status: "pendente" });
    saveState(state); render();
  });
  document.querySelectorAll("[data-task]").forEach((btn) => btn.addEventListener("click", () => {
    const t = state.tasks.find((x) => x.id === btn.dataset.task);
    if (t) t.status = "concluída";
    saveState(state); render();
  }));
  document.getElementById("event-form")?.addEventListener("submit", (e) => {
    e.preventDefault(); const fd = new FormData(e.target);
    state.events.push({ id: crypto.randomUUID(), title: fd.get("title"), date: fd.get("date"), type: fd.get("type"), userId: fd.get("userId") });
    saveState(state); render();
  });
  document.getElementById("post-form")?.addEventListener("submit", (e) => {
    e.preventDefault(); const fd = new FormData(e.target);
    state.posts.unshift({ id: crypto.randomUUID(), authorId: user.id, content: fd.get("content"), likes: [] });
    saveState(state); render();
  });
  document.querySelectorAll("[data-like]").forEach((btn) => btn.addEventListener("click", () => {
    const p = state.posts.find((x) => x.id === btn.dataset.like);
    if (!p.likes.includes(user.id)) p.likes.push(user.id); else p.likes = p.likes.filter((id) => id !== user.id);
    saveState(state); render();
  }));
  document.querySelectorAll("[data-profile]").forEach((btn) => btn.addEventListener("click", () => {
    socialSelectedUserId = btn.dataset.profile;
    render();
  }));
  document.getElementById("chat-form")?.addEventListener("submit", (e) => {
    e.preventDefault(); const fd = new FormData(e.target);
    state.chats.push({ id: crypto.randomUUID(), fromUserId: user.id, toUserId: fd.get("toUserId"), text: fd.get("text"), date: new Date().toISOString() });
    saveState(state); render();
  });
  document.getElementById("profile-form")?.addEventListener("submit", (e) => {
    e.preventDefault(); const fd = new FormData(e.target);
    const me = byId(user.id);
    me.bio = fd.get("bio"); me.resume = fd.get("resume"); me.mood = fd.get("mood");
    saveState(state); render();
  });
}

function render() {
  const user = getCurrentUser();
  if (!user) {
    authSection.classList.remove("hidden");
    appSection.classList.add("hidden");
    sessionInfo.innerHTML = "";
    return;
  }

  authSection.classList.add("hidden");
  appSection.classList.remove("hidden");
  sessionInfo.innerHTML = `<span>${user.name} (${user.role})</span>`;

  if (!permissions[user.role].views.includes(activeTab)) activeTab = "dashboard";
  renderTabs(user);

  const map = {
    dashboard: renderDashboard,
    avaliacoes: renderReviews,
    feedback: renderFeedback,
    tarefas: renderTasks,
    agenda: renderAgenda,
    contatos: renderContacts,
    social: renderSocial,
    chat: renderChat,
    perfil: renderProfile,
    organograma: renderOrg,
    admin: renderAdmin,
  };
  viewEl.innerHTML = (map[activeTab] || renderDashboard)(user);
  attachHandlers(user);
}

render();
