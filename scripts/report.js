// Global chart variables
let productionChart;
let expenseBarChart;
let expensePieChart;
let currentChartType = 'production'; // Track current chart type

// DOM Content Loaded event
document.addEventListener('DOMContentLoaded', function() {
    initializeCharts('production');
    setupEventListeners();
});

// Initialize charts based on type
async function initializeCharts(chartType, timeRange = 'all') {
    try {
        // Clear previous errors
        document.getElementById('error-message').style.display = 'none';
        
        // Show appropriate container
        document.getElementById('productionContainer').style.display = 
            chartType === 'production' ? 'block' : 'none';
        document.getElementById('expenseContainer').style.display = 
            chartType === 'expense' ? 'block' : 'none';

        if (chartType === 'production') {
            await initializeProductionChart(timeRange);
        } else if (chartType === 'expense') {
            await initializeExpenseCharts(timeRange);
        }

        currentChartType = chartType;
    } catch (error) {
        console.error('Chart initialization error:', error);
        showError(error.message);
    }
}

// Initialize the production chart
async function initializeProductionChart(timeRange = 'all') {
    // Fetch data
    const data = await fetchData('production', timeRange);
    
    // Check if data is empty
    if (data.length === 0) {
        throw new Error('No production data available for the selected time range');
    }

    // Aggregate data by date
    const aggregatedData = aggregateDataByDate(data);

    // Get canvas context
    const ctx = document.getElementById('productionChart').getContext('2d');
    
    // Destroy previous chart if exists
    if (productionChart) {
        productionChart.destroy();
    }

    // Create new chart with aggregated data
    productionChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: aggregatedData.map(item => item.date),
            datasets: [{
                label: 'Total Production (units)',
                data: aggregatedData.map(item => item.totalQuantity),
                backgroundColor: 'rgba(76, 175, 80, 0.7)',
                borderColor: 'rgba(76, 175, 80, 1)',
                borderWidth: 1,
                barThickness: 'flex',
                maxBarThickness: 50
            }]
        },
        options: getBarChartOptions('Quantity (units)')
    });
}

// Initialize expense charts
async function initializeExpenseCharts(timeRange = 'all') {
    // Fetch expense data
    const expenseData = await fetchData('expense', timeRange);
    
    // Check if data is empty
    if (expenseData.length === 0) {
        throw new Error('No expense data available for the selected time range');
    }

    // Destroy previous charts if they exist
    if (expenseBarChart) {
        expenseBarChart.destroy();
    }
    if (expensePieChart) {
        expensePieChart.destroy();
    }

    // Process data for bar chart (daily totals)
    const dailyExpenses = aggregateDataByDate(expenseData, 'amount');
    
    // Process data for pie chart (categories)
    const categoryExpenses = aggregateDataByCategory(expenseData);

    // Create daily expense bar chart
    const barCtx = document.getElementById('expenseBarChart').getContext('2d');
    expenseBarChart = new Chart(barCtx, {
        type: 'bar',
        data: {
            labels: dailyExpenses.map(item => item.date),
            datasets: [{
                label: 'Daily Expenses',
                data: dailyExpenses.map(item => item.totalAmount),
                backgroundColor: 'rgba(255, 99, 132, 0.7)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1,
                barThickness: 'flex',
                maxBarThickness: 50
            }]
        },
        options: getBarChartOptions('Amount ($)')
    });

    // Create expense category pie chart
    const pieCtx = document.getElementById('expensePieChart').getContext('2d');
    expensePieChart = new Chart(pieCtx, {
        type: 'pie',
        data: {
            labels: categoryExpenses.map(item => item.category),
            datasets: [{
                data: categoryExpenses.map(item => item.totalAmount),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.7)',
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(255, 206, 86, 0.7)',
                    'rgba(75, 192, 192, 0.7)',
                    'rgba(153, 102, 255, 0.7)',
                    'rgba(255, 159, 64, 0.7)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        font: {
                            size: 14
                        }
                    }
                },
                tooltip: {
                    bodyFont: {
                        size: 14
                    },
                    titleFont: {
                        size: 16
                    },
                    callbacks: {
                        label: function(context) {
                            return `${context.label}: $${context.raw.toFixed(2)}`;
                        }
                    }
                }
            }
        }
    });
}

// Helper function to aggregate data by date
function aggregateDataByDate(data, valueField = 'quantity') {
    const dateMap = new Map();
    
    data.forEach(item => {
        const dateKey = item.date;
        const value = parseFloat(item[valueField]);
        
        if (dateMap.has(dateKey)) {
            const existing = dateMap.get(dateKey);
            dateMap.set(dateKey, {
                date: dateKey,
                [`total${valueField.charAt(0).toUpperCase() + valueField.slice(1)}`]: 
                    existing[`total${valueField.charAt(0).toUpperCase() + valueField.slice(1)}`] + value
            });
        } else {
            dateMap.set(dateKey, {
                date: dateKey,
                [`total${valueField.charAt(0).toUpperCase() + valueField.slice(1)}`]: value
            });
        }
    });
    
    return Array.from(dateMap.values()).sort((a, b) => new Date(a.date) - new Date(b.date));
}

// Helper function to aggregate data by category
function aggregateDataByCategory(data) {
    const categoryMap = new Map();
    
    data.forEach(item => {
        const category = item.category || 'Uncategorized';
        const amount = parseFloat(item.amount);
        
        if (categoryMap.has(category)) {
            const existing = categoryMap.get(category);
            categoryMap.set(category, {
                category: category,
                totalAmount: existing.totalAmount + amount
            });
        } else {
            categoryMap.set(category, {
                category: category,
                totalAmount: amount
            });
        }
    });
    
    return Array.from(categoryMap.values()).sort((a, b) => b.totalAmount - a.totalAmount);
}

// Generic function to fetch data
async function fetchData(dataType, timeRange) {
    try {
        const response = await fetch(`./php/report.php?dataType=${dataType}&timeRange=${timeRange}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.error || 'Unknown server error');
        }
        
        return result.data;
    } catch (error) {
        console.error('Fetch error:', error);
        throw new Error(`Failed to load ${dataType} data`);
    }
}

// Helper function for bar chart options
function getBarChartOptions(yAxisTitle) {
    return {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: yAxisTitle,
                    font: {
                        size: 14,
                        weight: 'bold'
                    }
                },
                ticks: {
                    font: {
                        size: 12
                    }
                }
            },
            x: {
                title: {
                    display: true,
                    text: 'Date',
                    font: {
                        size: 14,
                        weight: 'bold'
                    }
                },
                ticks: {
                    font: {
                        size: 12
                    },
                    maxRotation: 45,
                    minRotation: 45
                }
            }
        },
        plugins: {
            legend: {
                labels: {
                    font: {
                        size: 14
                    }
                }
            },
            tooltip: {
                bodyFont: {
                    size: 14
                },
                titleFont: {
                    size: 16
                },
                callbacks: {
                    label: function(context) {
                        return `${context.dataset.label}: ${context.raw}`;
                    }
                }
            }
        }
    };
}

// Setup event listeners
function setupEventListeners() {
    // Filter button
    document.getElementById('applyFiltersButton').addEventListener('click', function(e) {
        e.preventDefault();
        const timeRange = document.getElementById('timeRange').value;
        initializeCharts(currentChartType, timeRange);
    });

    // Chart links
    document.getElementById('productionLink').addEventListener('click', function(e) {
        e.preventDefault();
        setActiveTab(this);
        document.getElementById('chartTitle').textContent = 'Daily Production Analysis';
        initializeCharts('production');
    });

    document.getElementById('expenseLink').addEventListener('click', function(e) {
        e.preventDefault();
        setActiveTab(this);
        document.getElementById('chartTitle').textContent = 'Daily Expense Analysis';
        initializeCharts('expense');
    });

    document.getElementById('incomeLink').addEventListener('click', function(e) {
        e.preventDefault();
        setActiveTab(this);
        document.getElementById('chartTitle').textContent = 'Daily Income Analysis';
        // You would need to implement income chart loading here
    });
}

// Helper function to set active tab
function setActiveTab(activeElement) {
    document.querySelectorAll('.chart-link').forEach(link => {
        link.classList.remove('active');
    });
    activeElement.classList.add('active');
}

// Show error message
function showError(message) {
    const errorElement = document.getElementById('error-message');
    errorElement.textContent = message;
    errorElement.style.display = 'block';
}