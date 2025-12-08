/**
 * @file
 * @author Vera Konigin vera@groundedwren.com
 */
 
window.GW = window.GW || {};
(function Controls(ns) {
	ns.BrailleCellEl = class BrailleCellEl extends HTMLElement {
		static InstanceCount = 0; // Global count of instances created
		static InstanceMap = {}; // Dynamic map of IDs to instances of the element currently attached

		static NumberCellDots = "3456";
		static AlphaCellDots = "56";

		static BrailleKey = [
			{Ascii: " ", Braille: [" "]},
			{Ascii: "a", Braille: ["1"]},
			{Ascii: "b", Braille: ["12"]},
			{Ascii: "c", Braille: ["14"]},
			{Ascii: "d", Braille: ["145"]},
			{Ascii: "e", Braille: ["15"]},
			{Ascii: "f", Braille: ["124"]},
			{Ascii: "g", Braille: ["1245"]},
			{Ascii: "h", Braille: ["125"]},
			{Ascii: "i", Braille: ["24"]},
			{Ascii: "j", Braille: ["245"]},
			{Ascii: "k", Braille: ["13"]},
			{Ascii: "l", Braille: ["123"]},
			{Ascii: "m", Braille: ["134"]},
			{Ascii: "n", Braille: ["1345"]},
			{Ascii: "o", Braille: ["135"]},
			{Ascii: "p", Braille: ["1234"]},
			{Ascii: "q", Braille: ["12345"]},
			{Ascii: "r", Braille: ["1235"]},
			{Ascii: "s", Braille: ["234"]},
			{Ascii: "t", Braille: ["2345"]},
			{Ascii: "u", Braille: ["136"]},
			{Ascii: "v", Braille: ["1236"]},
			{Ascii: "w", Braille: ["2456"]},
			{Ascii: "x", Braille: ["1346"]},
			{Ascii: "y", Braille: ["13456"]},
			{Ascii: "z", Braille: ["1356"]},
			{Ascii: "A", Braille: ["6", "1"]},
			{Ascii: "B", Braille: ["6", "12"]},
			{Ascii: "C", Braille: ["6", "14"]},
			{Ascii: "D", Braille: ["6", "145"]},
			{Ascii: "E", Braille: ["6", "15"]},
			{Ascii: "F", Braille: ["6", "124"]},
			{Ascii: "G", Braille: ["6", "1245"]},
			{Ascii: "H", Braille: ["6", "125"]},
			{Ascii: "I", Braille: ["6", "24"]},
			{Ascii: "J", Braille: ["6", "245"]},
			{Ascii: "K", Braille: ["6", "13"]},
			{Ascii: "L", Braille: ["6", "123"]},
			{Ascii: "M", Braille: ["6", "134"]},
			{Ascii: "N", Braille: ["6", "1345"]},
			{Ascii: "O", Braille: ["6", "135"]},
			{Ascii: "P", Braille: ["6", "1234"]},
			{Ascii: "Q", Braille: ["6", "12345"]},
			{Ascii: "R", Braille: ["6", "1235"]},
			{Ascii: "S", Braille: ["6", "234"]},
			{Ascii: "T", Braille: ["6", "2345"]},
			{Ascii: "U", Braille: ["6", "136"]},
			{Ascii: "V", Braille: ["6", "1236"]},
			{Ascii: "W", Braille: ["6", "2456"]},
			{Ascii: "X", Braille: ["6", "1346"]},
			{Ascii: "Y", Braille: ["6", "13456"]},
			{Ascii: "Z", Braille: ["6", "1356"]},
			{Ascii: "0", Braille: ["245"]},
			{Ascii: "1", Braille: ["1"]},
			{Ascii: "2", Braille: ["12"]},
			{Ascii: "3", Braille: ["14"]},
			{Ascii: "4", Braille: ["145"]},
			{Ascii: "5", Braille: ["15"]},
			{Ascii: "6", Braille: ["124"]},
			{Ascii: "7", Braille: ["1245"]},
			{Ascii: "8", Braille: ["125"]},
			{Ascii: "9", Braille: ["24"]},
			{Ascii: ",", Braille: ["2"]},
			{Ascii: ";", Braille: ["23"], IsGradeOneOnly: true}, //Problematic: conflicts with "be"
			{Ascii: ":", Braille: ["25"]},
			{Ascii: ".", Braille: ["256"]},
			{Ascii: "?", Braille: ["236"]},
			{Ascii: "!", Braille: ["235"]},
			{Ascii: "'", Braille: ["3"]},
			{Ascii: "“", Braille: ["3", "2356"]},
			{Ascii: "“", Braille: ["45", "236"]},
			{Ascii: "”", Braille: ["45", "356"]},
			{Ascii: "‘", Braille: ["6", "236"]},
			{Ascii: "’", Braille: ["6", "356"]},
			{Ascii: "(", Braille: ["5", "126"]},
			{Ascii: ")", Braille: ["5", "345"]},
			{Ascii: "/", Braille: ["456", "34"]},
			{Ascii: "\\", Braille: ["456", "16"]},
			{Ascii: "–", Braille: ["36"]},
			{Ascii: "-", Braille: ["36"]},
			{Ascii: "–", Braille: ["6", "36"]},
			{Ascii: "—", Braille: ["5", "6", "36"]},
			{Ascii: "[", Braille: ["46", "126"]},
			{Ascii: "]", Braille: ["46", "345"]},
			{Ascii: "<", Braille: ["4", "126"]},
			{Ascii: ">", Braille: ["4", "345"]},
			{Ascii: "^", Braille: ["45", "146"]},
			{Ascii: "{", Braille: ["123", "126"]},
			{Ascii: "}", Braille: ["123", "345"]},
			{Ascii: "*", Braille: ["5", "35"]},
			{Ascii: "@", Braille: ["4", "1"]},
			{Ascii: "&", Braille: ["4", "12346"]},
			{Ascii: "%", Braille: ["46", "356"]},
			{Ascii: "+", Braille: ["5", "125"]},
			{Ascii: "#", Braille: ["456", "1456"]},
			{Ascii: `"`, Braille: ["6", "2356"]},
			{Ascii: `~`, Braille: ["4", "35"]},
			{Ascii: `$`, Braille: ["4", "234"]},

			// Contracted
			{Ascii: "but", Braille: ["12"], Sign: "b"},
			{Ascii: "can", Braille: ["14"], Sign: "c"},
			{Ascii: "do", Braille: ["145"], Sign: "d"},
			{Ascii: "every", Braille: ["15"], Sign: "e"},
			{Ascii: "from", Braille: ["124"], Sign: "f"},
			{Ascii: "go", Braille: ["1245"], Sign: "g"},
			{Ascii: "have", Braille: ["125"], Sign: "h"},
			{Ascii: "just", Braille: ["24"], Sign: "i"},
			{Ascii: "knowledge", Braille: ["245"], Sign: "j"},
			{Ascii: "like", Braille: ["13"], Sign: "k"},
			{Ascii: "more", Braille: ["123"], Sign: "l"},
			{Ascii: "more", Braille: ["134"], Sign: "m"},
			{Ascii: "not", Braille: ["1345"], Sign: "n"},
			{Ascii: "people", Braille: ["1234"], Sign: "p"},
			{Ascii: "quite", Braille: ["12345"], Sign: "q"},
			{Ascii: "rather", Braille: ["1235"], Sign: "r"},
			{Ascii: "so", Braille: ["234"], Sign: "s"},
			{Ascii: "that", Braille: ["2345"], Sign: "t"},
			{Ascii: "us", Braille: ["136"], Sign: "u"},
			{Ascii: "very", Braille: ["1236"], Sign: "v"},
			{Ascii: "will", Braille: ["2456"], Sign: "w"},
			{Ascii: "it", Braille: ["1346"], Sign: "x"},
			{Ascii: "you", Braille: ["13456"], Sign: "y"},
			{Ascii: "as", Braille: ["1356"], Sign: "z"},

			//TODO: Shortforms
			{Ascii: "about", Braille: ["1", "12"], IsWord: true},
			{Ascii: "above", Braille: ["1", "12", "1236"], IsWord: true},
			{Ascii: "according", Braille: ["1", "14"], IsWord: true},
			{Ascii: "across", Braille: ["1", "14", "1235"], IsWord: true},
			{Ascii: "after", Braille: ["1", "124"], IsWord: true},
			{Ascii: "afternoon", Braille: ["1", "124", "1345"], IsWord: true},
			{Ascii: "afterward", Braille: ["1", "124", "2456"], IsWord: true},
			{Ascii: "again", Braille: ["1", "1245"], IsWord: true},
			{Ascii: "against", Braille: ["1", "1245", "34"], IsWord: true},
			{Ascii: "almost", Braille: ["1", "123", "134"], IsWord: true},
			{Ascii: "already", Braille: ["1", "123", "1234"], IsWord: true},
			{Ascii: "also", Braille: ["1", "123"], IsWord: true},
			{Ascii: "although", Braille: ["1", "123", "1456"], IsWord: true},
			{Ascii: "altogether", Braille: ["1", "123", "2345"], IsWord: true},
			{Ascii: "always", Braille: ["1", "123", "2456"], IsWord: true},
			{Ascii: "because", Braille: ["23", "14"], IsWord: true},
			{Ascii: "before", Braille: ["23", "124"], IsWord: true},
			{Ascii: "behind", Braille: ["23", "125"], IsWord: true},
			{Ascii: "below", Braille: ["23", "123"], IsWord: true},
			{Ascii: "beneath", Braille: ["23", "1345"], IsWord: true},
			{Ascii: "beside", Braille: ["23", "234"], IsWord: true},
			{Ascii: "between", Braille: ["23", "2345"], IsWord: true},
			{Ascii: "beyond", Braille: ["23", "13456"], IsWord: true},
			{Ascii: "blind", Braille: ["12", "123"], IsWord: true},
			{Ascii: "braille", Braille: ["12", "1235", "123"], IsWord: true},
			{Ascii: "children", Braille: ["16", "1345"], IsWord: true},
			{Ascii: "conceive", Braille: ["25", "14", "1236"], IsWord: true},
			{Ascii: "conceiving", Braille: ["25", "14", "1236", "1245"], IsWord: true},
			{Ascii: "could", Braille: ["14", "145"], IsWord: true},
			{Ascii: "deceive", Braille: ["145", "14", "1236"], IsWord: true},
			{Ascii: "deceiving", Braille: ["145", "14", "1236", "1245"], IsWord: true},
			{Ascii: "declare", Braille: ["145", "14", "123"], IsWord: true},
			{Ascii: "declaring", Braille: ["145", "14", "123", "1245"], IsWord: true},
			{Ascii: "either", Braille: ["15", "24"], IsWord: true},
			{Ascii: "first", Braille: ["124", "34"], IsWord: true},
			{Ascii: "friend", Braille: ["124", "1235"], IsWord: true},
			{Ascii: "good", Braille: ["1245", "145"], IsWord: true},
			{Ascii: "great", Braille: ["1245", "1235", "2345"], IsWord: true},
			{Ascii: "herself", Braille: ["125", "12456", "124"], IsWord: true},
			{Ascii: "him", Braille: ["125", "134"], IsWord: true},
			{Ascii: "himself", Braille: ["125", "134", "124"], IsWord: true},
			{Ascii: "immediate", Braille: ["24", "134", "134"], IsWord: true},
			{Ascii: "its", Braille: ["1346", "234"], IsWord: true},
			{Ascii: "itself", Braille: ["1346", "124"], IsWord: true},
			{Ascii: "letter", Braille: ["123", "1235"], IsWord: true},
			{Ascii: "little", Braille: ["123", "123"], IsWord: true},
			{Ascii: "much", Braille: ["134", "16"], IsWord: true},
			{Ascii: "must", Braille: ["134", "34"], IsWord: true},
			{Ascii: "myself", Braille: ["134", "13456", "124"], IsWord: true},
			{Ascii: "necessary", Braille: ["1345", "15", "14"], IsWord: true},
			{Ascii: "neither", Braille: ["1345", "15", "24"], IsWord: true},
			{Ascii: "oneself", Braille: ["5", "135", "124"], IsWord: true},
			{Ascii: "ourselves", Braille: ["1245", "1235", "1236", "234"], IsWord: true},
			{Ascii: "paid", Braille: ["1234", "145"], IsWord: true},
			{Ascii: "perceive", Braille: ["1234", "12456", "14", "1236"], IsWord: true},
			{Ascii: "perceiving", Braille: ["1234", "12456", "14", "1236", "1245"], IsWord: true},
			{Ascii: "perhaps", Braille: ["1234", "12456", "125"], IsWord: true},
			{Ascii: "quick", Braille: ["12345", "13"], IsWord: true},
			{Ascii: "receive", Braille: ["1235", "14", "1236"], IsWord: true},
			{Ascii: "receiving", Braille: ["1235", "14", "1236", "1245"], IsWord: true},
			{Ascii: "rejoice", Braille: ["1235", "245", "14"], IsWord: true},
			{Ascii: "rejoicing", Braille: ["1235", "245", "14", "1245"], IsWord: true},
			{Ascii: "said", Braille: ["234", "145"], IsWord: true},
			{Ascii: "should", Braille: ["146", "145"], IsWord: true},
			{Ascii: "such", Braille: ["234", "16"], IsWord: true},
			{Ascii: "themselves", Braille: ["2346", "134", "1236", "234"], IsWord: true},
			{Ascii: "thyself", Braille: ["1456", "13456", "124"], IsWord: true},
			{Ascii: "today", Braille: ["2345", "145"], IsWord: true},
			{Ascii: "together", Braille: ["2345", "1245", "1235"], IsWord: true},
			{Ascii: "tomorrow", Braille: ["2345", "134"], IsWord: true},
			{Ascii: "tonight", Braille: ["2345", "1345"], IsWord: true},
			{Ascii: "would", Braille: ["2456", "145"], IsWord: true},
			{Ascii: "your", Braille: ["13456", "1235"], IsWord: true},
			{Ascii: "yourself", Braille: ["13456", "1235", "124"], IsWord: true},
			{Ascii: "yourselves", Braille: ["13456", "1235", "1236", "234"], IsWord: true},

			{Ascii: "and", Braille: ["12346"], IsWord: true},
			{Ascii: "for", Braille: ["123456"], IsWord: true},
			{Ascii: "of", Braille: ["12356"], IsWord: true},
			{Ascii: "the", Braille: ["2346"], IsWord: true},
			{Ascii: "with", Braille: ["23456"], IsWord: true},
			{Ascii: "child", Braille: ["16"], IsWord: true},
			{Ascii: "shall", Braille: ["146"], IsWord: true},
			{Ascii: "this", Braille: ["1456"], IsWord: true},
			{Ascii: "which", Braille: ["156"], IsWord: true},
			{Ascii: "out", Braille: ["1256"], IsWord: true},
			{Ascii: "still", Braille: ["34"], IsWord: true},

			{Ascii: "character", Braille: ["5", "16"], IsWord: true},
			{Ascii: "day", Braille: ["5", "145"], IsWord: true},
			{Ascii: "ever", Braille: ["5", "15"], IsWord: true},
			{Ascii: "father", Braille: ["5", "124"], IsWord: true},
			{Ascii: "here", Braille: ["5", "125"], IsWord: true},
			{Ascii: "know", Braille: ["5", "13"], IsWord: true},
			{Ascii: "lord", Braille: ["5", "123"], IsWord: true},
			{Ascii: "mother", Braille: ["5", "134"], IsWord: true},
			{Ascii: "name", Braille: ["5", "1345"], IsWord: true},
			{Ascii: "one", Braille: ["5", "135"], IsWord: true},
			{Ascii: "ought", Braille: ["5", "1256"], IsWord: true},
			{Ascii: "part", Braille: ["5", "1234"], IsWord: true},
			{Ascii: "question", Braille: ["5", "12345"], IsWord: true},
			{Ascii: "right", Braille: ["5", "1235"], IsWord: true},
			{Ascii: "some", Braille: ["5", "234"], IsWord: true},
			{Ascii: "there", Braille: ["5", "2346"], IsWord: true},
			{Ascii: "through", Braille: ["5", "1456"], IsWord: true},
			{Ascii: "time", Braille: ["5", "2345"], IsWord: true},
			{Ascii: "under", Braille: ["5", "136"], IsWord: true},
			{Ascii: "where", Braille: ["5", "156"], IsWord: true},
			{Ascii: "work", Braille: ["5", "2456"], IsWord: true},
			{Ascii: "young", Braille: ["5", "13456"], IsWord: true},

			{Ascii: "these", Braille: ["45", "2346"], IsWord: true},
			{Ascii: "those", Braille: ["45", "1456"], IsWord: true},
			{Ascii: "upon", Braille: ["45", "136"], IsWord: true},
			{Ascii: "whose", Braille: ["45", "156"], IsWord: true},
			{Ascii: "word", Braille: ["45", "2456"], IsWord: true},
			
			{Ascii: "cannot", Braille: ["456", "14"], IsWord: true},
			{Ascii: "had", Braille: ["456", "125"], IsWord: true},
			{Ascii: "many", Braille: ["456", "134"], IsWord: true},
			{Ascii: "spirit", Braille: ["456", "234"], IsWord: true},
			{Ascii: "their", Braille: ["456", "2346"], IsWord: true},
			{Ascii: "world", Braille: ["456", "2456"], IsWord: true},

			{Ascii: "ch", Braille: ["16"], IsGroup: true},
			{Ascii: "sh", Braille: ["146"], IsGroup: true},
			{Ascii: "th", Braille: ["1456"], IsGroup: true},
			{Ascii: "wh", Braille: ["156"], IsGroup: true},
			{Ascii: "ou", Braille: ["1256"], IsGroup: true},
			{Ascii: "st", Braille: ["34"], IsGroup: true},
			{Ascii: "ar", Braille: ["345"], IsGroup: true},
			{Ascii: "ed", Braille: ["1246"], IsGroup: true},
			{Ascii: "er", Braille: ["12456"], IsGroup: true},
			{Ascii: "ing", Braille: ["346"], IsGroup: true},
			{Ascii: "gh", Braille: ["126"], IsGroup: true},
			{Ascii: "ow", Braille: ["246"], IsGroup: true},
			{Ascii: "be", Braille: ["23"], IsGroup: true},
			{Ascii: "con", Braille: ["25"], IsGroup: true},
			{Ascii: "dis", Braille: ["256"], IsGroup: true},
			{Ascii: "ea", Braille: ["2"], IsGroup: true},
			{Ascii: "en", Braille: ["26"], IsGroup: true},
			{Ascii: "his", Braille: ["236"], IsGroup: true},
			{Ascii: "in", Braille: ["35"], IsGroup: true},
			{Ascii: "was", Braille: ["356"], IsGroup: true},
			{Ascii: "were", Braille: ["2356"], IsGroup: true},
			{Ascii: "bb", Braille: ["23"], IsGroup: true},
			{Ascii: "cc", Braille: ["25"], IsGroup: true},
			{Ascii: "ff", Braille: ["235"], IsGroup: true},
			{Ascii: "gg", Braille: ["2356"], IsGroup: true},
			{Ascii: "ence", Braille: ["56", "15"], IsGroup: true},
			{Ascii: "ful", Braille: ["56", "123"], IsGroup: true},
			{Ascii: "ity", Braille: ["56", "13456"], IsGroup: true},
			{Ascii: "ment", Braille: ["56", "2345"], IsGroup: true},
			{Ascii: "ness", Braille: ["56", "234"], IsGroup: true},
			{Ascii: "ong", Braille: ["56", "1245"], IsGroup: true},
			{Ascii: "tion", Braille: ["56", "1345"], IsGroup: true},
			{Ascii: "ance", Braille: ["56", "12"], IsGroup: true},
			{Ascii: "less", Braille: ["56", "234"], IsGroup: true},
			{Ascii: "ound", Braille: ["56", "145"], IsGroup: true},
			{Ascii: "ount", Braille: ["56", "2345"], IsGroup: true},
			{Ascii: "sion", Braille: ["56", "1345"], IsGroup: true},
		];

		static BrailleUnicodeMap = new Map([
			[" ", "2800"],
			["1", "2801"],
			["2", "2802"],
			["12", "2803"],
			["3", "2804"],
			["13", "2805"],
			["23", "2806"],
			["123", "2807"],
			["4", "2808"],
			["14", "2809"],
			["24", "280A"],
			["124", "280B"],
			["34", "280C"],
			["134", "280D"],
			["234", "280E"],
			["1234", "280F"],
			["5", "2810"],
			["15", "2811"],
			["25", "2812"],
			["125", "2813"],
			["35", "2814"],
			["135", "2815"],
			["235", "2816"],
			["1235", "2817"],
			["45", "2818"],
			["145", "2819"],
			["245", "281A"],
			["1245", "281B"],
			["345", "281C"],
			["1345", "281D"],
			["2345", "281E"],
			["12345", "281F"],
			["6", "2820"],
			["16", "2821"],
			["26", "2822"],
			["126", "2823"],
			["36", "2824"],
			["136", "2825"],
			["236", "2826"],
			["1236", "2827"],
			["46", "2828"],
			["146", "2829"],
			["246", "282A"],
			["1246", "282B"],
			["346", "282C"],
			["1346", "282D"],
			["2346", "282E"],
			["12346", "282F"],
			["56", "2830"],
			["156", "2831"],
			["256", "2832"],
			["1256", "2833"],
			["356", "2834"],
			["1356", "2835"],
			["2356", "2836"],
			["12356", "2837"],
			["456", "2838"],
			["1456", "2839"],
			["2456", "283A"],
			["12456", "283B"],
			["3456", "283C"],
			["13456", "283D"],
			["23456", "283E"],
			["123456", "283F"],
		]);

		static {
			const gradeTwoEntries = BrailleCellEl.BrailleKey.filter(entry => entry.Sign || entry.IsWord || entry.IsGroup);
			gradeTwoEntries.forEach(entry => {
				const newEntry = {
					...entry,
					Ascii: entry.Ascii.charAt(0).toUpperCase() + entry.Ascii.slice(1),
					Braille: ["6"].concat(entry.Braille),
				};
				if(entry.Sign) {
					newEntry.Sign = entry.Sign.toUpperCase();
				}
				BrailleCellEl.BrailleKey.push(newEntry);
			});
		}

		static reindexGradeOne() {
			BrailleCellEl.#reindex(
				BrailleCellEl.BrailleKey.filter(entry => !entry.IsGroup && !entry.IsWord && !entry.Sign)
			);
		}

		static reindexGradeTwo() {
			BrailleCellEl.#reindex(BrailleCellEl.BrailleKey.filter(entry => !entry.IsGradeOneOnly));
		}

		static #reindex(brailleKey) {
			BrailleCellEl.AtoBMap = new Map(brailleKey.map(entry => [entry.Ascii, entry.Braille]));

			BrailleCellEl.BrailleTree = {};
			brailleKey.forEach(entry => {
				let curLevel = BrailleCellEl.BrailleTree;
				entry.Braille.forEach(cell => {
					curLevel[cell] = curLevel[cell] || {};
					curLevel = curLevel[cell];
				});
				if(entry.Sign || entry.IsWord) {
					curLevel.WordSign = entry.Ascii;
				}
				else {
					curLevel.Ascii = curLevel.Ascii || [];
					curLevel.Ascii.push(entry.Ascii);
				}
			});

			BrailleCellEl.AlphabeticWordMap = new Map(
				brailleKey.filter(
					entry => !!entry.Sign || entry.IsWord || entry.IsGroup
				).map(
					entry => [entry.Ascii, entry.Sign || entry.Ascii]
				)
			);

			BrailleCellEl.GroupList = brailleKey.map(
				entry => entry.IsGroup ? entry.Ascii : null
			).filter(ascii => !!ascii).sort((a, b) => b.length - a.length);
		}

		// Element name
		static Name = "gw-braille-cell";

		// Attributes whose changes we respond to
		static observedAttributes = ["data-cell-idx", "data-char-idx"];

		// Element CSSStyleSheet
		static #CommonStyleSheet = new CSSStyleSheet();
		static #CommonStyleAttribute = `data-${BrailleCellEl.Name}-style`;
		static {
			BrailleCellEl.#CommonStyleSheet.replaceSync(`${BrailleCellEl.Name} {
				display: contents;
				li {
					background-color: var(--background-color);
					padding: 5px;
					border-block: 4px solid var(--background-alt-color);
				}

				button {
					border-width: 1px;
					--border-start-color: var(--link-color);
					--border-end-color: var(--link-color);
					
					&::before {
						border-radius: 100%;
						opacity: 0.5;
					}

					&[aria-pressed="true"] {
						--border-start-color: color-mix(in oklab, var(--link-color), #FFFFFF 30%);
						--border-end-color: color-mix(in oklab, var(--link-color), #000000 20%);
						border-width: 2.5px;

						&::before {
							opacity: 1;
							width: 1em;
							height: 1em;
						}
					}
				}
			}`);
		}

		InstanceId; // Identifier for this instance of the element
		IsInitialized; // Whether the element has rendered its content

		/** Creates an instance */
		constructor() {
			super();
			if(!this.getId) {
				// We're not initialized correctly. Attempting to fix:
				Object.setPrototypeOf(this, customElements.get(BrailleCellEl.Name).prototype);
			}
			this.InstanceId = BrailleCellEl.InstanceCount++;
		}

		/** Shortcut for the root node of the element */
		get Root() {
			return this.getRootNode();
		}
		/** Looks up the <head> element (or a fascimile thereof in the shadow DOM) for the element's root */
		get Head() {
			if(this.Root.head) {
				return this.Root.head;
			}
			if(this.Root.getElementById("gw-head")) {
				return this.Root.getElementById("gw-head");
			}
			const head = document.createElement("div");
			head.setAttribute("id", "gw-head");
			this.Root.prepend(head);
			return head;
		}

		/**
		 * Generates a globally unique ID for a key unique to the custom element instance
		 * @param {String} key Unique key within the custom element
		 * @returns A globally unique ID
		 */
		getId(key) {
			return `${BrailleCellEl.Name}-${this.InstanceId}-${key}`;
		}
		/**
		 * Finds an element within the custom element created with an ID from getId
		 * @param {String} key Unique key within the custom element
		 * @returns The element associated with the key
		 */
		getRef(key) {
			return this.querySelector(`#${CSS.escape(this.getId(key))}`);
		}

		/** Handler invoked when the element is attached to the page */
		connectedCallback() {
			this.onAttached();
		}
		/** Handler invoked when the element is moved to a new document via adoptNode() */
		adoptedCallback() {
			this.onAttached();
		}
		/** Handler invoked when the element is disconnected from the document */
		disconnectedCallback() {
			delete BrailleCellEl.InstanceMap[this.InstanceId];
		}

		/** Performs setup when the element has been sited */
		onAttached() {
			if(!this.Head.hasAttribute(BrailleCellEl.#CommonStyleAttribute)) {
				this.Head.setAttribute(BrailleCellEl.#CommonStyleAttribute, "");
				this.Root.adoptedStyleSheets.push(BrailleCellEl.#CommonStyleSheet);
			}

			BrailleCellEl.InstanceMap[this.InstanceId] = this;
			if(document.readyState === "loading") {
				document.addEventListener("DOMContentLoaded", () => {
					this.#initialize();
				});
			}
			else {
				this.#initialize();
			}
		}

		/** First-time setup */
		#initialize() {
			if(this.IsInitialized) { return; }

			const dots = new Set(this.getAttribute("dots").split("").map(dot => parseInt(dot)));
			this.innerHTML = `
				<li>
					<table
						id="${this.getId("tbl")}"
						role="grid"
						aria-label="Braille Cell"
						aria-describedby="spnChar-${this.getAttribute("data-char-idx")}"
					>
						<tbody>${[1, 2, 3].map((rowNum => `
							<tr>${[1, 2].map(colNum => `
								<td>
									<button
										data-dot="${rowNum + ((colNum - 1) * 3)}"
										aria-label="dot"
										aria-pressed="${dots.has(rowNum + ((colNum - 1) * 3))
											? "true"
											: "false"}"
										tabindex="-1"
									></button>
								</td>`).join(" ")}
							</tr>`)).join("\n")}
						</tbody>
					</table>
				</li>
			`;

			this.querySelectorAll(`button`).forEach(buttonEl => {
				buttonEl.addEventListener("click", this.#onBtnClick);
			});

			this.IsInitialized = true;
		}

		/** Handler invoked when any of the observed attributes are changed */
		attributeChangedCallback(name, oldValue, newValue) {
			this.getRef("tbl")?.setAttribute("aria-label", `Braille Cell ${this.getAttribute("data-cell-idx")}`);
			this.getRef("tbl")?.setAttribute("aria-describedby", `spnChar-${this.getAttribute("data-char-idx")}`);
		}

		#onBtnClick = (event) => {
			const btnEl = event.currentTarget;
			btnEl.setAttribute("aria-pressed", btnEl.getAttribute("aria-pressed") === "true" ? "false" : "true");

			const dotAry = Array.from(this.querySelectorAll(`button[aria-pressed="true"]`)).map(
				btnEl => btnEl.getAttribute("data-dot")
			).sort();
			this.setAttribute("dots", dotAry.join("") || " ");

			this.dispatchEvent(new Event("change"));
		};
	}
	if(!customElements.get(ns.BrailleCellEl.Name)) {
		customElements.define(ns.BrailleCellEl.Name, ns.BrailleCellEl);
	}
}) (window.GW.Controls = window.GW.Controls || {});
GW?.Controls?.Veil?.clearDefer("GW.Controls.BrailleCellEl");