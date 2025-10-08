// ...existing code...
$(document).ready(function() {
    const STORAGE_KEY = "reminders";
    let reminders = [];

    function loadReminders() {
        const raw = localStorage.getItem(STORAGE_KEY);
        reminders = raw ? JSON.parse(raw) : [];
    }

    function saveReminders() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
    }

    function renderReminders() {
        $("#reminderItems").empty();
        reminders.forEach((r, idx) => {
            const li = `<li data-index="${idx}">${r.docName} - Expires on: ${r.expiryDate} <button class="delete-btn">Delete</button></li>`;
            $("#reminderItems").append(li);
        });
    }

    // Load and render on page load
    loadReminders();
    renderReminders();

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

        reminders.push({ docName, expiryDate });
        saveReminders();
        renderReminders();

        $("#docName").val("");
        $("#expiryDate").val("");
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
        reminders = [];
        saveReminders();
        renderReminders();
    });
});
// ...existing code...