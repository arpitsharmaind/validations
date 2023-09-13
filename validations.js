(function ($) {
  const customRules = {
    alphabeticWithSpace: /^[A-Za-z\s]+$/,
    validEmail: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i,
    validBusinessName: /^[A-Za-z0-9!@#$%^&*()_\-=+{}\[\]:;"'<>,.?\/\\|~`\s]+$/,
    validName: /^[A-Za-z]+(?:\s[A-Za-z]+){0,29}(?:\s)?$/,
    validMobile: /^(?!0)(?!(\d)\1+$)\d{10}$/,
    validWebsite:
      /^(https?:\/\/)?([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})(:[0-9]+)?(\/[^\s]*)?$/,
    validUsername: /^[A-Za-z0-9]{1,30}$/,
    validUsernameWithDot: /^[A-Za-z0-9.]{1,30}$/,
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
  };

  const customMethods = {}; // Object to store custom validation methods

  const functions = {
    validMobile: function (event) {
      let input = $(this);
      let inputVal = $(this).val();

      let originalCursorPosition = input.prop("selectionStart");

      let sanitizedInput = inputVal.replace(/[^\d]/g, "");
      let maxLength = 10;
      if (sanitizedInput.length > maxLength) {
        sanitizedInput = sanitizedInput.slice(0, maxLength);
      }
      $(this).val(sanitizedInput);

      // Calculate cursor position shift due to modifications
      let cursorShift = inputVal.length - sanitizedInput.length;

      // Restore cursor position
      let newCursorPosition = Math.max(0, originalCursorPosition - cursorShift);

      input.prop("selectionStart", newCursorPosition);
      input.prop("selectionEnd", newCursorPosition);
    },

    validName: function (event) {
      console.log("Inside validName");
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
    },

    validEmail: function (event) {
      var input = $(this);
      var inputVal = input.val();

      // Remove spaces and limit the input length
      var sanitizedInput = inputVal.replace(/\s/g, "").slice(0, 50);

      // Set the sanitized value
      input.val(sanitizedInput);
    },

    validBusinessName: function (event) {
      var input = $(this);
      var inputVal = input.val();

      // Remove extra spaces and limit the input length
      var sanitizedInput = inputVal.replace(/\s{2,}/g, " ").slice(0, 60);

      // Set the sanitized value
      input.val(sanitizedInput);
    },

    validWebsite: function (event) {
      var input = $(this);
      var inputVal = input.val().trim();

      // Trim the input value to a maximum of 1000 characters
      if (inputVal.length > 1000) {
        input.val(inputVal.slice(0, 1000));
      }
    },

    validUsername: function (event) {
      var input = $(this);
      var inputVal = input.val();

      // Remove special characters and limit the input length to 30
      var sanitizedInput = inputVal.replace(/[^A-Za-z0-9]/g, "").slice(0, 30);

      // Set the sanitized value
      input.val(sanitizedInput);
    },

    validUsernameWithDot: function (event) {
      var input = $(this);
      var inputVal = input.val();

      // Remove special characters and limit the input length to 30
      var sanitizedInput = inputVal.replace(/[^A-Za-z0-9.]/g, "").slice(0, 30);

      // Set the sanitized value
      input.val(sanitizedInput);
    },
  };

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
        form.find(".error-message").remove();
        let valid = true;

        form.find("input, select").each(function () {
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

      form.find("select").on("change", function () {
        console.log($(this).val());
        $(this).next(".error-message").remove();
        validateInput($(this));
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
          if (typeof functions[rules[1]] === "function") {
            functions[rules[1]].call(this, event); // Call the dynamic function with input and event parameters
          } else if (typeof functions[rules[0]] === "function") {
            functions[rules[0]].call(this, event);
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
            console.log("Inside Nested If");
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
