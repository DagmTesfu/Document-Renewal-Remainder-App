// ...existing code...
$(document).ready(function() {
    const STORAGE_KEY = "reminders";
    let reminders = [];

    function loadReminders() {
        const raw = localStorage.getItem(STORAGE_KEY);
        reminders = raw ? JSON.parse(raw) : [];
        // normalize lastNotified field
        reminders = reminders.map(r => {
            if (typeof r.lastNotified === "undefined" || r.lastNotified === null) r.lastNotified = Infinity;
            return r;
        });
    }

    function saveReminders() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
    }

    function getDaysLeft(expiryDateStr) {
        const now = new Date();
        const expiry = new Date(expiryDateStr + "T23:59:59"); // include the whole day
        const diffMs = expiry - now;
        return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    }

    function getStatusClass(daysLeft) {
        if (daysLeft < 0) return "expired";
        if (daysLeft > 30) return "safe";
        if (daysLeft > 15) return "ok";
        if (daysLeft > 10) return "notice";
        if (daysLeft > 5) return "warning";
        if (daysLeft > 3) return "urgent";
        if (daysLeft > 1) return "very-urgent";
        return "due"; // 1 day or less
    }

    function renderReminders() {
        $("#reminderItems").empty();
        const now = new Date();
        reminders.forEach((r, idx) => {
            const daysLeft = getDaysLeft(r.expiryDate);
            const statusClass = getStatusClass(daysLeft);

            let statusText = "";
            if (daysLeft < 0) {
                statusText = `Expired (${Math.abs(daysLeft)} day(s) ago)`;
            } else if (daysLeft === 0) {
                statusText = "Due today (within 24 hours)";
            } else {
                statusText = `Expires in ${daysLeft} day(s)`;
            }

            const li = $(`
                <li data-index="${idx}" class="${statusClass}">
                    <div class="item-left">
                        <strong>${r.docName}</strong>
                        <div class="date">${r.expiryDate}</div>
                    </div>
                    <div class="item-right">
                        <span class="status-text">${statusText}</span>
                        <button class="delete-btn">Delete</button>
                    </div>
                </li>
            `);
            $("#reminderItems").append(li);
        });
    }

    // Notification logic
    const THRESHOLDS = [30, 15, 10, 5, 3, 1, 0]; // days

    function ensureNotificationPermission() {
        if (!("Notification" in window)) return; // not supported
        if (Notification.permission === "default") {
            Notification.requestPermission();
        }
    }

    function notifyUser(title, body) {
        if ("Notification" in window && Notification.permission === "granted") {
            new Notification(title, { body });
        } else {
            // fallback alert (small apps)
            try { alert(`${title}\n\n${body}`); } catch (e) { /* ignore */ }
        }
    }

    function checkNotifications() {
        let changed = false;
        reminders.forEach((r, idx) => {
            const daysLeft = getDaysLeft(r.expiryDate);
            // Ensure lastNotified field exists
            if (typeof r.lastNotified === "undefined" || r.lastNotified === null) r.lastNotified = Infinity;

            // For each threshold from largest to smallest, notify if crossing below it
            for (let t of THRESHOLDS) {
                if (daysLeft <= t && r.lastNotified > t) {
                    const title = "Document Renewal Reminder";
                    const prettyDay = daysLeft < 0 ? `${Math.abs(daysLeft)} day(s) ago` : `${daysLeft} day(s)`;
                    const body = `${r.docName} expires in ${prettyDay} (${r.expiryDate}).`;
                    notifyUser(title, body);
                    r.lastNotified = t;
                    changed = true;
                    // break so we only notify the most urgent threshold at this check
                    break;
                }
            }
        });
        if (changed) saveReminders();
        renderReminders();
    }

    // Init
    loadReminders();
    renderReminders();
    ensureNotificationPermission();
    // Run checks immediately and then every hour
    checkNotifications();
    setInterval(checkNotifications, 1000 * 60 * 60);

    // Image click -> fill input
    $(".doc-image").on("click", function() {
        const selectedDoc = $(this).data("docName") || $(this).data("docname");
        if (selectedDoc) {
            $("#docName").val(selectedDoc);
        }
    });

    // Form submit -> add reminder
    $("#documentForm").on("submit", function(e) {
        e.preventDefault();
        const docName = $("#docName").val().trim();
        const expiryDate = $("#expiryDate").val();

        if (!docName || !expiryDate) return;

        // lastNotified set so notifications won't repeat older thresholds
        reminders.push({ docName, expiryDate, lastNotified: Infinity });
        saveReminders();
        renderReminders();

        $("#docName").val("");
        $("#expiryDate").val("");
        checkNotifications(); // immediate check after adding
    });

    // Delete single reminder (event delegation)
    $("#reminderItems").on("click", ".delete-btn", function() {
        const idx = $(this).closest("li").data("index");
        if (typeof idx === "number") {
            reminders.splice(idx, 1);
            saveReminders();
            renderReminders();
        }
    });

    // Clear all reminders
    $("#clearButton").on("click", function() {
        if (!confirm("Clear all reminders?")) return;
        reminders = [];
        saveReminders();
        renderReminders();
    });
});
// ...existing code...