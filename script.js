class ExpenseTracker {
  constructor() {
    this.transactions = JSON.parse(localStorage.getItem('npr-transactions')) || [];
    this.currentFilter = 'all';
    this.init();
  }

  init() {
    this.updateDisplay();
    document.getElementById('transaction-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.addTransaction();
    });

    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.setFilter(btn.dataset.filter);
      });
    });
  }

  addTransaction() {
    const title = document.getElementById('title').value.trim();
    const amount = parseFloat(document.getElementById('amount').value);

    if (!title || isNaN(amount)) {
      alert('Please enter valid title and amount');
      return;
    }

    const transaction = {
      id: Date.now(),
      title,
      amount,
      date: new Date().toLocaleString(),
      type: amount >= 0 ? 'income' : 'expense'
    };

    this.transactions.unshift(transaction);
    this.save();
    this.updateDisplay();
    document.getElementById('transaction-form').reset();
  }

  deleteTransaction(id) {
    this.transactions = this.transactions.filter(t => t.id !== id);
    this.save();
    this.updateDisplay();
  }

  setFilter(filter) {
    this.currentFilter = filter;
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
    this.renderTransactions();
  }

  updateDisplay() {
    this.updateSummary();
    this.renderTransactions();
  }

  updateSummary() {
    let income = 0, expense = 0;
    this.transactions.forEach(t => {
      if (t.amount >= 0) income += t.amount;
      else expense += Math.abs(t.amount);
    });

    document.getElementById('balance').textContent = this.formatCurrency(income - expense);
    document.getElementById('income').textContent = this.formatCurrency(income);
    document.getElementById('expenses').textContent = this.formatCurrency(expense);
  }

  renderTransactions() {
    const container = document.getElementById('transactions-container');
    let filtered = this.transactions;

    if (this.currentFilter === 'income') {
      filtered = filtered.filter(t => t.amount >= 0);
    } else if (this.currentFilter === 'expense') {
      filtered = filtered.filter(t => t.amount < 0);
    }

    if (filtered.length === 0) {
      container.innerHTML = '<div class="empty-state"><p>No transactions found.</p></div>';
      return;
    }

    container.innerHTML = filtered.map(t => `
      <div class="transaction-item">
        <div class="transaction-info">
          <div class="transaction-title">${this.escape(t.title)}</div>
          <div class="transaction-date">${t.date}</div>
        </div>
        <div class="transaction-amount ${t.type}">${this.formatCurrency(t.amount)}</div>
        <button class="delete-btn" onclick="tracker.deleteTransaction(${t.id})">Delete</button>
      </div>
    `).join('');
  }

  formatCurrency(amount) {
    return 'रु' + amount.toFixed(2);
  }

  escape(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  save() {
    localStorage.setItem('npr-transactions', JSON.stringify(this.transactions));
  }
}

const tracker = new ExpenseTracker();
