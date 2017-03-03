const init = () => {
  const form = document.querySelector('.midas-form');
  if (!form) {
    return;
  }
  form.addEventListener('submit', validate);
}

const validate = function(e) {
  e.preventDefault();
  let valid = true;
  [...document.querySelectorAll('.midas-form__group--input')]
  .map((input) => {
    const validator = mapInputToValidator(input);
    console.log(input.name)
    debugger
    const { isValid, errorMessage } = validator.validate(input);
    if (!isValid) {
      valid = false;
      addErrorMessage(input, errorMessage);
    }
  });
  debugger
  if (valid) {
    e.target.submit();
  }
}
const mapInputToValidator = function(input) {
  if (input.name === 'credit_card_number') {
    return validators.creditCardNumber;
  } else if (input.name === 'expiration_date') {
    return validators.creditCardExpiry;
  } else if (input.name === 'ccv') {
    return validators.creditCardCVC;
  } else if (input.name.indexOf('confirmation') > -1) {
    return validators.confirmation;
  } else if (input.name == 'email') {
    return validators.email;
  } else if (input.name == 'password') {
    return validators.password;
  } else {
    return validators.default;
  }
}

const validators = {
  confirmation: {
    validate(input) {
      if (input.value.length === 0) {
        const errorMessage = input.dataset['requiredMessage'] || "Required";
        return {isValid: false, errorMessage: errorMessage};
      }
      const siblingName = input.name.slice(0, input.name.indexOf('_'));
      const siblingInput = document.querySelector(`input[name=${siblingName}]`);
      const match = input.value === siblingInput.value;
      if (!match) {
        return {isValid: false, errorMessage: `Must match ${siblingName}`};
      }
      return {isValid: true, errorMessage: null};
    }
  },
  creditCardCVC: {
    validate(input) {
      if (input.value.length === 0) {
        const errorMessage = input.dataset['requiredMessage'] || "Required";
        return {isValid: false, errorMessage: errorMessage};
      }
      const cc = document.querySelector('input[name="credit_card_number"]').value;
      const type = $.payment.cardType(cc)
      const valid = $.payment.validateCardCVC(input.value, type);
      if (!valid) {
        return {isValid: false, errorMessage: 'Invalid'};
      }
      return {isValid: true, errorMessage: null};
    }
  },
  creditCardExpiry: {
    validate(input) {
      if (input.value.length === 0) {
        const errorMessage = input.dataset['requiredMessage'] || "Required";
        return {isValid: false, errorMessage: errorMessage};
      }
      const { month, year } = $.payment.cardExpiryVal(input.value);
      const valid = $.payment.validateCardExpiry(month, year);
      if (!valid) {
        return {isValid: false, errorMessage: 'Invalid'};
      }
      return {isValid: true, errorMessage: null};
    }
  },
  creditCardNumber: {
    validate(input) {
      if (input.value.length === 0) {
        const errorMessage = input.dataset['requiredMessage'] || "Required";
        return {isValid: false, errorMessage: errorMessage};
      }
      const valid = $.payment.validateCardNumber(input.value);
      if (!valid) {
        return {isValid: false, errorMessage: 'Invalid'};
      }
      return {isValid: true, errorMessage: null};
    }
  },
  email: {
    validate(input) {
      if (isRequired(input) && input.value.length === 0) {
        return {isValid: false, errorMessage: input.dataset['requiredMessage']};
      } else if (!isRequired(input) && input.value.length === 0) {
        return {isValid: true, errorMessage: null};
      } else if (input.form.action.indexOf("sign-up") > -1) {
        ajax(input.value, null, "registration").then((res) => {
          console.log("email result: ", res)
          if(res == "unavailable" || "invalid") {
            let result = false;
            return {isValid: result, errorMessage: res}
          } else {
            let result = true
            return {isValid: result, errorMessage: res}
          }

        })
      } else if (input.form.action.indexOf("login") > -1) {
        return {isValid: true, errorMessage: null}
      }
    }
  },
  password: {
    validate(input) {
      let email = input.form.elements['email'].value
      if (isRequired(input) && input.value.length === 0) {
        return {isValid: false, errorMessage: input.dataset['requiredMessage']};
      } else if (!isRequired(input) && input.value.length === 0) {
        return {isValid: true, errorMessage: null};
      } else if (input.form.action.indexOf("sign-up") > -1) {
        return {isValid: true, errorMessage: null};
      } else if (input.form.action.indexOf("login") > -1) {
        ajax(email, input.value, "login").then((res) => {
          console.log("password result: ", res)
          return {isValid: res, errorMessage: "foobar"}
        })
      }
    }
  },
  default: {
    validate(input) {
      const regex = new RegExp(input.dataset.validationPattern);
      if (isRequired(input) && input.value.length === 0) {
        return {isValid: false, errorMessage: input.dataset['requiredMessage']};
      } else if (!isRequired(input) && input.value.length === 0) {
        return {isValid: true, errorMessage: null};
      } else if (!regex.test(input.value)) {
        return {isValid: false, errorMessage: input.dataset['validationMessage']};
      }
      return {isValid: true, errorMessage: null};
    }
  }
}

const isRequired = (input) => {
  return (typeof input.dataset.required !== 'undefined')
    && (['false', 'False', 'no'].indexOf(input.dataset.required) === -1);
}

async function ajax(email, password, type) {
  try {
    return await apiFunction.apiFunction(email, password, type)
  }
  catch (err) {
    console.log('fetch failed', err);
  }
}

const addErrorMessage = (input, message) => {
  const errorNode = input.parentNode.querySelector('.error-message');
  if (!errorNode) {
    return;
  }
  errorNode.innerHTML = message;
  input.parentNode.classList.add('invalid');
}

export default { init: init }
