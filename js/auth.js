/* Shared helpers: validation, login/sign-up (localStorage demo), navbar */
const Auth = {
  emailRe: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/,
  phoneRe: /^[0-9]{10}$/,

  validEmail(v){ return this.emailRe.test(v.trim()); },
  validPhone(v){ return this.phoneRe.test(v); },        // exactly 10 digits

  async hash(text){
    try{
      const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
      return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
    }catch(e){ // fallback if crypto.subtle is unavailable
      let h = 5381; for(const c of text) h = ((h << 5) + h) + c.charCodeAt(0);
      return 'x' + (h >>> 0).toString(16);
    }
  },
  users(){
    const list = JSON.parse(localStorage.getItem('cf_users') || '[]');
    if(!list.some(u => u.email === 'admin@example.com')){
      list.push({
        name: 'Administrator',
        email: 'admin@example.com',
        phone: '9876543210',
        pass: '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9' // SHA-256 for admin123
      });
      localStorage.setItem('cf_users', JSON.stringify(list));
    }
    return list;
  },
  current(){ return JSON.parse(localStorage.getItem('cf_session') || 'null'); },

  async register({name,email,phone,password}){
    const list = this.users();
    email = email.trim().toLowerCase();
    if(list.some(u => u.email === email)) return {ok:false, msg:'This email is already registered. Please log in.'};
    list.push({name:name.trim(), email, phone, pass: await this.hash(password)});
    localStorage.setItem('cf_users', JSON.stringify(list));
    return {ok:true};
  },
  async login({email,phone,password}){
    email = email.trim().toLowerCase();
    const u = this.users().find(u => u.email === email);
    if(!u) return {ok:false, msg:'No account found with this email. Please sign up first.'};
    if(u.phone !== phone) return {ok:false, msg:'Phone number does not match this account.'};
    if(u.pass !== await this.hash(password)) return {ok:false, msg:'Incorrect password.'};
    localStorage.setItem('cf_session', JSON.stringify({name:u.name,email:u.email}));
    return {ok:true};
  },
  logout(){ localStorage.removeItem('cf_session'); location.href = 'login.html'; },
  demoLogin(){
    const demo = { name: 'Administrator', email: 'admin@example.com' };
    localStorage.setItem('cf_session', JSON.stringify(demo));
    const hkey = 'cf_history_' + demo.email;
    if(!localStorage.getItem(hkey)){
      localStorage.setItem(hkey, JSON.stringify([
        { date: new Date().toLocaleDateString(), annual: 2150, score: 73, level: 'Low' }
      ]));
    }
    return demo;
  },
  requireLogin(){ if(!this.current()) { location.replace('login.html'); } },

  /* allow only digits while typing in phone boxes */
  bindPhone(input){ input.addEventListener('input', () => { input.value = input.value.replace(/\D/g,'').slice(0,10); }); },

  setErr(input, text){
    const holder = input.closest('div.pw') ? input.closest('div.pw').parentElement : input.parentElement;
    const e = holder.querySelector('.err');
    if(e) e.textContent = text || '';
    input.classList.toggle('bad', !!text);
    input.classList.toggle('good', !text && input.value !== '');
    return !text;
  },

  nav(active){
    const u = this.current();
    const pages = [['index.html','Home'],['calculator.html','Calculator'],['learn.html','Learn'],['about.html','About Us']];
    const el = document.getElementById('nav'); if(!el) return;
    el.className = 'nav';
    el.innerHTML = '<div class="nav-in"><a class="brand" href="index.html">🌍 CarbonTrack</a><nav class="links"></nav><div class="userbox"></div></div>';
    const links = el.querySelector('.links');
    pages.forEach(([h,t]) => { const a = document.createElement('a'); a.href = h; a.textContent = t; if(h === active) a.className = 'active'; links.appendChild(a); });
    const box = el.querySelector('.userbox');
    const s = document.createElement('span'); s.textContent = '👤 ' + (u ? u.name.split(' ')[0] : ''); box.appendChild(s);
    const b = document.createElement('button'); b.textContent = 'Logout'; b.onclick = () => Auth.logout(); box.appendChild(b);
  }
};
