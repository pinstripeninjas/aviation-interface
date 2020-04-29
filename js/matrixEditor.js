// JSON links to be adjusted accordingly
const urlEditorData = "./json/editorData.json";
const urlEditorCriteria = "./json/editorCriteria.json";
const urlSubmittedForecast = "./";

///////////// Variables to select DOM elements //////////////
const mainTable = document.querySelector("#main-table");
const criteriaTable = document.querySelector("#criteria-table");
const submitBtn = document.querySelector("#submit-btn");
const spinner = document.querySelector("#spinner");

/////// Variable that holds sent criteria and matrix data ////////////
let criteriaData = {};
let matrixData = {};

//////////// button listener to request forecast ///////////
const reqFcst = document.querySelector("#request-fcst");
reqFcst.addEventListener("click", function () {
	clearTables();
	buildFullMatrix();
});

/////////////// Function to clear tables out ///////////////
const clearTables = () => {
	mainTable.innerHTML = "";
	criteriaTable.innerHTML = "";
	submitBtn.innerHTML = "";
};

//////////////// Build Matrix v2.0 /////////////////
const buildFullMatrix = () => {
	axios
		.all([
			axios({
				method: "get",
				url: urlEditorData,
				onDownloadProgress: function () {
					reqFcst.innerHTML = "<span class='spinner-border'></span> Loading...";
				},
			}),
			axios.get(urlEditorCriteria),
		])
		.then(
			axios.spread((forecast, criteria) => {
				// makes criteria
				criteriaData = criteria.data;
				matrixData = forecast.data;
				getCriteriaBody(criteria.data);
				getCriteriaHeader(criteria.data);
				// makes matrix
				buildTableBody(forecast.data);
				buildTableHeader(forecast.data);
				// add listeners that color matrices when changed
				colorListener();
				dropdownListener();
				// add button and remove "loading" text
				reqFcst.innerHTML = "Request New Forecast";
				addSubmitBtn();
			})
		)
		.catch((err) => {
			console.log(err);
		});
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
		if (data.forecast[i].dataType === "textbox") {
			buildTableTextbox(data, i, tr);
		} else if (data.forecast[i].dataType === "dropdown") {
			buildTableDropdown(data, i, tr);
		}
	}
};

///////////// Function to build textbox datatype ////////////////////
const buildTableTextbox = (data, i, tr) => {
	for (let j = 0; j < data.validPeriod.day.length; j++) {
		const newCell = tr.insertCell(j + 1);
		const newInput = document.createElement("input");
		newInput.setAttribute("name", data.forecast[i].variable);
		newInput.setAttribute("type", "input");
		newInput.setAttribute("data-fcst-period", j);
		const newValue = data.forecast[i].values[j];
		const newVariable = data.forecast[i].variable;
		// add in class to color cell based on criteria
		newCell.classList.add(checkCriteria(newValue, newVariable));
		newInput.value = newValue;
		newCell.appendChild(newInput);
	}
};

/////////// Function to build dropdown section of table ///////////////
const buildTableDropdown = (data, i, tr) => {
	for (let j = 0; j < data.validPeriod.day.length; j++) {
		const newCell = tr.insertCell(j + 1);
		const newSelect = document.createElement("select");
		newSelect.setAttribute("name", data.forecast[i].variable);
		newSelect.setAttribute("data-fcst-period", j);
		newCell.appendChild(newSelect);
		for (let k = 0; k < data.forecast[i].options.length; k++) {
			const newOption = document.createElement("option");
			newOption.setAttribute("value", data.forecast[i].options[k].value);
			newOption.innerHTML = data.forecast[i].options[k].text;
			newSelect.appendChild(newOption);
		}
	}
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
	newBtn.setAttribute("id", "submit-btn");
	newBtn.addEventListener("click", submitForecast);
	submitBtn.appendChild(newBtn);
};

////// Listener that updates color of input cells when data changes ///////////////
const colorListener = () => {
	const inputListener = document.querySelectorAll("input");
	for (let input of inputListener) {
		input.addEventListener("input", function (event) {
			const changedValue = event.target.value;
			const changedVariable = event.target.name;
			const changedFcstPeriod = event.target.dataset.fcstPeriod;
			// find where to edit matrixData object for updated value
			for (search of matrixData.forecast) {
				if (search.variable === changedVariable) {
					// check if maxSfcWind to keep as string
					if (changedVariable === "maxSfcWind") {
						search.values[changedFcstPeriod] = changedValue;
					} else {
						search.values[changedFcstPeriod] = Number(changedValue);
					}
				}
			}
			this.parentNode.classList.remove("red", "yellow");
			this.parentNode.classList.add(checkCriteria(changedValue, changedVariable));
		});
	}
};

////// Listener that updates color of select/option cells when data changes ////////
const dropdownListener = () => {
	const selectListener = document.querySelectorAll("select");
	for (let select of selectListener) {
		select.addEventListener("input", function (event) {
			// update matrixData with value and category for dropdown field
			const changedValue = event.target.value;
			const changedVariable = event.target.name;
			const changedCategory = event.target.selectedIndex;
			const changedFcstPeriod = event.target.dataset.fcstPeriod;
			// find where to edit matrixData object for updated value
			for (search of matrixData.forecast) {
				if (search.variable === changedVariable) {
					search.values[changedFcstPeriod] = changedValue;
					search.category[changedFcstPeriod] = changedCategory;
				}
			}
			// apply proper color class
			if (event.target.selectedIndex === 0) {
				this.parentNode.classList.remove("red", "yellow");
			} else if (event.target.selectedIndex === 1) {
				this.parentNode.classList.remove("red");
				this.parentNode.classList.add("yellow");
			} else {
				this.parentNode.classList.remove("yellow");
				this.parentNode.classList.add("red");
			}
		});
	}
};

const checkCriteria = (value, variable) => {
	let criteriaObj = {};
	// find the variable and set associated criteria to criteriaObj
	for (let criteriaVar of criteriaData.body) {
		if (criteriaVar.variable === variable) {
			criteriaObj = criteriaVar;
		}
	}
	// check if variable is sfc wind to remove directional component
	if (variable === "maxSfcWind") {
		value = Number(value.slice(2));
	}
	// return color for associated class
	if (value > criteriaObj.yellow) {
		return "red";
	} else if (value > criteriaObj.green) {
		return "yellow";
	}
};

// Helper function to copy object
function jsonCopy(src) {
	return JSON.parse(JSON.stringify(src));
}

// Reorders the array based on starting and ending index
function swapElement(array, indexA, indexB) {
	const tmp = array[indexA];
	array[indexA] = array[indexB];
	array[indexB] = tmp;
}

// arranges matrixData into correct order and sends POSt request with JSON to server
const submitForecast = () => {
	const finalMatrixData = jsonCopy(matrixData);
	// rearrange array
	swapElement(finalMatrixData.forecast, 8, 6);
	swapElement(finalMatrixData.forecast, 9, 7);
	console.log(finalMatrixData);
	const stringifyMatrixData = JSON.stringify(finalMatrixData);
	// make POST request with final data
	axios.post(urlSubmittedForecast, stringifyMatrixData);
};
