document.addEventListener("DOMContentLoaded", function () {
    const filterBtn = document.getElementById("filter-btn");
    const fromDateInput = document.getElementById("from-date");
    const toDateInput = document.getElementById("to-date");
    const incomeBody = document.getElementById("income-body");
    const expenseBody = document.getElementById("expense-body");
    const downloadReportBtn = document.getElementById("download-report-btn");
    const addFinanceBtn = document.getElementById("add-finance-btn");

    // Fetch and display data
    function fetchFinanceData(fromDate, toDate) {
        fetch(`./php/fetch_finance.php?fromDate=${fromDate}&toDate=${toDate}`)
            .then(response => response.json())
            .then(data => {
                // Populate income table
                incomeBody.innerHTML = data.income.map(row => `
                    <tr>
                        <td>${row.date}</td>
                        <td>${row.amount}</td>
                        <td>${row.type}</td>
                    </tr>
                `).join("");

                // Populate expense table
                expenseBody.innerHTML = data.expense.map(row => `
                    <tr>
                        <td>${row.date}</td>
                        <td>${row.amount}</td>
                        <td>${row.type}</td>
                    </tr>
                `).join("");
            });
    }

    addFinanceBtn.addEventListener("click", () => {
        window.location.href = "./php/add_finance.php";
    });

    // Filter data by date range
    filterBtn.addEventListener("click", () => {
        const fromDate = fromDateInput.value;
        const toDate = toDateInput.value;
        fetchFinanceData(fromDate, toDate);
    });

    // Download PDF report
    downloadReportBtn.addEventListener("click", () => {
        const fromDate = fromDateInput.value;
        const toDate = toDateInput.value;

        fetch(`./php/fetch_finance.php?fromDate=${fromDate}&toDate=${toDate}`)
            .then(response => response.json())
            .then(data => {
                generatePDF(data, fromDate, toDate);
            });
    });

    // Generate PDF
    function generatePDF(data, fromDate, toDate) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
    
        doc.setFontSize(24);
        doc.setFont("helvetica", "bold");
        doc.text("SMART FARM", 105, 20, { align: 'center' });
    
        doc.setFontSize(18);
        doc.setFont("helvetica", "normal");
        doc.text("Finance Report", 105, 30, { align: 'center' });
    
        doc.setFontSize(12);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 45, { align: 'center' });
        doc.text(`Date Range: ${fromDate} to ${toDate}`, 105, 55, { align: 'center' });
    
        const combinedData = {};
        data.income.forEach(item => {
            if (!combinedData[item.date]) {
                combinedData[item.date] = { income: 0, expense: 0 };
            }
            combinedData[item.date].income += parseFloat(item.amount);
        });
        data.expense.forEach(item => {
            if (!combinedData[item.date]) {
                combinedData[item.date] = { income: 0, expense: 0 };
            }
            combinedData[item.date].expense += parseFloat(item.amount);
        });
    
        const tableData = Object.keys(combinedData).map(date => {
            const income = combinedData[date].income;
            const expense = combinedData[date].expense;
            const total = income - expense;
            return [date, income.toFixed(2), expense.toFixed(2), total.toFixed(2)];
        });
    
        const totalIncome = data.income.reduce((sum, item) => sum + parseFloat(item.amount), 0);
        const totalExpense = data.expense.reduce((sum, item) => sum + parseFloat(item.amount), 0);
        const totalFinance = totalIncome - totalExpense;
        tableData.push(["Total", totalIncome.toFixed(2), totalExpense.toFixed(2), totalFinance.toFixed(2)]);
    
        doc.autoTable({
            head: [['Date', 'Income', 'Expense', 'Total Finance']],
            body: tableData,
            startY: 60,
        });
    
        doc.save(`Finance_Report_${fromDate}_to_${toDate}.pdf`);
    }

    // Load initial data
    fetchFinanceData("", "");
});