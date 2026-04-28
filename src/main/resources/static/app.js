const API = 'https://fullstack-bankapp-ysl.onrender.com';

// toggle password visibility
function togglePassword(inputId, btn) {
    const input = document.getElementById(inputId);
    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';
    btn.innerHTML = isPassword
        ? `<svg class="eye-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`
        : `<svg class="eye-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
}

let token = localStorage.getItem('token');
let userRole = localStorage.getItem('role');

// check if already logged in on page load
window.onload = () => {
    if (token) showApp();
    else showAuth();
}

function showApp() {
    document.getElementById('auth-page').style.display = 'none';
    document.getElementById('app-page').style.display = 'flex';

    // show or hide admin nav buttons based on role
    document.querySelectorAll('.admin-only').forEach(el => {
        el.style.display = userRole === 'ADMIN' ? 'block' : 'none';
    });

    // show admin banner
    const banner = document.getElementById('admin-banner');
    if (banner) banner.style.display = userRole === 'ADMIN' ? 'block' : 'none';

    loadAccounts();
}

function showAuth() {
    document.getElementById('auth-page').style.display = 'flex';
    document.getElementById('app-page').style.display = 'none';
}

// auth tab switch
function switchTab(tab) {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
    document.getElementById('login-form').style.display = tab === 'login' ? 'block' : 'none';
    document.getElementById('register-form').style.display = tab === 'register' ? 'block' : 'none';
}

// register
async function register() {
    const username = document.getElementById('reg-username').value;
    const password = document.getElementById('reg-password').value;

    // frontend validation before hitting the server
    if (!username || username.trim() === '') {
        showMsg('register-msg', '✗ Username cannot be empty.', 'error');
        return;
    }
    if (!/[A-Z]/.test(password)) {
        showMsg('register-msg', '✗ Password must contain at least one uppercase letter.', 'error');
        return;
    }
    if (!/[0-9]/.test(password)) {
        showMsg('register-msg', '✗ Password must contain at least one number.', 'error');
        return;
    }
    if (!/[!@#$%^&*()_+\-=\[\]{}|;:\'",.<>\/?]/.test(password)) {
        showMsg('register-msg', '✗ Password must contain at least one special character.', 'error');
        return;
    }

    try {
        const res = await fetch(`${API}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const msg = await res.text();
        if (res.ok) {
            showMsg('register-msg', '✓ Registered! Please login.', 'success');
        } else {
            showMsg('register-msg', '✗ ' + msg, 'error');
        }
    } catch (e) {
        showMsg('register-msg', '✗ Could not connect.', 'error');
    }
}

// login — now reads token + role from json response
async function login() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    try {
        const res = await fetch(`${API}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        if (res.ok) {
            const data = await res.json();
            token = data.token;
            userRole = data.role;
            localStorage.setItem('token', token);
            localStorage.setItem('role', userRole);
            showApp();
        } else {
            const err = await res.text();
            showMsg('login-msg', '✗ ' + err, 'error');
        }
    } catch (e) {
        showMsg('login-msg', '✗ Could not connect.', 'error');
    }
}

// logout
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    token = null;
    userRole = null;
    showAuth();
}

// auth headers helper
function authHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

// navigation
function showSection(id) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    event.target.classList.add('active');
    if (id === 'dashboard') loadAccounts();
    if (id === 'admin-users') loadAllUsers();
}

// show messages
function showMsg(id, text, type) {
    const el = document.getElementById(id);
    el.textContent = text;
    el.className = 'msg ' + type;
}

// load accounts — backend already filters by role so no changes needed here
async function loadAccounts() {
    const grid = document.getElementById('accounts-grid');
    grid.innerHTML = '<div class="empty-state">Loading...</div>';
    try {
		const ownerTag = userRole === 'ADMIN' 
		    ? `<span class="account-owner">👤 ${acc.username}</span>` 
		    : '';
        const res = await fetch(`${API}/accounts`, { headers: authHeaders() });
        if (res.status === 401 || res.status === 403) { logout(); return; }
        const accounts = await res.json();
        if (accounts.length === 0) {
            grid.innerHTML = '<div class="empty-state">No accounts yet. Create one!</div>';
            return;
			
        }
        grid.innerHTML = accounts.map(acc => `
            <div class="account-card">
                <div class="acc-name">${acc.accountHolderName}</div>
                <div class="acc-number">${acc.accountNumber}</div>
                ${userRole === 'ADMIN' ? `<div class="acc-owner">Owner: ${acc.username}</div>` : ''}
                <div class="acc-balance">₹${acc.balance.toLocaleString('en-IN', {minimumFractionDigits: 2})}</div>
                <div class="acc-balance-label">Available Balance</div>
            </div>
        `).join('');
    } catch (e) {
        grid.innerHTML = '<div class="empty-state">Could not connect to server.</div>';
    }
}

// admin only — load all registered users
async function loadAllUsers() {
    const list = document.getElementById('users-list');
    if (!list) return;
    list.innerHTML = '<div class="empty-state">Loading...</div>';
    try {
        const res = await fetch(`${API}/accounts/admin/users`, { headers: authHeaders() });
        if (res.status === 403) {
            list.innerHTML = '<div class="empty-state">Access denied.</div>';
            return;
        }
        const users = await res.json();
        if (users.length === 0) {
            list.innerHTML = '<div class="empty-state">No users found.</div>';
            return;
        }
        list.innerHTML = users.map((u, i) => `
            <div class="user-row">
                <span class="user-index">#${i + 1}</span>
                <span class="user-name">${u}</span>
            </div>
        `).join('');
    } catch (e) {
        list.innerHTML = '<div class="empty-state">Could not load users.</div>';
    }
}

// create account
async function createAccount() {
    const name = document.getElementById('create-name').value;
    const accNum = document.getElementById('create-accnum').value;
    const balance = document.getElementById('create-balance').value;
    try {
        const res = await fetch(`${API}/accounts`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({ accountHolderName: name, accountNumber: accNum, balance: parseFloat(balance) })
        });
        if (res.ok) {
            showMsg('create-msg', '✓ Account created!', 'success');
            document.getElementById('create-name').value = '';
            document.getElementById('create-accnum').value = '';
            document.getElementById('create-balance').value = '';
        } else {
            const err = await res.text();
            showMsg('create-msg', '✗ ' + err, 'error');
        }
    } catch (e) {
        showMsg('create-msg', '✗ Could not connect.', 'error');
    }
}

// deposit
async function deposit() {
    const accNum = document.getElementById('deposit-accnum').value;
    const amount = document.getElementById('deposit-amount').value;
    try {
        const res = await fetch(`${API}/accounts/${accNum}/deposit?amount=${amount}`, {
            method: 'PUT',
            headers: authHeaders()
        });
        if (res.ok) {
            const acc = await res.json();
            showMsg('deposit-msg', `✓ Deposited ₹${amount}. New balance: ₹${acc.balance}`, 'success');
        } else {
            const err = await res.text();
            showMsg('deposit-msg', '✗ ' + err, 'error');
        }
    } catch (e) {
        showMsg('deposit-msg', '✗ Could not connect.', 'error');
    }
}

// withdraw
async function withdraw() {
    const accNum = document.getElementById('withdraw-accnum').value;
    const amount = document.getElementById('withdraw-amount').value;
    try {
        const res = await fetch(`${API}/accounts/${accNum}/withdraw?amount=${amount}`, {
            method: 'PUT',
            headers: authHeaders()
        });
        if (res.ok) {
            const acc = await res.json();
            showMsg('withdraw-msg', `✓ Withdrawn ₹${amount}. New balance: ₹${acc.balance}`, 'success');
        } else {
            const err = await res.text();
            showMsg('withdraw-msg', '✗ ' + err, 'error');
        }
    } catch (e) {
        showMsg('withdraw-msg', '✗ Could not connect.', 'error');
    }
}

// transfer
async function transfer() {
    const from = document.getElementById('transfer-from').value;
    const to = document.getElementById('transfer-to').value;
    const amount = document.getElementById('transfer-amount').value;
    try {
        const res = await fetch(`${API}/accounts/transfer?fromAccount=${from}&toAccount=${to}&amount=${amount}`, {
            method: 'POST',
            headers: authHeaders()
        });
        if (res.ok) {
            const msg = await res.text();
            showMsg('transfer-msg', '✓ ' + msg, 'success');
        } else {
            const err = await res.text();
            showMsg('transfer-msg', '✗ ' + err, 'error');
        }
    } catch (e) {
        showMsg('transfer-msg', '✗ Could not connect.', 'error');
    }
}

// transaction history
async function loadHistory() {
    const accNum = document.getElementById('history-accnum').value;
    const list = document.getElementById('history-list');
    list.innerHTML = '<div class="empty-state">Loading...</div>';
    try {
        const res = await fetch(`${API}/accounts/${accNum}/transactions`, { headers: authHeaders() });
        const txns = await res.json();
        if (txns.length === 0) {
            list.innerHTML = '<div class="empty-state">No transactions found.</div>';
            return;
        }
        list.innerHTML = txns.reverse().map(tx => `
            <div class="history-item">
                <span class="tx-type ${tx.type}">${tx.type}</span>
                <div>
                    <div class="tx-amount">₹${tx.amount.toLocaleString('en-IN')}</div>
                    <div class="tx-balance">Balance after: ₹${tx.balanceAfter}</div>
                </div>
                <span class="tx-time">${new Date(tx.timestamp).toLocaleString('en-IN')}</span>
            </div>
        `).join('');
    } catch (e) {
        list.innerHTML = '<div class="empty-state">Could not load history.</div>';
    }
}