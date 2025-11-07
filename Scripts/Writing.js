window.GW = window.GW || {};
GW.Pages = GW.Pages || {};
(function Writing(ns) {
	const FOLDER_PARAM = "Folder";
	const ENTRY_PARAM = "Entry";

	IsUpdatingDisplay = false;

	window.addEventListener("DOMContentLoaded", async () => {
		buildMenus();
		document.getElementById("tblstFolders").addEventListener("tab-change", onFolderChange);

		const params = new URLSearchParams(window.location.search);
		if(!displayEntry(params.get(FOLDER_PARAM), params.get(ENTRY_PARAM))) {
			document.getElementById("btnBlog").click();
		}
	});

	window.addEventListener("popstate", (event) => {
		if(event.state)  {
			const params = new URLSearchParams(window.location.search);
			displayEntry(params.get(FOLDER_PARAM), params.get(ENTRY_PARAM));
		}
	});

	function buildMenus() {
		for(folder of Object.keys(ns.Data)) {
			document.querySelector(`#pnl${folder} fieldset`).insertAdjacentHTML("beforeend", `<gw-radiomenu data-folder="${folder}">${
				getSortedEntryNames(folder).map(entryKey => `<button data-entry="${entryKey}">
					<div class="text">${entryKey}</div>
				</button>`).join("\n")
			}</gw-radiomenu>`);
		}
		document.querySelectorAll(`gw-radiomenu`).forEach(radioMenu => radioMenu.addEventListener("change", onRadMenuChange));
	}

	function getSortedEntryNames(folderName) {
		const entryNames = Object.keys(ns.Data[folderName]);
		return entryNames.sort((a, b) => {
			const entryA = ns.Data[folderName][a];
			const entryB = ns.Data[folderName][b];

			if(entryA.Date && !entryB.Date) {
				return -1;
			}
			if (entryB.Date && !entryA.Date) {
				return 1;
			}
			if(entryA.Date) {
				return entryB.Date - entryA.Date;
			}
			return entryB.Order - entryA.Order;
		});
	}

	const onFolderChange = (_event) => {
		document.querySelectorAll(`gw-radiomenu`).forEach(radioMenu => {
			if(!radioMenu.checkVisibility()) {
				radioMenu.uncheck();
			}
		});

		displayCurrentEntry();
	};

	const onRadMenuChange = (event) => {
		setTimeout(() => {
			const artInfoRect = document.getElementById("artInfo").getBoundingClientRect();
			const selectionRect = event.detail.Selection.getBoundingClientRect();
			if(artInfoRect.top < selectionRect.bottom) {
				event.detail.Selection.scrollIntoView();
			}
		}, 0);
		displayCurrentEntry();
	};

	function displayCurrentEntry() {
		const selectedMenuItem = document.querySelector(`gw-radiomenu [aria-checked="true"]`);

		const selectedEntry = selectedMenuItem?.getAttribute("data-entry");
		const selectedFolder = selectedMenuItem?.closest(`gw-radiomenu`).getAttribute("data-folder")
			?? [...document.querySelectorAll(`gw-radiomenu`)].filter(
					radMenu => radMenu.checkVisibility()
				).pop()?.getAttribute("data-folder");
		
		displayEntry(selectedFolder, selectedEntry);
	}

	function displayEntry(selectedFolder, selectedEntry) {
		if(IsUpdatingDisplay) {
			return false;
		}
		IsUpdatingDisplay = true;

		const tab = document.querySelector(`[aria-controls="pnl${selectedFolder}"]`);
		tab?.click();

		const mnuItmRad = document.querySelector(`[role="menuitemradio"][data-entry="${selectedEntry}"]`);
		mnuItmRad?.click();

		const iframe = document.querySelector(`iframe`);
		const entryData = (ns.Data[selectedFolder] || {})[selectedEntry];
		if(entryData) {
			iframe.removeAttribute("src");
			iframe.contentWindow.location.replace(entryData.URL);
		}
		else {
			iframe.setAttribute("src", "about:blank");
		}

		document.getElementById("artInfo").innerHTML = entryData
			? `<a href="${entryData.URL}" class="full">${selectedEntry}</a>
				<cite>by ${entryData.Author}</cite>
				<time ${entryData.Date ? `` : ""}>${getEntryTimeStr(entryData)}</time>`
			: "";

		IsUpdatingDisplay = false;

		updateURL(selectedFolder, selectedEntry);

		return !!entryData;
	}

	function getEntryTimeStr(entryData) {
		if(entryData.Date) {
			return entryData.Date.toLocaleString(undefined, { dateStyle: "medium", });
		}
		return entryData.DateString;
	}

	function updateURL(selectedFolder, selectedEntry) {
		const curQueryString = `?${FOLDER_PARAM}=${selectedFolder}${selectedEntry
			? `&${ENTRY_PARAM}=${selectedEntry}`
			: ""
		}`;
		if(!window.history.state
			|| !(new URLSearchParams(window.history.state).has(ENTRY_PARAM))
		) {
			window.history.replaceState(curQueryString, "", curQueryString);
		}
		else if(window.history.state !== curQueryString) {
			window.history.pushState(curQueryString, "", curQueryString);
		}
	}
}) (GW.Pages.Writing = GW.Pages.Writing || {}); 