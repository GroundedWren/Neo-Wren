/**
 * @file
 * @author Vera Konigin vera@groundedwren.com
 */
 
window.GW = window.GW || {};
(function Controls(ns) {
	ns.SiteMapEl = class SiteMapEl extends HTMLElement {
		static InstanceCount = 0; // Global count of instances created
		static InstanceMap = {}; // Dynamic map of IDs to instances of the element currently attached

		// Element name
		static Name = "gw-sitemap";

		// Attributes whose changes we respond to
		static observedAttributes = [];

		// Element CSSStyleSheet
		static #CommonStyleSheet = new CSSStyleSheet();
		static #CommonStyleAttribute = `data-${SiteMapEl.Name}-style`;
		static {
			SiteMapEl.#CommonStyleSheet.replaceSync(`${SiteMapEl.Name} {
			}`);
		}

		InstanceId; // Identifier for this instance of the element
		IsInitialized; // Whether the element has rendered its content

		#StyleSheet; // CSSStyleSheet for this instance
		#StyleAttribute; // Identifying attribute for this instance's CSSStyleSheet

		pageTree;
		pageMap;
		charIndex;

		/** Creates an instance */
		constructor() {
			super();
			if(!this.getId) {
				// We're not initialized correctly. Attempting to fix:
				Object.setPrototypeOf(this, customElements.get(SiteMapEl.Name).prototype);
			}
			this.InstanceId = SiteMapEl.InstanceCount++;

			this.#StyleSheet = new CSSStyleSheet();
			this.#StyleAttribute = `data-${this.getId("style")}`;
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

		get SiteData() {
			let dataObj = window;
			this.getAttribute("dataPath").split(".").forEach(step => dataObj = dataObj[step] ?? {});
			return dataObj;
		}

		/**
		 * Generates a globally unique ID for a key unique to the custom element instance
		 * @param {String} key Unique key within the custom element
		 * @returns A globally unique ID
		 */
		getId(key) {
			return `${SiteMapEl.Name}-${this.InstanceId}-${key}`;
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
			delete SiteMapEl.InstanceMap[this.InstanceId];
		}
		/** Handler invoked when any of the observed attributes are changed */
		attributeChangedCallback(name, oldValue, newValue) {
			
		}

		/** Performs setup when the element has been sited */
		onAttached() {
			if(!this.Head.hasAttribute(SiteMapEl.#CommonStyleAttribute)) {
				this.Head.setAttribute(SiteMapEl.#CommonStyleAttribute, "");
				this.Root.adoptedStyleSheets.push(SiteMapEl.#CommonStyleSheet);
			}
			if(!this.Head.hasAttribute(this.#StyleAttribute)) {
				this.Head.setAttribute(this.#StyleAttribute, "");
				this.Root.adoptedStyleSheets?.push(this.#StyleSheet);
			}
			this.setAttribute("data-instance", this.InstanceId);

			SiteMapEl.InstanceMap[this.InstanceId] = this;
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

			this.pageTree = new Map();

			const typeAheadIdSet = new Set();
			this.charIndex = new Map();

			let idIdx = 0;
			for(const [pageName, pageData] of Object.entries(this.SiteData).sort().reverse()) {
				const categoryTree = pageData.Category.split(" / ");
				let curTreeNode = this.pageTree;
				[...categoryTree, pageName].forEach((nodeName, nodeIdx, nodeAry) => {
					const newTreeNode = curTreeNode.get(nodeName) ?? new Map();
					curTreeNode.set(nodeName, newTreeNode);
					curTreeNode = newTreeNode;

					const nodeInfo = curTreeNode.get(null) ?? Object.create(null);
					nodeInfo.Id = nodeInfo.Id ?? this.getId(idIdx);
					if(nodeIdx === nodeAry.length - 1) {
						nodeInfo.Name = pageName;
						nodeInfo.URL = pageData.URL;
						nodeInfo.Id = this.getId(idIdx);
					}
					
					curTreeNode.set(null, nodeInfo);
					if(!typeAheadIdSet.has(nodeInfo.Id)) {
						this.#addToTypeAheadIndex(nodeName, nodeInfo.Id);
						typeAheadIdSet.add(nodeInfo.Id);
					}

					idIdx++;
				});
			}

			this.innerHTML = ``;

			this.IsInitialized = true;
		}

		#addToTypeAheadIndex(name, id) {
			let curCharNode = this.charIndex;
			for(const char of name.toLowerCase()) {
				let newCharNode = curCharNode.get(char) ?? new Map();
				let newCharNodeList = newCharNode.get(null) ?? [];

				newCharNodeList.unshift(id);

				newCharNode.set(null, newCharNodeList);
				curCharNode.set(char, newCharNode);
				curCharNode = newCharNode;
			}
		}
	}
	if(!customElements.get(ns.SiteMapEl.Name)) {
		customElements.define(ns.SiteMapEl.Name, ns.SiteMapEl);
	}
}) (window.GW.Controls = window.GW.Controls || {});
GW?.Controls?.Veil?.clearDefer("GW.Controls.SiteMapEl");