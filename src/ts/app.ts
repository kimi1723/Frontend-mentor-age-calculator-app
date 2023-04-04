const ageCalcForm = document.querySelector('.age-calc-form') as HTMLDivElement;
const ageCalcLabels = document.querySelectorAll('.age-calc-form__label') as NodeListOf<HTMLLabelElement>;

const ageCalcDayInput = document.querySelector('.age-calc-form__input[data-id="day"]') as HTMLInputElement;
const ageCalcMonthInput = document.querySelector('.age-calc-form__input[data-id="month"]') as HTMLInputElement;
const ageCalcYearInput = document.querySelector('.age-calc-form__input[data-id="year"]') as HTMLInputElement;
const ageCalcInputs = document.querySelectorAll('.age-calc-form__input') as NodeListOf<HTMLInputElement>;
const ageCalcErrorParagraphs = document.querySelectorAll('.age-calc-form__error') as NodeListOf<HTMLParagraphElement>;

const ageCalcSubmitBtn = document.querySelector('.age-calc-form__submit-btn') as HTMLButtonElement;

const dayError = document.querySelector('.age-calc-form__error[data-error-id="day"') as HTMLParagraphElement;
const monthError = document.querySelector('.age-calc-form__error[data-error-id="month"') as HTMLParagraphElement;
const yearError = document.querySelector('.age-calc-form__error[data-error-id="year"') as HTMLParagraphElement;

const currentYear = new Date().getFullYear();

const calcAge = (e: Event) => {
	e.preventDefault();
	validateForm();
};

const validateForm = async () => {
	if (checkIfEmpty() === false) return;

	setTimeout(() => {
		checkIfAccurateValues();
	}, 300);

	// const isAccurate = () => {
	// 	return new Promise(resolve => {
	// 		setTimeout(() => {
	// 			if (checkIfAccurateValues() === false) {
	// 				return false;
	// 			} else {
	// 				return true;
	// 			}
	// 		}, 300);
	// 	});
	// };

	// const result = await isAccurate();

	// clearErrors();
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

	emptyInputs.forEach(input => {
		const errorToDisplay = document.querySelector(
			`.age-calc-form__error[data-error-id="${input}"]`,
		) as HTMLParagraphElement;

		errorToDisplay.textContent = 'This field is required';
		errorToDisplay.classList.add('age-calc-form__error--active');
		errorToDisplay.classList.add('age-calc-form__error--active-visibility');
	});

	filledInputs.forEach(input => {
		removeError(input);
	});

	return emptyInputs.length === 0 ? true : false;
};

const checkIfAccurateValues = (): boolean => {
	let day: number;
	let month: number;

	ageCalcInputs.forEach(input => {
		const TimePeriod = input.dataset.id;
		const dayError = Array.from(ageCalcErrorParagraphs).find(
			error => error.dataset.errorId === TimePeriod,
		) as HTMLParagraphElement;

		switch (TimePeriod) {
			case 'day':
				day = Number(input.value);
				if (day <= 0) {
					addDayError();
				}

				break;
			case 'month':
				month = Number(input.value);

				if (month > 12 || month <= 0) {
					addDayError();
					addMonthError();
					return;
				} else if (month === 2) {
					if (day > 28) {
						addDayError();
						return;
					}
					removeError('day');
				} else if (
					month === 1 ||
					month === 3 ||
					month === 5 ||
					month === 7 ||
					month === 8 ||
					month === 10 ||
					month === 12
				) {
					if (day > 31) {
						addDayError();
						return;
					}
					removeError('day');
				} else if (month !== 2) {
					if (day > 30) {
						addDayError();
						return;
					}
					removeError('day');
				}

				removeError('month');

				break;
			case 'year':
				const year = Number(input.value);

				if (year >= currentYear) {
					addYearError();
				} else {
					removeError('year');
				}

				if (year % 4 === 0 && month === 2 && day === 29) {
					removeError('day');
				}
				break;
		}
	});

	if (dayError.textContent !== '' && monthError.textContent !== '' && yearError.textContent !== '') {
		return false;
	} else {
		return true;
	}
};

const clearErrors = () => {
	ageCalcErrorParagraphs.forEach(p => p.classList.remove('age-calc-form__error--active'));

	setTimeout(() => {
		ageCalcErrorParagraphs.forEach(p => p.classList.remove('age-calc-form__error--active-visibility'));
		ageCalcErrorParagraphs.forEach(p => (p.textContent = ''));
	}, 300);
	ageCalcForm.classList.remove('age-calc-form--error');
};

const removeError = (timePeriod: string) => {
	const errorToRemove = document.querySelector(
		`.age-calc-form__error[data-error-id="${timePeriod}"`,
	) as HTMLParagraphElement;

	errorToRemove.classList.remove('age-calc-form__error--active');

	setTimeout(() => {
		errorToRemove.textContent = '';
		errorToRemove.classList.remove('age-calc-form__error--active-visibility');
	}, 300);
};

const addDayError = () => {
	dayError.textContent = 'Must be a valid day';
	dayError.classList.add('age-calc-form__error--active');
	dayError.classList.add('age-calc-form__error--active-visibility');
};

const addMonthError = () => {
	monthError.textContent = 'Must be a valid month';
	monthError.classList.add('age-calc-form__error--active');
	monthError.classList.add('age-calc-form__error--active-visibility');
};

const addYearError = () => {
	yearError.textContent = 'Must be in the past';
	yearError.classList.add('age-calc-form__error--active');
	yearError.classList.add('age-calc-form__error--active-visibility');
};

ageCalcSubmitBtn.addEventListener('click', calcAge);
