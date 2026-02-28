const checkInForm = document.getElementById("checkInForm");
const attendeeNameInput = document.getElementById("attendeeName");
const teamSelect = document.getElementById("teamSelect");
const greeting = document.getElementById("greeting");
const attendeeCountEl = document.getElementById("attendeeCount");
const progressBar = document.getElementById("progressBar");
const waterCountEl = document.getElementById("waterCount");
const zeroCountEl = document.getElementById("zeroCount");
const powerCountEl = document.getElementById("powerCount");

const attendanceGoal = 50;
const STORAGE_TOTAL_KEY = "totalAttendees";
const STORAGE_TEAM_COUNTS_KEY = "teamCounts";
const STORAGE_ATTENDEE_LIST_KEY = "attendeeList";

let totalAttendees = 0;
let teamCounts = {
	water: 0,
	zero: 0,
	power: 0,
};

let attendeeList = [];

const teamLabels = {
	water: "Team Water Wise",
	zero: "Team Net Zero",
	power: "Team Renewables",
};

function saveAttendanceData() {
	localStorage.setItem(STORAGE_TOTAL_KEY, String(totalAttendees));
	localStorage.setItem(STORAGE_TEAM_COUNTS_KEY, JSON.stringify(teamCounts));
	localStorage.setItem(STORAGE_ATTENDEE_LIST_KEY, JSON.stringify(attendeeList));
}

function loadAttendanceData() {
	const savedTotal = localStorage.getItem(STORAGE_TOTAL_KEY);
	const savedTeamCounts = localStorage.getItem(STORAGE_TEAM_COUNTS_KEY);
	const savedAttendeeList = localStorage.getItem(STORAGE_ATTENDEE_LIST_KEY);

	if (savedTotal !== null) {
		totalAttendees = Number(savedTotal);
	}

	if (savedTeamCounts) {
		const parsedTeamCounts = JSON.parse(savedTeamCounts);

		if (
			typeof parsedTeamCounts.water === "number" &&
			typeof parsedTeamCounts.zero === "number" &&
			typeof parsedTeamCounts.power === "number"
		) {
			teamCounts = parsedTeamCounts;
		}
	}

	if (savedAttendeeList) {
		const parsedAttendeeList = JSON.parse(savedAttendeeList);

		if (Array.isArray(parsedAttendeeList)) {
			attendeeList = parsedAttendeeList;
		}
	}
}

function getWinningTeamName() {
	let winningKey = "water";

	if (teamCounts.zero > teamCounts[winningKey]) {
		winningKey = "zero";
	}

	if (teamCounts.power > teamCounts[winningKey]) {
		winningKey = "power";
	}

	return teamLabels[winningKey];
}

function updateAttendanceDisplay() {
	attendeeCountEl.textContent = String(totalAttendees);

	const progressPercent = Math.min((totalAttendees / attendanceGoal) * 100, 100);
	progressBar.style.width = `${progressPercent}%`;

	waterCountEl.textContent = String(teamCounts.water);
	zeroCountEl.textContent = String(teamCounts.zero);
	powerCountEl.textContent = String(teamCounts.power);
}

function ensureAttendeeListUI() {
	let attendeeSection = document.getElementById("attendeeListSection");

	if (!attendeeSection) {
		const teamStats = document.querySelector(".team-stats");

		attendeeSection = document.createElement("div");
		attendeeSection.id = "attendeeListSection";
		attendeeSection.style.marginTop = "20px";
		attendeeSection.style.textAlign = "left";

		const title = document.createElement("h3");
		title.textContent = "Checked-In Attendees";
		title.style.color = "#64748b";
		title.style.fontSize = "16px";
		title.style.marginBottom = "12px";

		const list = document.createElement("ul");
		list.id = "attendeeList";
		list.style.listStyle = "none";
		list.style.padding = "0";
		list.style.margin = "0";
		list.style.display = "grid";
		list.style.gap = "8px";

		attendeeSection.appendChild(title);
		attendeeSection.appendChild(list);
		if (teamStats) {
			teamStats.appendChild(attendeeSection);
		}
	}
}

function renderAttendeeList() {
	ensureAttendeeListUI();

	const list = document.getElementById("attendeeList");

	if (!list) {
		return;
	}

	list.innerHTML = "";

	for (let index = attendeeList.length - 1; index >= 0; index -= 1) {
		const attendee = attendeeList[index];
		const item = document.createElement("li");

		item.style.background = "#f8fafc";
		item.style.border = "1px solid #e2e8f0";
		item.style.borderRadius = "8px";
		item.style.padding = "8px 10px";
		item.style.color = "#334155";
		item.textContent = `${attendee.name} — ${teamLabels[attendee.team]}`;

		list.appendChild(item);
	}
}

function isValidCheckIn(name, team) {
	return Boolean(name && team);
}

function addAttendee(name, team) {
	totalAttendees += 1;
	teamCounts[team] += 1;

	attendeeList.push({
		name: name,
		team: team,
	});
}

function showGreeting(name, teamKey) {
	if (totalAttendees >= attendanceGoal) {
		const winner = getWinningTeamName();
		greeting.textContent = `🎉 Goal reached! Welcome, ${name} from ${teamLabels[teamKey]}. Current winning team: ${winner}.`;
	} else {
		greeting.textContent = `Welcome, ${name}! You are checked in with ${teamLabels[teamKey]}.`;
	}

	greeting.classList.add("success-message");
	greeting.style.display = "block";
}

function handleCheckIn(event) {
	event.preventDefault();

	const attendeeName = attendeeNameInput.value.trim();
	const selectedTeam = teamSelect.value;

	if (!isValidCheckIn(attendeeName, selectedTeam)) {
		return;
	}

	addAttendee(attendeeName, selectedTeam);

	updateAttendanceDisplay();
	renderAttendeeList();
	showGreeting(attendeeName, selectedTeam);
	saveAttendanceData();

	checkInForm.reset();
	attendeeNameInput.focus();
}

function initializeApp() {
	loadAttendanceData();
	updateAttendanceDisplay();
	renderAttendeeList();
	checkInForm.addEventListener("submit", handleCheckIn);
}

initializeApp();
