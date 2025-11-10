window.GW = window.GW || {};
GW.Pages = GW.Pages || {};
(function Music(ns) {
	const COLLECTION_PARAM = "Collection";
	const TRACK_PARAM = "Track";

	document.addEventListener("DOMContentLoaded", async () => {
		ns.PlayCbx = document.getElementById("cbxPlay");
		ns.PlayCbx.addEventListener("switch", onPlayChange);

		ns.TrackAudio = document.getElementById("audTrack");
		ns.TrackAudio.addEventListener("pause", onTrackPaused);
		ns.TrackAudio.addEventListener("play", onTrackPlayed);

		document.getElementById("divCollections").innerHTML = `
			<gw-radiomenu id="mnuCollections"
				class="bubble"
				aria-label="Collections"
				onkeydown="GW.Pages.Music.onColMnuKeydown(event)"
				noUnselect
			>${ns.Data.OrderedCollections.map(collectionName => `
				<button data-collection="${collectionName}"><div class="text">${collectionName}</div></button>
			`).join("\n")}</gw-radiomenu>
		`;

		const mnuCollections = document.getElementById("mnuCollections");
		mnuCollections.addEventListener("change", onCollectionChanged);

		await mnuCollections.InitPromise;

		const params = new URLSearchParams(window.location.search);
		getCollectionButton(params.get(COLLECTION_PARAM))?.click();
		getTrackButton(params.get(TRACK_PARAM))?.click();

		if(!mnuCollections.querySelector(`[role="menuitemradio"][aria-checked="true"]`)) {
			mnuCollections.querySelector(`[role="menuitemradio"]`)?.click();
		}
	});

	const onCollectionChanged = (event) => {
		closeColMnu();

		const collectionName = event.detail.Selection.getAttribute("data-collection");
		const collectionObj = ns.Data.Collections[collectionName];

		const imgLoader = document.getElementById("colImgLoader");
		imgLoader.querySelectorAll(`img`).forEach(imgEl => imgEl.remove());
		imgLoader.insertAdjacentHTML("beforeend", `
			<img src=${collectionObj.ImgUrl} alt=${collectionObj.ImgAlt}>
		`);

		document.getElementById("fgcCollection").innerText = collectionName;

		document.getElementById("ulColDets").innerHTML = `
			<li><label>Date</label><span>${collectionObj.DateStr}</span></li>
			<li><label>Artists</label><span>${collectionObj.Artists.join(", ")}</span></li>
			<li><label>Description</label><span>${collectionObj.Description}</span></li>
		`;

		document.getElementById("divTracklist").innerHTML = `
			<gw-radiomenu id="mnuTracks"
				aria-label="Tracks"
			>${collectionObj.OrderedTracks.map(trackName => `
				<button data-track="${trackName}"><div class="text">${trackName}</div></button>
			`).join("\n")}
			</gw-radiomenu>
		`;
		document.getElementById("mnuTracks").addEventListener("change", onTrackChanged);

		updateLocation();
	};

	const onTrackChanged = (event) => {
		const trackName = event.detail.Selection.getAttribute("data-track");
		const trackObj = ns.Data.Collections[getCurCollectionName()].Tracks[trackName];

		ns.TrackAudio.pause();
		ns.TrackAudio.setAttribute("src", trackObj.AudioURL);
		ns.TrackAudio.currentTime = 0;

		document.getElementById("ulTrkDets").innerHTML = `
			<li><label>Performers</label><span>${trackObj.Performers.join(", ")}</span></li>
			<li><label>Composers</label><span>${trackObj.Composers.join(", ")}</span></li>
			<li><label>Instruments</label><span>${trackObj.Instruments.join(", ")}</span></li>
			<li><label>Recorded</label><span>${trackObj.Recorded
				? trackObj.Recorded.toLocaleString(undefined, { dateStyle: "medium", })
				: trackObj.RecordedString}</span></li>
			<li><label>Description</label><span>${trackObj.Description}</span></li>
		`;

		document.getElementById("bqtLyrics").innerHTML = `${trackObj.Lyrics.map(verse => `
			<div role="group" aria-label="Verse">${verse.map(line => `
				<div role="group" aria-label="Line">${line}</div>
			`).join("\n")}</div>
		`).join("\n")}`;

		if(ns.PlayCbx.checked) {
			ns.TrackAudio.play();
		}

		updateLocation();
	};

	function updateLocation() {
		const curTrack = getCurTrackName();
		const curQueryString = `?${COLLECTION_PARAM}=${getCurCollectionName()}${curTrack
			? `&${TRACK_PARAM}=${curTrack}`
			: ""
		}`;

		window.history.replaceState(curQueryString, "", curQueryString);
	}

	ns.onColMnuBtnClick = (event) => {
		if(event.currentTarget.getAttribute("aria-expanded") === "false") {
			event.currentTarget.setAttribute("aria-expanded", "true");
			document.getElementById(
				event.currentTarget.getAttribute("aria-controls")
			).querySelector(`[role*="menuitem"]`).focus();
		}
		else {
			closeColMnu();
		}
	};

	ns.onColMnuKeydown = (event) => {
		switch(event.key) {
			case "Escape":
				closeColMnu();
				break;
		}
	}

	function closeColMnu() {
		const mnuBtn = document.getElementById("colMnuBtn");
		const mnuHadFocus = document.getElementById("mnuCollections").matches(`:focus-within`);
		mnuBtn.setAttribute("aria-expanded", "false");
		if(mnuHadFocus) {
			setTimeout(() => mnuBtn.focus(), 0);
		}
	}

	const onPlayChange = () => {
		if(ns.PlayCbx.checked) {
			const mnuTracks = document.getElementById("mnuTracks");
			if(!mnuTracks.querySelector(`[role="menuitemradio"][aria-checked="true"]`)) {
				mnuTracks.querySelector(`[role="menuitemradio"]`)?.click();
			}
			else {
				ns.TrackAudio.play();
			}
		}
		else {
			ns.TrackAudio.pause();
		}
	};

	const onTrackPaused = () => {
		if(ns.TrackAudio.currentTime === ns.TrackAudio.duration) {
			const trackList = ns.Data.Collections[getCurCollectionName()].OrderedTracks;
			const curTrackIndex = trackList.indexOf(getCurTrackName());
			if(curTrackIndex < trackList.length - 1) {
				getTrackButton(trackList[curTrackIndex + 1])?.click();
				return;
			}
			ns.TrackAudio.currentTime = 0;
		}

		ns.PlayCbx.checked = false;
	};

	const onTrackPlayed = () => {
		ns.PlayCbx.checked = true;
	};

	ns.onPrevClicked = () => {
		if(ns.TrackAudio.currentTime > 2) {
			ns.TrackAudio.currentTime = 0;
			return;
		}
		const trackList = ns.Data.Collections[getCurCollectionName()].OrderedTracks;
		const curTrackIndex = trackList.indexOf(getCurTrackName());
		if(curTrackIndex > 0) {
			getTrackButton(trackList[curTrackIndex - 1])?.click();
		}
		else {
			ns.TrackAudio.currentTime = 0;
		}
	};

	ns.onNextClicked = () => {
		const trackList = ns.Data.Collections[getCurCollectionName()].OrderedTracks;
		const curTrackIndex = trackList.indexOf(getCurTrackName());
		if(curTrackIndex < trackList.length - 1) {
			getTrackButton(trackList[curTrackIndex + 1])?.click();
		}
	};

	function getCurCollectionName() {
		return document.getElementById("mnuCollections").querySelector(
			`[aria-checked="true"]`
		).getAttribute("data-collection");
	}

	function getCurTrackName() {
		return document.getElementById("mnuTracks").querySelector(
			`[aria-checked="true"]`
		)?.getAttribute("data-track");
	}

	function getTrackButton(trackName) {
		return document.getElementById("divTracklist").querySelector(`[data-track="${trackName}"`);
	}

	function getCollectionButton(collectionName) {
		return document.getElementById("mnuCollections")?.querySelector(`[data-collection="${collectionName}"]`);
	}
}) (GW.Pages.Music = GW.Pages.Music || {}); 