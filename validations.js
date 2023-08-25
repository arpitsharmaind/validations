(function ($) {
  const customRules = {
    alphabeticWithSpace: /^[A-Za-z\s]+$/,
    validEmail: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i,
    allowedCharacters: /^[A-Za-z0-9!@#$%^&*()_\-=+{}\[\]:;"'<>,.?\/\\|~`\s]+$/,
    validName: /^[A-Za-z]+(?:\s[A-Za-z]+){0,29}(?:\s)?$/,
    validMobile: /^(?!0)(?!(\d)\1+$)\d{10}$/,
    greaterThan: function (value, input, from) {
      const fromValue = $("#" + from).val();
      if (!value || !fromValue) {
        return true; // If either value is empty, validation passes
      }
      const fromDate = new Date(fromValue);
      const toDate = new Date(value);
      if (toDate >= fromDate) {
        return true; // Validation passes
      } else {
        input.val("");
        return false;
      }
    },
    lessThan: function (value, input, to) {
      const toValue = $("#" + to).val();

      if (!value || !toValue) {
        return true; // If either value is empty, validation passes
      }

      const toDate = new Date(toValue);
      const fromDate = new Date(value);

      if (fromDate <= toDate) {
        return true; // Validation passes
      } else {
        input.val(""); // Clear the "From Date" input
        return false;
      }
    },
    validAmount: function (value, input) {
      // Remove non-numeric characters
      var sanitizedInput = value.replace(/[^0-9.]/g, "");

      // Separate the integer part and the decimal part
      var parts = sanitizedInput.split(".");
      var integerPart = parts[0];
      var decimalPart = parts[1] || "";

      // Limit the integer part to 15 digits
      if (integerPart.length > 15) {
        return false;
      }

      // Combine the integer and decimal parts
      var sanitizedValue =
        decimalPart === "" ? integerPart : integerPart + "." + decimalPart;

      var amount = parseFloat(sanitizedValue);
      if (isNaN(amount)) {
        return false;
      }

      // Positive value validation
      if (amount <= 0) {
        return false;
      }

      // Decimal places validation (assuming max 2 decimal places)
      if (decimalPart.length > 2) {
        return false;
      }

      // Range validation (you can adjust min and max values)
      var minValue = 0;
      var maxValue = 999999999999999; // 15-digit max value
      if (amount < minValue || amount > maxValue) {
        return false;
      }

      // Non-Zero Amount Validation
      if (amount === 0) {
        return false;
      }

      return true;
    },
  };

  const customMethods = {}; // Object to store custom validation methods

  // Custom validation plugin
  $.fn.customValidation = function (options) {
    const settings = $.extend(
      {
        rules: {},
        messages: {},
        success: null,
      },
      options
    );

    // Add custom validation methods to customRules
    $.extend(customRules, customMethods);

    return this.each(function () {
      const form = $(this);
      let typingTimer;

      form.on("submit", function (event) {
        event.preventDefault();
        event.stopPropagation();
        form.find(".error-message").remove(); // Remove previous errors
        let valid = true;

        form.find("input").each(function () {
          if (!validateInput($(this))) {
            valid = false;
          }
        });

        if (valid) {
          settings.success();
        }
      });

      // Add a custom event listener for the datepicker onSelect event
      form.on("datepickerSelect", function (event, inputName) {
        const input = form.find(`[name="${inputName}"]`);
        input.next(".error-message").remove();
        validateInput(input);
        $(this).datepicker("hide");
      });

      form.find("input").on("blur", function () {
        $(this).data("blurred", true);
        validateInput($(this));
      });

      form.find("input").on("keyup", function () {
        /* if ($(this).data('blurred')) {
            const input = $(this);
            input.next('.error-message').remove(); // Clear existing error
            validateInput(input);
          } */
        clearTimeout(typingTimer);
        const input = $(this);
        if (!$(this).data("blurred")) {
          typingTimer = setTimeout(() => {
            input.next(".error-message").remove();
            validateInput(input);
          }, 300);
        } else {
          input.next(".error-message").remove(); // Clear existing error
          validateInput(input);
        }
      });

      function showError(input, message) {
        const existingError = input.next(".error-message");
        if (existingError.length > 0) {
          existingError.text(message);
        } else {
          const errorElement = $('<div class="error-message">').text(message);
          input.after(errorElement);
        }
      }

      form.find("input").on("input", function (event) {
        const value = $(this).val();
        const fieldName = $(this).attr("name");
        const rules = settings.rules[fieldName];

        if (rules) {
          if (typeof window[rules[1]] === "function") {
            window[rules[1]].call(this, event); // Call the dynamic function with input and event parameters
          }
        }
      });

      function validateInput(input) {
        const value = input.val().trim();
        const fieldName = input.attr("name");
        const rules = settings.rules[fieldName];
        let valid = true;

        if (rules) {
          input.data("valid", true); // Assume valid initially
          if (rules.includes("required") && value.trim() === "") {
            input.data("valid", false);
            valid = false;
            showError(
              input,
              settings.messages?.[fieldName]?.required ||
                `This field is required.`
            );
          } else if (value !== "") {
            rules.forEach((rule) => {
              const ruleParts = rule.split("["); // Split the rule to get rule name and parameters
              const ruleName = ruleParts[0];
              const parameter = ruleParts[1]?.replace("]", "");
              const validationFunction = customRules[ruleName];

              if (typeof validationFunction === "function") {
                const isValid = validationFunction.call(
                  this,
                  value,
                  input,
                  parameter
                );
                if (!isValid) {
                  valid = false;
                  showError(
                    input,
                    settings.messages[fieldName]?.[ruleName] || "Invalid value"
                  );
                }
              } else if (
                rule in customRules &&
                !customRules[rule].test(value)
              ) {
                valid = false;
                showError(
                  input,
                  settings.messages[fieldName]?.[rule] || "Invalid value"
                );
              }
            });
          }
        }
        return valid;
      }
    });
  };

  // Method to add custom validation methods
  $.validator = {
    addMethod: function (name, method, message) {
      customMethods[name] = method;
      $.fn.customValidation.defaults.messages[name] = message;
    },
  };

  // Default messages
  $.fn.customValidation.defaults = {
    messages: {},
  };
})(jQuery);

function validName(event) {
  var input = $(this);
  var inputVal = input.val();
  var originalCursorPosition = input.prop("selectionStart");

  // Remove extra spaces and non-alphabetic characters
  var sanitizedInput = inputVal
    .replace(/[^A-Za-z\s]+/g, "")
    .replace(/\s{2,}/g, " ");

  // Ensure the sanitized input respects the max length
  var maxLength = 60;
  if (sanitizedInput.length > maxLength) {
    sanitizedInput = sanitizedInput.slice(0, maxLength);
  }

  // Set the sanitized value
  input.val(sanitizedInput);

  // Calculate cursor position shift due to modifications
  var cursorShift = inputVal.length - sanitizedInput.length;

  // Restore cursor position
  var newCursorPosition = Math.max(0, originalCursorPosition - cursorShift);
  input.prop("selectionStart", newCursorPosition);
  input.prop("selectionEnd", newCursorPosition);
}

function validEmail(event) {
  var input = $(this);
  var inputVal = input.val();

  // Remove spaces and limit the input length
  var sanitizedInput = inputVal.replace(/\s/g, "").slice(0, 30);

  // Set the sanitized value
  input.val(sanitizedInput);
}

function validAmount(event) {
  let input = $(this);
  let inputVal = input.val();

  let sanitizedInput = inputVal.replace(/[^0-9.]/g, "");

  let decimalCount = sanitizedInput.split(".").length - 1;
  if (decimalCount > 1) {
    sanitizedInput = sanitizedInput.replace(/\./g, "");
  }
  console.log(sanitizedInput);
}
