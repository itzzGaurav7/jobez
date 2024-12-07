const searchEngines = {
  AmbitionBox: "https://www.ambitionbox.com/search?q=",
  GlassDoor: "https://www.glassdoor.co.in/Reviews/",
};

function createContextMenus(selectedEngines) {
  console.log("Creating context menus for: ", selectedEngines);

  chrome.contextMenus.removeAll(() => {
    if (selectedEngines.length > 0) {
      selectedEngines.forEach((engine) => {
        console.log("Creating menu for: ", engine);
        chrome.contextMenus.create({
          id: engine,
          title: `Find '%s' on ${engine}`,
          contexts: ["selection"],
        });
      });

      chrome.contextMenus.create({
        id: "searchAll",
        title: `Search '%s' in all selected engines`,
        contexts: ["selection"],
      });
    } else {
      chrome.contextMenus.create({
        id: "noEngines",
        title: "No search engines selected",
        contexts: ["selection"],
      });
    }
  });
}

chrome.contextMenus.onClicked.addListener((info) => {
  console.log("Clicked on: ", info.menuItemId);

  if (info.selectionText) {
    const engine = info.menuItemId;
    const searchTerm = encodeURIComponent(
      info.selectionText.trim().replace(/\s+/g, "-").toLowerCase()
    );

    let baseURL = searchEngines[engine];
    if (engine === "GlassDoor") {
      baseURL = `${searchEngines.GlassDoor}${searchTerm}-reviews-SRCH_KE0,14.htm`;
    }

    if (engine === "searchAll") {
      const selectedEngines = Object.keys(searchEngines);
      selectedEngines.forEach((selectedEngine) => {
        let searchURL =
          searchEngines[selectedEngine] +
          encodeURIComponent(info.selectionText);
        if (selectedEngine === "GlassDoor") {
          searchURL = `${searchEngines.GlassDoor}${searchTerm}-reviews-SRCH_KE0,14.htm`;
        }
        chrome.tabs.create({ url: searchURL });
      });
    } else if (baseURL) {
      let searchURL = baseURL + encodeURIComponent(info.selectionText);
      if (engine === "GlassDoor") {
        searchURL = `${searchEngines.GlassDoor}${searchTerm}-reviews-SRCH_KE0,14.htm`;
      }
      chrome.tabs.create({ url: searchURL });
    }
  }
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === "local" && changes.selectedEngines) {
    console.log("Selected engines changed: ", changes.selectedEngines.newValue);
    createContextMenus(changes.selectedEngines.newValue);
  }
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(["selectedEngines"], (result) => {
    const selectedEngines = result.selectedEngines || [];
    console.log("Initial selected engines: ", selectedEngines);
    createContextMenus(selectedEngines);
  });
});
