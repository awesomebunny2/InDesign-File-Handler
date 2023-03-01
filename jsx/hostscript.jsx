
//#region TESTING VARIABLES --------------------------------------------------------------------------------------------------------------------------

// var inddFilePath = "/Users/mattshark/Library/CloudStorage/OneDrive-SharedLibraries-MailShark/Prepress Team - Documents/General/Artist Folders/Matt's_Files/Little-Nicky_Douglasville_27739/2023-03_MENU-VE/2023-03_Little-Nicky_Douglasville_MENU-VE.indd"

// var templateFile = "/Users/mattshark/Library/Application Support/Adobe/CEP/extensions/com.mailshark.playground/downloaded-templates/Menu 2023.indt"
// // var templateFile = "undefined";

// var answer = openAndName(inddFilePath, templateFile, false, true, true);

// $.writeln(answer);

// showShirtDialog();

//#endregion -----------------------------------------------------------------------------------------------------------------------------------------

//#region GLOBAL VARIABLES ---------------------------------------------------------------------------------------------------------------------------

    var shirtDialog;

    var eventListener;

    // var message;

    var textPrompt = null;

    var byeBye = false;

    var returnMessage;

//#endregion -----------------------------------------------------------------------------------------------------------------------------------------


function openAndName(inddFilePath, templateFile, doesExist, secondTime, openTemplate) {

    //bring up text prompt if file path already exists. Also sets byeBye to true if file is not to be saved.
    var duplicatesMessage = checkForExistingFile(doesExist, secondTime); 

    //if file is not to be saved in previous function, byeBye is set to true and the function stops here, returning to the main.js the message
    if (byeBye == true) {
        byeBye = false;
        return duplicatesMessage;
    };

    //Normally should trigger, but if the user opts to choose a custom template or create a blank file, openTemplate will be false
    if (openTemplate == true) {
        app.open(templateFile);
        // alert("This should fire first");
    };

    // alert("This should fire second");

    //gets the active document
    var doc = getActiveDoc();

    //if there is no active document, byeBye will be set to true in the getActiveDoc function and doc will be set to a messae to send to main.js
    if (byeBye == true) {
        byeBye = false;
        return doc;
    };

    //saves the file and returns duplicatesMessage string, or if file is already open does not save and instead returns custom string
    var saveReturn = save(doc, inddFilePath, duplicatesMessage);

    //if a version modifier was added to the file path, textPrompt will be true
    var message = saveReturn + "<0.o!>" + textPrompt; 
    // $.writeln(typeof message);
    return message;

};






//#region SHIRT DIALOG -------------------------------------------------------------------------------------------------------------------------------

    /*
    Code for Import https://scriptui.joonas.me — (Triple click to select): 
    {"activeId":5,"items":{"item-0":{"id":0,"type":"Dialog","parentId":false,"style":{"enabled":true,"varName":"shirtDialog","windowType":"Dialog","creationProps":{"su1PanelCoordinates":false,"maximizeButton":false,"minimizeButton":false,"independent":false,"closeButton":true,"borderless":false,"resizeable":false},"text":"T-Shirt Template Unavailable","preferredSize":[500,160],"margins":16,"orientation":"column","spacing":10,"alignChildren":["center","top"]}},"item-1":{"id":1,"type":"StaticText","parentId":0,"style":{"enabled":true,"varName":"problemDescription","creationProps":{},"softWrap":true,"text":"The project you submitted is categorized as a T-Shirt product. Currently, there are no T-Shirt templates available. ","justify":"center","preferredSize":[448,0],"alignment":null,"helpTip":""}},"item-2":{"id":2,"type":"Button","parentId":7,"style":{"enabled":true,"varName":"chooseTemplateButton","text":"Choose Template","justify":"center","preferredSize":[0,0],"alignment":"center","helpTip":null}},"item-3":{"id":3,"type":"Button","parentId":7,"style":{"enabled":true,"varName":"createBlankDocButton","text":"Create Blank Document","justify":"center","preferredSize":[0,0],"alignment":"center","helpTip":null}},"item-4":{"id":4,"type":"Group","parentId":0,"style":{"enabled":true,"varName":"buttonsText","preferredSize":[0,0],"margins":15,"orientation":"column","spacing":16,"alignChildren":["center","center"],"alignment":"fill"}},"item-5":{"id":5,"type":"Button","parentId":7,"style":{"enabled":true,"varName":"cancelButton","text":"Cancel","justify":"center","preferredSize":[0,0],"alignment":"center","helpTip":null}},"item-6":{"id":6,"type":"StaticText","parentId":4,"style":{"enabled":true,"varName":"callToAction","creationProps":{"truncate":"none","multiline":false,"scrolling":false},"softWrap":false,"text":"Would you like to choose a template to work from?","justify":"left","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-7":{"id":7,"type":"Group","parentId":4,"style":{"enabled":true,"varName":"buttons","preferredSize":[0,0],"margins":0,"orientation":"row","spacing":10,"alignChildren":["center","center"],"alignment":"center"}}},"order":[0,1,4,6,7,2,3,5],"settings":{"importJSON":true,"indentSize":false,"cepExport":false,"includeCSSJS":true,"showDialog":true,"functionWrapper":false,"afterEffectsDockable":false,"itemReferenceList":"None"}}
    */ 

    function showShirtDialog(title, description1, description2, cta) {

        // SHIRTDIALOG
        // ===========
            shirtDialog = new Window("dialog"); 
            shirtDialog.text = "T-Shirt Template Unavailable"; //title
            shirtDialog.preferredSize.width = 500; 
            shirtDialog.preferredSize.height = 160; 
            shirtDialog.orientation = "column"; 
            shirtDialog.alignChildren = ["center","top"]; 
            shirtDialog.spacing = 10; 
            shirtDialog.margins = 16; 

        var problemDescription = shirtDialog.add("group", undefined , {name: "problemDescription"}); 
            problemDescription.getText = function() { var t=[]; for ( var n=0; n<problemDescription.children.length; n++ ) { var text = problemDescription.children[n].text || ''; if ( text === '' ) text = ' '; t.push( text ); } return t.join('\n'); }; 
            problemDescription.preferredSize.width = 448; 
            problemDescription.orientation = "column"; 
            problemDescription.alignChildren = ["center","center"]; 
            problemDescription.spacing = 0; 

            problemDescription.add("statictext", undefined, "The project you submitted is categorized as a T-Shirt product."); //description1
            problemDescription.add("statictext", undefined, "Currently, there are no T-Shirt templates available. "); //description2

        // BUTTONSTEXT
        // ===========
        var buttonsText = shirtDialog.add("group", undefined, {name: "buttonsText"}); 
            buttonsText.orientation = "column"; 
            buttonsText.alignChildren = ["center","center"]; 
            buttonsText.spacing = 16; 
            buttonsText.margins = 15; 
            buttonsText.alignment = ["fill","top"]; 

        var callToAction = buttonsText.add("statictext", undefined, undefined, {name: "callToAction"}); 
            callToAction.text = "Would you like to choose a template to work from?"; //cta

        // BUTTONS
        // =======
        var buttons = buttonsText.add("group", undefined, {name: "buttons"}); 
            buttons.orientation = "row"; 
            buttons.alignChildren = ["center","center"]; 
            buttons.spacing = 10; 
            buttons.margins = 0; 
            buttons.alignment = ["center","center"]; 

        var chooseTemplateButton = buttons.add("button", undefined, undefined, {name: "chooseTemplateButton"}); 
            chooseTemplateButton.text = "Choose Template"; 
            chooseTemplateButton.alignment = ["center","center"]; 

        var createBlankDocButton = buttons.add("button", undefined, undefined, {name: "createBlankDocButton"}); 
            createBlankDocButton.text = "Create Blank Document"; 
            createBlankDocButton.alignment = ["center","center"]; 

        var cancelButton = buttons.add("button", undefined, undefined, {name: "cancelButton"}); 
            cancelButton.text = "Cancel"; 
            cancelButton.alignment = ["center","center"]; 


        chooseTemplateButton.onClick = function () {
            shirtDialog.close(1);
        }
        createBlankDocButton.onClick = function () {
            shirtDialog.close(2);
        }
        cancelButton.onClick = function () {
            shirtDialog.close();
            returnMessage = "Cancelled"
        }

        var dialogResult = shirtDialog.show();

        if (dialogResult == 1) {
            // shirtDialog.hide();
            var tempFile = File.openDialog("Open...");
            $.writeln(typeof tempFile);
            app.open(tempFile);
            returnMessage = "Template file opened";
        } else if (dialogResult == 2) {
            shirtDialog.close();
            // removeEvents();
            var createDoc = app.menuActions.itemByID(257).invoke();
            returnMessage = "New document created";
        };
        $.writeln(returnMessage);
        return returnMessage;
    };

//#endregion -----------------------------------------------------------------------------------------------------------------------------------------


/**
 * If the file path already exists in the folder, the user is prompted to choose a version modifier for the file path & name, which is sent back to the main.js. If the proposed file path is still already taken, the script comes back here and informs the user to try again from the beginning to avoid infinte loops in the code.
 * @param {Boolean} doesExist Is true if the file path exists already
 * @param {Boolean} secondTime Is true if the user's version modifier to the file path also already exists
 * @returns String
 */
function checkForExistingFile(doesExist, secondTime) {

    var message;

    if (doesExist == true) {
        if (secondTime == true) {
            alert("Whoa! Looks like your proposed version folder already exists. Look at your project folder in your file system and then try using a version that is not yet taken in your folder." + "\n" + "The generated document was left opened and unsaved for your convenience. If you would like to use a generated file name for your project, please close the untitled document and try again using a different version identifier.");
            message = "User proposed a version folder that already exists in the directory. Preventing infinate loop by exiting function here until user can get it together and try again."
            message = message + "<0.o!>" + textPrompt; //message, null
            byeBye = true;
        } else {
            textPrompt = prompt("This client already has a folder for this product within the same month. Please type a version modifier to differentiate it your existing folder(s):", "VB", "File Already Exists");
        };
 
        if (!textPrompt) {
            $.writeln("User cancelled. Stopping...");
            message = "User cancelled. Stopping...";
            message = message + "<0.o!>" + textPrompt; //message, null
            byeBye = true;
        } else {
            message = "The product template was successfully opened and saved into the " + textPrompt + " directory";
            message = message + "<0.o!>" + textPrompt //message, true
            byeBye = true;
        }
    } else {
        message = "The document has been successfully named and saved."
    };

    return message;
};

/**
 * Saves the document to the specified file path and returns a message from previous function. If a file with the same name is currently open, save fails and function returns a custom message
 * @param {Document} doc The active document
 * @param {String} filePath The file path to save the active document to
 * @param {String} message A message from a previous function to send back to the main.js
 * @returns String
 */
function save(doc, filePath, message) {

    try {doc.save(filePath) } catch (e) {
        alert("ERROR WITH FILE:" + "\n" + e);
        // alert ("Either this document is currently open or the file path doesn't exist, so nothing was saved. Please close the document and try again.");
        doc.close(SaveOptions.NO);
        return "Document with same name currently open. Close and try again."
    }
    // $.writeln(message);
    return message;
}

/**
 * Checks to see if there is an active document and returns said document data. If there is no active document, returns a message and sets byeBye to true
 * @returns Document or String
 */
function getActiveDoc() {
    try {
        var doc = app.activeDocument; 
        return doc;
    } catch (e) {
        alert ("You don't have any documents open."); //this should never trigger unless something goes terribly wrong
        doc.close(SaveOptions.NO);
        var message = "Something has gone terribly wrong"
        message = message + "<0.o!>" + textPrompt
        byeBye == true;
        return message
    };
};



function alert(message) {
    alert (message);
};
//#region PACKAGE NATIVES SCRIPT FOR REFERENCE -------------------------------------------------------------------------------------------------------

//    // Get name of document
//    var docName = doc.name.split(".")[0];

//    // ! Breaks if file has "." in it.

//    // Creating the Folder object
//    try {
//       var docFolder = Folder(doc.filePath + "/" + docName + " Folder");
//    } catch(err) {


//       var answer = confirm("Do you want to save this document?");
      
//       if (answer == true) {
//          doc.save();
//          var docFolder = Folder(doc.filePath + "/" + docName + " Folder");
//       } else {
//          alert("Fine, then. Be that way.")
//          return;
//       }

//    }

//    var pdfFile = File(docFolder + "/" + docName + "_HQPRINT.pdf");

//    var nativesName = docFolder.fsName;

//    // Package!
//    packageThis(docFolder);


//    // Creates [High Quality Print] pdf inside the packaged folder (saves over old versions instead of creating duplicates, unlike the optional parameter in the packageThis function)
//    app.activeDocument.exportFile(ExportFormat.PDF_TYPE, pdfFile, false, "[High Quality Print]");

//    // Now let's zip the natives
//    var zipNatives = 'tell application \"Finder\"\n';
//       zipNatives += 'set theNatives to (POSIX file \"' + nativesName + '\" as alias)\n';
//       zipNatives += 'set folderName to name of theNatives\n';
//       zipNatives += 'set destFolder to (folder of theNatives) as alias\n';
//       zipNatives += 'do shell script (\"ditto -c -k --sequesterRsrc --keepParent \" & quoted form of POSIX path of theNatives & space & quoted form of (POSIX path of destFolder & folderName & \".zip\"))\n';
//       zipNatives += 'end tell\n';

//    app.doScript(zipNatives, ScriptLanguage.APPLESCRIPT_LANGUAGE);
//    //Great, that worked! The working AppleScript is saved as "testing" for future reference

//    doc.save();
// }

// // Packages the document
// function packageThis (docFolder) {
//     var copyingFonts = true;
//     var copyingLinkedGraphics = true;
//     var copyingProfiles = true;
//     var updatingGraphics = true;
//     var includingHiddenLayers = true;
//     var ignorePreflightErrors = true;
//     var creatingReport = true;
//     var includeIdml = false;
//     var includePdf = false;
//     var pdfStyle = "Mail Shark 2020_PRINT";
//     var useDocumentHyphenationExceptionsOnly = true;
//     var versionComments = "";
//     var forceSave = true;

//     doc.packageForPrint(docFolder, copyingFonts, copyingLinkedGraphics, copyingProfiles, updatingGraphics, includingHiddenLayers, ignorePreflightErrors, creatingReport, includeIdml, includePdf, pdfStyle, useDocumentHyphenationExceptionsOnly, versionComments, forceSave);
// }

//#endregion -----------------------------------------------------------------------------------------------------------------------------------------
