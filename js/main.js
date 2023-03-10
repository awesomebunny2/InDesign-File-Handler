//#region REQUIRE ------------------------------------------------------------------------------------------------------------------------------------

    /*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
    /*global $, window, location, CSInterface, SystemPath, themeManager*/
    const fs = require("fs");
    const path = require("path");
    const glob = require('glob');
    const https = require('https');
    const chosen = require('chosen-js');

//#endregion -----------------------------------------------------------------------------------------------------------------------------------------

//#region GLOBAL VARIABLES ---------------------------------------------------------------------------------------------------------------------------
    // Globals
    let globalSettings = [];
    let templateData = [];
    let productTemplates = []; 
    let runCreateDir = false;
    let runOpenNameSaveIndd = false;
    let openTemplate = true;
    let handler = null;


//#endregion -----------------------------------------------------------------------------------------------------------------------------------------

//#region ON READY -----------------------------------------------------------------------------------------------------------------------------------

    (function () {

        'use strict';

        var csInterface = new CSInterface();

        // $("#product").chosen();

        // if (globalSettings.firstTimeUse === true) {
        //     // Show Settings Dialog
        // }


        // glob(templatesURL + '/**/*.indt', {}, (err, files)=>{
            
        //     templateData = files.map((filePath) => {
        //         const fileName = path.basename(filePath);
        //         return {
        //             filePath: filePath,
        //             fileName: fileName
        //         }
        //     });
        // });

        // console.log(templateData);


        init();

    })();

    //#region INIT -----------------------------------------------------------------------------------------------------------------------------------

        async function init() {
                        
            initColors();

            // Load settings...
            const settingsPath = path.join(__dirname, "settings.json");
            let data = await fs.promises.readFile(settingsPath, "utf8");
            globalSettings = JSON.parse(data);

            // Does the active folder exist?
            // 
            if (fs.existsSync(globalSettings.pathToActiveFolder)) {
                console.log("Active Folder verified ✔️")
            } else {
                // Show settings dialog...
                console.log("Directory does not exist ❌")
            }

            //#region CONVERT PRODUCT TEMPLATE CSV TO JSON -------------------------------------------------------------------------------------------

                // Can we get the CSV data as a string from the .COM?
                // https://www.themailshark.com/prepress/ArtFileCreator/product-templates.csv


                const url = "https://www.themailshark.com/prepress/ArtFileCreator/product-templates.csv"
                const csvPath = path.join(__dirname, "product-templates.csv");

                await getRemoteFile(url, csvPath) // Wait for the download to finish

                // Read the downloaded csv
                let csv = fs.readFileSync(csvPath, "utf8");

                var array = csv.split("\r"); // Split CSV by lines into array
                let result = [];
                let headers = array[0].split(",") // Create header array
                array.shift(); // Remove the header row from array

                array.forEach((item) => {
                    let vals = item.split(","); // Get the values of this row
                    let obj = {} // Make empty object
                    headers.forEach((head, index) => {
                        obj[head] = vals[index] // Assign the property from header with value
                    })
                    result.push(obj) // Add object to result array
                })



                // Convert the result array to json and generate the JSON output file.
                let json = JSON.stringify(result);
                const jsonPath = path.join(__dirname, "product-templates.json");
                fs.writeFileSync(jsonPath, json);

                let ptData = await fs.promises.readFile(jsonPath, "utf8");
                productTemplates = JSON.parse(ptData);


                // $.getJSON("product-templates.json", (theStuff) => {
                //     productTemplates = theStuff;
                // });

            //#endregion -----------------------------------------------------------------------------------------------------------------------------

            tryCatch(updateDropdowns);

        };

    //#endregion -------------------------------------------------------------------------------------------------------------------------------------

//#endregion -------------------------------------------------------------------------------------------------------------------------------------

//#region BUTTONS ------------------------------------------------------------------------------------------------------------------------------------

$("#clear").on("click", () => {
    $("#product").val("").trigger("chosen:updated");
});

    //#region ON CREATE CLICK ------------------------------------------------------------------------------------------------------------------------
        /**
         * Get Form Data when Create button is clicked and creates project template file and directory and saves
         */    
        $("#input_form").submit(async function(event) {

            event.preventDefault(); //prevents defaults from executing

            //#region GLOBAL (FUNCTION) VARIABLES ----------------------------------------------------------------------------------------------------

                let title;
                let description1;
                let description2;
                let cta;

            //#endregion -----------------------------------------------------------------------------------------------------------------------------

            //#region GET DATE VARIABLES -------------------------------------------------------------------------------------------------------------
                let time = new Date(Date.now());
                let month = (time.getMonth() + 1).toString().padStart(2, "0");
                let year  = time.getFullYear();
                let day = time.getDate().toString().padStart(2, "0");
            //#endregion -----------------------------------------------------------------------------------------------------------------------------

            //#region FORM DATA ----------------------------------------------------------------------------------------------------------------------
                let formData = {
                    client: $("#client").val(),
                    location: $("#location").val(),
                    product: $("#product").val(),
                    clientCode: $("#client-code").val(),
                    contract: $("#contract").val(),
                    orderLine: $("#order-line").val(),
                }
            //#endregion -----------------------------------------------------------------------------------------------------------------------------

            //#region GET TEMPLATE YEAR FROM TEMPLATE FOLDER NAME ------------------------------------------------------------------------------------

                const templateYearURL = `https://www.themailshark.com/prepress/ArtFileCreator/template-year.txt`

                const templateYearFile = path.join(__dirname, "template-year.txt");
        
                await getRemoteFile(templateYearURL, templateYearFile) // Wait for the download to finish

                let templateYear = await fs.promises.readFile(templateYearFile, "utf8");

                //#region OLD CODE TO SPLIT YEAR FROM TEMPLATE FILE NAME WHEN GRABBING TEMPLATE FILES FROM DIRECTORY ---------------------------------

                    // console.log(globalSettings.pathToTemplates);

                    // const templateFolderName = path.parse(globalSettings.pathToTemplates).base;

                    // const yearFromTemplate = templateFolderName.match(/\d+/);
                    // const templateYear = yearFromTemplate[0];


                    // const theFile = templateData.filter((item) => { //iterates through each object in the templateData array
                    //     let templateName = path.parse(item.fileName).name; //returns just the base file name minus the extension

                    //     let regex = /\s*\b\d{4}\b/g; //regex to remove 4 digit year from end of file name
                    //     templateName = templateName.replace(regex, "") //use regex to replace year with nothing
                    //     //the nice thing about this regex expression is that if there ever is a template that doesn;t end in a 4 digit year, it will kepp the value of the file name and just not get rid of anything, so it still works!

                    //     if (templateName == productTemplateName) { //if the template name minus the year equals the lookUpVal from the .json...
                    //         templateFile = item.filePath; //matches the template name to the assocaited path in templateData
                    //         return;
                    //     };
                    // });

                    // console.log(templateFile);

                //#endregion -------------------------------------------------------------------------------------------------------------------------

            //#endregion -----------------------------------------------------------------------------------------------------------------------------

            //#region CREATE BLANK DOCUMENT EVENT HANDLER --------------------------------------------------------------------------------------------

                var handleOpen = function (event) {
                    // console.log("Event type:", event.type, "Data:", event.data );
                    if (handler == "CREATE") {
                        noOpeningTemplate (formData, year, month, productFolderName);
                        console.log("handleOpen was triggered and run");
                    };
                    // alert("This should now have a name");
                    csInterface.removeEventListener( 'documentAfterActivate', handleOpen);
                };

            //#endregion -----------------------------------------------------------------------------------------------------------------------------

            //#region GET PRODUCT TEMPLATE PATH ------------------------------------------------------------------------------------------------------

                let index;

                //loops through the product-templates.json data that has been stored until it find a system_name variable that matches the formData.product, then it returns the index of the array of said match
                for (let i = 0; i < productTemplates.length; i++) {
                    if (productTemplates[i].system_name == formData.product) {
                        index = i;
                    }
                };

                if (index == undefined) {
                    csInterface.evalScript(`alert("Something went wrong. It is most likely related to the product line feild. Please make sure the product in the Product Feild is a registered product in .net")`, (rtn, err) => {
                        if (err) {
                            console.log(err);
                            alert(err);
                            return;
                        }
                        return;
                    });
                    return;
                };

                //name of the product in .net
                const productSystemName = productTemplates[index].system_name;

                //name of the product in the template file names (minus the year and file extension)
                const productTemplateName = productTemplates[index].template_name;

                //name of the product as it will be seen in the created directories
                const productFolderName = productTemplates[index].directory_name;

                //name of the product in the template file names including the year and file extension
                let fullTemplateName = `${productTemplateName} ${templateYear}.indt`;



                if (productTemplateName == "SHIRT") {

                    title = "T-Shirt Template Unavailable";
                    description1 = "The project you submitted is categorized as a T-Shirt product.";
                    description2 = "Currently, there are no T-Shirt templates available.";
                    cta = "Would you like to choose a template to work from?";

                    csInterface.addEventListener('documentAfterActivate', handleOpen);

                    noTemplateDialog(title, description1, description2, cta, formData, year, month, productFolderName);

                } else if (productTemplateName == "NO DEFAULT") {
                    
                    title = "No Default Template";
                    description1 = `There are no default templates set for ${productSystemName}. This typically means that`;
                    description2 = "you are trying to work on a custom piece or some other non-printing form of artwork.";
                    cta = "Would you like to choose a template to work from?";

                    csInterface.addEventListener('documentAfterActivate', handleOpen);

                    noTemplateDialog(title, description1, description2, cta, formData, year, month, productFolderName);

                } else if (productTemplateName == "MARCOS") {
                    title = "Marco's Project - Template Unavailable";
                    description1 = "The project you submitted contains a product associated with Marco's Pizza.";
                    description2 = "Since most Marco's pieces are based on files sent from corporate, there are no default templates set.";
                    cta = "Would you like to choose a previous piece or template file to work from?";

                    csInterface.addEventListener('documentAfterActivate', handleOpen);

                    noTemplateDialog(title, description1, description2, cta, formData, year, month, productFolderName);

                } else if (productTemplateName == "DUMPDUDEZ") {
                    title = "Dumpster Dudez - Template Unavailable";
                    description1 = "The project you submitted contains a product associated with Dumpster Dudez.";
                    description2 = "Currently, there are no Dumpster Dudez templates available.";
                    cta = "Would you like to choose a previous piece or template to work from?";

                    console.log("About to show shirt dialog");

                    csInterface.addEventListener('documentAfterActivate', handleOpen);

                    noTemplateDialog(title, description1, description2, cta, formData, year, month, productFolderName);

                } else if (productTemplateName == "IGNORE") {

                    csInterface.evalScript(`alert("The project you submitted contains an unregonized product. Please update the product and try again.")`, (rtn, err) => {
                    });
                    return;
                    
                } else if (productTemplateName) { //if productTemplateName has a value...

                    openTemplate = true;

                    typicalExecution (fullTemplateName, templateYear, productTemplateName, formData, year, month, productFolderName);
                } 
                else {
                    //productTemplateName is undefined...
                    alert("idk how to hit this....if you are seeing this remember what you did to trigger it!")
                };

            //#endregion -----------------------------------------------------------------------------------------------------------------------------

        });

    //#endregion -------------------------------------------------------------------------------------------------------------------------------------

//#endregion -----------------------------------------------------------------------------------------------------------------------------------------

//#region SUBJECT LINE PARSERATOR 3001 ---------------------------------------------------------------------------------------------------------------

    $("#subject").keyup(() => subjectPasted());

    //#region SUBJECT PASTED FUNCTION --------------------------------------------------------------------------------------------------------

        /**
         * Auto-fills certain taskpane inputs based on the value pasted into the subject line input
         */
        async function subjectPasted() {

            // console.log("I triggered");
            var paste = $("#subject").val();
            if (paste.length == 0) { // If what's pasted is empty

                console.log("Tis Empty");

                //  $("#warning1").hide(); // Don't show the error
                //  $(this).removeClass("warning-box")
                //  $(this).removeClass("warning-box + .label")
                //  $("#client, #location, #product, #code").val(""); // Empty all inputs

            } else if (!paste.includes("~/*")) { // If what's pasted does not contain "~/*"

                    //  $("#warning1").show().text(`This subject does not contain "~/*"`);
                    //  $(this).addClass("warning-box")
                    //  $(this).addClass("warning-box + .label")
                    //  $("#client, #location, #product, #code").val(""); // Empty all inputs

                    console.log("This is not a valid subject line!");

            } else { // Probably a valid subject (contains ~/*)

                // console.log("A successful attempt!");
                //  $("#warning1").hide() // Hide error
                //  $(this).removeClass("warning-box")
                //  $(this).removeClass("warning-box + .label")

                /** ------------------------------------------------------------
                 Parse the subject, fill the other inputs
                ------------------------------------------------------------ */

                // Split at "-"s
                var splitPaste = paste.split("-");

                var blanks = splitPaste.includes("");

                if (blanks == true) {

                    var noBlanksArr = splitPaste.filter(function(x) {
                        return x !== "";
                    });

                } else {

                    var noBlanksArr = splitPaste;

                };

                //this will remove any RE: or FWD: from the beginning on the subject
                if (noBlanksArr[0].includes(":")) {

                    var str = noBlanksArr[0];

                    str = str.substring(str.indexOf(":") + 1);

                    noBlanksArr.splice(0, 1, str);

                    noBlanksArr[0] = str.trim();

                };


                //If a CSM was being a poop and edited the subject line to have another : in it; no fear, we'll run this code again
                if (noBlanksArr[0].includes(":")) {

                    var str = noBlanksArr[0];

                    str = str.substring(str.indexOf(":") + 1);

                    noBlanksArr.splice(0, 1, str);

                    noBlanksArr[0] = str.trim();

                };

                // var hasPrefix = noBlanksArr[0].includes("Re:") || noBlanksArr[0].includes("RE:") || noBlanksArr[0].includes("re:") || 
                // noBlanksArr[0].includes("Fwd:") || noBlanksArr[0].includes("FWD:") || noBlanksArr[0].includes("fwd:")

                var hasRequest = noBlanksArr[0].includes("CREATIVE REQUEST") || noBlanksArr[0].includes("Creative Request") || 
                noBlanksArr[0].includes("ARTIST REQUEST") || noBlanksArr[0].includes("Artist Request")  || 
                noBlanksArr[0].includes("Urgent") || noBlanksArr[0].includes("Urgent!") || noBlanksArr[0].includes("Urgent!!") || 
                noBlanksArr[0].includes("URGENT") || noBlanksArr[0].includes("URGENT!") || noBlanksArr[0].includes("URGENT!!") ||

                noBlanksArr[0].includes("Urgent Art Request") || noBlanksArr[0].includes("Urgent Art Request!") || 
                noBlanksArr[0].includes("Urgent! Art Request") || noBlanksArr[0].includes("Urgent! Art Request!") ||
                noBlanksArr[0].includes("Urgent Art Request!!") || noBlanksArr[0].includes("Urgent!! Art Request") ||
                noBlanksArr[0].includes("Urgent! Art Request!!") || noBlanksArr[0].includes("Urgent!! Art Request!") ||
                noBlanksArr[0].includes("Urgent!! Art Request!!") || 
                
                noBlanksArr[0].includes("URGENT Art Request") || noBlanksArr[0].includes("URGENT Art Request!") || 
                noBlanksArr[0].includes("URGENT! Art Request") || noBlanksArr[0].includes("URGENT! Art Request!")
                noBlanksArr[0].includes("URGENT Art Request!!") || noBlanksArr[0].includes("URGENT!! Art Request") || 
                noBlanksArr[0].includes("URGENT! Art Request!!") || noBlanksArr[0].includes("URGENT!! Art Request!") || 
                noBlanksArr[0].includes("URGENT!! Art Request!!") ||

                noBlanksArr[0].includes("Urgent ART REQUEST") || noBlanksArr[0].includes("Urgent ART REQUEST!") || 
                noBlanksArr[0].includes("Urgent! ART REQUEST") || noBlanksArr[0].includes("Urgent! ART REQUEST!") ||
                noBlanksArr[0].includes("Urgent ART REQUEST!!") || noBlanksArr[0].includes("Urgent!! ART REQUEST") ||
                noBlanksArr[0].includes("Urgent! ART REQUEST!!") || noBlanksArr[0].includes("Urgent!! ART REQUEST!") ||
                noBlanksArr[0].includes("Urgent!! ART REQUEST!!") || 

                noBlanksArr[0].includes("URGENT ART REQUEST") || noBlanksArr[0].includes("URGENT ART REQUEST!") ||
                noBlanksArr[0].includes("URGENT! ART REQUEST") || noBlanksArr[0].includes("URGENT! ART REQUEST!") ||
                noBlanksArr[0].includes("URGENT ART REQUEST!!") || noBlanksArr[0].includes("URGENT!! ART REQUEST") ||
                noBlanksArr[0].includes("URGENT! ART REQUEST!!") || noBlanksArr[0].includes("URGENT!! ART REQUEST!") || 
                noBlanksArr[0].includes("URGENT!! ART REQUEST!!") ||



                noBlanksArr[0].includes("Urgent Artist Request") || noBlanksArr[0].includes("Urgent Artist Request!") || 
                noBlanksArr[0].includes("Urgent! Artist Request") || noBlanksArr[0].includes("Urgent! Artist Request!") ||
                noBlanksArr[0].includes("Urgent Artist Request!!") || noBlanksArr[0].includes("Urgent!! Artist Request") ||
                noBlanksArr[0].includes("Urgent! Artist Request!!") || noBlanksArr[0].includes("Urgent!! Artist Request!") ||
                noBlanksArr[0].includes("Urgent!! Artist Request!!") || 
                
                noBlanksArr[0].includes("URGENT Artist Request") || noBlanksArr[0].includes("URGENT Artist Request!") || 
                noBlanksArr[0].includes("URGENT! Artist Request") || noBlanksArr[0].includes("URGENT! Artist Request!")
                noBlanksArr[0].includes("URGENT Artist Request!!") || noBlanksArr[0].includes("URGENT!! Artist Request") || 
                noBlanksArr[0].includes("URGENT! Artist Request!!") || noBlanksArr[0].includes("URGENT!! Artist Request!") || 
                noBlanksArr[0].includes("URGENT!! Artist Request!!") ||

                noBlanksArr[0].includes("Urgent ARTIST REQUEST") || noBlanksArr[0].includes("Urgent ARTIST REQUEST!") || 
                noBlanksArr[0].includes("Urgent! ARTIST REQUEST") || noBlanksArr[0].includes("Urgent! ARTIST REQUEST!") ||
                noBlanksArr[0].includes("Urgent ARTIST REQUEST!!") || noBlanksArr[0].includes("Urgent!! ARTIST REQUEST") ||
                noBlanksArr[0].includes("Urgent! ARTIST REQUEST!!") || noBlanksArr[0].includes("Urgent!! ARTIST REQUEST!") ||
                noBlanksArr[0].includes("Urgent!! ARTIST REQUEST!!") || 

                noBlanksArr[0].includes("URGENT ARTIST REQUEST") || noBlanksArr[0].includes("URGENT ARTIST REQUEST!") ||
                noBlanksArr[0].includes("URGENT! ARTIST REQUEST") || noBlanksArr[0].includes("URGENT! ARTIST REQUEST!") ||
                noBlanksArr[0].includes("URGENT ARTIST REQUEST!!") || noBlanksArr[0].includes("URGENT!! ARTIST REQUEST") ||
                noBlanksArr[0].includes("URGENT! ARTIST REQUEST!!") || noBlanksArr[0].includes("URGENT!! ARTIST REQUEST!") || 
                noBlanksArr[0].includes("URGENT!! ARTIST REQUEST!!") ||



                noBlanksArr[0].includes("Urgent Creative Request") || noBlanksArr[0].includes("Urgent Creative Request!") || 
                noBlanksArr[0].includes("Urgent! Creative Request") || noBlanksArr[0].includes("Urgent! Creative Request!") ||
                noBlanksArr[0].includes("Urgent Creative Request!!") || noBlanksArr[0].includes("Urgent!! Creative Request") ||
                noBlanksArr[0].includes("Urgent! Creative Request!!") || noBlanksArr[0].includes("Urgent!! Creative Request!") ||
                noBlanksArr[0].includes("Urgent!! Creative Request!!") || 
                
                noBlanksArr[0].includes("URGENT Creative Request") || noBlanksArr[0].includes("URGENT Creative Request!") || 
                noBlanksArr[0].includes("URGENT! Creative Request") || noBlanksArr[0].includes("URGENT! Creative Request!")
                noBlanksArr[0].includes("URGENT Creative Request!!") || noBlanksArr[0].includes("URGENT!! Creative Request") || 
                noBlanksArr[0].includes("URGENT! Creative Request!!") || noBlanksArr[0].includes("URGENT!! Creative Request!") || 
                noBlanksArr[0].includes("URGENT!! Creative Request!!") ||

                noBlanksArr[0].includes("Urgent CREATIVE REQUEST") || noBlanksArr[0].includes("Urgent CREATIVE REQUEST!") || 
                noBlanksArr[0].includes("Urgent! CREATIVE REQUEST") || noBlanksArr[0].includes("Urgent! CREATIVE REQUEST!") ||
                noBlanksArr[0].includes("Urgent CREATIVE REQUEST!!") || noBlanksArr[0].includes("Urgent!! CREATIVE REQUEST") ||
                noBlanksArr[0].includes("Urgent! CREATIVE REQUEST!!") || noBlanksArr[0].includes("Urgent!! CREATIVE REQUEST!") ||
                noBlanksArr[0].includes("Urgent!! CREATIVE REQUEST!!") || 

                noBlanksArr[0].includes("URGENT CREATIVE REQUEST") || noBlanksArr[0].includes("URGENT CREATIVE REQUEST!") ||
                noBlanksArr[0].includes("URGENT! CREATIVE REQUEST") || noBlanksArr[0].includes("URGENT! CREATIVE REQUEST!") ||
                noBlanksArr[0].includes("URGENT CREATIVE REQUEST!!") || noBlanksArr[0].includes("URGENT!! CREATIVE REQUEST") ||
                noBlanksArr[0].includes("URGENT! CREATIVE REQUEST!!") || noBlanksArr[0].includes("URGENT!! CREATIVE REQUEST!") || 
                noBlanksArr[0].includes("URGENT!! CREATIVE REQUEST!!") ||



                noBlanksArr[0].includes("Urgent Creative Review") || noBlanksArr[0].includes("Urgent Creative Review!") || 
                noBlanksArr[0].includes("Urgent! Creative Review") || noBlanksArr[0].includes("Urgent! Creative Review!") ||
                noBlanksArr[0].includes("Urgent Creative Review!!") || noBlanksArr[0].includes("Urgent!! Creative Review") ||
                noBlanksArr[0].includes("Urgent! Creative Review!!") || noBlanksArr[0].includes("Urgent!! Creative Review!") ||
                noBlanksArr[0].includes("Urgent!! Creative Review!!") || 
                
                noBlanksArr[0].includes("URGENT Creative Review") || noBlanksArr[0].includes("URGENT Creative Review!") || 
                noBlanksArr[0].includes("URGENT! Creative Review") || noBlanksArr[0].includes("URGENT! Creative Review!")
                noBlanksArr[0].includes("URGENT Creative Review!!") || noBlanksArr[0].includes("URGENT!! Creative Review") || 
                noBlanksArr[0].includes("URGENT! Creative Review!!") || noBlanksArr[0].includes("URGENT!! Creative Review!") || 
                noBlanksArr[0].includes("URGENT!! Creative Review!!") ||

                noBlanksArr[0].includes("Urgent CREATIVE REVIEW") || noBlanksArr[0].includes("Urgent CREATIVE REVIEW!") || 
                noBlanksArr[0].includes("Urgent! CREATIVE REVIEW") || noBlanksArr[0].includes("Urgent! CREATIVE REVIEW!") ||
                noBlanksArr[0].includes("Urgent CREATIVE REVIEW!!") || noBlanksArr[0].includes("Urgent!! CREATIVE REVIEW") ||
                noBlanksArr[0].includes("Urgent! CREATIVE REVIEW!!") || noBlanksArr[0].includes("Urgent!! CREATIVE REVIEW!") ||
                noBlanksArr[0].includes("Urgent!! CREATIVE REVIEW!!") || 

                noBlanksArr[0].includes("URGENT CREATIVE REVIEW") || noBlanksArr[0].includes("URGENT CREATIVE REVIEW!") ||
                noBlanksArr[0].includes("URGENT! CREATIVE REVIEW") || noBlanksArr[0].includes("URGENT! CREATIVE REVIEW!") ||
                noBlanksArr[0].includes("URGENT CREATIVE REVIEW!!") || noBlanksArr[0].includes("URGENT!! CREATIVE REVIEW") ||
                noBlanksArr[0].includes("URGENT! CREATIVE REVIEW!!") || noBlanksArr[0].includes("URGENT!! CREATIVE REVIEW!") || 
                noBlanksArr[0].includes("URGENT!! CREATIVE REVIEW!!");

                if (hasRequest == true) {

                    noBlanksArr.shift();

                };

                var plasticS = (noBlanksArr[noBlanksArr.length - 2]).trim();

                if (plasticS == "S" || plasticS == "Flat") {

                    var plasticSIndex = noBlanksArr.indexOf(noBlanksArr[noBlanksArr.length - 2]);

                    noBlanksArr.splice(plasticSIndex, 1);

                    if (plasticS == "Flat") {

                        var productPostFlatIndex = noBlanksArr.indexOf(noBlanksArr[noBlanksArr.length - 2]);

                        noBlanksArr[productPostFlatIndex] = noBlanksArr[noBlanksArr.length - 2] + "Flat";

                    };

                };

                // .NET stuff at end (~/*20104,51824,2*/~)
                // Remove spaces (just in case), "~/*", "*/~", then split at ","
                var splitCodes = noBlanksArr[noBlanksArr.length - 1].replace(' ','').replace('~/*','').replace('*/~','').split(",");

                var theClient = noBlanksArr[0].trim();//.replace(' ', '-');

                var theLocation = noBlanksArr[1].trim();//.replace(' ', '-');

                var theProduct = noBlanksArr[noBlanksArr.length - 2].trim();//.replace(' ', '-');

                var theClientCode = splitCodes[0].trim();

                var theContract = splitCodes[1].trim();

                var theOrderLine = splitCodes[2].trim();

                //  try {
                    //  var match = productIDData[theProduct].productID;
                    //  var updatedProduct = productIDData[theProduct].relativeProduct;

                    $("#client").val(theClient);

                    if (noBlanksArr.length > 3) {
                        $("#location").val(theLocation);
                    };

                    $("#product").val(theProduct).trigger("chosen:updated");

                    $("#client-code").val(theClientCode);

                    $("#contract").val(theContract);

                    $("#order-line").val(theOrderLine);

                    console.log("All feilds have been filled!");

                    //  if (match == undefined) {
                    //      console.log("Product is undefined...");
                    //  } else {
                    //      $("#product").val(updatedProduct).removeClass("grey-sel");
                    //      console.log(`You matched ${updatedProduct}!`);
                    //      newMoverGroupPrint();
                    //  }

                //  } catch (e) {
                //      // Something was wrong with the subject
                //     //  $("#warning1").show().text(`Something's wrong with this subject. Error: ` + e);
                //      console.log("There was an error in the last step");
                //  };

            };
        };

 //#endregion -----------------------------------------------------------------------------------------------------------------------------





 //#endregion ----------------------------------------------------------------------------------------------------------------------------------------
 
 function updateDropdowns() {

    $("#product").empty();
    $("#product").append($("<option disabled selected hidden></option>").val("").text(""));

    productTemplates.forEach(function(row) {

        // Add an option to the select box
        var option = `<option product-id="${row.system_name}" relative-product="${row.template_name}" product-code="${row.directory_name}">${row.system_name}</option>`;

        //finds current relative-product in current option in the product dropdown and returns how many are currently in the dropdown
        var x = $(`#product > option[relative-product="${row.system_name}"]`).length;

        if (x == 0) { // Meaning, it's not there yet, because it's length count is 0
            if (row.system_name !== "") { //if the relative-product in option is empty, do not add to list
                $("#product").append(option);
            };
        };
    });

    $("#product").chosen({
        allow_single_deselect: true,
        placeholder_text_single: " ",
        inherit_select_classes: true,
        no_results_text: "NO DEFAULT"
        // rtl: true
    });

};
 
 
 //#region HELPER FUNCTIONS --------------------------------------------------------------------------------------------------------------------------
 
    //#region GET REMOTE FILE ------------------------------------------------------------------------------------------------------------------------

        /**
         * getRemoteFile(url, outputPath)
         * @param {string} url  Path the file to download
         * @param {string} outputPath Path to the downloaded file
         * @return new Promise
         */
        async function getRemoteFile (url, outputPath) {
            return new Promise ((resolve, reject) => {

                https.get(url,(res) => {

                    // console.log(res);

                    if (res.statusCode === 404) {
                        reject("Page not found.")
                    }

                    // Image will be stored at this path
                    const filePath = fs.createWriteStream(outputPath);
                    res.pipe(filePath);
                    filePath.on('finish',() => {
                        filePath.close();
                        // console.log('Download Completed'); 
                        resolve();
                    });
                })
                // .on("error", () => {
                //     console.log("I am being rejected");
                //     reject(new Error("REJECTED"));
                // });


            })
        }

    //#endregion -------------------------------------------------------------------------------------------------------------------------------------


    async function noTemplateDialog(title, description1, description2, cta, formData, year, month, productFolderName) {

        await csInterface.evalScript(`showShirtDialog("${title}", "${description1}", "${description2}", "${cta}")`, (rtn, err) => {
            if (err) {
                console.log(err);
                csInterface.evalScript(`alert("${err}")`, (rtn, err) => {
                });
                return;
            } else {
                console.log(rtn);
                if (rtn == "Cancelled") {
                    console.log("User cancelled. Exiting...")
                    return;
                } else if (rtn == "Template file opened") {
                    console.log("Template was chosen manually.");
                    noOpeningTemplate (formData, year, month, productFolderName);
                    return;
                } else if (rtn == "New document created") {
                    console.log("Create a new document was chosen.");
                    handler = "CREATE";
                    //the handleOpen event handler will trigger once the user submits the creat document dialog to run the noOpeningTemaplte function
                    return;
                } else {
                    alert("Something went terribly wrong...");
                };
            };
        });
    };

    async function typicalExecution (fullTemplateName, templateYear, productTemplateName, formData, year, month, productFolderName) {

        let pathToTemplate = await productTempPath(fullTemplateName, templateYear, productTemplateName, formData);

        let inddInfo = createDirectory(formData, year, month, productFolderName);

        openNameSaveIndd(inddInfo.inddFilePath, pathToTemplate, year, month, productFolderName, formData, inddInfo.inddFileName, inddInfo.parentDir, openTemplate);
        
    };



    function noOpeningTemplate (formData, year, month, productFolderName) {
        let inddInfo = createDirectory(formData, year, month, productFolderName);

        openTemplate = false;

        openNameSaveIndd(inddInfo.inddFilePath, undefined, year, month, productFolderName, formData, inddInfo.inddFileName, inddInfo.parentDir, openTemplate);
    };



    //#region GET PRODUCT TEMPLATE PATH ------------------------------------------------------------------------------------------------------

        /**
         * Downloads the proper template file and creates a path to it
         * @param {String} fullTemplateName Name of the product template including the year and file extension
         * @param {String} templateYear 4 digit year string grabbed from the template-year.txt file when a new template year is released
         * @param {String} productTemplateName The name of the product template, grabbed from the product-templates.json
         * @param {Object} formData Object containing the elements from the extension form submitted by the user
         * @returns 
         */
        async function productTempPath(fullTemplateName, templateYear, productTemplateName, formData) {

            const productTemplateURL = `https://www.themailshark.com/prepress/ArtFileCreator/Templates/${fullTemplateName}`;
            const templatePath = path.join(__dirname, "downloaded-templates", fullTemplateName);

            // console.log(templatePath);

            let lePromise = true;
            await getRemoteFile(productTemplateURL, templatePath)
                .catch(err => {
                    // 404?
                    console.log(err)
                    lePromise = false;
                }) // Wait for the download to finish

            if (lePromise == false) {
                console.log("The requested template file does not exist. Exiting...");
                csInterface.evalScript(`alert("The requested template for ${formData.product} does not exist in the template files. Please change to another product.")`, (rtn, err) => {
                });
                return;
            };

            console.log(`The ${templateYear} ${productTemplateName} template file has successfully downloaded and given a local file path.`)

            // if (runCreateDir == true) {
            //     if (runOpenNameSaveIndd == true) {
            //         createDirectory(createDirVariables.var1, createDirVariables.var2, createDirVariables.var3, createDirVariables.var4, runOpenNameSaveIndd, openNameSaveInddVariables);
            //     } else {
            //         createDirectory(createDirVariables.var1, createDirVariables.var2, createDirVariables.var3, createDirVariables.var4, false, undefined);
            //     }
   
            //     console.log("a hole in my soup bowl");
            // }

            return templatePath;

        }


    //#endregion -----------------------------------------------------------------------------------------------------------------------------


    //#region GET AND CREATE PROJECT DIRECTORY & INDESIGN FILE NAME/PATH -----------------------------------------------------------------------------------------------

        /**
         * Creates directory names, indd file name, and full indd file path
         * @param {Object} formData Object containing the elements from the extension form submitted by the user
         * @param {Number} year 4 digit year number to be used in the naming of the directories
         * @param {Number} month 2 digit month number to be used in the naming of the directories
         * @param {String} productFolderName The name of the product as it will be seen in the directories
         */
        function createDirectory(formData, year, month, productFolderName) {

            let parentDir;
            if (formData.location == "") {
                //first project folder in user's active folder 
                parentDir = `${(formData.client).replace(' ', '-')}_${formData.clientCode}`;
            } else {
                //first project folder in user's active folder 
                parentDir = `${(formData.client).replace(' ', '-')}_${(formData.location).replace(' ', '-')}_${formData.clientCode}`;
            }

            //sub folder in project folder created based on date and product
            let subDir = `${year}-${month}_${productFolderName}`

            //creates a system agnostic path in the user defined active folder consisting of the parentDir all the way down to the Links folder
            let dir = path.join(globalSettings.pathToActiveFolder, parentDir, subDir, "Links");

            //if dir path doesn't already exist, create it!
            if (!fs.existsSync(dir)){
                fs.mkdirSync(dir, { recursive: true });
            };

            //#region GET PATH TO AND NAME FOR INDESIGN FILE -------------------------------------------------------------------------------------

            let inddFileName;
            if (formData.location == "") {
                //name of the indesign file
                inddFileName = `${year}-${month}_${(formData.client).replace(' ', '-')}_${productFolderName}.indd`;
            } else {
                //name of the indesign file
                inddFileName = `${year}-${month}_${(formData.client).replace(' ', '-')}_${(formData.location).replace(' ', '-')}_${productFolderName}.indd`;
            };

                let inddFilePath = path.join(globalSettings.pathToActiveFolder, parentDir, subDir, inddFileName);

            //#endregion -------------------------------------------------------------------------------------------------------------------------

            return {
                parentDir,
                inddFileName,
                inddFilePath
            }

        };

    //#endregion -----------------------------------------------------------------------------------------------------------------------------



    //#region OPEN, NAME, AND SAVE INDESIGN FILE FROM TEMPLATE -------------------------------------------------------------------------------

        /**
         * Opens the template file, makes the directories in the active folder defined in globalSettings, and saves the indesign file there with the proper name (includes some error handling for different invlaid product variables and directory names)
         * @param {String} inddFilePath Path to save the indd file in
         * @param {String} templatePath Path to open the template file from
         * @param {Number} year 4 digit year number to be used in the naming of the directories
         * @param {Number} month 2 digit month number to be used in the naming of the directories
         * @param {String} productFolderName The name of the product as it will be seen in the directories
         * @param {Object} formData Object containing the elements from the extension form submitted by the user
         * @param {String} inddFileName Name of the indesign file to be saved
         * @param {String} parentDir name of the first project folder in user's active folder
         */
        function openNameSaveIndd(inddFilePath, templatePath, year, month, productFolderName, formData, inddFileName, parentDir, openTemplate) {

            let doesExist = fs.existsSync(inddFilePath); //if indesign file already exists in path, returns true
            let secondTime = false;

            console.log(`First Pass:\ninddFilePath: ${inddFilePath}\ntemplatePath: ${templatePath}\ndoesExist: ${doesExist}\nsecondTime: ${secondTime}\nopenTemplate: ${openTemplate}`);

            //sends path variables for template file, name for indesign file, and if file path exists or not already to the hostscript
            csInterface.evalScript(`openAndName("${inddFilePath}", "${templatePath}", ${doesExist}, ${secondTime}, ${openTemplate})`, (rtn, err) => {
                if (err) {
                    console.log(err); //usually just says EvalScript error which is not helpful
                } else {
                    //since I can only communicate from the jsx to here via strings, if I want to send multiple variables back I combine them into a single string separated by <0.o!> and then when it is over here I just split the string apart from said divider. 
                    let rtnValues = rtn.split("<0.o!>");

                    if (rtnValues[1] == undefined) {
                        rtnValues[1] = "null";
                    };

                    //if the user was given a text prompt for a version in the jsx and they did not cancel out of it, this will pass ⬇
                    if (rtnValues[1] !== "null") {

                            //#region IF DIRECTORY ALREADY EXISTS... -------------------------------------------------------------------------------------

                            //#region CREATE NEW SUB DIRECTORY, UPDATE PROJECT DIRECTORY, AND CREATE FULL UPDATED DIRECTORY --------------------------

                                let newSubDir = `${year}-${month}_${productFolderName}-${rtnValues[1]}`;

                                //creates a system agnostic path in the user defined active folder consisting of the parentDir all the way down to the Links folder
                                let dir = path.join(globalSettings.pathToActiveFolder, parentDir, newSubDir, "Links");

                                //if dir path doesn't already exist, create it!
                                if (!fs.existsSync(dir)){
                                    fs.mkdirSync(dir, { recursive: true });
                                };

                            //#endregion -------------------------------------------------------------------------------------------------------------

                            //#region GET UPDATED PATH TO AND NAME FOR INDESIGN FILE -----------------------------------------------------------------

                                //name of the indesign file
                                inddFileName = `${year}-${month}_${(formData.client).replace(' ', '-')}_${(formData.location).replace(' ', '-')}_${productFolderName}-${rtnValues[1]}.indd`;

                                inddFilePath = path.join(globalSettings.pathToActiveFolder, parentDir, newSubDir, inddFileName);

                            //#endregion -------------------------------------------------------------------------------------------------------------

                            //#region OPEN, NAME, AND SAVE UPDATED INDESIGN FILE FROM TEMPLATE -------------------------------------------------------

                                let doesExist = fs.existsSync(inddFilePath); //if indesign file already exists in path, returns true

                                secondTime = true;

                                console.log(`Second Pass:\ninddFilePath: ${inddFilePath}\ntemplatePath: ${templatePath}\ndoesExist: ${doesExist}\nsecondTime: ${secondTime}\nopenTemplate: ${openTemplate}`);


                                csInterface.evalScript(`openAndName("${inddFilePath}", "${templatePath}", ${doesExist}, ${secondTime}, ${openTemplate})`, (rtn, err) => {
                                    if (err) {
                                        console.log(err); //usually just says EvalScript error which is not helpful
                                    } else {
                                        let newRtnValues = rtn.split("<0.o!>");
                                        console.log(newRtnValues[0]); 
                                    };
                                });

                                //At this point, if the new sub directory is still already existing, rather than loop through the process again the user is just alerted to get their crap together and the function ends. Form data is not erased however, so the user can immediately try again if they desire to do so.

                            //#endregion -------------------------------------------------------------------------------------------------------------
                    
                        //#endregion -------------------------------------------------------------------------------------------------------------
                    } else {
                        //should print to the console the desired results!
                        //The [0] position should alwasy be the message, and [1] should be the returned textPrompt or "null"
                        console.log(rtnValues[0]);
                    };
                };
            });

        };

    //#endregion -----------------------------------------------------------------------------------------------------------------------------


    async function tryCatch(callback) {
        //console.log("Error callback type is: ");
        //console.log(typeof callback);
        //if (typeof callback === 'function') {
            try {
                await callback();
            } catch (error) {
                console.error(error);
                showMessage(error, "show");

            }
    }

//#endregion -----------------------------------------------------------------------------------------------------------------------------------------