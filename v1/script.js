///////////// Variables to select DOM elements //////////////
const mainTable = document.querySelector("#main-table");
const criteriaTable = document.querySelector("#criteria-table");
const submitBtn = document.querySelector("#submit-btn");

/////// Variable that holds sent criteria data ////////////
let criteriaData = {};

//////////// button listener to request forecast ///////////
const reqFcst = document.querySelector("#request-fcst");
reqFcst.addEventListener("click", function() {
	clearTables();
	buildMatrix();
	buildFinalCriteria();
	colorShit(); // lets try this
	addSubmitBtn();
});

/////////////// Function to clear tables out ///////////////
const clearTables = () => {
	mainTable.innerHTML = "";
	criteriaTable.innerHTML = "";
	submitBtn.innerHTML = "";
};

///////////// Function to build main table header //////////////
const buildTableHeader = (data) => {
	const thead = mainTable.createTHead();
	const tr = thead.insertRow();
	const blankTh = document.createElement("th");
	tr.appendChild(blankTh);
	for (let i = 0; i < data.validPeriod.date.length; i++) {
		const th = document.createElement("th");
		th.innerHTML = `${data.validPeriod.day[i]}<br>${data.validPeriod.date[i]}`;
		th.classList.add("center");
		tr.appendChild(th);
	}
};

///////////// Function to build main table body content ////////////
const buildTableBody = (data) => {
	for (let i = 0; i < data.forecast.length; i++) {
		const tr = mainTable.insertRow(-1);
		const th = document.createElement("th");
		th.innerHTML = data.forecast[i].fullName;
		tr.appendChild(th);
		for (let j = 0; j < data.validPeriod.day.length; j++) {
			const newCell = tr.insertCell(j + 1);
			const newInput = document.createElement("input");
			newCell.classList.add("tableDataCell", data.forecast[i].variable);
			newInput.setAttribute("name", data.forecast[i].variable + "[]");
			newInput.setAttribute("type", "input");
			// newInput.setAttribute("value", "");
			const newValue = data.forecast[i].values[j];
			const newVariable = data.forecast[i].variable[j];
			newInput.value = newValue;
			//newCell.classList.add(checkCriteria(newValue, newVariable));
			newCell.appendChild(newInput);
		}
	}
};

/////////// Function to build dropdown section of table ///////////////
const buildTableDropdown = (data) => {
	for (let i = 0; i < data.dropdown.length; i++) {
		const tr = mainTable.insertRow(-1);
		const th = document.createElement("th");
		th.innerHTML = data.dropdown[i].fullName;
		tr.appendChild(th);
		for (let j = 0; j < data.validPeriod.day.length; j++) {
			const newCell = tr.insertCell(j + 1);
			const newSelect = document.createElement("select");
			newCell.classList.add("tableDataCell");
			newSelect.setAttribute("name", data.dropdown[i].variable + "[]");
			newCell.appendChild(newSelect);
			for (let k = 0; k < data.dropdown[i].options.length; k++) {
				const newOption = document.createElement("option");
				newOption.setAttribute("value", data.dropdown[i].options[k].value);
				newOption.innerHTML = data.dropdown[i].options[k].text;
				newSelect.appendChild(newOption);
			}
		}
	}
};

//////////////////// Build Full Matrix //////////////////
const buildMatrix = () => {
	axios
		.get("testData.json")
		.then((res) => {
			const data = res.data;
			buildTableBody(data);
			buildTableDropdown(data);
			buildTableHeader(data);
		})
		.catch((err) => {
			console.log(err);
		});
};

/////////////// Build Full Criteria Table //////////////////
const buildFinalCriteria = () => {
	axios
		.get("criteria.json")
		.then((res) => {
			criteriaData = res.data;
			getCriteriaBody(criteriaData);
			getCriteriaHeader(criteriaData);
		})
		.catch((err) => {
			console.log(err);
		});
};

///// function to load individual field data into criteria table /////
const getCriteriaBody = (data) => {
	for (let i = 0; i < data.body.length; i++) {
		const tr = criteriaTable.insertRow();
		for (let j = 0; j < data.body[i].textArray.length; j++) {
			const newCell = tr.insertCell();
			newCell.innerHTML = data.body[i].textArray[j];
			newCell.classList.add(data.body[i].colorsClass[j]);
		}
	}
};

/////////// Function to create Criteria Table Header ///////////
const getCriteriaHeader = (data) => {
	const thead = criteriaTable.createTHead();
	const tr = thead.insertRow();
	for (let i = 0; i < data.header.length; i++) {
		const th = document.createElement("th");
		th.innerHTML = data.header[i].text;
		th.classList.add("center");
		tr.appendChild(th);
	}
};

////// Function that adds Submit Button After Requesting Fcts //////////
const addSubmitBtn = () => {
	const newBtn = document.createElement("button");
	newBtn.classList.add("btn", "btn-lg", "btn-primary", "my-4");
	newBtn.innerHTML = "Submit Forecast";
	submitBtn.appendChild(newBtn);
};

////// This works but need to find way to wait for full table to be built ///////////////
const colorShit = () => {
	const inputListener = document.querySelectorAll("input");
	for (const input of inputListener) {
		input.addEventListener("input", function(e) {
			const changedValue = e.target.value;
			console.log("it changed to " + changedValue);
			//checkCriteria(changedValue, )
		});
	}
};

// const checkCriteria = (value, variable, criteria) => {
// 	if (value > criteria[variable].yellow) {
// 		console.log("red");
// 	} else if (value > criteria[variable].green) {
// 		console.log("yellow");
// 	} else {
// 		console.log("green");
// 	}
// };

/////// axios parallel get requests that doesn't proceed until all arguments are resolved //////
// axios.all([axios.get("testData.json"), axios.get("criteria.json")]).then(
// 	axios.spread((data1, data2) => {
// 		console.log(data1.data);
// 		console.log(data2.data);
// 	})
// );
