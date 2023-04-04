const ageCalcForm = document.querySelector('.age-calc-form') as HTMLDivElement;
// const ageCalcLabels = document.querySelectorAll('.age-calc-form__label') as NodeListOf<HTMLLabelElement>;

// const ageCalcDayInput = document.querySelector('.age-calc-form__input[data-id="day"]') as HTMLInputElement;
// const ageCalcMonthInput = document.querySelector('.age-calc-form__input[data-id="month"]') as HTMLInputElement;
// const ageCalcYearInput = document.querySelector('.age-calc-form__input[data-id="year"]') as HTMLInputElement;
const ageCalcInputs = document.querySelectorAll('.age-calc-form__input') as NodeListOf<HTMLInputElement>;
const ageCalcErrorParagraphs = document.querySelectorAll('.age-calc-form__error') as NodeListOf<HTMLParagraphElement>;

const ageCalcSubmitBtn = document.querySelector('.age-calc-form__submit-btn') as HTMLButtonElement;

const currentYear: number = new Date().getFullYear();

const calcAge = async (e: Event) => {
	e.preventDefault();

	const validation: boolean = await validateForm();
	if (validation === false) return;
};

const validateForm = async () => {
	if (checkIfEmpty() === false) return false;

	const timeout = (): Promise<void> => {
		return new Promise(resolve => setTimeout(resolve, 300));
	};

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

	filledInputs.forEach(input => removeError(input));

	emptyInputs.forEach(input => {
		addError(input, 'empty');
	});

	return emptyInputs.length === 0 ? true : false;
};

const checkIfAccurateValues = (): boolean => {
	const monthsWith31Days: number[] = [1, 3, 5, 7, 8, 10, 12];
	let day: number;
	let month: number;
	let validationsPassed: number = 0;

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
					addError('day', 'notValidated');
					addError('month', 'notValidated');
					return;
				} else if (month === 2) {
					if (day > 28) {
						addError('day', 'notValidated');
						return;
					}

					removeError('day');
				} else if (monthsWith31Days.includes(month)) {
					if (day > 31) {
						addError('day', 'notValidated');
						return;
					}

					removeError('day');
				} else if (month !== 2) {
					if (day > 30) {
						addError('day', 'notValidated');
						return;
					}

					removeError('day');
				}

				removeError('month');
				break;
			case 'year':
				const year = Number(input.value);

				if (year >= currentYear) {
					addError('year', 'notValidated');
				} else {
					removeError('year');
				}

				if (year % 4 === 0 && month === 2 && day === 29) {
					removeError('day');
				}

				break;
		}
	});

	ageCalcErrorParagraphs.forEach(error => {
		if (error.textContent === '') {
			validationsPassed++;
		}
	});

	if (validationsPassed === 3) {
		return true;
	} else {
		return false;
	}
};

const removeError = (timePeriod: string) => {
	const errorToRemove = document.querySelector(
		`.age-calc-form__error[data-error-id="${timePeriod}"`,
	) as HTMLParagraphElement;

	errorToRemove.classList.remove('age-calc-form__error--active');
	ageCalcForm.classList.remove('age-calc-form--error');

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

ageCalcSubmitBtn.addEventListener('click', calcAge);
