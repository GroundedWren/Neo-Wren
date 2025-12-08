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

		document.getElementById("cbxGrade2").addEventListener("switch", ns.onGradeChange);
		ns.onGradeChange();
	};
	window.addEventListener("DOMContentLoaded", onDCL);

	ns.onGradeChange = () => {
		if(isUsingContracted()) {
			CellEl.reindexGradeTwo();
		}
		else {
			CellEl.reindexGradeOne();
		}

		ns.TxtText.value = "";
		outputBraille("");
	};

	function isUsingContracted() {
		return document.getElementById("cbxGrade2").checked;
	}

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

	ns.addBrailleCell = () => {
		ns.OlBraille.insertAdjacentHTML("beforeend", `<gw-braille-cell dots=" "></gw-braille-cell>`);
		addCellListeners();
		generateMappedText(getCharUnits(ns.TxtText.value));

		ns.OlBraille.querySelector(`gw-braille-cell:last-of-type button`)?.focus();
	};

	ns.onTxtInput = (event) => {
		ns.InputBatcher.run("text", () => {
			const lastWasSpace = event.target.value.charAt(event.target.value.length - 1) === " ";
			event.target.value = event.target.value.split(" ").filter(char => !!char).join(" ")
				+ (lastWasSpace ? " " : "");
			outputBraille(event.target.value.trim());
		});
	};

	const outputBraille = function outputBraille(value) {
		let inNumberMode = false;
		
		const charUnits = getCharUnits(value);
		let charIdx = 0;
		ns.OlBraille.innerHTML = `${charUnits.map(unit => {
			let output = "";
			const thisIsNumeric = isNumeric(unit.Key);
			const thisIsAlpha = isAlpha(unit.Key);
			if(!inNumberMode && thisIsNumeric) {
				//Insert number marker
				output += `<gw-braille-cell data-char-idx="${charIdx}" dots="${CellEl.NumberCellDots}"></gw-braille-cell>`;
				inNumberMode = true;
			}
			else if(thisIsAlpha && inNumberMode) {
				//Insert alpha marker
				output += `<gw-braille-cell data-char-idx="${charIdx}" dots="${CellEl.AlphaCellDots}"></gw-braille-cell>`;
				inNumberMode = false;
			}

			if(thisIsAlpha || unit.Key === " ") {
				inNumberMode = false;
			}

			output += CellEl.AtoBMap.get(unit.Key)?.map(charSet => `
				<gw-braille-cell data-char-idx="${charIdx}" dots="${charSet}"></gw-braille-cell>
			`).join(" ") || "";

			charIdx++;
			return output;
		}).join(" ")}`;

		ns.OlBraille.querySelector(`gw-braille-cell button`).setAttribute("tabindex", "0");		
		postProcessOutput(charUnits);
	};

	function getCharUnits(inputStr) {
		if(inputStr.charAt(inputStr.length - 1) !== " ") {
			inputStr += " ";
		}

		if(!isUsingContracted()) {
			return inputStr.split("").map(char => {
				return {Key: char, Display: char};
			});
		}

		let units = [];
		let curUnit = "";
		for(let i = 0; i < inputStr.length; i++) {
			const char = inputStr.charAt(i);
			if(isAlpha(char) || isNumeric(char)) {
				curUnit += char;
			}
			else {
				units.push(curUnit);
				units.push(char);
				curUnit = "";
			}
		}
		if(curUnit) {
			units.push(curUnit);
		}

		units = units.map(word => {
			if(CellEl.AlphabeticWordMap.has(word)) {
				return {Key: CellEl.AlphabeticWordMap.get(word), Display: word};
			}
			return word;
		});

		CellEl.GroupList.forEach(groupStr => {
			units = units.reduce((acc, unit) => {
				if(typeof unit === "object") {
					acc.push(unit);
					return acc;
				}

				const pieces = unit.split(groupStr);
				if(pieces.length === 1) {
					acc.push(unit);
					return acc;
				}

				for(let i = 0; i < pieces.length; i++) {
					if(pieces[i]) {
						acc.push(pieces[i]);
					}
					if(i < pieces.length - 1) {
						acc.push({Key: groupStr, Display: groupStr});
					}
				}

				return acc;
			}, []);
		});

		units = units.reduce((acc, unit) => {
			if(typeof unit === "object") {
				acc.push(unit);
			}
			else if(unit !== "") {
				unit.split("").forEach(char => acc.push({Key: char, Display: char}));
			}
			return acc;
		}, []);

		return units;
	}

	const onBrailleChange = () => {
		outputText();
	};

	function outputText() {
		pruneCells();

		const cells = Array.from(ns.OlBraille.querySelectorAll(`gw-braille-cell`));
		const units = [];
		let charIdx = 0;
		let cellIdx = -1;
		let lastValidSymbol = null;
		let lastValidWord = null
		let inNumberMode = false;
		let treeNode = CellEl.BrailleTree;
		let outputText = "";
		while(cellIdx < cells.length) {
			cellIdx++;

			const cell = cells[cellIdx];
			cell?.setAttribute("data-char-idx", charIdx);
			const cellDots = cell?.getAttribute("dots");
			if(treeNode) {
				treeNode = treeNode[cellDots];
			}

			let pushedText = false;

			if(lastValidWord && !treeNode) {
				units.push({Key: "", Display: lastValidWord.Word});
				outputText += lastValidWord.Word;
				cellIdx = lastValidWord.CellIdx;
				pushedText = true;
			}
			else if(lastValidSymbol && (
				cellDots === CellEl.NumberCellDots
				|| cellDots === CellEl.AlphaCellDots
				|| !treeNode
			)) {
				units.push({Key: "", Display: lastValidSymbol.Char});
				outputText += lastValidSymbol.Char;
				cellIdx = lastValidSymbol.CellIdx;
				pushedText = true;
			}

			if(pushedText) {
				charIdx += 1;
				lastValidSymbol = null;
				lastValidWord = null;
				treeNode = CellEl.BrailleTree;
				continue;
			}

			if(!inNumberMode && cellDots === CellEl.NumberCellDots) {
				treeNode = CellEl.BrailleTree;
				inNumberMode = true;
				continue;
			}
			if(inNumberMode && cellDots === CellEl.AlphaCellDots) {
				treeNode = CellEl.BrailleTree;
				inNumberMode = false;
				continue;
			}

			if(!treeNode) {
				continue;
			}

			if(treeNode.Ascii) {
				const validChar = treeNode.Ascii.find((char) => inNumberMode ? !isAlpha(char) : !isNumeric(char));
				if(validChar) {
					lastValidSymbol = {Char: validChar, CellIdx: cellIdx};
				}
			}

			const nextCellDots = cells[cellIdx + 1]?.getAttribute("dots")
			if(treeNode.WordSign
				&& (outputText.length === 0 || outputText.charAt(outputText.length - 1) === " ")
				&& (nextCellDots == "" || nextCellDots === " ")
			) {
				lastValidWord = {Word: treeNode.WordSign, CellIdx: cellIdx};
			}
		}

		ns.TxtText.value = outputText.trim();
		
		if(ns.OlBraille.querySelector(`gw-braille-cell:last-of-type`)?.getAttribute("dots") !== " ") {
			ns.OlBraille.insertAdjacentHTML("beforeend", `<gw-braille-cell dots=" "></gw-braille-cell>`);
		}

		postProcessOutput(units);
	}

	function pruneCells() {
		Array.from(ns.OlBraille.querySelectorAll(
			`:is(gw-braille-cell[dots=" "] + gw-braille-cell[dots=" "], gw-braille-cell[dots=" "]:first-of-type):not(:focus-within)`)
		).forEach(cellEl => cellEl.remove());
	}

	function postProcessOutput(charUnits) {
		addCellListeners();
		generateMappedText(charUnits);
		ns.practiceAfterInput();
	}

	function addCellListeners() {
		document.querySelectorAll(`gw-braille-cell:not([data-listening])`).forEach(brailleEl => {
			brailleEl.addEventListener("change", onBrailleChange)
			brailleEl.setAttribute("data-listening", "");
		});
	}

	function generateMappedText(charUnits) {
		document.getElementById("bqBraille").innerHTML = Array.from(
			ns.OlBraille.querySelectorAll(`gw-braille-cell`)
		).reduce((accu, cell) => {
			const brailleChar = String.fromCharCode(`0x${CellEl.BrailleUnicodeMap.get(cell.getAttribute("dots"))}`);
			return accu + `<span id="spnBChar-${cell.getAttribute("data-char-idx")}" class="charfig">${brailleChar}</span>`;
		}, "");

		let cellIdx = 0;
		ns.OlBraille.querySelectorAll(`gw-braille-cell`).forEach(cell => {
			cell.setAttribute("data-cell-idx", ++cellIdx);
		});

		let charIdx = 0;
		document.getElementById("bqText").innerHTML = charUnits.map((unit) => {
			if(!document.querySelector(`gw-braille-cell[data-char-idx="${charIdx}"]`)) {
				charIdx += 1;
				return "";
			}
			const spn = `<span
				id="spnChar-${charIdx}"
				role="figure"
				data-char-idx="${charIdx}"
				aria-label="${unit.Display}"
				class="charfig"
			>${unit.Display}</span>`
			charIdx += 1;
			return spn;
		}).join("");

		const rulesets = [];
		for(let i = 0; i < charIdx; i++){
			rulesets.push(`
			main:has(:is(gw-braille-cell[data-char-idx="${i}"], #spnChar-${i}, #spnBChar-${i}):is(:hover, :focus-within)) {
				#spnChar-${i}, #spnBChar-${i} {
					background-color: var(--mark-color);
					border-color: var(--text-color);
				}

				gw-braille-cell[data-char-idx="${i}"] li {
					background-color: var(--mark-color);
					border-block-end-color: var(--border-color);
				}
			}`);
		}
		TextMapStylesheet.replaceSync(rulesets.join("\n"));
	}

	function isNumeric(char) {
		return Number.isInteger(parseInt(char));
	}

	function isAlpha(char) {
		return !!char.match(/[a-z]/i);
	}
	function isAlphaOrWhitespace(char) {
		return !!char.match(/[a-z]/i) || char === " ";
	}
}) (GW.Pages.Braille = GW.Pages.Braille || {}); 