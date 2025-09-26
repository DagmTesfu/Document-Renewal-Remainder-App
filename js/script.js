//Document Ready Function
    $("#documentForm").on("submit", function(e){
        e.preventDefault(); //stop the form from submitting

        //Get the values from the form
        const docName = $("#docName").val();
        const expiryDate = $("#expiryDate").val();

        //Check in console
        console.log('Document Name:', docName);
        console.log('Expiry Date:', expiryDate);

        //Create a new list item
        const newRemainder = `<li>${docName} - Expires on: ${expiryDate} <button class="delete-btn">Delete</button></li>`

        // Add it to the <ul>
        $("#remainderList").append(newRemainder);

        //Clear the form for the next entry
        $("#docName").val("");
        $("#expiryDate").val("");

        // Event delegation: Listen for clicks on any .delete-btn, even future ones
        $("#remainderList").on("click", ".delete-btn", function() {
         // Remove the closest <li> (the parent of the button)
        $(this).parent("li").remove();
        });

                
    });



