const API = 'https://fullstack-bankapp-ysl.onrender.com';

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
let userAccounts = [];

window.onload = () => {
    if (token) showApp();
    else showAuth();
}

function showApp() {
    document.getElementById('auth-page').style.display = 'none';
    document.getElementById('app-page').style.display = 'flex';

    if (userRole === 'ADMIN') {
        document.getElementById('user-nav').style.display = 'none';
        document.getElementById('admin-nav').style.display = 'flex';
        document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
        document.getElementById('admin-panel').classList.add('active');
        const el = document.getElementById('admin-welcome-username');
        if (el) el.textContent = loggedInUsername || 'Admin';
        loadAdminPanel();
    } else {
        document.getElementById('user-nav').style.display = 'flex';
        document.getElementById('admin-nav').style.display = 'none';
        const el = document.getElementById('welcome-username');
        if (el) el.textContent = loggedInUsername || 'there';
        document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
        document.getElementById('dashboard').classList.add('active');
        loadAccounts();
    }
}

function showAuth() {
    document.getElementById('auth-page').style.display = 'flex';
    document.getElementById('app-page').style.display = 'none';
}

function switchTab(tab) {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
    document.getElementById('login-form').style.display = tab === 'login' ? 'block' : 'none';
    document.getElementById('register-form').style.display = tab === 'register' ? 'block' : 'none';
}

async function register() {
    const username = document.getElementById('reg-username').value;
    const password = document.getElementById('reg-password').value;
    if (!username || username.trim() === '') { showMsg('register-msg', '✗ Username cannot be empty.', 'error'); return; }
    if (!/[A-Z]/.test(password)) { showMsg('register-msg', '✗ Password must contain at least one uppercase letter.', 'error'); return; }
    if (!/[0-9]/.test(password)) { showMsg('register-msg', '✗ Password must contain at least one number.', 'error'); return; }
    if (!/[!@#$%^&*()_+\-=\[\]{}|;:\'",.<>\/?]/.test(password)) { showMsg('register-msg', '✗ Password must contain at least one special character.', 'error'); return; }
    try {
        const res = await fetch(`${API}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const msg = await res.text();
        res.ok ? showMsg('register-msg', '✓ Registered! Please login.', 'success')
                : showMsg('register-msg', '✗ ' + msg, 'error');
    } catch (e) { showMsg('register-msg', '✗ Could not connect.', 'error'); }
}

// pt1 change 1 — login() with overlay show/hide
async function login() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    // show overlay
    document.getElementById('login-overlay').style.display = 'flex';

    try {
        const res = await fetch(`${API}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        if (res.ok) {
            const data = await res.json();
            token = data.token; userRole = data.role; loggedInUsername = username;
            localStorage.setItem('token', token);
            localStorage.setItem('role', userRole);
            localStorage.setItem('username', loggedInUsername);
            showApp();
        } else {
            document.getElementById('login-overlay').style.display = 'none';
            showMsg('login-msg', '✗ ' + await res.text(), 'error');
        }
    } catch (e) {
        document.getElementById('login-overlay').style.display = 'none';
        showMsg('login-msg', '✗ Could not connect.', 'error');
    }
}

// pt1 change 4 + pt2 change 1 — logout() hides overlay, now delegates to modal
function logout() {
    document.getElementById('login-overlay').style.display = 'none';
    openLogoutModal();
}

function authHeaders() {
    return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
}

// ===== NAVIGATION =====

function showSection(id) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('#user-nav .nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    event.target.classList.add('active');
    if (id === 'dashboard') loadAccounts();
    if (['deposit', 'withdraw', 'transfer', 'history'].includes(id)) populateDropdowns();
}

function showAdminSection(id) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('#admin-nav .nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    event.target.classList.add('active');
    if (id === 'admin-panel') loadAdminPanel();
    if (id === 'admin-accounts') loadAdminAccounts();
    if (id === 'admin-users-section') loadAdminUsers();
}

function showMsg(id, text, type) {
    const el = document.getElementById(id);
    el.textContent = text;
    el.className = 'msg ' + type;
}

// ===== DROPDOWN =====

async function populateDropdowns() {
    try {
        const res = await fetch(`${API}/accounts`, { headers: authHeaders() });
        if (!res.ok) return;
        userAccounts = await res.json();
        ['deposit-accnum', 'withdraw-accnum', 'transfer-from', 'history-accnum'].forEach(id => {
            renderDropdown(id, userAccounts);
        });
    } catch (e) { console.error('Dropdown load failed', e); }
}

function renderDropdown(selectId, accounts) {
    const sel = document.getElementById(selectId);
    if (!sel) return;
    sel.innerHTML = accounts.length === 0
        ? `<option value="">— No accounts yet —</option>`
        : `<option value="">Select account...</option>` +
          accounts.map(a =>
            `<option value="${a.accountNumber}">${a.accountNumber} — ${a.accountHolderName} (₹${a.balance.toLocaleString('en-IN')})</option>`
          ).join('');
}

// ===== USER FUNCTIONS =====

async function loadAccounts() {
    const grid = document.getElementById('accounts-grid');
    grid.innerHTML = '<div class="empty-state">Loading...</div>';
    try {
        const res = await fetch(`${API}/accounts`, { headers: authHeaders() });
        if (res.status === 401 || res.status === 403) { logout(); return; }
        userAccounts = await res.json();
        if (userAccounts.length === 0) {
            grid.innerHTML = '<div class="empty-state">No accounts yet. Create one!</div>';
            return;
        }
        // pt1 change 2 — added Delete button on each account card
        grid.innerHTML = userAccounts.map(acc => `
            <div class="account-card">
                <div class="acc-name">${acc.accountHolderName}</div>
                <div class="acc-number">${acc.accountNumber}</div>
                <div class="acc-balance">₹${acc.balance.toLocaleString('en-IN', {minimumFractionDigits: 2})}</div>
                <div class="acc-balance-label">Available Balance</div>
                <button class="btn-delete-card" onclick="openDeleteModal('${acc.accountNumber}')">Delete Account</button>
            </div>
        `).join('');
    } catch (e) {
        grid.innerHTML = '<div class="empty-state">Could not connect to server.</div>';
    }
}

async function createAccount() {
    const name = document.getElementById('create-name').value;
    const accNum = document.getElementById('create-accnum').value.trim();
    const balance = document.getElementById('create-balance').value;
    if (!accNum) { showMsg('create-msg', '✗ Account number cannot be empty.', 'error'); return; }
    try {
        const res = await fetch(`${API}/accounts`, {
            method: 'POST', headers: authHeaders(),
            body: JSON.stringify({ accountHolderName: name, accountNumber: accNum, balance: parseFloat(balance) })
        });
        if (res.ok) {
            showMsg('create-msg', '✓ Account created!', 'success');
            document.getElementById('create-name').value = '';
            document.getElementById('create-accnum').value = '';
            document.getElementById('create-balance').value = '';
            await loadAccounts();
        } else {
            showMsg('create-msg', '✗ ' + await res.text(), 'error');
        }
    } catch (e) { showMsg('create-msg', '✗ Could not connect.', 'error'); }
}

async function deposit() {
    const accNum = document.getElementById('deposit-accnum').value;
    const amount = document.getElementById('deposit-amount').value;
    if (!accNum) { showMsg('deposit-msg', '✗ Please select an account.', 'error'); return; }
    if (!amount || amount <= 0) { showMsg('deposit-msg', '✗ Enter a valid amount.', 'error'); return; }
    try {
        const res = await fetch(`${API}/accounts/${accNum}/deposit?amount=${amount}`, {
            method: 'PUT', headers: authHeaders()
        });
        if (res.ok) {
            const acc = await res.json();
            showMsg('deposit-msg', `✓ Deposited ₹${amount}. New balance: ₹${acc.balance.toLocaleString('en-IN')}`, 'success');
            document.getElementById('deposit-amount').value = '';
            await loadAccounts(); populateDropdowns();
        } else { showMsg('deposit-msg', '✗ ' + await res.text(), 'error'); }
    } catch (e) { showMsg('deposit-msg', '✗ Could not connect.', 'error'); }
}

async function withdraw() {
    const accNum = document.getElementById('withdraw-accnum').value;
    const amount = document.getElementById('withdraw-amount').value;
    if (!accNum) { showMsg('withdraw-msg', '✗ Please select an account.', 'error'); return; }
    if (!amount || amount <= 0) { showMsg('withdraw-msg', '✗ Enter a valid amount.', 'error'); return; }
    try {
        const res = await fetch(`${API}/accounts/${accNum}/withdraw?amount=${amount}`, {
            method: 'PUT', headers: authHeaders()
        });
        if (res.ok) {
            const acc = await res.json();
            showMsg('withdraw-msg', `✓ Withdrawn ₹${amount}. New balance: ₹${acc.balance.toLocaleString('en-IN')}`, 'success');
            document.getElementById('withdraw-amount').value = '';
            await loadAccounts(); populateDropdowns();
        } else { showMsg('withdraw-msg', '✗ ' + await res.text(), 'error'); }
    } catch (e) { showMsg('withdraw-msg', '✗ Could not connect.', 'error'); }
}

async function transfer() {
    const from = document.getElementById('transfer-from').value;
    const to = document.getElementById('transfer-to').value.trim();
    const amount = document.getElementById('transfer-amount').value;
    if (!from) { showMsg('transfer-msg', '✗ Please select your account.', 'error'); return; }
    if (!to) { showMsg('transfer-msg', '✗ Enter destination account number.', 'error'); return; }
    if (from === to) { showMsg('transfer-msg', '✗ Cannot transfer to the same account.', 'error'); return; }
    if (!amount || amount <= 0) { showMsg('transfer-msg', '✗ Enter a valid amount.', 'error'); return; }
    try {
        const res = await fetch(`${API}/accounts/transfer?fromAccount=${from}&toAccount=${to}&amount=${amount}`, {
            method: 'POST', headers: authHeaders()
        });
        if (res.ok) {
            showMsg('transfer-msg', '✓ ' + await res.text(), 'success');
            document.getElementById('transfer-to').value = '';
            document.getElementById('transfer-amount').value = '';
            await loadAccounts(); populateDropdowns();
        } else { showMsg('transfer-msg', '✗ ' + await res.text(), 'error'); }
    } catch (e) { showMsg('transfer-msg', '✗ Could not connect.', 'error'); }
}

async function loadHistory() {
    const accNum = document.getElementById('history-accnum').value;
    if (!accNum) return;
    const list = document.getElementById('history-list');
    list.innerHTML = '<div class="empty-state">Loading...</div>';
    try {
        const res = await fetch(`${API}/accounts/${accNum}/transactions`, { headers: authHeaders() });
        const txns = await res.json();
        if (txns.length === 0) { list.innerHTML = '<div class="empty-state">No transactions found.</div>'; return; }
        list.innerHTML = txns.reverse().map(tx => `
            <div class="history-item">
                <span class="tx-type ${tx.type.replace(' ', '-')}">${tx.type}</span>
                <div>
                    <div class="tx-amount">₹${tx.amount.toLocaleString('en-IN')}</div>
                    <div class="tx-balance">Balance after: ₹${tx.balanceAfter.toLocaleString('en-IN')}</div>
                </div>
                <span class="tx-time">${new Date(tx.timestamp).toLocaleString('en-IN')}</span>
            </div>
        `).join('');
    } catch (e) { list.innerHTML = '<div class="empty-state">Could not load history.</div>'; }
}

// ===== DELETE ACCOUNT MODAL (pt1 change 3) =====

function openDeleteModal(accountNumber) {
    document.getElementById('modal-acc-num').textContent = accountNumber;
    document.getElementById('modal-confirm-btn').onclick = () => confirmDeleteAccount(accountNumber);
    document.getElementById('delete-modal').style.display = 'flex';
}

function closeDeleteModal() {
    document.getElementById('delete-modal').style.display = 'none';
}

async function confirmDeleteAccount(accountNumber) {
    closeDeleteModal();
    try {
        const res = await fetch(`${API}/accounts/${accountNumber}`, {
            method: 'DELETE', headers: authHeaders()
        });
        if (res.ok) {
            await loadAccounts();
            populateDropdowns();
        } else {
            alert('Could not delete: ' + await res.text());
        }
    } catch (e) { alert('Could not connect.'); }
}

// ===== LOGOUT MODAL (pt2 changes 2) =====

function openLogoutModal() {
    document.getElementById('logout-modal').style.display = 'flex';
}

function closeLogoutModal() {
    document.getElementById('logout-modal').style.display = 'none';
}

function confirmLogout() {
    closeLogoutModal();
    // show logging out overlay briefly before clearing
    document.getElementById('logout-overlay').style.display = 'flex';
    setTimeout(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('username');
        token = null; userRole = null; loggedInUsername = null; userAccounts = [];
        document.getElementById('logout-overlay').style.display = 'none';
        showAuth();
    }, 1200);
}

// ===== ADMIN FUNCTIONS =====

async function loadAdminPanel() {
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
        document.getElementById('stat-balance').textContent = '₹' + totalBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 });
        const recent = accounts.slice(-5).reverse();
        const wrap = document.getElementById('admin-recent-accounts');
        wrap.innerHTML = recent.length === 0 ? '<div class="empty-state">No accounts yet.</div>' : buildAccountsTable(recent);
    } catch (e) {
        document.getElementById('admin-recent-accounts').innerHTML = '<div class="empty-state">Could not load data.</div>';
    }
}

async function loadAdminAccounts() {
    const wrap = document.getElementById('admin-accounts-table');
    wrap.innerHTML = '<div class="empty-state">Loading...</div>';
    try {
        const res = await fetch(`${API}/accounts`, { headers: authHeaders() });
        const accounts = await res.json();
        wrap.innerHTML = accounts.length === 0 ? '<div class="empty-state">No accounts found.</div>' : buildAccountsTable(accounts);
    } catch (e) { wrap.innerHTML = '<div class="empty-state">Could not load accounts.</div>'; }
}

async function loadAdminUsers() {
    const wrap = document.getElementById('admin-users-table');
    wrap.innerHTML = '<div class="empty-state">Loading...</div>';
    try {
        const res = await fetch(`${API}/accounts/admin/users`, { headers: authHeaders() });
        const users = await res.json();
        if (users.length === 0) { wrap.innerHTML = '<div class="empty-state">No users found.</div>'; return; }
        wrap.innerHTML = `
            <table class="admin-table">
                <thead><tr><th>#</th><th>Username</th><th>Actions</th></tr></thead>
                <tbody>
                    ${users.map((u, i) => `
                        <tr id="user-row-${u}">
                            <td class="muted">${i + 1}</td>
                            <td>${u}</td>
                            <td class="user-actions">
                                <button class="btn-change-pw" onclick="showChangePassword('${u}')">Change Password</button>
                                <button class="btn-delete" onclick="adminDeleteUser('${u}')"
                                    ${u === loggedInUsername ? 'disabled title="Cannot delete yourself"' : ''}>Delete</button>
                            </td>
                        </tr>
                        <tr id="pw-row-${u}" style="display:none;">
                            <td colspan="3">
                                <div class="pw-change-form">
                                    <input type="password" id="pw-input-${u}" placeholder="New password" class="pw-inline-input">
                                    <button class="btn-admin-sm" onclick="submitChangePassword('${u}')">Save</button>
                                    <button class="btn-cancel-sm" onclick="hideChangePassword('${u}')">Cancel</button>
                                    <span id="pw-msg-${u}" class="pw-msg"></span>
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>`;
    } catch (e) { wrap.innerHTML = '<div class="empty-state">Could not load users.</div>'; }
}

function showChangePassword(username) {
    document.getElementById(`pw-row-${username}`).style.display = 'table-row';
}

function hideChangePassword(username) {
    document.getElementById(`pw-row-${username}`).style.display = 'none';
    document.getElementById(`pw-input-${username}`).value = '';
    document.getElementById(`pw-msg-${username}`).textContent = '';
}

async function submitChangePassword(username) {
    const newPassword = document.getElementById(`pw-input-${username}`).value;
    const msgEl = document.getElementById(`pw-msg-${username}`);
    if (!newPassword) { msgEl.textContent = '✗ Enter a password.'; msgEl.className = 'pw-msg error'; return; }
    try {
        const res = await fetch(`${API}/accounts/admin/users/${username}/password?newPassword=${encodeURIComponent(newPassword)}`, {
            method: 'PUT', headers: authHeaders()
        });
        const msg = await res.text();
        msgEl.textContent = res.ok ? '✓ ' + msg : '✗ ' + msg;
        msgEl.className = 'pw-msg ' + (res.ok ? 'success' : 'error');
    } catch (e) { msgEl.textContent = '✗ Could not connect.'; msgEl.className = 'pw-msg error'; }
}

async function adminDeleteUser(username) {
    if (!confirm(`Delete user "${username}" and ALL their accounts and transactions? This cannot be undone.`)) return;
    try {
        const res = await fetch(`${API}/accounts/admin/users/${username}`, {
            method: 'DELETE', headers: authHeaders()
        });
        if (res.ok) { loadAdminUsers(); loadAdminPanel(); }
        else alert('Could not delete: ' + await res.text());
    } catch (e) { alert('Could not connect.'); }
}

function buildAccountsTable(accounts) {
    return `
        <table class="admin-table">
            <thead>
                <tr><th>Owner</th><th>Holder Name</th><th>Account No.</th><th>Balance</th><th>Action</th></tr>
            </thead>
            <tbody>
                ${accounts.map(acc => `
                    <tr>
                        <td class="muted">${acc.username}</td>
                        <td>${acc.accountHolderName}</td>
                        <td class="mono">${acc.accountNumber}</td>
                        <td class="accent">₹${acc.balance.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                        <td><button class="btn-delete" onclick="adminDeleteAccount('${acc.accountNumber}')">Delete</button></td>
                    </tr>
                `).join('')}
            </tbody>
        </table>`;
}

async function adminDeleteAccount(accountNumber) {
    if (!confirm(`Delete account ${accountNumber}? This cannot be undone.`)) return;
    try {
        const res = await fetch(`${API}/accounts/${accountNumber}`, {
            method: 'DELETE', headers: authHeaders()
        });
        if (res.ok) {
            document.getElementById('admin-accounts').classList.contains('active') ? loadAdminAccounts() : loadAdminPanel();
        } else { alert('Could not delete: ' + await res.text()); }
    } catch (e) { alert('Could not connect.'); }
}