const form = document.getElementById("transaction-form");
const descriptionInput = document.getElementById("description");
const amountInput = document.getElementById("amount");
const transactionList = document.getElementById("transaction-list");
const balanceEl = document.getElementById("balance");
const incomeEl = document.getElementById("income");
const expenseEl = document.getElementById("expense");
const filterButtons = document.querySelectorAll(".filter");

let transactions = loadTransactions();
let currentFilter = "all";

form.addEventListener("submit", addTransaction);
filterButtons.forEach(button => {
  button.addEventListener("click", () => {
    document.querySelector(".filter.active").classList.remove("active");
    button.classList.add("active");

    currentFilter = button.getAttribute("data-filter");
    renderTransactions();
  });
});

function addTransaction(event) {
  event.preventDefault();

  const description = descriptionInput.value.trim();
  const amount = parseFloat(amountInput.value);

  if (description === "" || isNaN(amount)) {
    alert("Please enter a valid description and amount.");
    return;
  }

  const newTransaction = {
    id: Date.now(),
    description,
    amount,
    date: new Date().toLocaleDateString()
  };

  transactions.push(newTransaction);
  saveTransactions();
  renderAll();

  descriptionInput.value = "";
  amountInput.value = "";
}

function deleteTransaction(id) {
  transactions = transactions.filter(tx => tx.id !== id);
  saveTransactions();
  renderAll();
}

function renderAll() {
  updateTotals();
  renderTransactions();
}

function renderTransactions() {
  transactionList.innerHTML = "";

  let filtered;
  switch(currentFilter) {
    case "income":
      filtered = transactions.filter(tx => tx.amount > 0);
      break;
    case "expense":
      filtered = transactions.filter(tx => tx.amount < 0);
      break;
    default:
      filtered = [...transactions];
  }

  if (filtered.length === 0) {
    transactionList.innerHTML = "<li>No transactions to show.</li>";
    return;
  }

  filtered.forEach(tx => {
    const li = document.createElement("li");
    li.className = "transaction-item " + (tx.amount >= 0 ? "income" : "expense");

    const detailsDiv = document.createElement("div");
    detailsDiv.className = "transaction-details";

    const strongDesc = document.createElement("strong");
    strongDesc.textContent = tx.description;

    const br = document.createElement("br");

    const spanAmount = document.createElement("span");
    spanAmount.textContent = (tx.amount >= 0 ? "+" : "–") + "$" + Math.abs(tx.amount).toFixed(2);

    const dateDiv = document.createElement("div");
    dateDiv.className = "transaction-date";
    dateDiv.textContent = tx.date;

    detailsDiv.appendChild(strongDesc);
    detailsDiv.appendChild(br);
    detailsDiv.appendChild(spanAmount);
    detailsDiv.appendChild(dateDiv);

    const delBtn = document.createElement("button");
    delBtn.className = "delete-btn";
    delBtn.textContent = "❌";
    delBtn.addEventListener("click", () => deleteTransaction(tx.id));

    li.appendChild(detailsDiv);
    li.appendChild(delBtn);

    transactionList.appendChild(li);
  });
}

function updateTotals() {
  let income = 0;
  let expense = 0;

  for (let tx of transactions) {
    if (tx.amount > 0) income += tx.amount;
    else expense += tx.amount;
  }

  const balance = income + expense;

  balanceEl.textContent = "$" + balance.toFixed(2);
  incomeEl.textContent = "+$" + income.toFixed(2);
  expenseEl.textContent = "-$" + Math.abs(expense).toFixed(2);
}

function saveTransactions() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

function loadTransactions() {
  const data = localStorage.getItem("transactions");
  return data ? JSON.parse(data) : [];
}

renderAll();
    