/**
 * @file Control for an art frame row in a grid gallery
 * @author Vera Konigin vera@groundedwren.com
 */
 
window.GW = window.GW || {};
(function Controls(ns) {
	ns.ArtFrameRowEl = class ArtFrameRowEl extends HTMLElement {
		static InstanceCount = 0; // Global count of instances created
		static InstanceMap = {}; // Dynamic map of IDs to instances of the element currently attached

		// Element name
		static Name = "gw-art-frame-row";

		// Attributes whose changes we respond to
		static observedAttributes = [];

		// Element CSSStyleSheet
		static #CommonStyleSheet = new CSSStyleSheet();
		static #CommonStyleAttribute = `data-${ArtFrameRowEl.Name}-style`;
		static {
			ArtFrameRowEl.#CommonStyleSheet.replaceSync(`${ArtFrameRowEl.Name} {
				position: relative;
				display: grid;
				align-items: center;
				justify-items: stretch;
				row-gap: 5px;
				grid-template-areas:
					"pc pc"
					"tl dt"
					"ar ar"
					"ch ch"
					"ds ds";
				grid-template-columns: 1fr auto;

				--border-radius: 6px;
				&:is(:hover, :focus-within) {
					--icon-opacity: 1;
				}
				@media(hover: none) {
					--icon-opacity: 1;
				}

				.title {
					grid-area: tl;
					font-weight: bold;
					font-size: 1.2em;
				}
				.picture {
					grid-area: pc;
					border-start-start-radius: var(--border-radius);
					border-start-end-radius: var(--border-radius);
					overflow: clip;
				}
				.expand, .link {
					grid-area: pc;
					z-index: 101;
					align-self: start;
					justify-self: start;
					&.link {
						justify-self: end;
					}
					opacity: var(--icon-opacity, 0);

					a {
						display: grid;
						min-width: 30px;
						min-height: 30px;
						margin: 5px;
					}
				}
				.timestamp {
					grid-area: dt;
					justify-self: end;
					font-size: 0.9em;
				}
				.artists {
					grid-area: ar;
					display: grid;
					grid-auto-flow: row;
					background-color: var(--background-alt-color);
					padding-inline: 5px;
				}
				.characters {
					grid-area: ch;
					display: grid;
					grid-auto-flow: row;
					background-color: var(--background-alt-color);
					padding-inline: 5px;
				}
				.description {
					grid-area: ds;
					background-color: var(--background-alt-color);
					padding-inline: 5px;
					border-end-start-radius: var(--border-radius);
					border-end-end-radius: var(--border-radius);
					overflow: clip;
				}

				label {
					cursor: unset;
					font-style: italic;
					font-size: 0.8em;
				}
			}`);
		}

		InstanceId; // Identifier for this instance of the element
		IsInitialized; // Whether the element has rendered its content

		#StyleSheet; // CSSStyleSheet for this instance
		#StyleAttribute; // Identifying attribute for this instance's CSSStyleSheet

		/** Creates an instance */
		constructor() {
			super();
			if(!this.getId) {
				// We're not initialized correctly. Attempting to fix:
				Object.setPrototypeOf(this, customElements.get(ArtFrameRowEl.Name).prototype);
			}
			this.InstanceId = ArtFrameRowEl.InstanceCount++;

			this.#StyleSheet = new CSSStyleSheet();
			this.#StyleAttribute = `data-${this.getId("style")}`;

			if(!GW.Controls?.ImageLoaderEl) {
				const imageLoaderScript = document.createElement("script");
				imageLoaderScript.type = "text/javascript";
				imageLoaderScript.src = "https://groundedwren.com/Scripts/Controls/ImageLoaderControl.js";
				document.head.appendChild(imageLoaderScript);
				GW.Controls?.Veil?.addDefer("GW.Controls.ImageLoaderEl");
			}
			if(!GW.Controls?.IconEl) {
				const imageLoaderScript = document.createElement("script");
				imageLoaderScript.type = "text/javascript";
				imageLoaderScript.src = "https://groundedwren.com/Scripts/Controls/SVGIconControl.js";
				document.head.appendChild(imageLoaderScript);
				GW.Controls?.Veil?.addDefer("GW.Controls.IconEl");
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
			return `${ArtFrameRowEl.Name}-${this.InstanceId}-${key}`;
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
			delete ArtFrameRowEl.InstanceMap[this.InstanceId];
		}
		/** Handler invoked when any of the observed attributes are changed */
		attributeChangedCallback(name, oldValue, newValue) {
			
		}

		/** Performs setup when the element has been sited */
		onAttached() {
			if(!this.Head.hasAttribute(ArtFrameRowEl.#CommonStyleAttribute)) {
				this.Head.setAttribute(ArtFrameRowEl.#CommonStyleAttribute, "");
				this.Root.adoptedStyleSheets.push(ArtFrameRowEl.#CommonStyleSheet);
			}
			if(!this.Head.hasAttribute(this.#StyleAttribute)) {
				this.Head.setAttribute(this.#StyleAttribute, "");
				this.Root.adoptedStyleSheets?.push(this.#StyleSheet);
			}
			this.setAttribute("data-instance", this.InstanceId);

			ArtFrameRowEl.InstanceMap[this.InstanceId] = this;
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

			this.setAttribute("role", "row");

			const artistNameList = this.dataset.artists.split(",").filter(item => item);
			const artistLinkList = this.dataset.artistlinks.split(",").filter(item => item);
			const charactersList = this.dataset.characters.split(",").filter(item => item);
			this.innerHTML = `
				<div role="rowheader" class="title">${this.dataset.title}</div>
				<div role="gridcell" class="picture" tabindex="-1">
					<gw-image-loader
						data-w="${this.dataset.w}"
						data-h="${this.dataset.h}"
						data-color="${this.dataset.color}"
					>
						<img src="${this.dataset.src}" alt="${this.dataset.alt}" loading="lazy">
					</gw-image-loader>
				</div>
				<div role="gridcell" class="expand" tabindex="-1">
					<a href="${this.dataset.src}" tabindex="-1">
						<gw-icon iconkey="expand" name="Open fullscreen"></gw-icon>
					</a>
				</div>
				<div role="gridcell" class="link" tabindex="-1">
					<a href="?piece=${encodeURI(this.dataset.title)}" tabindex="-1">
						<gw-icon iconkey="link" name="Permalink"></gw-icon>
					</a>
				</div>
				<div role="gridcell" class="timestamp" tabindex="-1">
					<time datetime="${this.dataset.date}">
						${new Date(this.dataset.date).toLocaleString(undefined, { dateStyle: "medium", })}
					</time>
				</div>
				<div role="gridcell" class="artists" tabindex="-1">
					<label>Art by</label>
					<span>${artistNameList.map((name, idx) => 
					`<a href="${artistLinkList[idx]}" tabindex="-1">${name}</a>`
					).join(", ")}</span>
				</div>
				<div role="gridcell" class="characters" tabindex="-1">
					<label>Featuring</label>
					<span>${charactersList.map(name => 
					`<a href="?character=${encodeURI(name)}" tabindex="-1">${name}</a>`
					).join(", ")}</span>
				</div>
				<div role="gridcell" class="description" tabindex="-1">${this.dataset.description}</div>
			`;

			this.IsInitialized = true;
		}
	}
	if(!customElements.get(ns.ArtFrameRowEl.Name)) {
		customElements.define(ns.ArtFrameRowEl.Name, ns.ArtFrameRowEl);
	}
}) (window.GW.Controls = window.GW.Controls || {});
GW?.Controls?.Veil?.clearDefer("GW.Controls.ArtFrameRowEl");