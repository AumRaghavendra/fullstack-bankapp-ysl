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
let loggedInUsername = localStorage.getItem('username');

// check if already logged in on page load
window.onload = () => {
    if (token) showApp();
    else showAuth();
}

function showApp() {
    document.getElementById('auth-page').style.display = 'none';
    document.getElementById('app-page').style.display = 'flex';

    if (userRole === 'ADMIN') {
        // show admin nav, hide user nav
        document.getElementById('user-nav').style.display = 'none';
        document.getElementById('admin-nav').style.display = 'flex';
        // hide all user sections, show admin panel
        document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
        document.getElementById('admin-panel').classList.add('active');
        // set admin welcome name
        const adminWelcome = document.getElementById('admin-welcome-username');
        if (adminWelcome) adminWelcome.textContent = loggedInUsername || 'Admin';
        loadAdminPanel();
    } else {
        // show user nav, hide admin nav
        document.getElementById('user-nav').style.display = 'flex';
        document.getElementById('admin-nav').style.display = 'none';
        // set welcome name
        const welcomeEl = document.getElementById('welcome-username');
        if (welcomeEl) welcomeEl.textContent = loggedInUsername || 'there';
        document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
        document.getElementById('dashboard').classList.add('active');
        loadAccounts();
    }
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

// login
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
            loggedInUsername = username;
            localStorage.setItem('token', token);
            localStorage.setItem('role', userRole);
            localStorage.setItem('username', loggedInUsername);
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
    localStorage.removeItem('username');
    token = null;
    userRole = null;
    loggedInUsername = null;
    showAuth();
}

// auth headers helper
function authHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

// USER navigation
function showSection(id) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('#user-nav .nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    event.target.classList.add('active');
    if (id === 'dashboard') loadAccounts();
}

// ADMIN navigation
function showAdminSection(id) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('#admin-nav .nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    event.target.classList.add('active');
    if (id === 'admin-panel') loadAdminPanel();
    if (id === 'admin-accounts') loadAdminAccounts();
    if (id === 'admin-users-section') loadAdminUsers();
}

// show messages
function showMsg(id, text, type) {
    const el = document.getElementById(id);
    el.textContent = text;
    el.className = 'msg ' + type;
}

// ===== USER FUNCTIONS =====

async function loadAccounts() {
    const grid = document.getElementById('accounts-grid');
    grid.innerHTML = '<div class="empty-state">Loading...</div>';
    try {
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
                <div class="acc-balance">₹${acc.balance.toLocaleString('en-IN', {minimumFractionDigits: 2})}</div>
                <div class="acc-balance-label">Available Balance</div>
            </div>
        `).join('');
    } catch (e) {
        grid.innerHTML = '<div class="empty-state">Could not connect to server.</div>';
    }
}

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

// ===== ADMIN FUNCTIONS =====

async function loadAdminPanel() {
    // load stats and recent accounts in parallel
    try {
        const [accountsRes, usersRes] = await Promise.all([
            fetch(`${API}/accounts`, { headers: authHeaders() }),
            fetch(`${API}/accounts/admin/users`, { headers: authHeaders() })
        ]);

        const accounts = await accountsRes.json();
        const users = await usersRes.json();

        const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);

        document.getElementById('stat-users').textContent = users.length;
        document.getElementById('stat-accounts').textContent = accounts.length;
        document.getElementById('stat-balance').textContent =
            '₹' + totalBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 });

        // show last 5 accounts as preview
        const recent = accounts.slice(-5).reverse();
        const wrap = document.getElementById('admin-recent-accounts');
        if (recent.length === 0) {
            wrap.innerHTML = '<div class="empty-state">No accounts yet.</div>';
            return;
        }
        wrap.innerHTML = buildAccountsTable(recent);

    } catch (e) {
        document.getElementById('admin-recent-accounts').innerHTML =
            '<div class="empty-state">Could not load data.</div>';
    }
}

async function loadAdminAccounts() {
    const wrap = document.getElementById('admin-accounts-table');
    wrap.innerHTML = '<div class="empty-state">Loading...</div>';
    try {
        const res = await fetch(`${API}/accounts`, { headers: authHeaders() });
        const accounts = await res.json();
        if (accounts.length === 0) {
            wrap.innerHTML = '<div class="empty-state">No accounts found.</div>';
            return;
        }
        wrap.innerHTML = buildAccountsTable(accounts);
    } catch (e) {
        wrap.innerHTML = '<div class="empty-state">Could not load accounts.</div>';
    }
}

async function loadAdminUsers() {
    const wrap = document.getElementById('admin-users-table');
    wrap.innerHTML = '<div class="empty-state">Loading...</div>';
    try {
        const res = await fetch(`${API}/accounts/admin/users`, { headers: authHeaders() });
        const users = await res.json();
        if (users.length === 0) {
            wrap.innerHTML = '<div class="empty-state">No users found.</div>';
            return;
        }
        wrap.innerHTML = `
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Username</th>
                    </tr>
                </thead>
                <tbody>
                    ${users.map((u, i) => `
                        <tr>
                            <td class="muted">${i + 1}</td>
                            <td>${u}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } catch (e) {
        wrap.innerHTML = '<div class="empty-state">Could not load users.</div>';
    }
}

// builds the accounts table HTML — used in both overview and all-accounts
function buildAccountsTable(accounts) {
    return `
        <table class="admin-table">
            <thead>
                <tr>
                    <th>Owner</th>
                    <th>Holder Name</th>
                    <th>Account No.</th>
                    <th>Balance</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
                ${accounts.map(acc => `
                    <tr>
                        <td class="muted">${acc.username}</td>
                        <td>${acc.accountHolderName}</td>
                        <td class="mono">${acc.accountNumber}</td>
                        <td class="accent">₹${acc.balance.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                        <td>
                            <button class="btn-delete" onclick="adminDeleteAccount('${acc.accountNumber}')">Delete</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

async function adminDeleteAccount(accountNumber) {
    if (!confirm(`Delete account ${accountNumber}? This cannot be undone.`)) return;
    try {
        const res = await fetch(`${API}/accounts/${accountNumber}`, {
            method: 'DELETE',
            headers: authHeaders()
        });
        if (res.ok) {
            // refresh whichever table is currently visible
            const allAccountsActive = document.getElementById('admin-accounts').classList.contains('active');
            if (allAccountsActive) loadAdminAccounts();
            else loadAdminPanel();
        } else {
            const err = await res.text();
            alert('Could not delete: ' + err);
        }
    } catch (e) {
        alert('Could not connect.');
    }
}