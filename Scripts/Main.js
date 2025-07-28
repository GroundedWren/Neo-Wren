/**
 * @file Site-wide code
 * @author Kathryn Aulabaugh kathryn-aulabaugh@gmail.com
 * https://kathryn-aulabaugh.com
 */

window.GW = window.GW || {};
(function Common(ns) {
	(function Controls(ns) {
		ns.SiteHeaderEl = class SiteHeader extends HTMLElement {
			static InstanceCount = 0; // Global count of instances created
			static InstanceMap = {}; // Dynamic map of IDs to instances of the element currently attached

			//Element name
			static Name = "gw-site-header";
			// Element CSS rules
			static Style = `${SiteHeader.Name} {
				display: contents;

				header {
					display: grid;
					grid-template-columns: 1fr 1fr 1fr;
					align-items: center;
					gap: 10px;
					padding-block: 10px;
					border-block-end: 1px solid color-mix(in oklab, var(--border-color), transparent 80%);
					margin-inline: 4px;

					> :first-child {
						display: grid;
						grid-template-areas:
							"j s"
							"b b";
						grid-template-columns: auto 1fr;
						grid-template-rows: auto auto;
						justify-items: start;
						align-items: start;
					}

					> :last-child {
						display: flex;
						flex-direction: row;
						gap: 5px;
						justify-content: flex-end;
					}
				}

				[href="#main"] {
					grid-area: j;
				}
				
				gw-search {
					grid-area: s;
				}

				nav {
					grid-area: b;

					display: flex;
					flex-direction: row;
					flex-wrap: wrap;
					gap: 5px;
					padding: 5px;
					border-radius: 20px;
					background-color: var(--background-color);
					
					ol {
						margin: 0;
						padding: 0;
						list-style: none;
						display: flex;
						flex-direction: row;
						flex-wrap: wrap;
						
						li {
							display: inline-block;
							
							+ li::before {
								display: inline-block;
								margin-inline: 0.25em;
								transform: rotate(15deg);
								border-inline-end: 0.1em solid var(--border-color);
								height: 0.8em;
								content: "";
							}
							
							a {
								display: inline-block;
								
								&[aria-current="page"] {
									font-weight: 700;
									text-decoration: none;
								}
							}
						}
					}
				}

				hgroup {
					display: flex;
					flex-direction: column;
					align-items: center;
					gap: 4px;
					h1 {
						margin-block: 0px;
						text-align: center;
						background-color: var(--accent-color);
						border-radius: 20px;
						padding: 4px;
					}
					p {
						margin: 0;
						font-size: 0.85em;
						font-style: italic;
					}
				}

				svg {
					width: 16px;
					height: 16px;
					fill: var(--icon-color);
				}

				gw-personalization {
					min-width: 250px;
				}
			}`;

			InstanceId; // Identifier for this instance of the element
			IsInitialized; // Whether the element has rendered its content

			/** Creates an instance */
			constructor() {
				super();
				if(!this.getId) {
					// We're not initialized correctly. Attempting to fix:
					Object.setPrototypeOf(this, customElements.get(SiteHeader.Name).prototype);
				}
				this.InstanceId = SiteHeader.InstanceCount++;
				
				if(!GW.Controls?.PersonalizationEl) {
					const personalizationScript = document.createElement("script");
					personalizationScript.type = "text/javascript";
					personalizationScript.src = "https://groundedwren.com/Scripts/PersonalizationControl.js";
					document.head.appendChild(personalizationScript);
					GW.Controls?.Veil?.addDefer("GW.Controls.PersonalizationEl");
				}
				
				if(!GW.Controls?.SearchEl) {
					const searchScript = document.createElement("script");
					searchScript.type = "text/javascript";
					searchScript.src = "https://groundedwren.com/Scripts/SearchControl.js";
					document.head.appendChild(searchScript);
					GW.Controls?.Veil?.addDefer("GW.Controls.Search");
				}
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
				return `${SiteHeader.Name}-${this.InstanceId}-${key}`;
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
				delete SiteHeader.InstanceMap[this.InstanceId];
			}

			/** Performs setup when the element has been sited */
			onAttached() {
				if(!this.Root.querySelector(`style.${SiteHeader.Name}`)) {
					this.Head.insertAdjacentHTML(
						"beforeend",
						`<style class=${SiteHeader.Name}>${SiteHeader.Style}</style>`
					);
				}

				SiteHeader.InstanceMap[this.InstanceId] = this;
				if(!this.IsInitialized) {
					if(document.readyState === "loading") {
						document.addEventListener("DOMContentLoaded", () => {
							if(!this.IsInitialized) {
								this.renderContent();
							}
						});
					}
					else {
						this.renderContent();
					}
				}
			}

			/** Invoked when the element is ready to render */
			renderContent() {
				document.head.insertAdjacentHTML("beforeend", `
				<style>
					@media (max-width: ${this.getAttribute("reflowWidth") || "450px"}) {
						#${this.getId("header")} {
							grid-template-columns: 1fr;
							justify-items: center;
						}
						#${this.getId("p13n")} {
							display: contents;
						}
					}
				</style>
				`);

				const headerText = this.querySelector(`h1`)?.innerText || "Header";
				const subtitleText = this.querySelector(`p`)?.innerText;
				this.innerHTML = `
				<header id=${this.getId("header")}>
					<div>
						<a class="hide-until-focus full" href="#main">Skip to content</a>
						<gw-search dataKey="Site"></gw-search>
						${this.hasAttribute("crumbs")
							? `<nav aria-label="Breadcrumb" class="breadcrumb">
									<ol>
										${this.getAttribute("crumbs").split("; ").map(crumb =>
										 `<li><a class="full" href="https://groundedwren.com/${crumb.split("|")[0]}">${crumb.split("|")[1]}</a></li>`
										).join("")}
										<li><a class="full" href="" aria-current="page">${this.getAttribute("curCrumbTxt")}</a></li>
									</ol>
								</nav>`
							: ""
						}
					</div>
					<hgroup>
						<h1>${headerText}</h1>
						${subtitleText  ? `<p>${subtitleText}</p>` : ""}
					</hgroup>
					<div class="bubble-container">
						<details class="bubbler">
							<summary>
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
									<!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License) Copyright 2023 Fonticons, Inc. -->
									<title>Personalization</title>
									<path d="M495.9 166.6c3.2 8.7 .5 18.4-6.4 24.6l-43.3 39.4c1.1 8.3 1.7 16.8 1.7 25.4s-.6 17.1-1.7 25.4l43.3 39.4c6.9 6.2 9.6 15.9 6.4 24.6c-4.4 11.9-9.7 23.3-15.8 34.3l-4.7 8.1c-6.6 11-14 21.4-22.1 31.2c-5.9 7.2-15.7 9.6-24.5 6.8l-55.7-17.7c-13.4 10.3-28.2 18.9-44 25.4l-12.5 57.1c-2 9.1-9 16.3-18.2 17.8c-13.8 2.3-28 3.5-42.5 3.5s-28.7-1.2-42.5-3.5c-9.2-1.5-16.2-8.7-18.2-17.8l-12.5-57.1c-15.8-6.5-30.6-15.1-44-25.4L83.1 425.9c-8.8 2.8-18.6 .3-24.5-6.8c-8.1-9.8-15.5-20.2-22.1-31.2l-4.7-8.1c-6.1-11-11.4-22.4-15.8-34.3c-3.2-8.7-.5-18.4 6.4-24.6l43.3-39.4C64.6 273.1 64 264.6 64 256s.6-17.1 1.7-25.4L22.4 191.2c-6.9-6.2-9.6-15.9-6.4-24.6c4.4-11.9 9.7-23.3 15.8-34.3l4.7-8.1c6.6-11 14-21.4 22.1-31.2c5.9-7.2 15.7-9.6 24.5-6.8l55.7 17.7c13.4-10.3 28.2-18.9 44-25.4l12.5-57.1c2-9.1 9-16.3 18.2-17.8C227.3 1.2 241.5 0 256 0s28.7 1.2 42.5 3.5c9.2 1.5 16.2 8.7 18.2 17.8l12.5 57.1c15.8 6.5 30.6 15.1 44 25.4l55.7-17.7c8.8-2.8 18.6-.3 24.5 6.8c8.1 9.8 15.5 20.2 22.1 31.2l4.7 8.1c6.1 11 11.4 22.4 15.8 34.3zM256 336a80 80 0 1 0 0-160 80 80 0 1 0 0 160z"/>
								</svg>
							</summary>
							<gw-personalization id="${this.getId("p13n")}" class="bubble"></gw-personalization>
						</details>
					</div>
				</header>`;
				this.IsInitialized = true;
			}
		}
		if(!customElements.get(ns.SiteHeaderEl.Name)) {
			customElements.define(ns.SiteHeaderEl.Name, ns.SiteHeaderEl);
		}

		ns.ButtonsListEl = class ButtonsList extends HTMLElement {
			static InstanceCount = 0; // Global count of instances created
			static InstanceMap = {}; // Dynamic map of IDs to instances of the element currently attached

			//Element name
			static Name = "gw-buttons-list";
			// Element CSS rules
			static Style = `${ButtonsList.Name} {
				display: contents;

				ul {
					min-height: 55px;
					display: flex;
					flex-direction: row;
					flex-wrap: wrap;
					justify-content: space-evenly;
					padding: 0;

					li {
						list-style: none;
						width: 150px;
					}
				}

				figure {
					display: grid;
					grid-template-rows: auto auto;
					justify-items: center;
					margin: 5px;
					
					figcaption {
						font-size: 0.9em;
						text-align: center;
					}
				}
			}`;

			static Buttons = [
				{
					Href: "https://pinkvampyr.leprd.space/accessiblenet/index",
					Src: "https://groundedwren.com/Img/Buttons/accessiblenet-button.png",
					Alt: "A light purple 88x31 button with the universal access symbol and the words 'accessible net'",
					Title: "Accessible Net",
					Caption: "A11y first"
				},
				{
					Href: "https://owlsroost.xyz/webring/index.html",
					Src: "https://groundedwren.com/Img/Buttons/focusfirst-button.png",
					Alt: "A light brown 88x31 button with the words 'focus first'",
					Title: "Focus first",
					Caption: "Anti-distraction"
				},
				{
					Href: "./Img/Buttons/gw-button.png",
					Src: "https://groundedwren.com/Img/Buttons/gw-button.png",
					Alt: "Grounded Wren 88x31 Button; white text on a swirling purple, red, and black background",
					Title: "Grounded Wren",
					Caption: "Created by Vera"
				},
				{
					Href: "https://kalechips.net/responsive/index",
					Src: "https://groundedwren.com/Img/Buttons/responsiveweb-button.png",
					Alt: "A dark 88x31 button with white text: 'responsive web directory'",
					Title: "Responsive Web",
					Caption: "Mobile visitors welcome"
				},
				{
					Href: "https://bisexualism.emeowly.gay/",
					Src: "https://groundedwren.com/Img/Buttons/bisexualism-button.png",
					Alt: "A dark 88x31 button dripping with magenta and blue that reads 'bisexualism'",
					Title: "Bisexualism",
					Caption: "Proudly queer"
				},
			];

			InstanceId; // Identifier for this instance of the element
			IsInitialized; // Whether the element has rendered its content

			/** Creates an instance */
			constructor() {
				super();
				if(!this.getId) {
					// We're not initialized correctly. Attempting to fix:
					Object.setPrototypeOf(this, customElements.get(ButtonsList.Name).prototype);
				}
				this.InstanceId = ButtonsList.InstanceCount++;
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
				return `${ButtonsList.Name}-${this.InstanceId}-${key}`;
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
				delete ButtonsList.InstanceMap[this.InstanceId];
			}

			/** Performs setup when the element has been sited */
			onAttached() {
				if(!this.Root.querySelector(`style.${ButtonsList.Name}`)) {
					this.Head.insertAdjacentHTML(
						"beforeend",
						`<style class=${ButtonsList.Name}>${ButtonsList.Style}</style>`
					);
				}

				ButtonsList.InstanceMap[this.InstanceId] = this;
				if(!this.IsInitialized) {
					if(document.readyState === "loading") {
						document.addEventListener("DOMContentLoaded", () => {
							if(!this.IsInitialized) {
								this.renderContent();
							}
						});
					}
					else {
						this.renderContent();
					}
				}
			}

			/** Invoked when the element is ready to render */
			renderContent() {
				this.innerHTML = `
					<ul>
						${ButtonsList.Buttons.map(btnObj => 
							`<li>
								<figure>
									${btnObj.Href ? `<a href="${btnObj.Href}" target="_blank">` : ""}
										<img src="${btnObj.Src}" alt="${btnObj.Alt}" title="${btnObj.Title}">
									${btnObj.Href ? `</a>` : ""}
									<figcaption>
										${btnObj.Caption}
									</figcaption>
								</figure>
							</li>`
						).join("\n")}
					</ul>
				`;
				this.IsInitialized = true;
			}
		}
		if(!customElements.get(ns.ButtonsListEl.Name)) {
			customElements.define(ns.ButtonsListEl.Name, ns.ButtonsListEl);
		}
	}) (ns.Controls = ns.Controls || {});
}) (GW.Common = GW.Common || {}); 

GW.Controls = GW.Controls || {};
GW.Controls.Search = GW.Controls.Search || {};
GW.Controls.Search.Data = GW.Controls.Search.Data || {};
GW.Controls.Search.Data.Site = {
	"Home": {
		URL: "https://groundedwren.com/index.html",
		Category: "GW",
		Terms: ["HOME", "INDEX"],
	},
	"About": {
		URL: "https://groundedwren.com/Pages/About.html",
		Category: "GW",
		Terms: ["ABOUT", "VERA", "KONIGIN"],
	},
	"Guestbook": {
		URL: "https://groundedwren.com/Pages/Guestbook.html",
		Category: "GW",
		Terms: ["GUESTBOOK", "SIGN", "VISITOR", "COMMENT"],
	},
	"Games": {
		URL: "https://groundedwren.com/Pages/Games.html",
		Category: "GW",
		Terms: ["GAMES", "GAME", "JAVASCRIPT", "SUDOKU", "CHESS", "MINESWEEPER"],
	},
	"Music": {
		URL: "https://groundedwren.com/Pages/Music.html",
		Category: "GW",
		Terms: ["MUSIC", "GUITAR", "SINGING", "SONG", "BAND", "SOUND"],
	},
	"Writing": {
		URL: "https://groundedwren.com/Pages/Writing.html",
		Category: "GW",
		Terms: ["BLOG", "POETRY", "FICTION", "FANFIC", "WRITING", "ARTICLE"],
	},
	"LYRICS": {
		URL: "https://groundedwren.neocities.org/",
		Category: "External",
		Terms: ["LYRICS", "SONG", "SONGS", "WORD", "ANALYSIS", "PARSER", "STEMMER"],
	},
	"Legacy": {
		URL: "https://legacy.groundedwren.com/",
		Category: "External",
		Terms: ["LEGACY", "OLD", "GROUNDED", "WREN", "COM", "SITE"],
	},
}