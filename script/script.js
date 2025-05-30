const form = document.getElementById("transaction-form");
const descriptionInput = document.getElementById("description");
const amountInput = document.getElementById("amount");
const dateInput = document.getElementById("date");
const transactionList = document.getElementById("transaction-list");
const balanceEl = document.getElementById("balance");
const incomeEl = document.getElementById("income");
const expenseEl = document.getElementById("expense");
const filterButtons = document.querySelectorAll(".filter");

let transactions = loadTransactions();
let currentFilter = "all";
let expenseChart = null;

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
  const date = dateInput.value;

  if (description === "" || isNaN(amount) || !date) {
    alert("Please enter a valid description, amount, and date.");
    return;
  }

  const newTransaction = {
    id: Date.now(),
    description,
    amount,
    date
  };

  transactions.push(newTransaction);
  saveTransactions();
  renderAll();

  descriptionInput.value = "";
  amountInput.value = "";
  dateInput.value = "";
}

function deleteTransaction(id) {
  transactions = transactions.filter(tx => tx.id !== id);
  saveTransactions();
  renderAll();
}

function renderAll() {
  updateTotals();
  renderTransactions();
  updateChart();
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
    spanAmount.textContent = (tx.amount >= 0 ? "+" : "-") + "XAF" + Math.abs(tx.amount).toFixed(2);

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

  balanceEl.textContent = "XAF" + balance.toFixed(2);
  incomeEl.textContent = "+XAF" + income.toFixed(2);
  expenseEl.textContent = "-XAF" + Math.abs(expense).toFixed(2);
}

function updateChart() {
  const income = transactions.filter(tx => tx.amount > 0)
    .reduce((sum, tx) => sum + tx.amount, 0);
  const expense = transactions.filter(tx => tx.amount < 0)
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

  const ctx = document.getElementById("expenseChart").getContext("2d");

  if (expenseChart) {
    expenseChart.data.datasets[0].data = [income, expense];
    expenseChart.update();
  } else {
    expenseChart = new Chart(ctx, {
      type: "pie",
      data: {
        labels: ["Income", "Expense"],
        datasets: [{
          label: "Transactions",
          data: [income, expense],
          backgroundColor: ["#4CAF50", "#F44336"]
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "bottom"
          }
        }
      }
    });
  }
}

function saveTransactions() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

function loadTransactions() {
  const data = localStorage.getItem("transactions");
  return data ? JSON.parse(data) : [];
}

renderAll();