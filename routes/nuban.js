const fs = require("fs");
const axios = require("axios");
const rawdata = fs.readFileSync("banks.json");
const logger = require("../logger.js");
const banks = JSON.parse(rawdata);
require("dotenv").config();

const seed = "373373373373";
const nubanLength = 10;
const serialNumLength = 9;

let NewaccountBanks = [];
let selectedBank = "";
let selectedPeriod = {};
let account = 0;
let result = "";

module.exports = {
  ussd: async (req, res, next) => {
    const { sessionId, serviceCode, phoneNumber, text } = req.body;

    let response = "";
    let accountBanks = [];
    let numberedItems = "";
    const date = new Date();

    // Example usage:
    const apiUrl = process.env.PAYSLIP_URL;
    const customHeaders = {
      clientKey: process.env.CLIENT_KEY,
    };

    async function makePostRequest(url, data, customHeaders) {
      try {
        const response = await axios.post(url, data, {
          headers: {
            "Content-Type": "application/json",
            ...customHeaders,
          },
        });

        const logObject = {
          On: `${date.toDateString()}:${date.toLocaleTimeString()}`,
          PhoneNumber: `${phoneNumber}`,
          SessionId: `${sessionId}`,
          Payload: data,
          response: response.data,
        };

        // Log to File
        logger.info(JSON.stringify(logObject));
        return response.data;
      } catch (error) {
        const logObject = {
          On: `${date.toDateString()}:${date.toLocaleTimeString()}`,
          PhoneNumber: `${phoneNumber}`,
          SessionId: `${sessionId}`,
          Payload: data,
          Error: error.response.data,
        };

        // Log to File
        logger.error(JSON.stringify(logObject));
        // throw error;
      }
    }

    async function makeRequest(accountNo) {
      try {
        let accountNumber = accountNo;
        banks.forEach((item, index) => {
          if (isBankAccountValid(accountNumber, item.code)) {
            accountBanks.push(item.name);
          }
        });
      } catch (error) {
        console.error("Error:", error.message);
      }
    }

    function getPreviousMonths() {
      const currentDate = new Date();
      const previousMonths = [];

      // Loop to get the dates for the last 3 months
      for (let i = 1; i <= 3; i++) {
        const newDate = new Date(currentDate);
        newDate.setMonth(currentDate.getMonth() - i);

        // Get month name
        const monthName = new Intl.DateTimeFormat("en", {
          month: "long",
        }).format(newDate);

        // Format: 'Month YYYY'
        previousMonths.push(`${monthName} ${newDate.getFullYear()}`);
      }

      return previousMonths;
    }

    // Pick out the Dates from the array
    function displayDatesAsText(dates) {
      let response = "Select Period \n";

      dates.forEach((date, index) => {
        response += `${index + 1}. ${date}\n`;
      });

      return response;
    }

    // Get The 3 Previous Month
    function parseMonthAndYear(dateString) {
      const dateParts = dateString.split(" ");
      if (dateParts.length !== 2) {
        throw new Error("Invalid date format");
      }

      const monthName = dateParts[0];
      const year = parseInt(dateParts[1], 10);

      if (isNaN(year)) {
        throw new Error("Invalid year");
      }

      const monthNumber = new Date(`${monthName} 1, ${year}`).getMonth() + 1;

      return { month: monthNumber, year };
    }

    // Check if the USSD session is new
    const isNewSession = text === "";
    if (serviceCode !== "*379#") {
      return res.send("Invalid Service Code");
    }

    if (isNewSession) {
      // Clear the accountBanks array for a new session
      accountBanks = [];
      NewaccountBanks = [];
      selectedBank = "";
      account = 0;

      response = `CON What would you like to check
        1. My Account Status`;
    } else if (text && text == "1") {
      response = `CON Input your Account number`;
    } else if (text && text.startsWith("1*") && selectedBank != "") {
      const selectedOption = parseInt(text.split("*")[3]);
      if (!isNaN(selectedOption) && selectedOption > 0 && selectedOption == 1) {
        const inputDate = `${result[0]}`;
        const selectedPeriod = parseMonthAndYear(inputDate);
        const postData = {
          month: JSON.stringify(selectedPeriod.month),
          year: JSON.stringify(selectedPeriod.year),
          bankName: selectedBank,
          accountNumber: JSON.stringify(account),
        };

        const periodRes = await makePostRequest(
          apiUrl,
          postData,
          customHeaders
        );
        if (periodRes.message === "Successfully") {
          if (periodRes.data.paymentStatus === "00") {
            response = `END Payment is Successful`;
          } else if (periodRes.data.paymentStatus === "10") {
            response = `END Failed Nuban Validation`;
          } else if (periodRes.data.paymentStatus === "15") {
            response = `END Payment Failed`;
          } else if (periodRes.data.paymentStatus === "06") {
            response = `END Payment in Progress`;
          } else {
            response = `END Paymnet not found`;
          }
        } else {
          response = `END Payment not found`;
        }
      } else if (
        !isNaN(selectedOption) &&
        selectedOption > 0 &&
        selectedOption == 2
      ) {
        const inputDate = `${result[1]}`;
        const selectedPeriod = parseMonthAndYear(inputDate);
        const postData = {
          month: JSON.stringify(selectedPeriod.month),
          year: JSON.stringify(selectedPeriod.year),
          bankName: selectedBank,
          accountNumber: JSON.stringify(account),
        };
        const periodRes = await makePostRequest(
          apiUrl,
          postData,
          customHeaders
        );
        if (periodRes.message === "Successfully") {
          if (periodRes.data.paymentStatus === "00") {
            // response = `END ${JSON.stringify(periodRes.data, null, 2)}`;
            response = `END Payment is Successful`;
          } else if (periodRes.data.paymentStatus === "10") {
            response = `END Failed Nuban Validation`;
          } else if (periodRes.data.paymentStatus === "15") {
            response = `END Payment Failed`;
          } else if (periodRes.data.paymentStatus === "06") {
            response = `END Payment in Progress`;
          } else {
            response = `END Paymnet not found`;
          }
        } else {
          response = `END Payment not found`;
        }
      } else if (
        !isNaN(selectedOption) &&
        selectedOption > 0 &&
        selectedOption == 3
      ) {
        const inputDate = `${result[2]}`;
        selectedPeriod = parseMonthAndYear(inputDate);
        const postData = {
          month: JSON.stringify(selectedPeriod.month),
          year: JSON.stringify(selectedPeriod.year),
          bankName: selectedBank,
          accountNumber: JSON.stringify(account),
        };
        const periodRes = await makePostRequest(
          apiUrl,
          postData,
          customHeaders
        );

        if (periodRes.message === "Successfully") {
          if (periodRes.data.paymentStatus === "00") {
            // response = `END ${JSON.stringify(periodRes.data, null, 2)}`;
            response = `END Payment is Successful`;
          } else if (periodRes.data.paymentStatus === "10") {
            response = `END Failed Nuban Validation`;
          } else if (periodRes.data.paymentStatus === "15") {
            response = `END Payment Failed`;
          } else if (periodRes.data.paymentStatus === "06") {
            response = `END Payment in Progress`;
          } else {
            response = `END Paymnet not found`;
          }
        } else {
          response = `END Payment not found`;
        }
      } else {
        response = `END Nothing Selected`;
      }
    } else if (
      text &&
      text.startsWith("1*") &&
      NewaccountBanks.length > 0 &&
      !isNaN(account)
    ) {
      const selectedOption = parseInt(text.split("*")[2]);

      if (
        !isNaN(selectedOption) &&
        selectedOption > 0 &&
        selectedOption <= NewaccountBanks[0].length
      ) {
        selectedBank = NewaccountBanks[0][selectedOption - 1];
        // bankSelected = true;
        result = getPreviousMonths();
        const ussdResponse = displayDatesAsText(result);
        response = `CON You selected: ${selectedBank} \n ${ussdResponse}`;
      } else {
        response = `CON Invalid selection. Please enter a valid option.`;
      }
    } else if (text && text.startsWith("1*")) {
      const userEnteredAccount = text.substring(2).trim();

      if (userEnteredAccount !== "" && !isNaN(userEnteredAccount)) {
        account = parseInt(userEnteredAccount);

        accountBanks = [];
        await makeRequest(userEnteredAccount);

        if (accountBanks.length > 0) {
          NewaccountBanks.push([...accountBanks]);
          numberedItems = accountBanks.map(
            (item, index) => `${index + 1}. ${item}`
          );
          const resultString = numberedItems.join("\n");
          response = `CON Select Your Bank : \n${resultString.trim()}`;
        } else {
          response = `CON No banks found for the provided account number. Please enter a valid account number.`;
        }
      } else {
        response = `CON Invalid Account Number. Please enter a valid number.`;
      }
    }

    res.set({
      "Content-Type": "text/plain",
    });
    res.send(response);
  },
};

const generateCheckDigit = (serialNumber, bankCode) => {
  if (serialNumber.length > serialNumLength) {
    console.log(
      `Serial number should be at most ${serialNumLength}-digits long.`
    );
    throw new Error(
      `Serial number should be at most ${serialNumLength}-digits long.`
    );
  }

  serialNumber = serialNumber.padStart(serialNumLength, "0");
  let cipher = bankCode + serialNumber;
  let sum = 0;

  // Step 1. Calculate A*3+B*7+C*3+D*3+E*7+F*3+G*3+H*7+I*3+J*3+K*7+L*3
  cipher.split("").forEach((item, index) => {
    sum += item * seed[index];
  });

  // Step 2: Calculate Modulo 10 of your result i.e. the remainder after dividing by 10
  sum %= 10;

  // Step 3. Subtract your result from 10 to get the Check Digit
  let checkDigit = 10 - sum;

  // Step 4. If your result is 10, then use 0 as your check digit
  checkDigit = checkDigit == 10 ? 0 : checkDigit;

  return checkDigit;
};

const isBankAccountValid = (accountNumber, bankCode) => {
  if (!accountNumber || !accountNumber.length == nubanLength) {
    error = "NUBAN must be %s digits long" % nubanLength;
    return false;
  }

  let serialNumber = accountNumber.substring(0, 9);
  let checkDigit = generateCheckDigit(serialNumber, bankCode);

  return checkDigit == accountNumber[9];
};
