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
			{Ascii: ";", Braille: ["23"]},
			{Ascii: ":", Braille: ["25"]},
			{Ascii: ".", Braille: ["256"]},
			{Ascii: "?", Braille: ["236"]},
			{Ascii: "!", Braille: ["235"]},
			{Ascii: "‘", Braille: ["3"]},
			{Ascii: "“", Braille: ["3", "2356"]},
			{Ascii: "“", Braille: ["45", "236"]},
			{Ascii: "”", Braille: ["45", "356"]},
			{Ascii: "‘", Braille: ["3", "236"]},
			{Ascii: "’", Braille: ["3", "356"]},
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
			["1436", "282D"],
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
			BrailleCellEl.AtoBMap = new Map(BrailleCellEl.BrailleKey.map(entry => [entry.Ascii, entry.Braille]));

			BrailleCellEl.BrailleTree = {};
			BrailleCellEl.BrailleKey.forEach(entry => {
				let curLevel = BrailleCellEl.BrailleTree;
				entry.Braille.forEach(cell => {
					curLevel[cell] = curLevel[cell] || {};
					curLevel = curLevel[cell];
				});
				curLevel.Ascii = curLevel.Ascii || [];
				curLevel.Ascii.push(entry.Ascii);
			});
		}

		// Element name
		static Name = "gw-braille-cell";

		// Element CSSStyleSheet
		static #CommonStyleSheet = new CSSStyleSheet();
		static #CommonStyleAttribute = `data-${BrailleCellEl.Name}-style`;
		static {
			BrailleCellEl.#CommonStyleSheet.replaceSync(`${BrailleCellEl.Name} {
				display: contents;
				li {
					background-color: var(--background-alt-color);
					padding: 5px;
					border-block-end: 4px solid transparent;
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
						aria-describedby="spnChar-${this.getAttribute("data-idx")}"
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

		setIndex(index) {
			this.getRef("tbl").setAttribute("aria-label", `Braille Cell ${index}`);
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