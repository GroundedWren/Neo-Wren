window.GW = window.GW || {};
GW.Pages = GW.Pages || {};
(function Gallery(ns) {
	ns.FilterStyleSheet = new CSSStyleSheet();
	window.document.adoptedStyleSheets.push(ns.FilterStyleSheet);

	window.addEventListener("DOMContentLoaded", () => {
		document.getElementById("secGallery").addEventListener("focusin", onGridFocusin);
		const olbxArtist = document.getElementById("olbxArtist");
		olbxArtist.addEventListener("option-click", recomputeFilters);
		const olbxChar = document.getElementById("olbxChar");
		olbxChar.addEventListener("option-click", recomputeFilters);

		const artistSet = new Set();
		const characterSet = new Set();
		document.querySelectorAll(`gw-art-frame-row`).forEach(frameRow => {
			frameRow.dataset.artists.split(",").forEach(artist => artistSet.add(artist));
			frameRow.dataset.characters.split(",").forEach(character => characterSet.add(character));
		});
		Array.from(artistSet).sort().forEach(artist => {
			if(artist) {
				olbxArtist.querySelector(`fieldset`).insertAdjacentHTML(
					"beforeend", 
					`<label><input type="radio" name="artist" value="${artist}">${artist}</label>`
				);
			}
		});
		Array.from(characterSet).sort().forEach(character => {
			if(character) {
				olbxChar.querySelector(`fieldset`).insertAdjacentHTML(
					"beforeend", 
					`<label><input type="radio" name="character" value="${character}">${character}</label>`
				);
			}
		});

		const params = new URLSearchParams(window.location.search);
		const piece = params.get("piece");
		if(piece) {
			ns.FilterStyleSheet.replaceSync(`
				gw-art-frame-row:not([data-title="${piece}"]) { display: none; }
				#olbxArtist, #olbxChar { display: none; }
				#secGallery > * {
					flex-grow: 1;
					max-width: 1100px;
				}
			`);
			return;
		}

		const artist = params.get("artist");
		if(artist) {
			document.getElementById("olbxArtist").querySelector(`[value="${artist}"]`).click();
		}

		const character = params.get("character");
		if(character) {
			document.getElementById("olbxChar").querySelector(`[value="${character}"]`).click();
		}
		recomputeFilters();
	});

	const onGridFocusin = (event) => {
		const galleryEl = document.getElementById("secGallery");
		if(galleryEl.hasAttribute("tabindex")) {
			galleryEl.removeAttribute("tabindex");
		}
		const closestCell = event.target.closest(`[role="gridcell"]`);
		if(closestCell?.getAttribute("tabindex") === "-1") {
			selectCell(closestCell);
		}
		else if(event.target === galleryEl) {
			const cellEl = [...galleryEl.querySelectorAll(`[role="gridcell"]`)].filter(
				cell => cell.checkVisibility()
			)[0];
			if(cellEl) {
				selectCell(cellEl);
				cellEl.focus();
			}
		}
	}

	const recomputeFilters = () => {
		const chosenArtist = document.querySelector("#olbxArtist input:checked")?.value;
		const artistFilter = chosenArtist 
			? `gw-art-frame-row:not([data-artists*="${chosenArtist},"]) { display: none; }`
			: "";

		const chosenCharacter = document.querySelector("#olbxChar input:checked")?.value;
		const characterFilter = chosenCharacter 
			? `gw-art-frame-row:not([data-characters*="${chosenCharacter},"]) { display: none; }`
			: "";
		
		if(!chosenArtist && !chosenCharacter) {
			window.history.replaceState(null, "", "?");
		}
		else {
			window.history.replaceState(null, "", `?${[
				chosenCharacter ? `character=${chosenCharacter}` : "", 
				chosenArtist ? `artist=${chosenArtist}` : ""
			].filter(itm => itm).join("&")}`);
		}
		
		ns.FilterStyleSheet.replaceSync(`
			${artistFilter}
			${characterFilter}
		`);

		const galleryEl = document.getElementById("secGallery");
		if(![...galleryEl.querySelectorAll(`gw-art-frame-row`)].filter(row => row.checkVisibility()).length) {
			galleryEl.setAttribute("tabindex", "-1");
			clearSelection();
		}
		else if (galleryEl.getAttribute("tabindex") === "-1") {
			galleryEl.setAttribute("tabindex", "0");
		}
		else {
			const activeCell = galleryEl.querySelector(`[role="gridcell"][tabindex="0"]`);
			if(!activeCell?.checkVisibility()) {
				clearSelection();
				galleryEl.setAttribute("tabindex", "0");
			}
		}
	};

	ns.clearFilters = function clearFilters() {
		ns.FilterStyleSheet.replaceSync("");
		window.history.replaceState(null, "", "?");
		document.getElementById("olbxArtist").clear();
		document.getElementById("olbxChar").clear();
	};

	ns.onArrowNav = function onArrowNav(key) {
		const curCell = getCurCell();
		const curRow = curCell.closest(`[role="row"]`);
		
		const rowList = [...document.querySelectorAll(`#secGallery [role="row"]`)].filter(row => row.checkVisibility());
		const curRowIdx = rowList.indexOf(curRow);
		const curCellIdx = [...curRow.querySelectorAll(`[role="gridcell"]`)].indexOf(curCell);

		let nextRowIdx = curRowIdx;
		switch(key) {
			case "ArrowUp":
				nextRowIdx = curRowIdx === 0 ? rowList.length - 1 : curRowIdx - 1;
				break;
			case "ArrowDown":
				nextRowIdx = curRowIdx === rowList.length - 1 ? 0 : curRowIdx + 1;
				break;
		}

		const nextCellList = [...rowList[nextRowIdx].querySelectorAll(`[role="gridcell"]`)];
		let nextCellIdx = curCellIdx;
		switch(key) {
			case "ArrowLeft":
				nextCellIdx = curCellIdx === 0 ? nextCellList.length - 1 : curCellIdx - 1;
				break;
			case "ArrowRight":
				nextCellIdx = curCellIdx === nextCellList.length - 1 ? 0 : curCellIdx + 1;
				break;
		}
		selectCell(nextCellList[nextCellIdx]);
		nextCellList[nextCellIdx].focus();
	};

	ns.onGridEnter = function onGridEnter(_event) {
		const cellLinks = [...getCurCell()?.querySelectorAll(`a`)];
		if(cellLinks.length === 1) {
			cellLinks[0].click();
		}
		else {
			cellLinks[0].focus();
		}
	}

	function selectCell(gridcell) {
		clearSelection();
		[gridcell, ...gridcell?.querySelectorAll(`[tabindex="-1"]`)].forEach(
			tabbableEl => tabbableEl.setAttribute("tabindex", "0")
		);
	}

	function clearSelection() {
		document.querySelectorAll(`#secGallery [tabindex="0"]`).forEach(
			tabbableEl => tabbableEl.setAttribute("tabindex", "-1")
		);
	}

	function getCurCell() {
		return document.querySelector(`#secGallery [role="gridcell"][tabindex="0"]`);
	}
}) (GW.Pages.Gallery = GW.Pages.Gallery || {}); 