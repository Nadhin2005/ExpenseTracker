
const authPage = document.getElementById("authPage");
const appPage = document.getElementById("appPage");
const notifyBox = document.getElementById("notifyBox");

const username = document.getElementById("username");
const password = document.getElementById("password");
const role = document.getElementById("role");
const authMsg = document.getElementById("authMsg");

const balance = document.getElementById("balance");
const income = document.getElementById("income");
const expense = document.getElementById("expense");
const goalDisplay = document.getElementById("goalDisplay");

const highestExpense = document.getElementById("highestExpense");
const averageExpense = document.getElementById("averageExpense");
const topCategory = document.getElementById("topCategory");
const totalTransactions = document.getElementById("totalTransactions");

const list = document.getElementById("list");
const monthList = document.getElementById("monthList");

const form = document.getElementById("form");
const text = document.getElementById("text");
const amount = document.getElementById("amount");
const category = document.getElementById("category");
const paymentMode = document.getElementById("paymentMode");
const date = document.getElementById("date");

const search = document.getElementById("search");
const filter = document.getElementById("filter");
const fromDate = document.getElementById("fromDate");
const toDate = document.getElementById("toDate");
const categoryFilter = document.getElementById("categoryFilter");
const paymentFilter = document.getElementById("paymentFilter");

const monthFilter = document.getElementById("monthFilter");
const monthIncome = document.getElementById("monthIncome");
const monthExpense = document.getElementById("monthExpense");
const monthBalance = document.getElementById("monthBalance");
const monthTopCategory = document.getElementById("monthTopCategory");

const yearInput = document.getElementById("yearInput");
const yearIncome = document.getElementById("yearIncome");
const yearExpense = document.getElementById("yearExpense");
const yearBalance = document.getElementById("yearBalance");
const highestMonth = document.getElementById("highestMonth");

const predictedExpense = document.getElementById("predictedExpense");
const recommendedSaving = document.getElementById("recommendedSaving");
const riskLevel = document.getElementById("riskLevel");
const aiAction = document.getElementById("aiAction");
const suggestionList = document.getElementById("suggestionList");

const adminBtn = document.getElementById("adminBtn");
const adminUsers = document.getElementById("adminUsers");
const adminIncome = document.getElementById("adminIncome");
const adminExpense = document.getElementById("adminExpense");
const adminRecords = document.getElementById("adminRecords");
const adminList = document.getElementById("adminList");

const budget = document.getElementById("budget");
const budgetAmount = document.getElementById("budgetAmount");
const savingGoal = document.getElementById("savingGoal");
const progressBar = document.getElementById("progressBar");
const savingText = document.getElementById("savingText");

const limitCategory = document.getElementById("limitCategory");
const limitAmount = document.getElementById("limitAmount");
const limitText = document.getElementById("limitText");
const restoreFile = document.getElementById("restoreFile");
const submitBtn = document.getElementById("submitBtn");

let currentUser = "";
let currentRole = "";

let users = JSON.parse(localStorage.getItem("users")) || [];
let transactions = [];
let categoryLimits = JSON.parse(localStorage.getItem("categoryLimits")) || {};

let editId = null;
let monthlyBudget = 0;
let goal = 0;

let mainChart;
let categoryChart;
let monthMainChart;
let monthCategoryChart;
let yearChart;
let forecastChart;

function createDefaultAdmin() {
    const adminExists = users.find(u => u.username === "admin");

    if (!adminExists) {
        users.push({
            username: "admin",
            password: "admin123",
            role: "admin"
        });

        localStorage.setItem("users", JSON.stringify(users));
    }
}

createDefaultAdmin();

function notify(message, type = "success") {
    if (!notifyBox) {
        alert(message);
        return;
    }

    const div = document.createElement("div");
    div.className = `notify ${type}`;
    div.innerText = message;

    notifyBox.appendChild(div);

    setTimeout(() => {
        div.remove();
    }, 3000);
}

function getUserKey(user) {
    return "transactions_" + user;
}

function getCurrentTransactions() {
    if (!currentUser) {
        return [];
    }

    return JSON.parse(localStorage.getItem(getUserKey(currentUser))) || [];
}

function saveCurrentTransactions() {
    if (!currentUser) {
        notify("Please login first", "error");
        return;
    }

    localStorage.setItem(getUserKey(currentUser), JSON.stringify(transactions));
}

function register() {
    if (username.value.trim() === "" || password.value.trim() === "") {
        authMsg.innerText = "Enter username and password";
        return;
    }

    if (password.value.length < 6) {
        authMsg.innerText = "Password must be minimum 6 characters";
        return;
    }

    const exists = users.find(u => u.username === username.value.trim());

    if (exists) {
        authMsg.innerText = "Username already exists";
        return;
    }

    users.push({
        username: username.value.trim(),
        password: password.value.trim(),
        role: role.value
    });

    localStorage.setItem("users", JSON.stringify(users));

    authMsg.innerText = "Registered successfully. Now login.";
    notify("User registered successfully", "success");
}

function login() {
    const found = users.find(
        u =>
            u.username === username.value.trim() &&
            u.password === password.value.trim() &&
            u.role === role.value
    );

    if (!found) {
        authMsg.innerText = "Invalid login details";
        notify("Invalid login details", "error");
        return;
    }

    currentUser = found.username;
    currentRole = found.role;

    localStorage.setItem("loggedIn", "true");
    localStorage.setItem("currentUser", currentUser);
    localStorage.setItem("currentRole", currentRole);

    showApp();
    notify(`${currentRole.toUpperCase()} login successful`, "success");
}

function logout() {
    localStorage.setItem("loggedIn", "false");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("currentRole");

    currentUser = "";
    currentRole = "";
    transactions = [];

    authPage.style.display = "flex";
    appPage.style.display = "none";

    notify("Logout successful", "warning");
}

function showApp() {
    currentUser = localStorage.getItem("currentUser") || "";
    currentRole = localStorage.getItem("currentRole") || "";

    if (!currentUser) {
        authPage.style.display = "flex";
        appPage.style.display = "none";
        return;
    }

    authPage.style.display = "none";
    appPage.style.display = "flex";

    transactions = getCurrentTransactions();

    if (adminBtn) {
        if (currentRole === "admin") {
            adminBtn.style.display = "block";
        } else {
            adminBtn.style.display = "none";
        }
    }

    showSection("dashboard");
    initializeApp();
}

if (localStorage.getItem("loggedIn") === "true") {
    showApp();
}

function showSection(id) {
    document.querySelectorAll(".section").forEach(section => {
        section.classList.remove("active");
        section.style.display = "none";
    });

    const selected = document.getElementById(id);

    if (selected) {
        selected.classList.add("active");
        selected.style.display = "block";
    }

    if (id === "adminPanel") {
        loadAdminPanel();
    }
}

form.addEventListener("submit", function(e) {
    e.preventDefault();

    if (
        text.value.trim() === "" ||
        amount.value.trim() === "" ||
        category.value === "" ||
        paymentMode.value === "" ||
        date.value === ""
    ) {
        notify("Please fill all fields", "error");
        return;
    }

    const amountValue = Number(amount.value);

    if (amountValue === 0 || isNaN(amountValue)) {
        notify("Enter valid amount", "error");
        return;
    }

    const duplicate = transactions.find(item =>
        item.text.toLowerCase() === text.value.toLowerCase() &&
        item.amount === amountValue &&
        item.date === date.value &&
        item.id !== editId
    );

    if (duplicate) {
        notify("Duplicate transaction detected", "warning");
        return;
    }

    const transaction = {
        id: editId === null ? Date.now() : editId,
        text: text.value,
        amount: amountValue,
        category: category.value,
        paymentMode: paymentMode.value,
        date: date.value
    };

    if (editId === null) {
        transactions.push(transaction);
        notify("Transaction added", "success");
    } else {
        transactions = transactions.map(item =>
            item.id === editId ? transaction : item
        );

        editId = null;
        submitBtn.innerText = "Add Transaction";
        notify("Transaction updated", "success");
    }

    saveCurrentTransactions();
    clearInputs();

    updateUI();
    checkBudget();
    checkCategoryLimit(transaction.category);
});

function getFilteredTransactions() {
    const searchText = search.value.toLowerCase();

    return transactions.filter(item => {
        const matchSearch =
            item.text.toLowerCase().includes(searchText) ||
            item.category.toLowerCase().includes(searchText) ||
            item.paymentMode.toLowerCase().includes(searchText);

        const matchType =
            filter.value === "all" ||
            (filter.value === "income" && item.amount > 0) ||
            (filter.value === "expense" && item.amount < 0);

        const matchFrom =
            fromDate.value === "" || item.date >= fromDate.value;

        const matchTo =
            toDate.value === "" || item.date <= toDate.value;

        const matchCategory =
            categoryFilter.value === "all" ||
            item.category === categoryFilter.value;

        const matchPayment =
            paymentFilter.value === "all" ||
            item.paymentMode === paymentFilter.value;

        return (
            matchSearch &&
            matchType &&
            matchFrom &&
            matchTo &&
            matchCategory &&
            matchPayment
        );
    });
}

function showTransactions() {
    list.innerHTML = "";

    const filtered = getFilteredTransactions();

    if (filtered.length === 0) {
        list.innerHTML = `<li>No transactions found</li>`;
        return;
    }

    filtered.forEach(item => {
        const li = document.createElement("li");

        if (item.amount < 0) {
            li.classList.add("expense");
        }

        li.innerHTML = `
            <strong>${item.text}</strong>
            <span>₹${item.amount}</span>
            <span>${item.category}</span>
            <span>${item.paymentMode}</span>
            <span>${item.date}</span>
            <button class="edit-btn" onclick="editTransaction(${item.id})">Edit</button>
            <button class="delete-btn" onclick="deleteTransaction(${item.id})">X</button>
        `;

        list.appendChild(li);
    });
}

function updateDashboard() {
    const inc = transactions
        .filter(item => item.amount > 0)
        .reduce((a, b) => a + b.amount, 0);

    const exp = transactions
        .filter(item => item.amount < 0)
        .reduce((a, b) => a + Math.abs(b.amount), 0);

    income.innerText = inc;
    expense.innerText = exp;
    balance.innerText = inc - exp;

    const expenses = transactions.filter(item => item.amount < 0);

    highestExpense.innerText = expenses.length
        ? Math.max(...expenses.map(item => Math.abs(item.amount)))
        : 0;

    averageExpense.innerText = expenses.length
        ? (exp / expenses.length).toFixed(2)
        : 0;

    totalTransactions.innerText = transactions.length;
    topCategory.innerText = getTopCategory(transactions);

    updateSavingProgress(inc - exp);
}

function resetDashboardOnRefresh() {
    income.innerText = 0;
    expense.innerText = 0;
    balance.innerText = 0;
    goalDisplay.innerText = 0;

    highestExpense.innerText = 0;
    averageExpense.innerText = 0;
    topCategory.innerText = "None";
    totalTransactions.innerText = transactions.length;

    goal = 0;
    progressBar.style.width = "0%";
    savingText.innerText = "Savings progress: 0%";
}

function getTopCategory(data) {
    const cats = {};

    data.forEach(item => {
        if (item.amount < 0) {
            cats[item.category] =
                (cats[item.category] || 0) + Math.abs(item.amount);
        }
    });

    let top = "None";
    let max = 0;

    for (let cat in cats) {
        if (cats[cat] > max) {
            max = cats[cat];
            top = cat;
        }
    }

    return top;
}

function editTransaction(id) {
    const item = transactions.find(t => t.id === id);

    if (!item) {
        notify("Transaction not found", "error");
        return;
    }

    text.value = item.text;
    amount.value = item.amount;
    category.value = item.category;
    paymentMode.value = item.paymentMode;
    date.value = item.date;

    editId = id;
    submitBtn.innerText = "Update Transaction";
    showSection("transactions");
}

function deleteTransaction(id) {
    transactions = transactions.filter(item => item.id !== id);

    saveCurrentTransactions();
    updateUI();

    notify("Transaction deleted", "warning");
}

function clearAll() {
    if (confirm("Delete all transactions?")) {
        transactions = [];

        saveCurrentTransactions();
        updateUI();

        notify("All data cleared", "warning");
    }
}

function showMonthDashboard() {
    if (monthFilter.value === "") {
        notify("Select month", "error");
        return;
    }

    const selectedMonth = monthFilter.value;

    const data = transactions.filter(item =>
        item.date.startsWith(selectedMonth)
    );

    const inc = data
        .filter(i => i.amount > 0)
        .reduce((a, b) => a + b.amount, 0);

    const exp = data
        .filter(i => i.amount < 0)
        .reduce((a, b) => a + Math.abs(b.amount), 0);

    monthIncome.innerText = inc;
    monthExpense.innerText = exp;
    monthBalance.innerText = inc - exp;
    monthTopCategory.innerText = getTopCategory(data);

    monthList.innerHTML = "";

    if (data.length === 0) {
        monthList.innerHTML = `<li>No transactions found for this month</li>`;
    }

    data.forEach(item => {
        const li = document.createElement("li");

        if (item.amount < 0) {
            li.classList.add("expense");
        }

        li.innerHTML = `
            <strong>${item.text}</strong>
            <span>₹${item.amount}</span>
            <span>${item.category}</span>
            <span>${item.paymentMode}</span>
            <span>${item.date}</span>
        `;

        monthList.appendChild(li);
    });

    updateMonthCharts(data, inc, exp);
    notify("Month dashboard generated", "success");
}

function updateMonthCharts(data, inc, exp) {
    const ctx1 = document.getElementById("monthMainChart").getContext("2d");

    if (monthMainChart) {
        monthMainChart.destroy();
    }

    monthMainChart = new Chart(ctx1, {
        type: "doughnut",
        data: {
            labels: ["Income", "Expense"],
            datasets: [{
                data: [inc, exp],
                backgroundColor: ["#22c55e", "#ef4444"]
            }]
        }
    });

    const cats = {};

    data.forEach(item => {
        if (item.amount < 0) {
            cats[item.category] =
                (cats[item.category] || 0) + Math.abs(item.amount);
        }
    });

    const ctx2 = document.getElementById("monthCategoryChart").getContext("2d");

    if (monthCategoryChart) {
        monthCategoryChart.destroy();
    }

    monthCategoryChart = new Chart(ctx2, {
        type: "bar",
        data: {
            labels: Object.keys(cats),
            datasets: [{
                label: "Expense",
                data: Object.values(cats),
                backgroundColor: "#2563eb"
            }]
        }
    });
}

function showYearDashboard() {
    if (yearInput.value === "") {
        notify("Enter year", "error");
        return;
    }

    const year = yearInput.value;

    const data = transactions.filter(item =>
        item.date.startsWith(year)
    );

    const monthlyExpense = Array(12).fill(0);
    const monthlyIncome = Array(12).fill(0);

    data.forEach(item => {
        const monthIndex = Number(item.date.split("-")[1]) - 1;

        if (item.amount > 0) {
            monthlyIncome[monthIndex] += item.amount;
        } else {
            monthlyExpense[monthIndex] += Math.abs(item.amount);
        }
    });

    const inc = monthlyIncome.reduce((a, b) => a + b, 0);
    const exp = monthlyExpense.reduce((a, b) => a + b, 0);

    yearIncome.innerText = inc;
    yearExpense.innerText = exp;
    yearBalance.innerText = inc - exp;

    const maxExp = Math.max(...monthlyExpense);
    const maxIndex = monthlyExpense.indexOf(maxExp);

    highestMonth.innerText =
        maxExp > 0 ? getMonthName(maxIndex) : "None";

    const ctx = document.getElementById("yearChart").getContext("2d");

    if (yearChart) {
        yearChart.destroy();
    }

    yearChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: [
                "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
            ],
            datasets: [
                {
                    label: "Income",
                    data: monthlyIncome,
                    borderColor: "#22c55e",
                    backgroundColor: "#22c55e"
                },
                {
                    label: "Expense",
                    data: monthlyExpense,
                    borderColor: "#ef4444",
                    backgroundColor: "#ef4444"
                }
            ]
        }
    });

    notify("Year dashboard generated", "success");
}

function getMonthName(index) {
    return [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ][index];
}

function runAIPrediction() {
    const monthlyTotals = {};

    transactions.forEach(item => {
        if (item.amount < 0) {
            const month = item.date.slice(0, 7);
            monthlyTotals[month] =
                (monthlyTotals[month] || 0) + Math.abs(item.amount);
        }
    });

    const values = Object.values(monthlyTotals);

    if (values.length === 0) {
        notify("Not enough data for prediction", "warning");
        return;
    }

    const average = values.reduce((a, b) => a + b, 0) / values.length;
    const last = values[values.length - 1];
    const prediction = Math.round((average + last) / 2);

    predictedExpense.innerText = prediction;
    recommendedSaving.innerText = Math.round(prediction * 0.2);

    if (prediction > average * 1.3) {
        riskLevel.innerText = "High";
        aiAction.innerText = "Reduce Expense";
    } else if (prediction > average) {
        riskLevel.innerText = "Medium";
        aiAction.innerText = "Monitor Spending";
    } else {
        riskLevel.innerText = "Low";
        aiAction.innerText = "Good";
    }

    generateSuggestions(prediction);
    updateForecastChart(values, prediction);
    notify("AI prediction completed", "success");
}

function generateSuggestions(prediction) {
    suggestionList.innerHTML = "";

    const top = getTopCategory(transactions);

    const suggestions = [
        `Next month expected expense is ₹${prediction}.`,
        `${top} category spending is high. Try reducing it by 15% to 20%.`,
        `Recommended saving amount is ₹${Math.round(prediction * 0.2)}.`,
        `Avoid duplicate or unnecessary transactions.`,
        `Use month-wise dashboard to compare spending patterns.`
    ];

    suggestions.forEach(s => {
        const li = document.createElement("li");
        li.innerText = s;
        suggestionList.appendChild(li);
    });
}

function updateForecastChart(values, prediction) {
    const ctx = document.getElementById("forecastChart").getContext("2d");

    if (forecastChart) {
        forecastChart.destroy();
    }

    forecastChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: [...values.map((_, i) => "M" + (i + 1)), "Next"],
            datasets: [{
                label: "Expense Forecast",
                data: [...values, prediction],
                borderColor: "#7c3aed",
                backgroundColor: "#7c3aed"
            }]
        }
    });
}

function downloadMonthPDF() {
    if (monthFilter.value === "") {
        notify("Select month first", "error");
        return;
    }

    const selectedMonth = monthFilter.value;

    const data = transactions.filter(item =>
        item.date.startsWith(selectedMonth)
    );

    if (data.length === 0) {
        notify("No data found", "warning");
        return;
    }

    const inc = data
        .filter(i => i.amount > 0)
        .reduce((a, b) => a + b.amount, 0);

    const exp = data
        .filter(i => i.amount < 0)
        .reduce((a, b) => a + Math.abs(b.amount), 0);

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("AI Smart Finance - Monthly Report", 20, 20);

    doc.setFontSize(12);
    doc.text("User: " + currentUser, 20, 35);
    doc.text("Month: " + selectedMonth, 20, 45);
    doc.text("Income: Rs. " + inc, 20, 55);
    doc.text("Expense: Rs. " + exp, 20, 65);
    doc.text("Balance: Rs. " + (inc - exp), 20, 75);

    try {
        const chartImage =
            document.getElementById("monthMainChart").toDataURL("image/png");

        doc.addImage(chartImage, "PNG", 20, 85, 160, 70);
    } catch (error) {}

    let y = 170;

    doc.text("Transactions", 20, y);
    y += 10;

    data.forEach(item => {
        if (y > 280) {
            doc.addPage();
            y = 20;
        }

        doc.text(
            `${item.text} | ${item.amount} | ${item.category} | ${item.date}`,
            20,
            y
        );

        y += 8;
    });

    doc.save(`month-report-${selectedMonth}.pdf`);
    notify("Month PDF downloaded", "success");
}

function downloadAllPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const inc = transactions
        .filter(i => i.amount > 0)
        .reduce((a, b) => a + b.amount, 0);

    const exp = transactions
        .filter(i => i.amount < 0)
        .reduce((a, b) => a + Math.abs(b.amount), 0);

    doc.setFontSize(18);
    doc.text("AI Smart Finance - Full Report", 20, 20);

    doc.setFontSize(12);
    doc.text("User: " + currentUser, 20, 35);
    doc.text("Income: Rs. " + inc, 20, 45);
    doc.text("Expense: Rs. " + exp, 20, 55);
    doc.text("Balance: Rs. " + (inc - exp), 20, 65);

    try {
        const chartImage =
            document.getElementById("mainChart").toDataURL("image/png");

        doc.addImage(chartImage, "PNG", 20, 75, 160, 70);
    } catch (error) {}

    let y = 160;

    transactions.forEach(item => {
        if (y > 280) {
            doc.addPage();
            y = 20;
        }

        doc.text(
            `${item.text} | ${item.amount} | ${item.category} | ${item.date}`,
            20,
            y
        );

        y += 8;
    });

    doc.save("full-finance-report.pdf");
    notify("PDF downloaded", "success");
}

function downloadMonthCSV() {
    if (monthFilter.value === "") {
        notify("Select month first", "error");
        return;
    }

    const selectedMonth = monthFilter.value;

    const data = transactions.filter(item =>
        item.date.startsWith(selectedMonth)
    );

    downloadCSVFile(data, `month-report-${selectedMonth}.csv`);
}

function downloadAllCSV() {
    downloadCSVFile(transactions, "all-transactions.csv");
}

function downloadCSVFile(data, filename) {
    let csv = "Description,Amount,Category,Payment Mode,Date\n";

    data.forEach(item => {
        csv += `${item.text},${item.amount},${item.category},${item.paymentMode},${item.date}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();

    notify("CSV downloaded", "success");
}

function setBudget() {
    if (budget.value === "") {
        notify("Enter budget", "error");
        return;
    }

    monthlyBudget = Number(budget.value);
    budgetAmount.innerText = monthlyBudget;
    budget.value = "";

    notify("Budget set", "success");
}

function checkBudget() {
    const exp = transactions
        .filter(item => item.amount < 0)
        .reduce((a, b) => a + Math.abs(b.amount), 0);

    if (monthlyBudget > 0 && exp > monthlyBudget) {
        notify("Budget exceeded", "warning");
    }
}

function setSavingGoal() {
    if (savingGoal.value === "") {
        notify("Enter savings goal", "error");
        return;
    }

    goal = Number(savingGoal.value);
    goalDisplay.innerText = goal;
    savingGoal.value = "";

    updateSavingProgress(Number(balance.innerText));
    notify("Savings goal set", "success");
}

function updateSavingProgress(currentBalance) {
    if (goal <= 0) {
        progressBar.style.width = "0%";
        savingText.innerText = "Savings progress: 0%";
        return;
    }

    let percent = (currentBalance / goal) * 100;

    if (percent < 0) {
        percent = 0;
    }

    if (percent > 100) {
        percent = 100;
    }

    progressBar.style.width = percent + "%";
    savingText.innerText = "Savings progress: " + percent.toFixed(1) + "%";
}

function setCategoryLimit() {
    if (limitCategory.value === "" || limitAmount.value === "") {
        notify("Select category and limit", "error");
        return;
    }

    categoryLimits[limitCategory.value] = Number(limitAmount.value);

    localStorage.setItem(
        "categoryLimits",
        JSON.stringify(categoryLimits)
    );

    limitText.innerText =
        `${limitCategory.value} Limit: ₹${limitAmount.value}`;

    limitCategory.value = "";
    limitAmount.value = "";

    notify("Category limit saved", "success");
}

function checkCategoryLimit(cat) {
    if (!categoryLimits[cat]) {
        return;
    }

    const total = transactions
        .filter(item => item.category === cat && item.amount < 0)
        .reduce((a, b) => a + Math.abs(b.amount), 0);

    if (total > categoryLimits[cat]) {
        notify(`${cat} limit exceeded`, "warning");
    }
}

function backupData() {
    const backup = {
        user: currentUser,
        transactions,
        categoryLimits
    };

    const blob = new Blob(
        [JSON.stringify(backup, null, 2)],
        { type: "application/json" }
    );

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "finance-backup.json";
    link.click();

    notify("Backup downloaded", "success");
}

function restoreData() {
    const file = restoreFile.files[0];

    if (!file) {
        notify("Choose backup file", "error");
        return;
    }

    const reader = new FileReader();

    reader.onload = function(e) {
        const data = JSON.parse(e.target.result);

        transactions = data.transactions || [];
        categoryLimits = data.categoryLimits || {};

        saveCurrentTransactions();

        localStorage.setItem(
            "categoryLimits",
            JSON.stringify(categoryLimits)
        );

        updateUI();
        notify("Data restored", "success");
    };

    reader.readAsText(file);
}

function loadAdminPanel() {
    if (currentRole !== "admin") {
        notify("Admin only access", "error");
        showSection("dashboard");
        return;
    }

    let allIncome = 0;
    let allExpense = 0;
    let allRecords = 0;

    adminList.innerHTML = "";

    users.forEach(user => {
        const data =
            JSON.parse(localStorage.getItem(getUserKey(user.username))) || [];

        const inc = data
            .filter(i => i.amount > 0)
            .reduce((a, b) => a + b.amount, 0);

        const exp = data
            .filter(i => i.amount < 0)
            .reduce((a, b) => a + Math.abs(b.amount), 0);

        allIncome += inc;
        allExpense += exp;
        allRecords += data.length;

        const li = document.createElement("li");

        li.innerHTML = `
            <strong>${user.username}</strong>
            <span>${user.role}</span>
            <span>Income ₹${inc}</span>
            <span>Expense ₹${exp}</span>
            <span>Records ${data.length}</span>
        `;

        adminList.appendChild(li);
    });

    adminUsers.innerText = users.length;
    adminIncome.innerText = allIncome;
    adminExpense.innerText = allExpense;
    adminRecords.innerText = allRecords;

    notify("Admin panel loaded", "success");
}

function updateCharts() {
    const inc = transactions
        .filter(i => i.amount > 0)
        .reduce((a, b) => a + b.amount, 0);

    const exp = transactions
        .filter(i => i.amount < 0)
        .reduce((a, b) => a + Math.abs(b.amount), 0);

    const mainCanvas = document.getElementById("mainChart");

    if (!mainCanvas) {
        return;
    }

    const ctx1 = mainCanvas.getContext("2d");

    if (mainChart) {
        mainChart.destroy();
    }

    mainChart = new Chart(ctx1, {
        type: "doughnut",
        data: {
            labels: ["Income", "Expense"],
            datasets: [{
                data: [inc, exp],
                backgroundColor: [
                    "#00C853",
                    "#FF5722"
                ],
                hoverBackgroundColor: [
                    "#64DD17",
                    "#FF1744"
                ],
                borderColor: "#ffffff",
                borderWidth: 5,
                hoverOffset: 18
            }]
        },
        options: {
            responsive: true,
            cutout: "58%",
            plugins: {
                legend: {
                    position: "top",
                    labels: {
                        color: "#0f172a",
                        font: {
                            size: 14,
                            weight: "bold"
                        }
                    }
                }
            },
            animation: {
                animateRotate: true,
                animateScale: true
            }
        }
    });

    const categoryCanvas = document.getElementById("categoryChart");

    if (!categoryCanvas) {
        return;
    }

    const cats = {};

    transactions.forEach(item => {
        if (item.amount < 0) {
            cats[item.category] =
                (cats[item.category] || 0) + Math.abs(item.amount);
        }
    });

    const ctx2 = categoryCanvas.getContext("2d");

    if (categoryChart) {
        categoryChart.destroy();
    }

    categoryChart = new Chart(ctx2, {
        type: "bar",
        data: {
            labels: Object.keys(cats),
            datasets: [{
                label: "Expense",
                data: Object.values(cats),
                backgroundColor: [
                    "#2563EB",
                    "#7C3AED",
                    "#06B6D4",
                    "#F59E0B",
                    "#EF4444",
                    "#16A34A",
                    "#EC4899",
                    "#14B8A6"
                ],
                borderRadius: 10,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    labels: {
                        color: "#0f172a",
                        font: {
                            weight: "bold"
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: "#475569"
                    }
                },
                x: {
                    ticks: {
                        color: "#475569"
                    }
                }
            }
        }
    });
}

function clearInputs() {
    text.value = "";
    amount.value = "";
    category.value = "";
    paymentMode.value = "";
    date.value = "";
}

function updateUI() {
    showTransactions();
    updateDashboard();
    updateCharts();
}

function toggleDarkMode() {
    document.body.classList.toggle("dark");
}

search.addEventListener("input", showTransactions);
filter.addEventListener("change", showTransactions);
fromDate.addEventListener("change", showTransactions);
toDate.addEventListener("change", showTransactions);
categoryFilter.addEventListener("change", showTransactions);
paymentFilter.addEventListener("change", showTransactions);

function initializeApp() {
    transactions = getCurrentTransactions();

    showTransactions();

    resetDashboardOnRefresh();

    updateCharts();
}
