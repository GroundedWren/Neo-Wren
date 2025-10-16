window.GW = window.GW || {};
GW.Pages = GW.Pages || {};
(function Timer(ns) {
	const ColorStylesheet = new CSSStyleSheet();

	ns.onTimeInput = () => {
		const totalSecs = getTotalSeconds();
		if(!isNaN(totalSecs)) {
			localStorage.setItem("minutes", parseInt(ns.MinutesInput.value));
			localStorage.setItem("seconds", parseInt(ns.SecondsInput.value));
			ns.Ring.setAttribute("denominator", totalSecs);
		}
	};

	function getTotalSeconds() {
		const mins = parseInt(ns.MinutesInput.value);
		const secs = parseInt(ns.SecondsInput.value);
		return mins * 60 + secs;
	}

	function getW1Seconds() {
		if(ns.W1MinutesInput.value === "" && ns.W1SecondsInput.value === "") {
			return null;
		}

		const mins = parseInt(ns.W1MinutesInput.value || 0);
		const secs = parseInt(ns.W1SecondsInput.value || 0);
		return mins * 60 + secs;
	}

	function getW2Seconds() {
		if(ns.W2MinutesInput.value === "" && ns.W2SecondsInput.value === "") {
			return null;
		}
		
		const mins = parseInt(ns.W2MinutesInput.value || 0);
		const secs = parseInt(ns.W2SecondsInput.value || 0);
		return mins * 60 + secs;
	}

	ns.onSoundInput = () => {
		ns.Alarm.setAttribute(
			"src",
			document.querySelector(`select[name="sound"]`).value
		);
		ns.Alarm.currentTime = 0;
		localStorage.setItem("sound", ns.SoundSelect.value);
	};

	ns.updateThresholds = () => {
		ColorStylesheet.replaceSync(`
			gw-progress-ring {
				--progress-color: ${ns.ColorInput.value};
				--dot-color: ${ns.ColorInput.value};

				&.w1 {
					--progress-color: ${ns.W1ColorInput.value};
					--dot-color: ${ns.W1ColorInput.value};
				}

				&.w2 {
					--progress-color: ${ns.W2ColorInput.value};
					--dot-color: ${ns.W2ColorInput.value};
				}
			}
		`);

		localStorage.setItem("color", ns.ColorInput.value);
		localStorage.setItem("w1color", ns.W1ColorInput.value);
		localStorage.setItem("w2color", ns.W2ColorInput.value);

		localStorage.setItem("w1minutes", ns.W1MinutesInput.value);
		localStorage.setItem("w1seconds", ns.W1SecondsInput.value);

		localStorage.setItem("w2minutes", ns.W2MinutesInput.value);
		localStorage.setItem("w2seconds", ns.W2SecondsInput.value);

		checkThresholds();
	};

	const onRunChange = () => {
		if(ns.RunCbx.checked) {
			onTick();
			ns.RunInterval = setInterval(onTick, 1000);
			if(isNaN(getLocalStorageStartTime())) {
				localStorage.setItem("start", new Date());
			}
		}
		else {
			ns.AlarmCbx.checked = false;
			clearInterval(ns.RunInterval);
			localStorage.removeItem("start");
			localStorage.setItem("ticks", ns.Ticks);
		}
	};

	const onAlarmSwitch = () => {
		if(ns.AlarmCbx.checked) {
			ns.Alarm.currentTime = 0;
			ns.Alarm.play();
		}
		else {
			ns.Alarm.pause();
		}
	};

	const onMaximizeChange = () => {
		if(ns.MaximizeCbx.checked) {
			document.documentElement.requestFullscreen();
		}
		else {
			document.exitFullscreen();
		}
	};

	const onDCL = () => {
		document.adoptedStyleSheets.push(ColorStylesheet);

		ns.Ring = ns.Ring = document.querySelector(`gw-progress-ring`);
		ns.Ring.DisplayTextCallback = getRingText;
		ns.Ring.querySelector(`.dot`).setAttribute("r", "5");

		ns.MinutesInput = document.querySelector(`input[name="minutes"]`);
		ns.SecondsInput = document.querySelector(`input[name="seconds"]`);
		ns.ColorInput = document.querySelector(`input[name="color"]`);
		ns.SoundSelect = document.querySelector(`select[name="sound"]`);
		ns.Alarm = document.getElementById("audAlarm");
		ns.Beep = document.getElementById("audBeep");

		ns.W1MinutesInput = document.querySelector(`input[name="w1mins"]`);
		ns.W1SecondsInput = document.querySelector(`input[name="w1secs"]`);
		ns.W1ColorInput = document.querySelector(`input[name="w1color"]`);

		ns.W2MinutesInput = document.querySelector(`input[name="w2mins"]`);
		ns.W2SecondsInput = document.querySelector(`input[name="w2secs"]`);
		ns.W2ColorInput = document.querySelector(`input[name="w2color"]`);

		ns.RunCbx = document.getElementById("cbxRun");
		ns.RunCbx.addEventListener("switch", onRunChange);

		ns.AlarmCbx = document.getElementById("cbxAlarm");
		ns.AlarmCbx.addEventListener("switch", onAlarmSwitch);

		ns.MaximizeCbx = document.getElementById("cbxMaximize");
		ns.MaximizeCbx.addEventListener("switch", onMaximizeChange);

		loadFromStorage();
		ns.onTimeInput();
		ns.onSoundInput();
		ns.updateThresholds();
	};
	window.addEventListener("DOMContentLoaded", onDCL);

	function loadFromStorage() {
		ns.MinutesInput.value = localStorage.getItem("minutes") || 10;
		ns.SecondsInput.value = localStorage.getItem("seconds") || 0;
		ns.ColorInput.value = localStorage.getItem("color") || "#008000";
		ns.SoundSelect.value = localStorage.getItem("sound") || "../../Audio/Timer/Alarm_Clock.mp3";

		ns.W1MinutesInput.value = localStorage.getItem("w1minutes");
		ns.W1SecondsInput.value = localStorage.getItem("w1seconds");
		ns.W1ColorInput.value = localStorage.getItem("w1color") || "#dbb706";

		ns.W2MinutesInput.value = localStorage.getItem("w2minutes");
		ns.W2SecondsInput.value = localStorage.getItem("w2seconds");
		ns.W2ColorInput.value = localStorage.getItem("w2color") || "#f60404";

		const startTime = getLocalStorageStartTime();
		const ticks = parseInt(localStorage.getItem("ticks"));
		if(!isNaN(startTime)) {
			ns.Ticks = Math.floor((new Date() - startTime) / 1000) + (ticks || 0);
			ns.RunCbx.checked = true;
		}
		else if(!isNaN(ticks)) {
			ns.Ticks = ticks;
			ns.Ring.setAttribute("numerator", ns.Ticks);
		}
	}

	function getLocalStorageStartTime() {
		return localStorage.getItem("start") ? new Date(localStorage.getItem("start")) : NaN;
	}
	
	ns.Ticks = 0;
	const onTick = () => {
		const lsStart = getLocalStorageStartTime();
		if(!isNaN(lsStart)) {
			const secSinceStart = parseInt((new Date() - lsStart) / 1000);
			const ticksAtStart = parseInt(localStorage.getItem("ticks")) || 0;;
			const ticksSinceStart = ns.Ticks - ticksAtStart;
			if(Math.abs(secSinceStart - ticksSinceStart) >= 2) {
				//Ticks are out of sync with real time difference - adjust to match real time.
				ns.Ticks = secSinceStart + ticksAtStart - 1;
			}
		}

		ns.Ring.setAttribute("numerator", ++ns.Ticks);
		if(ns.Ticks === getTotalSeconds() + 1) {
			ns.AlarmCbx.checked = true;
		}
		checkThresholds();
	};

	function checkThresholds() {
		const ticksRemaining = getTotalSeconds() - ns.Ticks;

		const w1Secs = getW1Seconds();
		if(w1Secs === null) {
			ns.Ring.classList.remove("w1");
		}
		else if(ticksRemaining <= w1Secs) {
			if(!ns.Ring.classList.contains("w1")) {
				ns.Beep.currentTime = 0;
				ns.Beep.play();
				ns.Ring.classList.add("w1");
			}
		}
		else {
			ns.Ring.classList.remove("w1");
		}

		const w2Secs = getW2Seconds();
		if(w2Secs === null) {
			ns.Ring.classList.remove("w2");
		}
		else if(ticksRemaining <= w2Secs) {
			if(!ns.Ring.classList.contains("w2")) {
				ns.Beep.currentTime = 0;
				ns.Beep.play();
				ns.Ring.classList.add("w2");
			}
		}
		else {
			ns.Ring.classList.remove("w2");
		}
	}

	ns.onReset = () => {
		ns.Ticks = 0;
		ns.Ring.setAttribute("numerator", 0);
		ns.AlarmCbx.checked = false;

		if(ns.RunCbx.checked) {
			localStorage.setItem("start", new Date());
			localStorage.removeItem("ticks");
		}
		else {
			localStorage.removeItem("start");
			localStorage.setItem("ticks", ns.Ticks);
		}
	};

	const getRingText = (attrs) => {
		const totalSecs = attrs.FloatDenominator - attrs.FloatNumerator;

		const secs = totalSecs % 60;
		const mins = (totalSecs - secs) / 60;

		const displayMins = Math.abs(mins) > 0 ? `${Math.abs(mins)}` : "";
		const displaySecs = (Math.abs(secs) < 10 && displayMins.length) ? `0${Math.abs(secs)}` : Math.abs(secs);

		return `${totalSecs < 0 ? "-" : ""}${displayMins ? `${displayMins}:` : ""}${displaySecs}`
	};
}) (GW.Pages.Timer = GW.Pages.Timer || {}); 