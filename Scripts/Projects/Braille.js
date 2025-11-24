window.GW = window.GW || {};
GW.Pages = GW.Pages || {};
(function Braille(ns) {
	ns.OlBraille;
	ns.TxtText;
	ns.InputBatcher = new GW.Gizmos.ActionBatcher("Input", 50, true, true);
	const TextMapStylesheet = new CSSStyleSheet();
	document.adoptedStyleSheets.push(TextMapStylesheet);
	const CellEl = GW.Controls.BrailleCellEl;

	const onDCL = () => {
		ns.OlBraille = document.getElementById("olBraille");
		ns.TxtText = document.getElementById("txtText");

		ns.OlBraille.addEventListener("focusin", onOlBrailleFocusin);

		document.getElementById("tblstExercises").addEventListener("tab-change", onPracticeTabChanged);

		outputBraille(" ");
	};
	window.addEventListener("DOMContentLoaded", onDCL);

	ns.practiceAfterInput = () => {};
	const onPracticeTabChanged = (event) => {
		const selectedTab = event.currentTarget.querySelector(`[aria-selected="true"]`);
		if(!selectedTab) {
			ns.practiceAfterInput = () => {};
			document.getElementById("secText").classList.remove("collapsed");
			document.getElementById("secBraille").classList.remove("collapsed");
		}
		else if (selectedTab.getAttribute("aria-controls") === "pnlReading") {
			ns.practiceAfterInput = validateAgainstReading;
			switchToTextOnly();
		}
		else if (selectedTab.getAttribute("aria-controls") === "pnlWriting") {
			ns.practiceAfterInput = validateAgainstWriting;
			switchToBrailleOnly();
		}

		ns.practiceAfterInput();
	};

	const validateAgainstReading = () => {
		if(document.getElementById("txtText").value === document.getElementById("outReadingWord").getAttribute("data-word")) {
			document.getElementById("outReadingValidity").innerHTML = `<gw-icon name="Check" iconKey="circle-check"></gw-icon>Correct!`;
		}
		else {
			document.getElementById("outReadingValidity").innerHTML = "";
		}
	};

	const validateAgainstWriting = () => {
		if(document.getElementById("txtText").value === document.getElementById("outWritingWord").getAttribute("data-word")) {
			document.getElementById("outWritingValidity").innerHTML = `<gw-icon name="Check" iconKey="circle-check"></gw-icon>Correct!`;
		}
		else {
			document.getElementById("outWritingValidity").innerHTML = "";
		}
	};

	ns.triggerGenerate = (event) => {
		Array.from(document.querySelectorAll(`.generate`)).filter(btnEl => btnEl.checkVisibility()).pop()?.click();
	};

	ns.onGenerateReadingWord = (event) => {
		event.preventDefault();

		switchToTextOnly();

		const data = new FormData(event.currentTarget);
		const word = pickWord(parseInt(data.get("wordLength")));
		const outWord = document.getElementById("outReadingWord");

		outWord.innerHTML = translateToUnicodeBraille(word);
		outWord.setAttribute("data-word", word);
		document.getElementById("outReadingValidity").innerHTML = "";

		ns.TxtText.value = "";
		outputBraille("");
	};

	ns.onGenerateWritingWord = (event) => {
		event.preventDefault();

		switchToBrailleOnly();

		const data = new FormData(event.currentTarget);
		const word = pickWord(parseInt(data.get("wordLength")));
		const outWord = document.getElementById("outWritingWord");
		
		outWord.innerHTML = word;
		outWord.setAttribute("data-word", word);
		document.getElementById("outWritingValidity").innerHTML = "";

		ns.TxtText.value = "";
		outputBraille("");
	};

	function switchToTextOnly() {
		document.getElementById("secText").classList.remove("collapsed");
		document.getElementById("secBraille").classList.add("collapsed");
	}

	function switchToBrailleOnly() {
		document.getElementById("secText").classList.add("collapsed");
		document.getElementById("secBraille").classList.remove("collapsed");
	}

	function translateToUnicodeBraille(textStr) {
		let inNumberMode = false;

		return textStr.split("").map(char => {
			let output = "";
			const thisIsNumeric = isNumeric(char);
			const thisIsAlpha = isAlpha(char);
			if(!inNumberMode && thisIsNumeric) {
				//Insert number marker
				output += String.fromCharCode(`0x${CellEl.BrailleUnicodeMap.get(CellEl.NumberCellDots)}`);
				inNumberMode = true;
			}
			else if(thisIsAlpha && inNumberMode) {
				//Insert alpha marker
				output += String.fromCharCode(`0x${CellEl.BrailleUnicodeMap.get(CellEl.AlphaCellDots)}`);
				inNumberMode = false;
			}

			if(thisIsAlpha || char === " ") {
				inNumberMode = false;
			}

			output += CellEl.AtoBMap.get(char)?.map(
				charSet => String.fromCharCode(`0x${CellEl.BrailleUnicodeMap.get(charSet)}`)
			).join("");

			return output;
		}).join("");
	}

	function pickWord(wordLength) {
		const filteredWords = GW.Hangman.Words.filter(word => word.length === wordLength);
		const word = filteredWords[Math.floor(Math.random()*filteredWords.length)];
		return word.charAt(0).toUpperCase() + word.substr(1).toLowerCase();
	}

	const onOlBrailleFocusin = (event) => {
		const focusedDot = ns.OlBraille.querySelector(`button:focus-within`)
		if(focusedDot) {
			ns.OlBraille.querySelector(`button[tabindex="0"]`)?.setAttribute("tabindex", "-1");
			focusedDot.setAttribute("tabindex", "0");
		}
	};

	ns.onBrailleJump = (event) => {
		let targetDot = null;
		switch(event.key) {
			case "Home":
				targetDot = ns.OlBraille.querySelector(`gw-braille-cell button`);
				break;
			case "End":
				targetDot = ns.OlBraille.querySelector(`gw-braille-cell:last-of-type button`);
				break;
			case "PageUp":
				targetDot = event.target.closest(`gw-braille-cell`).previousElementSibling?.querySelector(`button`);
				break;
			case "PageDown":
				targetDot = event.target.closest(`gw-braille-cell`).nextElementSibling?.querySelector(`button`);
				break;
		}

		if(targetDot) {
			targetDot.focus();
		}
	};

	ns.onBrailleNav = (event) => {
		let above = false;
		let below = false;
		let left = false;
		let right = false;
		switch(event.key) {
			case "ArrowUp":
				above = true;
				break;
			case "ArrowDown":
				below = true;
				break;
			case "ArrowLeft":
				left = true;
				break;
			case "ArrowRight":
				right = true;
				break;
		}
		if(!above && !below && !left && !right) {
			return;
		}

		const currentDot = event.target;
		const currentDotRect = currentDot.getBoundingClientRect();
		let dotObjs = getDotsAndRects(currentDot);
		dotObjs = dotObjs.filter(dotObj => {
			if(above) {
				return dotObj.Rect.y < currentDotRect.y;
			}
			if(below) {
				return dotObj.Rect.y > currentDotRect.y;
			}
			if(left) {
				return dotObj.Rect.x < currentDotRect.x
					&& dotObj.Rect.y === currentDotRect.y;
			}
			if(right) {
				return dotObj.Rect.x > currentDotRect.x
					&& dotObj.Rect.y === currentDotRect.y;
			}
		});
		const nearestDotObj = dotObjs.sort((dotObjA, dotObjB) => dotObjA.Distance - dotObjB.Distance)[0];
		if(nearestDotObj) {
			nearestDotObj.Element.focus();
		}
	};

	function getDotsAndRects(distanceDot) {
		const distanceDotRect = distanceDot?.getBoundingClientRect();
		return [...ns.OlBraille.querySelectorAll(`button`)].map(dotEl => {
			const rect = dotEl.getBoundingClientRect();
			return {
				Element: dotEl,
				Rect: rect,
				Distance: distanceDot
					? Math.sqrt(Math.pow((rect.x - distanceDotRect.x), 2)
						+ Math.pow((rect.y - distanceDotRect.y), 2))
					: undefined
			}
		});
	}

	ns.onTxtInput = (event) => {
		ns.InputBatcher.run("text", () => {
			outputBraille(event.target.value.trim());
		});
	};

	const outputBraille = function outputBraille(value) {
		let inNumberMode = false;
		
		const dispVal = value.charAt(value.length - 1) === " " ? value : value + " ";
		let charIdx = 0;
		ns.OlBraille.innerHTML = `${dispVal.split("").map(char => {
			let output = "";
			const thisIsNumeric = isNumeric(char);
			const thisIsAlpha = isAlpha(char);
			if(!inNumberMode && thisIsNumeric) {
				//Insert number marker
				output += `<gw-braille-cell data-idx="${charIdx}" dots="${CellEl.NumberCellDots}"></gw-braille-cell>`;
				inNumberMode = true;
			}
			else if(thisIsAlpha && inNumberMode) {
				//Insert alpha marker
				output += `<gw-braille-cell data-idx="${charIdx}" dots="${CellEl.AlphaCellDots}"></gw-braille-cell>`;
				inNumberMode = false;
			}

			if(thisIsAlpha || char === " ") {
				inNumberMode = false;
			}

			output += CellEl.AtoBMap.get(char)?.map(charSet => `
				<gw-braille-cell data-idx="${charIdx}" dots="${charSet}"></gw-braille-cell>
			`).join(" ") || "";

			charIdx++;
			return output;
		}).join(" ")}`;

		addCellListeners();

		ns.OlBraille.querySelector(`gw-braille-cell button`).setAttribute("tabindex", "0");
		generateMappedText();
	};

	const onBrailleChange = () => {
		outputText();
	};

	ns.addBrailleCell = () => {
		ns.OlBraille.insertAdjacentHTML("beforeend", `<gw-braille-cell dots=" "></gw-braille-cell>`);
		addCellListeners();
		generateMappedText();

		ns.OlBraille.querySelector(`gw-braille-cell:last-of-type button`)?.focus();
	};

	function outputText() {
		pruneCells();

		const cells = Array.from(ns.OlBraille.querySelectorAll(`gw-braille-cell`));
		let charIdx = 0;
		let cellIdx = -1;
		let lastValidSymbol = null;
		let inNumberMode = false;
		let treeNode = CellEl.BrailleTree;
		let outputText = "";
		while(cellIdx < cells.length) {
			cellIdx++;

			const cell = cells[cellIdx];
			cell?.setAttribute("data-idx", charIdx);
			const cellDots = cell?.getAttribute("dots");
			if(treeNode) {
				treeNode = treeNode[cellDots];
			}

			if(lastValidSymbol && (
				cellDots === CellEl.NumberCellDots
				|| cellDots === CellEl.AlphaCellDots
				|| !treeNode
			)) {
				outputText += lastValidSymbol.Char;
				cellIdx = lastValidSymbol.CellIdx;
				charIdx += 1;
				lastValidSymbol = null;
				treeNode = CellEl.BrailleTree;
				continue;
			}

			if(cellDots === CellEl.NumberCellDots) {
				treeNode = CellEl.BrailleTree;
				inNumberMode = true;
				continue;
			}
			if(cellDots === CellEl.AlphaCellDots) {
				treeNode = CellEl.BrailleTree;
				inNumberMode = false;
				continue;
			}

			if(!treeNode) {
				continue;
			}

			if(treeNode.Ascii) {
				const validChar = treeNode.Ascii.find((char) => inNumberMode ? !isAlpha(char) : !isNumeric(char));
				if(!validChar) {
					continue;
				}
				lastValidSymbol = {Char: validChar, CellIdx: cellIdx};
			}
		}
		ns.TxtText.value = outputText.trim();

		if(ns.OlBraille.querySelector(`gw-braille-cell:last-of-type`)?.getAttribute("dots") !== " ") {
			ns.OlBraille.insertAdjacentHTML("beforeend", `<gw-braille-cell dots=" "></gw-braille-cell>`);
		}

		addCellListeners();
		generateMappedText();
	}

	function addCellListeners() {
		document.querySelectorAll(`gw-braille-cell:not([data-listening])`).forEach(brailleEl => {
			brailleEl.addEventListener("change", onBrailleChange)
			brailleEl.setAttribute("data-listening", "");
		});
	}

	function pruneCells() {
		Array.from(ns.OlBraille.querySelectorAll(
			`:is(gw-braille-cell[dots=" "] + gw-braille-cell[dots=" "], gw-braille-cell[dots=" "]:first-of-type):not(:focus-within)`)
		).forEach(cellEl => cellEl.remove());
	}

	function generateMappedText() {
		document.getElementById("bqBraille").innerHTML = Array.from(
			ns.OlBraille.querySelectorAll(`gw-braille-cell`)
		).reduce((accu, cell) => {
			const brailleChar = String.fromCharCode(`0x${CellEl.BrailleUnicodeMap.get(cell.getAttribute("dots"))}`);
			return accu + `<span id="spnBChar-${cell.getAttribute("data-idx")}" class=charfig>${brailleChar}</span>`;
		}, "");

		let cellIdx = 0;
		ns.OlBraille.querySelectorAll(`gw-braille-cell`).forEach(cell => {
			cell.setIndex(++cellIdx);
		});

		let charIdx = 0;
		document.getElementById("bqText").innerHTML = ns.TxtText.value.trim().split("").map((char) => {
			const spn = `<span
				id="spnChar-${charIdx}"
				role="figure"
				data-idx="${charIdx}"
				aria-label="${char}"
				class="charfig"
			>${char}</span>`
			charIdx += 1;
			return spn;
		}).join("");

		const rulesets = [];
		for(let i = 0; i < charIdx; i++){
			rulesets.push(`
			main:has(:is(gw-braille-cell[data-idx="${i}"], #spnChar-${i}, #spnBChar-${i}):is(:hover, :focus-within)) {
				#spnChar-${i}, #spnBChar-${i} {
					background-color: var(--mark-color);
					border-color: var(--text-color);
				}

				gw-braille-cell[data-idx="${i}"] li {
					background-color: var(--mark-color);
					border-block-end-color: var(--border-color);
				}
			}`);
		}
		TextMapStylesheet.replaceSync(rulesets.join("\n"));

		ns.practiceAfterInput();
	}

	function isNumeric(char) {
		return Number.isInteger(parseInt(char));
	}

	function isAlpha(char) {
		return !!char.match(/[a-z]/i);
	}
}) (GW.Pages.Braille = GW.Pages.Braille || {}); 