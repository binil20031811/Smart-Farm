document.addEventListener("DOMContentLoaded", function() {
    const username = new URLSearchParams(window.location.search).get('username') || 
                    sessionStorage.getItem('username');
    
    if (!username) {
        window.location.href = 'login.html';
        return;
    }

    const calendarEl = document.getElementById('calendar');
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,dayGridWeek'
        },
        firstDay: 1, // Start week on Monday
        dayMaxEvents: true,
        height: 'auto',
        datesSet: function(dateInfo) {
            // Update stats when month changes
            updateMonthStats(username, dateInfo.start, dateInfo.end);
        },
        events: async function(fetchInfo, successCallback) {
            try {
                const response = await fetch(
                    `./scripts/api/get_worker_attendance.php?username=${encodeURIComponent(username)}` +
                    `&start=${fetchInfo.startStr}&end=${fetchInfo.endStr}`
                );
                const dbData = await response.json();
                
                // Generate complete date range up to today
                const startDate = new Date(fetchInfo.start);
                const endDate = new Date(fetchInfo.end);
                const currentDate = new Date();
                currentDate.setHours(0, 0, 0, 0);
                
                const allDates = [];
                for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
                    if (d <= currentDate) {
                        const dateStr = d.toISOString().split('T')[0];
                        allDates.push(dateStr);
                    }
                }

                // Create calendar events
                const events = allDates.map(date => {
                    const dbRecord = dbData.find(item => item.date === date);
                    const isPresent = dbRecord ? dbRecord.present : false;
                    
                    return {
                        title: isPresent ? 'Present' : 'Absent',
                        start: date,
                        allDay: true,
                        color: isPresent ? '#4CAF50' : '#F44336',
                        display: 'background'
                    };
                });

                successCallback(events);
            } catch (error) {
                console.error('Error:', error);
                document.getElementById('message').textContent = 'Failed to load attendance data';
            }
        },
        eventDidMount: function(info) {
            info.el.title = `${info.event.title} - ${info.event.startStr}`;
            
            // Highlight current day
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (info.event.start.getTime() === today.getTime()) {
                info.el.style.border = '2px solid #FFC107';
            }
        }
    });
    
    calendar.render();

    // Initial load of stats for current month
    updateMonthStats(username, calendar.view.activeStart, calendar.view.activeEnd);

    // Function to calculate and display monthly statistics
    async function updateMonthStats(username, startDate, endDate) {
        try {
            const response = await fetch(
                `./scripts/api/get_worker_attendance.php?username=${encodeURIComponent(username)}` +
                `&start=${startDate.toISOString().split('T')[0]}&end=${endDate.toISOString().split('T')[0]}`
            );
            const dbData = await response.json();
            
            // 1. Get total days in the month
            const totalDaysInMonth = getDaysInMonth(startDate);
            
            // 2. Get current date (without time)
            const currentDate = new Date();
            currentDate.setHours(0, 0, 0, 0);
            
            // 3. Calculate how many days have passed in this month
            let daysPassed = 0;
            if (startDate > currentDate) {
                daysPassed = 0; // Month is in the future
            } else if (endDate < currentDate) {
                daysPassed = totalDaysInMonth; // Entire month has passed
            } else {
                // Month includes today - count days from start to today
                daysPassed = Math.floor((currentDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
            }
            
            // 4. Count present days (only for dates that have passed)
            const presentDays = dbData.filter(item => {
                const itemDate = new Date(item.date);
                return item.present && 
                       itemDate >= startDate && 
                       itemDate <= currentDate;
            }).length;
            
            // 5. Calculate absent days (only for days that have passed)
            const absentDays = daysPassed - presentDays;
            
            // Update the display
            document.getElementById('total-days').textContent = totalDaysInMonth;
            document.getElementById('present-days').textContent = presentDays;
            document.getElementById('absent-days').textContent = absentDays;
            
        } catch (error) {
            console.error('Error:', error);
            document.getElementById('message').textContent = 'Failed to load attendance statistics';
        }
    }
    
    // Helper function to get number of days in a month
    function getDaysInMonth(date) {
        const year = date.getFullYear();
        const month = date.getMonth();
        return new Date(year, month + 1, 0).getDate();
    }
});