// DOM Elements
const toolCards = document.querySelectorAll(".tool-card");
const toolSections = document.querySelectorAll(".tool-section");
const launchToolButtons = document.querySelectorAll(".launch-tool");

// Budget Planner Elements
const budgetForm = document.getElementById("budget-form");
const budgetResults = document.getElementById("budget-results");
const budgetChart = document.getElementById("budget-chart");
let budgetChartInstance = null;

// Savings Calculator Elements
const savingsForm = document.getElementById("savings-form");
const savingsResults = document.getElementById("savings-results");
const savingsChart = document.getElementById("savings-chart");
let savingsChartInstance = null;

// Subscription Tracker Elements
const subscriptionForm = document.getElementById("subscription-form");
const subscriptionList = document.getElementById("subscription-list");
const addSubscriptionButton = document.getElementById("add-subscription");
const subscriptionResults = document.getElementById("subscription-results");
const subscriptionChart = document.getElementById("subscription-chart");
let subscriptionChartInstance = null;
let subscriptionCount = 1;

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  // Show the first tool section by default
  if (toolSections.length > 0) {
    toolSections[0].classList.add("active");
  }

  // Add event listeners
  initToolNavigation();
  initBudgetPlanner();
  initSavingsCalculator();
  initSubscriptionTracker();
});

// Tool Navigation
function initToolNavigation() {
  launchToolButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const toolId = button.getAttribute("data-tool");
      showTool(toolId);

      // Scroll to tool section
      document.getElementById(toolId).scrollIntoView({ behavior: "smooth" });
    });
  });
}

function showTool(toolId) {
  // Hide all tool sections
  toolSections.forEach((section) => {
    section.classList.remove("active");
  });

  // Show the selected tool section
  const selectedTool = document.getElementById(toolId);
  if (selectedTool) {
    selectedTool.classList.add("active");
  }
}

// Budget Planner
function initBudgetPlanner() {
  if (!budgetForm) return;

  budgetForm.addEventListener("submit", (e) => {
    e.preventDefault();
    calculateBudget();
  });
}

function calculateBudget() {
  // Get income
  const income = parseFloat(document.getElementById("income").value) || 0;

  // Get expenses
  const needs = {
    rent: parseFloat(document.getElementById("rent").value) || 0,
    utilities: parseFloat(document.getElementById("utilities").value) || 0,
    groceries: parseFloat(document.getElementById("groceries").value) || 0,
    transportation:
      parseFloat(document.getElementById("transportation").value) || 0,
    insurance: parseFloat(document.getElementById("insurance").value) || 0,
    otherNeeds: parseFloat(document.getElementById("other-needs").value) || 0,
  };

  const wants = {
    dining: parseFloat(document.getElementById("dining").value) || 0,
    entertainment:
      parseFloat(document.getElementById("entertainment").value) || 0,
    shopping: parseFloat(document.getElementById("shopping").value) || 0,
    subscriptions:
      parseFloat(document.getElementById("subscriptions").value) || 0,
    otherWants: parseFloat(document.getElementById("other-wants").value) || 0,
  };

  const savings = {
    savings: parseFloat(document.getElementById("savings").value) || 0,
    investments: parseFloat(document.getElementById("investments").value) || 0,
    debtPayments:
      parseFloat(document.getElementById("debt-payments").value) || 0,
  };

  // Calculate totals
  const needsTotal = Object.values(needs).reduce((a, b) => a + b, 0);
  const wantsTotal = Object.values(wants).reduce((a, b) => a + b, 0);
  const savingsTotal = Object.values(savings).reduce((a, b) => a + b, 0);
  const totalExpenses = needsTotal + wantsTotal + savingsTotal;
  const remaining = income - totalExpenses;

  // Calculate recommended amounts based on 50/30/20 rule
  const recommendedNeeds = income * 0.5;
  const recommendedWants = income * 0.3;
  const recommendedSavings = income * 0.2;

  // Update summary
  document.getElementById("summary-income").textContent = `$${income.toFixed(
    2
  )}`;
  document.getElementById(
    "summary-expenses"
  ).textContent = `$${totalExpenses.toFixed(2)}`;
  document.getElementById(
    "summary-remaining"
  ).textContent = `$${remaining.toFixed(2)}`;

  // Update category allocations
  document.getElementById(
    "needs-recommended"
  ).textContent = `$${recommendedNeeds.toFixed(2)}`;
  document.getElementById("needs-actual").textContent = `$${needsTotal.toFixed(
    2
  )}`;
  document.getElementById(
    "wants-recommended"
  ).textContent = `$${recommendedWants.toFixed(2)}`;
  document.getElementById("wants-actual").textContent = `$${wantsTotal.toFixed(
    2
  )}`;
  document.getElementById(
    "savings-recommended"
  ).textContent = `$${recommendedSavings.toFixed(2)}`;
  document.getElementById(
    "savings-actual"
  ).textContent = `$${savingsTotal.toFixed(2)}`;

  // Update category bars
  const needsPercentage = (needsTotal / income) * 100;
  const wantsPercentage = (wantsTotal / income) * 100;
  const savingsPercentage = (savingsTotal / income) * 100;

  document.getElementById("needs-bar").style.width = `${Math.min(
    needsPercentage,
    100
  )}%`;
  document.getElementById("wants-bar").style.width = `${Math.min(
    wantsPercentage,
    100
  )}%`;
  document.getElementById("savings-bar").style.width = `${Math.min(
    savingsPercentage,
    100
  )}%`;

  // Update budget tips
  updateBudgetTips(
    needsPercentage,
    wantsPercentage,
    savingsPercentage,
    remaining
  );

  // Update chart
  updateBudgetChart(needsTotal, wantsTotal, savingsTotal);

  // Show results
  budgetResults.style.display = "block";
}

function updateDataVisualizationTips(chartType, dataPoints, axisLabels) {
  const tipsList = document.getElementById("visualization-tips-list");
  tipsList.innerHTML = "";

  // Add default visualization tips
  const defaultTips = [
    "Choose a chart type that best represents your data relationship (e.g., scatter for correlations, bar for comparisons)",
    "Label your axes clearly and include units of measurement",
    "Use a clear title that describes what the visualization shows",
  ];

  // Add specific tips based on chart analysis
  if (chartType === "scatter") {
    defaultTips.push(
      "Consider adding a trend line if there appears to be a correlation"
    );
    defaultTips.push(
      "Make sure to include error bars if you have uncertainty measurements"
    );
  }

  if (chartType === "bar" || chartType === "column") {
    defaultTips.push(
      "Use consistent spacing between bars and consider grouping related data"
    );
    defaultTips.push(
      "Start your Y-axis at zero to avoid misrepresenting differences"
    );
  }

  if (dataPoints > 20) {
    defaultTips.push(
      "Consider breaking large datasets into multiple visualizations for clarity"
    );
  }

  if (!axisLabels) {
    defaultTips.push(
      "Remember to add descriptive labels for all axes and include units where applicable"
    );
  }

  // Add tips to the list
  defaultTips.forEach((tip) => {
    const li = document.createElement("li");
    li.textContent = tip;
    tipsList.appendChild(li);
  });
}

function updateBudgetChart(needsTotal, wantsTotal, savingsTotal) {
  const ctx = budgetChart.getContext("2d");

  // Destroy existing chart if it exists
  if (budgetChartInstance) {
    budgetChartInstance.destroy();
  }

  // Create new chart
  budgetChartInstance = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Needs", "Wants", "Savings & Debt"],
      datasets: [
        {
          data: [needsTotal, wantsTotal, savingsTotal],
          backgroundColor: [
            "rgba(99, 102, 241, 0.8)",
            "rgba(16, 185, 129, 0.8)",
            "rgba(30, 41, 59, 0.8)",
          ],
          borderColor: [
            "rgba(99, 102, 241, 1)",
            "rgba(16, 185, 129, 1)",
            "rgba(30, 41, 59, 1)",
          ],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const label = context.label || "";
              const value = context.raw || 0;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = Math.round((value / total) * 100);
              return `${label}: $${value.toFixed(2)} (${percentage}%)`;
            },
          },
        },
      },
    },
  });
}

// Savings Calculator
function initSavingsCalculator() {
  if (!savingsForm) return;

  savingsForm.addEventListener("submit", (e) => {
    e.preventDefault();
    calculateSavings();
  });
}

function calculateSavings() {
  // Get input values
  const goal = parseFloat(document.getElementById("savings-goal").value) || 0;
  const initial =
    parseFloat(document.getElementById("initial-amount").value) || 0;
  const contribution =
    parseFloat(document.getElementById("contribution-amount").value) || 0;
  const frequency = document.getElementById("contribution-frequency").value;
  const interestRate =
    parseFloat(document.getElementById("interest-rate").value) || 0;

  // Convert interest rate to decimal
  const interestRateDecimal = interestRate / 100;

  // Calculate contributions per year based on frequency
  let contributionsPerYear;
  switch (frequency) {
    case "weekly":
      contributionsPerYear = 52;
      break;
    case "biweekly":
      contributionsPerYear = 26;
      break;
    case "monthly":
      contributionsPerYear = 12;
      break;
    default:
      contributionsPerYear = 12;
  }

  // Calculate time to reach goal
  let balance = initial;
  let months = 0;
  let totalContributions = 0;
  const milestones = [];
  const chartData = {
    labels: [],
    balances: [],
    contributions: [],
    interest: [],
  };

  // If no interest and no contributions, it's impossible to reach the goal
  if (interestRateDecimal === 0 && contribution === 0 && initial < goal) {
    document.getElementById("time-to-goal").textContent =
      "Impossible without contributions or interest";
    document.getElementById("total-contributions").textContent = "$0.00";
    document.getElementById("interest-earned").textContent = "$0.00";
    return;
  }

  // If initial amount already meets or exceeds the goal
  if (initial >= goal) {
    document.getElementById("time-to-goal").textContent =
      "0 months (Goal already met)";
    document.getElementById("total-contributions").textContent = "$0.00";
    document.getElementById("interest-earned").textContent = "$0.00";

    // Update chart with just the initial amount
    updateSavingsChart([0], [initial], [0], [0]);

    // Update milestones table
    updateMilestonesTable([
      {
        time: "0 months",
        balance: initial,
        percentage: 100,
      },
    ]);

    return;
  }

  // Calculate time to reach goal
  let totalInterest = 0;

  while (balance < goal && months < 600) {
    // Cap at 50 years
    months++;

    // Add contribution
    const monthlyContribution = contribution * (contributionsPerYear / 12);
    balance += monthlyContribution;
    totalContributions += monthlyContribution;

    // Add interest (monthly compounding)
    const monthlyInterest = balance * (interestRateDecimal / 12);
    balance += monthlyInterest;
    totalInterest += monthlyInterest;

    // Add data points for chart (every 6 months or at the end)
    if (months % 6 === 0 || balance >= goal) {
      const timeLabel =
        months <= 12
          ? `${months} months`
          : `${Math.floor(months / 12)} years ${months % 12} months`;
      chartData.labels.push(timeLabel);
      chartData.balances.push(balance);
      chartData.contributions.push(initial + totalContributions);
      chartData.interest.push(totalInterest);

      // Add milestone
      if (months % 12 === 0 || balance >= goal) {
        milestones.push({
          time: timeLabel,
          balance: balance,
          percentage: Math.min(Math.round((balance / goal) * 100), 100),
        });
      }
    }

    // Break if goal is reached
    if (balance >= goal) {
      break;
    }
  }

  // Format time to goal
  let timeToGoal;
  if (months < 600) {
    if (months <= 12) {
      timeToGoal = `${months} months`;
    } else {
      const years = Math.floor(months / 12);
      const remainingMonths = months % 12;
      timeToGoal =
        remainingMonths > 0
          ? `${years} years, ${remainingMonths} months`
          : `${years} years`;
    }
  } else {
    timeToGoal = "More than 50 years";
  }

  // Update results
  document.getElementById("time-to-goal").textContent = timeToGoal;
  document.getElementById("total-contributions").textContent = `$${(
    initial + totalContributions
  ).toFixed(2)}`;
  document.getElementById(
    "interest-earned"
  ).textContent = `$${totalInterest.toFixed(2)}`;

  // Update chart
  updateSavingsChart(
    chartData.labels,
    chartData.balances,
    chartData.contributions,
    chartData.interest
  );

  // Update milestones table
  updateMilestonesTable(milestones);

  // Show results
  savingsResults.style.display = "block";
}

function updateSavingsChart(labels, balances, contributions, interest) {
  const ctx = savingsChart.getContext("2d");

  // Destroy existing chart if it exists
  if (savingsChartInstance) {
    savingsChartInstance.destroy();
  }

  // Create new chart
  savingsChartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Total Balance",
          data: balances,
          backgroundColor: "rgba(99, 102, 241, 0.2)",
          borderColor: "rgba(99, 102, 241, 1)",
          borderWidth: 2,
          fill: true,
        },
        {
          label: "Contributions",
          data: contributions,
          backgroundColor: "rgba(16, 185, 129, 0.2)",
          borderColor: "rgba(16, 185, 129, 1)",
          borderWidth: 2,
          fill: true,
        },
        {
          label: "Interest",
          data: interest.map((int, i) => contributions[i] + int),
          backgroundColor: "rgba(30, 41, 59, 0.2)",
          borderColor: "rgba(30, 41, 59, 1)",
          borderWidth: 2,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function (value) {
              return "$" + value.toLocaleString();
            },
          },
        },
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: function (context) {
              const label = context.dataset.label || "";
              const value = context.raw || 0;
              return `${label}: $${value.toFixed(2)}`;
            },
          },
        },
      },
    },
  });
}

function updateMilestonesTable(milestones) {
  const tbody = document.querySelector("#milestones-table tbody");
  tbody.innerHTML = "";

  milestones.forEach((milestone) => {
    const row = document.createElement("tr");

    const timeCell = document.createElement("td");
    timeCell.textContent = milestone.time;

    const balanceCell = document.createElement("td");
    balanceCell.textContent = `$${milestone.balance.toFixed(2)}`;

    const percentageCell = document.createElement("td");
    percentageCell.textContent = `${milestone.percentage}%`;

    row.appendChild(timeCell);
    row.appendChild(balanceCell);
    row.appendChild(percentageCell);

    tbody.appendChild(row);
  });
}

// Subscription Tracker
function initSubscriptionTracker() {
  if (!subscriptionForm || !addSubscriptionButton) return;

  // Add subscription
  addSubscriptionButton.addEventListener("click", addSubscription);

  // Submit form
  subscriptionForm.addEventListener("submit", (e) => {
    e.preventDefault();
    calculateSubscriptions();
  });

  // Enable remove button for first subscription
  document.querySelector(".remove-subscription").disabled = true;
}

function addSubscription() {
  subscriptionCount++;

  const subscriptionItem = document.createElement("div");
  subscriptionItem.classList.add("subscription-item");

  subscriptionItem.innerHTML = `
        <div class="form-group">
            <label for="sub-name-${subscriptionCount}">Subscription Name</label>
            <input type="text" id="sub-name-${subscriptionCount}" placeholder="e.g., Netflix" required>
        </div>
        <div class="form-group">
            <label for="sub-cost-${subscriptionCount}">Monthly Cost</label>
            <div class="input-with-icon">
                <i class="fas fa-dollar-sign"></i>
                <input type="number" id="sub-cost-${subscriptionCount}" min="0" step="0.01" required>
            </div>
        </div>
        <div class="form-group">
            <label for="sub-category-${subscriptionCount}">Category</label>
            <select id="sub-category-${subscriptionCount}">
                <option value="entertainment">Entertainment</option>
                <option value="music">Music</option>
                <option value="news">News</option>
                <option value="software">Software</option>
                <option value="gaming">Gaming</option>
                <option value="food">Food Delivery</option>
                <option value="fitness">Fitness</option>
                <option value="other">Other</option>
            </select>
        </div>
        <div class="form-group">
            <label for="sub-essential-${subscriptionCount}">Essential?</label>
            <select id="sub-essential-${subscriptionCount}">
                <option value="no">No</option>
                <option value="yes">Yes</option>
            </select>
        </div>
        <button type="button" class="remove-subscription btn-icon"><i class="fas fa-trash"></i></button>
    `;

  subscriptionList.appendChild(subscriptionItem);

  // Enable all remove buttons
  const removeButtons = document.querySelectorAll(".remove-subscription");
  removeButtons.forEach((button) => {
    button.disabled = false;
    button.addEventListener("click", function () {
      this.closest(".subscription-item").remove();

      // If only one subscription left, disable its remove button
      if (document.querySelectorAll(".subscription-item").length === 1) {
        document.querySelector(".remove-subscription").disabled = true;
      }
    });
  });
}

function calculateSubscriptions() {
  const subscriptions = [];
  const subscriptionItems = document.querySelectorAll(".subscription-item");

  subscriptionItems.forEach((item, index) => {
    const id = index + 1;
    const name = document.getElementById(`sub-name-${id}`).value;
    const cost =
      parseFloat(document.getElementById(`sub-cost-${id}`).value) || 0;
    const category = document.getElementById(`sub-category-${id}`).value;
    const essential =
      document.getElementById(`sub-essential-${id}`).value === "yes";

    subscriptions.push({
      name,
      cost,
      category,
      essential,
    });
  });

  // Calculate totals
  const monthlyTotal = subscriptions.reduce(
    (total, sub) => total + sub.cost,
    0
  );
  const yearlyTotal = monthlyTotal * 12;
  const nonEssentialMonthly = subscriptions
    .filter((sub) => !sub.essential)
    .reduce((total, sub) => total + sub.cost, 0);
  const potentialSavings = nonEssentialMonthly * 12;

  // Update summary
  document.getElementById(
    "monthly-total"
  ).textContent = `$${monthlyTotal.toFixed(2)}`;
  document.getElementById("yearly-total").textContent = `$${yearlyTotal.toFixed(
    2
  )}`;
  document.getElementById(
    "potential-savings"
  ).textContent = `$${potentialSavings.toFixed(2)}`;

  // Update table
  updateSubscriptionTable(subscriptions);

  // Update chart
  updateSubscriptionChart(subscriptions);

  // Show results
  subscriptionResults.style.display = "block";
}

function updateSubscriptionTable(subscriptions) {
  const tbody = document.querySelector("#subscription-table tbody");
  tbody.innerHTML = "";

  subscriptions.forEach((sub) => {
    const row = document.createElement("tr");

    const nameCell = document.createElement("td");
    nameCell.textContent = sub.name;

    const categoryCell = document.createElement("td");
    categoryCell.textContent =
      sub.category.charAt(0).toUpperCase() + sub.category.slice(1);

    const monthlyCostCell = document.createElement("td");
    monthlyCostCell.textContent = `$${sub.cost.toFixed(2)}`;

    const yearlyCostCell = document.createElement("td");
    yearlyCostCell.textContent = `$${(sub.cost * 12).toFixed(2)}`;

    const essentialCell = document.createElement("td");
    essentialCell.textContent = sub.essential ? "Yes" : "No";

    row.appendChild(nameCell);
    row.appendChild(categoryCell);
    row.appendChild(monthlyCostCell);
    row.appendChild(yearlyCostCell);
    row.appendChild(essentialCell);

    tbody.appendChild(row);
  });
}

function updateSubscriptionChart(subscriptions) {
  const ctx = subscriptionChart.getContext("2d");

  // Group subscriptions by category
  const categories = {};
  subscriptions.forEach((sub) => {
    if (!categories[sub.category]) {
      categories[sub.category] = 0;
    }
    categories[sub.category] += sub.cost;
  });

  // Prepare data for chart
  const labels = Object.keys(categories).map(
    (cat) => cat.charAt(0).toUpperCase() + cat.slice(1)
  );
  const data = Object.values(categories);

  // Define colors for categories
  const categoryColors = {
    entertainment: "rgba(99, 102, 241, 0.8)",
    music: "rgba(16, 185, 129, 0.8)",
    news: "rgba(30, 41, 59, 0.8)",
    software: "rgba(245, 158, 11, 0.8)",
    gaming: "rgba(239, 68, 68, 0.8)",
    food: "rgba(139, 92, 246, 0.8)",
    fitness: "rgba(20, 184, 166, 0.8)",
    other: "rgba(148, 163, 184, 0.8)",
  };

  const backgroundColor = labels.map((label) => {
    const category = label.toLowerCase();
    return categoryColors[category] || "rgba(148, 163, 184, 0.8)";
  });

  // Destroy existing chart if it exists
  if (subscriptionChartInstance) {
    subscriptionChartInstance.destroy();
  }

  // Create new chart
  subscriptionChartInstance = new Chart(ctx, {
    type: "pie",
    data: {
      labels: labels,
      datasets: [
        {
          data: data,
          backgroundColor: backgroundColor,
          borderColor: "white",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const label = context.label || "";
              const value = context.raw || 0;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = Math.round((value / total) * 100);
              return `${label}: $${value.toFixed(2)} (${percentage}%)`;
            },
          },
        },
      },
    },
  });
}
