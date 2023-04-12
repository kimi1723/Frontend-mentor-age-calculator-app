const ageCalcForm = document.querySelector('.age-calc-form') as HTMLDivElement;
// const ageCalcLabels = document.querySelectorAll('.age-calc-form__label') as NodeListOf<HTMLLabelElement>;

const ageCalcInputs = document.querySelectorAll('.age-calc-form__input') as NodeListOf<HTMLInputElement>;
const yearInput = document.querySelector('.age-calc-form__input[data-id="year"]') as HTMLInputElement;
const ageCalcSubmitBtn = document.querySelector('.age-calc-form__submit-btn') as HTMLButtonElement;

const currentDate: Date = new Date();

let i: number = 0;

const timeout = (): Promise<void> => {
	return new Promise(resolve => setTimeout(resolve, 300));
};

const calculateAge = async (e: Event) => {
	e.preventDefault();

	const validation: boolean = await validateForm();

	if (validation === false) return;
	ageCalcForm.classList.remove('age-calc-form--error');
	i = 0;
	getAge();
};

const getAge = () => {
	const dayInput = document.querySelector('.age-calc-form__input[data-id="day"]') as HTMLInputElement;
	const monthInput = document.querySelector('.age-calc-form__input[data-id="month"]') as HTMLInputElement;

	const providedDate: Date = new Date(`${monthInput.value}/${dayInput.value}/${yearInput.value}`);
	const dateResult: number = currentDate.valueOf() - providedDate.valueOf();

	const outputTemplate = document.querySelector('.age-calc-output-template') as HTMLTemplateElement;
	const outputHTML = outputTemplate.content.cloneNode(true) as HTMLElement;
	const outputDiv = document.querySelector('.age-calc-output') as HTMLDivElement;
	const timestamps: string[] = ['days', 'months', 'years'];

	let days: number | string = Math.round((dateResult / 1000 / 60 / 60 / 24) % 365.25);
	let months: number | string = Math.floor((dateResult / 1000 / 60 / 60 / 24 / 30.437) % 12);
	let years: number | string = Math.round(dateResult / 1000 / 60 / 60 / 24 / 365.25 - 1);

	if (
		(providedDate.getMonth() === currentDate.getMonth() && providedDate.getDate() <= currentDate.getDate()) ||
		providedDate.getMonth() < currentDate.getMonth()
	) {
		years += 1;
	}

	if (days === 365) (days = 0), (months = 0);

	outputDiv.textContent = '';
	timestamps.forEach(timestamp => {
		const timestampOutput = outputHTML.querySelector(`.age-calc-output__text--${timestamp}`) as HTMLParagraphElement;
		if (isNaN(Number(days)) || isNaN(Number(months)) || isNaN(Number(years)))
			(days = '--'), (months = '--'), (years = '--');

		switch (timestamp) {
			case 'days':
				if (days === 1) timestamp = timestamp.slice(0, -1);
				timestampOutput.innerHTML = `<span class="age-calc-output__text--highlighted">0</span> ${timestamp}`;

				outputDiv.append(timestampOutput);
				break;
			case 'months':
				if (months === 1) timestamp = timestamp.slice(0, -1);
				timestampOutput.innerHTML = `<span class="age-calc-output__text--highlighted">${months}</span> ${timestamp}`;
				break;
			case 'years':
				if (years === 1) timestamp = timestamp.slice(0, -1);
				timestampOutput.innerHTML = `<span class="age-calc-output__text--highlighted">${years}</span> ${timestamp}`;
				break;
		}

		outputDiv.append(timestampOutput);
		updateForm(Number(days));
	});
};

let initialValue: number = 0;

const updateForm = (value2: number) => {
	if (i === 0) (initialValue = value2), i++;

	const ts = document.querySelector('.age-calc-output__text--highlighted') as HTMLSpanElement;
	const speed = Number(initialValue / 185);
	const valueT = document.querySelector('.age-calc-output__text--highlighted') as HTMLSpanElement;

	let value = Number(valueT.textContent);
	if (value < initialValue) {
		ts.textContent = Math.floor((value += speed)).toString();
		setTimeout(updateForm, 1);
	}
};

const validateForm = async () => {
	if (checkIfEmpty() === false) return false;

	const validateValues = async (): Promise<boolean> => {
		await timeout();

		return checkIfAccurateValues();
	};

	return await validateValues();
};

const checkIfEmpty = (): boolean => {
	const emptyInputs: string[] = [];
	const filledInputs: string[] = [];

	ageCalcInputs.forEach(input => {
		const inputTimePeriod = input.dataset.id as string;
		if (input.value === '') {
			emptyInputs.push(inputTimePeriod);
		} else {
			filledInputs.push(inputTimePeriod);
		}
	});

	filledInputs.forEach(input => removeError(input, 'all'));

	emptyInputs.forEach(input => addError(input, 'empty'));

	return emptyInputs.length === 0 ? true : false;
};

const checkIfAccurateValues = () => {
	const ageCalcErrorParagraphs = document.querySelectorAll('.age-calc-form__error') as NodeListOf<HTMLParagraphElement>;
	const monthsWith31Days: number[] = [1, 3, 5, 7, 8, 10, 12];

	const year = Number(yearInput.value);

	let day: number,
		month: number,
		validationsPassed: number = 0;

	ageCalcInputs.forEach(input => {
		const timePeriod = input.dataset.id as string;
		const dayError = Array.from(ageCalcErrorParagraphs).find(
			error => error.dataset.errorId === timePeriod,
		) as HTMLParagraphElement;

		switch (timePeriod) {
			case 'day':
				day = Number(input.value);

				if (day <= 0) {
					addError('day', 'notValidated');
				}

				break;
			case 'month':
				month = Number(input.value);

				if (month > 12 || month <= 0) {
					addError('month', 'notValidated');
					return;
				} else if (month === 2) {
					if (day > 28 && year % 4 !== 0) {
						addError('day', 'notValidated');
						return;
					}

					removeError('day', 'one');
				} else if (monthsWith31Days.includes(month)) {
					if (day > 31) {
						addError('day', 'notValidated');
						return;
					}

					removeError('day', 'one');
				} else if (month !== 2) {
					if (day > 30) {
						addError('day', 'notValidated');
						return;
					}

					removeError('day', 'one');
				}

				removeError('month', 'one');
				break;
			case 'year':
				const currentYear: number = currentDate.getFullYear();

				if (year > currentYear) {
					addError('year', 'notValidated');
				} else if (
					(year === currentYear && day > currentDate.getDate()) ||
					(year === currentYear && month - 1 > currentDate.getMonth())
				) {
					addError('year', 'notValidated');
				} else {
					removeError('year', 'one');
				}
				break;
		}
	});

	ageCalcErrorParagraphs.forEach(error => (error.textContent === '' ? validationsPassed++ : validationsPassed--));

	return validationsPassed === 3 ? true : false;
};

const removeError = (timePeriod: string, howMany: string) => {
	if (howMany === 'all') ageCalcForm.classList.remove('age-calc-form--error');

	const errorToRemove = document.querySelector(
		`.age-calc-form__error[data-error-id="${timePeriod}"`,
	) as HTMLParagraphElement;

	errorToRemove.classList.remove('age-calc-form__error--active');

	setTimeout(() => {
		errorToRemove.textContent = '';
		errorToRemove.classList.remove('age-calc-form__error--active-visibility');
	}, 300);
};

const addError = (timePeriod: string, id: string) => {
	const errorToAdd = document.querySelector(
		`.age-calc-form__error[data-error-id="${timePeriod}"`,
	) as HTMLParagraphElement;

	ageCalcForm.classList.add('age-calc-form--error');

	if (id === 'empty') {
		errorToAdd.textContent = 'This field is required';
	} else {
		switch (timePeriod) {
			case 'day':
				errorToAdd.textContent = 'Must be a valid day';
				break;
			case 'month':
				errorToAdd.textContent = 'Must be a valid month';
				break;
			case 'year':
				errorToAdd.textContent = 'Must be in the past';
				break;
		}
	}

	errorToAdd.classList.add('age-calc-form__error--active');
	errorToAdd.classList.add('age-calc-form__error--active-visibility');
};

getAge();
ageCalcSubmitBtn.addEventListener('click', calculateAge);
