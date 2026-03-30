const API = 'http://localhost:8080';

// Navigation
function showSection(id) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    event.target.classList.add('active');
    if (id === 'dashboard') loadAccounts();
}

// Show messages
function showMsg(id, text, type) {
    const el = document.getElementById(id);
    el.textContent = text;
    el.className = 'msg ' + type;
}

// Load all accounts
async function loadAccounts() {
    const grid = document.getElementById('accounts-grid');
    grid.innerHTML = '<div class="empty-state">Loading...</div>';
    try {
        const res = await fetch(`${API}/accounts`);
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

// Create account
async function createAccount() {
    const name = document.getElementById('create-name').value;
    const accNum = document.getElementById('create-accnum').value;
    const balance = document.getElementById('create-balance').value;
    try {
        const res = await fetch(`${API}/accounts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ accountHolderName: name, accountNumber: accNum, balance: parseFloat(balance) })
        });
        if (res.ok) {
            showMsg('create-msg', '✓ Account created successfully!', 'success');
            document.getElementById('create-name').value = '';
            document.getElementById('create-accnum').value = '';
            document.getElementById('create-balance').value = '';
        } else {
            const err = await res.text();
            showMsg('create-msg', '✗ ' + err, 'error');
        }
    } catch (e) {
        showMsg('create-msg', '✗ Could not connect to server.', 'error');
    }
}

// Deposit
async function deposit() {
    const accNum = document.getElementById('deposit-accnum').value;
    const amount = document.getElementById('deposit-amount').value;
    try {
        const res = await fetch(`${API}/accounts/${accNum}/deposit?amount=${amount}`, { method: 'PUT' });
        if (res.ok) {
            const acc = await res.json();
            showMsg('deposit-msg', `✓ Deposited ₹${amount}. New balance: ₹${acc.balance}`, 'success');
        } else {
            const err = await res.text();
            showMsg('deposit-msg', '✗ ' + err, 'error');
        }
    } catch (e) {
        showMsg('deposit-msg', '✗ Could not connect to server.', 'error');
    }
}

// Withdraw
async function withdraw() {
    const accNum = document.getElementById('withdraw-accnum').value;
    const amount = document.getElementById('withdraw-amount').value;
    try {
        const res = await fetch(`${API}/accounts/${accNum}/withdraw?amount=${amount}`, { method: 'PUT' });
        if (res.ok) {
            const acc = await res.json();
            showMsg('withdraw-msg', `✓ Withdrawn ₹${amount}. New balance: ₹${acc.balance}`, 'success');
        } else {
            const err = await res.text();
            showMsg('withdraw-msg', '✗ ' + err, 'error');
        }
    } catch (e) {
        showMsg('withdraw-msg', '✗ Could not connect to server.', 'error');
    }
}

// Transfer
async function transfer() {
    const from = document.getElementById('transfer-from').value;
    const to = document.getElementById('transfer-to').value;
    const amount = document.getElementById('transfer-amount').value;
    try {
        const res = await fetch(`${API}/accounts/transfer?fromAccount=${from}&toAccount=${to}&amount=${amount}`, { method: 'POST' });
        if (res.ok) {
            const msg = await res.text();
            showMsg('transfer-msg', '✓ ' + msg, 'success');
        } else {
            const err = await res.text();
            showMsg('transfer-msg', '✗ ' + err, 'error');
        }
    } catch (e) {
        showMsg('transfer-msg', '✗ Could not connect to server.', 'error');
    }
}

// Transaction history
async function loadHistory() {
    const accNum = document.getElementById('history-accnum').value;
    const list = document.getElementById('history-list');
    list.innerHTML = '<div class="empty-state">Loading...</div>';
    try {
        const res = await fetch(`${API}/accounts/${accNum}/transactions`);
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

// Load dashboard on start
loadAccounts();