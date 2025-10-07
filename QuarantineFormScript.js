var PRODUCT_TABLE = "gsc_product"; // product table id
var SEARCH_FIELD = "gsc_qr_stockcodesearch"; // Search field on form
var STOCKCODE_FIELD = "gsc_qr_stockcode"; // Stockcode lookup field
var PARTDESC_FIELD = "gsc_qr_partdescription"; // Part description lookup field
var PRODUCTCLASS_FIELD = "gsc_qr_productclass"; // Product class lookup field

// Main function to search for product
function onStockcodeSearch(executionContext) {
    var formContext = executionContext.getFormContext();
    var searchValue = formContext.getAttribute(SEARCH_FIELD).getValue();
    
    // Clear previous values
    formContext.getAttribute(STOCKCODE_FIELD).setValue(null);
    formContext.getAttribute(PARTDESC_FIELD).setValue(null);
    formContext.getAttribute(PRODUCTCLASS_FIELD).setValue(null);
    
    if (!searchValue || searchValue.trim() === "") {
        return; // Exit if search field is empty
    }
    
    // Trim and normalize the search value
    searchValue = searchValue.trim();
    
    // Show loading indicator
    formContext.ui.setFormNotification("Searching for product...", "INFO", "searchNotification");
    
    // Build FetchXML query
    var fetchXml = [
        "<fetch top='1'>",
        "  <entity name='" + PRODUCT_TABLE + "'>",
        "    <attribute name='" + PRODUCT_TABLE + "id'/>",
        "    <attribute name='gsc_qr_stockcode'/>", 
        "    <attribute name='gsc_qr_partdescription'/>",
        "    <attribute name='gsc_qr_productclass'/>",
        "    <filter>",
        "      <condition attribute='gsc_qr_stockcode' operator='eq' value='" + escapeXml(searchValue) + "'/>",
        "    </filter>",
        "  </entity>",
        "</fetch>"
    ].join("");
    
    // Execute the query
    Xrm.WebApi.retrieveMultipleRecords(PRODUCT_TABLE, "?fetchXml=" + encodeURIComponent(fetchXml))
        .then(
            function success(result) {
                // Clear the loading notification
                formContext.ui.clearFormNotification("searchNotification");
                
                if (result.entities.length > 0) {
                    var product = result.entities[0];
                    
                    // Create lookup object
                    var lookupValue = [{
                        id: product[PRODUCT_TABLE + "id"],
                        name: product.gsc_qr_stockcode, 
                        entityType: PRODUCT_TABLE
                    }];
                    
                    // Set all three lookup fields to the same product
                    formContext.getAttribute(STOCKCODE_FIELD).setValue(lookupValue);
                    formContext.getAttribute(PARTDESC_FIELD).setValue(lookupValue);
                    formContext.getAttribute(PRODUCTCLASS_FIELD).setValue(lookupValue);
                    
                    // Clear the search field
                    formContext.getAttribute(SEARCH_FIELD).setValue(null);
                    
                    // Show success message
                    formContext.ui.setFormNotification(
                        "Product found and linked successfully!",
                        "INFO",
                        "successNotification"
                    );
                    
                    // Auto-clear success message after 3 seconds
                    setTimeout(function() {
                        formContext.ui.clearFormNotification("successNotification");
                    }, 3000);
                    
                } else {
                    // No product found
                    formContext.ui.setFormNotification(
                        "Stockcode '" + searchValue + "' not found in Product table.",
                        "WARNING",
                        "notFoundNotification"
                    );
                    
                    // Auto-clear warning after 5 seconds
                    setTimeout(function() {
                        formContext.ui.clearFormNotification("notFoundNotification");
                    }, 5000);
                }
            },
            function error(error) {
                // Clear the loading notification
                formContext.ui.clearFormNotification("searchNotification");
                
                // Show error message
                formContext.ui.setFormNotification(
                    "Error searching for product: " + error.message,
                    "ERROR",
                    "errorNotification"
                );
                console.log("Error details: ", error);
            }
        );
}

// Helper function to escape XML special characters
function escapeXml(unsafe) {
    if (!unsafe) return unsafe;
    return unsafe.replace(/[<>&'"]/g, function (c) {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
        }
    });
}

// Optional: Function to clear all fields
function clearProductFields(executionContext) {
    var formContext = executionContext.getFormContext();
    formContext.getAttribute(STOCKCODE_FIELD).setValue(null);
    formContext.getAttribute(PARTDESC_FIELD).setValue(null);
    formContext.getAttribute(PRODUCTCLASS_FIELD).setValue(null);
    formContext.getAttribute(SEARCH_FIELD).setValue(null);
}
