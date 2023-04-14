const ageCalcForm = document.querySelector('.age-calc-form') as HTMLDivElement;
const ageCalcInputs = document.querySelectorAll('.age-calc-form__input') as NodeListOf<HTMLInputElement>;
const yearInput = document.querySelector('.age-calc-form__input[data-id="year"]') as HTMLInputElement;
const ageCalcSubmitBtn = document.querySelector('.age-calc-form__submit-btn') as HTMLButtonElement;

const currentDate: Date = new Date();

const timeout = (): Promise<void> => {
	return new Promise(resolve => setTimeout(resolve, 300));
};

const calculateAge = async (e: Event): Promise<void> => {
	e.preventDefault();

	const validation: boolean = await validateForm();

	if (validation === false) return;
	ageCalcForm.classList.remove('age-calc-form--error');

	getAge();
};

const updateOutput = (targetValue: number | string, timestamp: string): void => {
	if (isNaN(Number(targetValue))) targetValue = '--';

	const outputTemplate = document.querySelector('.age-calc-output-template') as HTMLTemplateElement;
	const outputHTML = outputTemplate.content.cloneNode(true) as HTMLElement;
	const outputDiv = document.querySelector('.age-calc-output') as HTMLDivElement;
	const textOutput = outputHTML.querySelector(`.age-calc-output__text--${timestamp}`) as HTMLParagraphElement;
	const timestampOutput = textOutput.querySelector(`span[data-timestamp="${timestamp}"]`) as HTMLSpanElement;
	const outputNumericalValue = textOutput.querySelector(`.age-calc-output__text--highlighted`) as HTMLSpanElement;

	if (targetValue === 1) timestamp = timestamp.slice(0, -1);

	timestampOutput.innerHTML = `${timestamp}`;

	if (targetValue !== '--') {
		const targetValueDivingNumber: number = 15;
		const speed: number = Number(targetValue) / targetValueDivingNumber;

		let value: number = 0,
			timeoutTime: number = 0;

		for (let i = 0; i < targetValueDivingNumber; i++) {
			timeoutTime += 30;

			setTimeout(() => {
				outputNumericalValue.textContent = Math.round((value += speed)).toString();
			}, timeoutTime);
		}
	} else {
		outputNumericalValue.textContent = targetValue;
	}

	outputDiv.append(textOutput);
};

const validateForm = async (): Promise<boolean> => {
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

const checkIfAccurateValues = (): boolean => {
	const ageCalcErrorParagraphs = document.querySelectorAll('.age-calc-form__error') as NodeListOf<HTMLParagraphElement>;
	const monthsWith31Days: number[] = [1, 3, 5, 7, 8, 10, 12];

	const year = Number(yearInput.value);

	let day: number,
		month: number,
		validationsPassed: number = 0;

	ageCalcInputs.forEach(input => {
		const timePeriod = input.dataset.id as string;

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

const getAge = (): void => {
	const dayInput = document.querySelector('.age-calc-form__input[data-id="day"]') as HTMLInputElement;
	const monthInput = document.querySelector('.age-calc-form__input[data-id="month"]') as HTMLInputElement;
	const providedDate: Date = new Date(`${monthInput.value}/${dayInput.value}/${yearInput.value}`);
	const dateResult: number = currentDate.valueOf() - providedDate.valueOf();
	const timestamps: string[] = ['days', 'months', 'years'];

	const outputDiv = document.querySelector('.age-calc-output') as HTMLDivElement;

	let days: number | string = Math.floor((dateResult / 1000 / 60 / 60 / 24) % 365.25),
		months: number | string = Math.floor((dateResult / 1000 / 60 / 60 / 24 / 30.437) % 12),
		years: number | string = Math.round(dateResult / 1000 / 60 / 60 / 24 / 365.25 - 1);

	if (
		(providedDate.getMonth() === currentDate.getMonth() && providedDate.getDate() <= currentDate.getDate()) ||
		providedDate.getMonth() < currentDate.getMonth()
	) {
		years += 1;
	}

	if (days === 365) (days = 0), (months = 0);

	outputDiv.textContent = '';

	timestamps.forEach(timestamp => {
		switch (timestamp) {
			case 'days':
				updateOutput(Number(days), timestamp);
				break;
			case 'months':
				updateOutput(Number(months), 'months');
				break;
			case 'years':
				updateOutput(Number(years), 'years');
				break;
		}
	});
};

const removeError = (timePeriod: string, howMany: string): void => {
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

const addError = (timePeriod: string, id: string): void => {
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
