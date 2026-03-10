// Wait for the popup's HTML to be loaded 
document.addEventListener("DOMContentLoaded", function () {
  updateBlockedWebsitesSection();
  
  var blockButton = document.getElementById("blockButton");
  blockButton.addEventListener("click", function () {
    getWebsiteInput();
  });
});

function getWebsiteInput() {
  var websiteInput = document.getElementById("websiteInput").value.trim().toLowerCase();
  
  // If user clicks the -Block- button without entering input -> Alert Error
  if (!websiteInput) {
    alert("Error: please enter a website URL");
    return;
  } 

  // Retrieve the blockedWebsitesArray from Chrome browser
  chrome.storage.sync.get("blockedWebsitesArray", function (data) {
    var blockedWebsitesArray = data.blockedWebsitesArray ||[];
    
    // Check if URL is already in the list
    if (blockedWebsitesArray.includes(websiteInput)) {
      alert("Error: URL is already blocked");
    } else {
      blockedWebsitesArray.push(websiteInput);
      chrome.storage.sync.set({ blockedWebsitesArray: blockedWebsitesArray }, function () {
        // Update the UI INSIDE the callback (after storage is definitely complete)
        updateBlockedWebsitesSection();
        document.getElementById("websiteInput").value = "";
        document.getElementById("websiteInput").focus();
      });
    }
  });
}

function updateBlockedWebsitesSection() {
  const blockedWebsitesDiv = document.getElementById("blockedWebsitesDiv");
  blockedWebsitesDiv.innerHTML = ""; // Easily clear out the old list

  chrome.storage.sync.get("blockedWebsitesArray", function (data) {
    const blockedWebsitesArray = data.blockedWebsitesArray ||[];

    if (blockedWebsitesArray.length > 0) {
      blockedWebsitesArray.forEach((website, index) => {
        const websiteDiv = document.createElement("div");
        websiteDiv.classList.add("websiteDiv");

        const websiteDivText = document.createElement("div");
        websiteDivText.classList.add("websiteDivText");
        websiteDivText.textContent = website;
        websiteDiv.appendChild(websiteDivText);

        const deleteButton = document.createElement("button");
        deleteButton.classList.add("delete");
        deleteButton.dataset.index = index; // Safely store index

        const trashIcon = document.createElement("i");
        trashIcon.classList.add("fas", "fa-trash");
        deleteButton.appendChild(trashIcon);

        deleteButton.addEventListener("click", unblockURL);
        websiteDiv.appendChild(deleteButton);
        blockedWebsitesDiv.appendChild(websiteDiv);
      });
    } else {
      const nothingBlocked = document.createElement("div");
      nothingBlocked.textContent = "No websites have been blocked";
      nothingBlocked.classList.add("nothingBlocked");
      blockedWebsitesDiv.appendChild(nothingBlocked);
    }
  });
}

function unblockURL(event) {
  // .currentTarget ensures we get the button's index even if they clicked the exact center of the trash icon
  const indexToRemove = parseInt(event.currentTarget.dataset.index, 10);
  
  chrome.storage.sync.get("blockedWebsitesArray", function (data) {
    let blockedWebsitesArray = data.blockedWebsitesArray ||[];
    blockedWebsitesArray.splice(indexToRemove, 1);
    
    // Refresh the UI INSIDE the callback to fix the race condition
    chrome.storage.sync.set({ blockedWebsitesArray: blockedWebsitesArray }, function() {
      updateBlockedWebsitesSection();
    });
  });
}
