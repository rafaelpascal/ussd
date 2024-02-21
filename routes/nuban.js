const fs = require("fs");
const axios = require("axios");
const rawdata = fs.readFileSync("banks.json");
const banks = JSON.parse(rawdata);

const seed = "373373373373";
const nubanLength = 10;
const serialNumLength = 9;

// module.exports = {
//   getAccountBanks: (req, res, next) => {
//     let accountNumber = req.params.account;

//     let accountBanks = [];

//     banks.forEach((item, index) => {
//       if (isBankAccountValid(accountNumber, item.code)) {
//         accountBanks.push(item);
//       }
//     });

//     res.send(accountBanks);
//   },
// };
let NewaccountBanks = [];
let selectedBank = "";
let selectedPeriod = {};
let account = 0;

module.exports = {
  ussd: async (req, res, next) => {
    const { sessionId, serviceCode, phoneNumber, text } = req.params;
    let response = "";
    let accountBanks = [];
    let numberedItems = "";
    const selectedBankIndex = 1;
    // Example usage:
    const apiUrl = "https://nkeazu.abia.live/veripay/payslip";
    const postData = {
      month: JSON.stringify(selectedPeriod.month),
      year: JSON.stringify(selectedPeriod.year),
      bankName: selectedBank,
      accountNumber: JSON.stringify(account),
    };
    const customHeaders = {
      clientKey:
        "CrztedLCxb2EArUOkSWjJMpw0Ngg1pWJXR0ccLttFwD7VT9547AW4645WSeVijLX2TGjcRGLcXPI4gyoaFcC296SwiGOarK4xAAK1YCvuxo6fH7VUPBydpf4ZU5EW7LUqmwbVmOjiHHfcxVCNoMzrez8xmEwnNKjC6PfwP85ahGv6ZKm0OqL411hg2lHj", // Add your custom headers here
    };

    async function makePostRequest(url, data, customHeaders) {
      try {
        const response = await axios.post(url, data, {
          headers: {
            "Content-Type": "application/json", // Example content type
            ...customHeaders, // Add your custom headers here
          },
        });

        // You can handle the response here
        console.log(response.data);
        return response.data;
      } catch (error) {
        // Handle errors here
        console.error("Error:", error.data);
        // throw error; // Rethrow the error if needed
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

    if (isNewSession) {
      // Clear the accountBanks array for a new session
      accountBanks = [];
      NewaccountBanks = [];
      selectedBank = "";
      account = 0;

      response = `CON What would you like to check
        1. My Account Status`;
    } else if (text == "1") {
      response = `CON Input your Account number`;
    } else if (
      text.startsWith("1*") &&
      // NewaccountBanks.length > 0 &&
      selectedBank != ""
      // !isNaN(account) &&
      // text.endsWith("1")
    ) {
      const selectedOption = parseInt(text.split("*")[3]);
      if (!isNaN(selectedOption) && selectedOption > 0 && selectedOption == 1) {
        const inputDate = "January 2024";
        selectedPeriod = parseMonthAndYear(inputDate);
        const periodRes = await makePostRequest(
          apiUrl,
          postData,
          customHeaders
        );
        response = `END ${JSON.stringify(periodRes.data, null, 2)}`;
      } else if (
        !isNaN(selectedOption) &&
        selectedOption > 0 &&
        selectedOption == 2
      ) {
        const inputDate = "Fabruary 2024";
        selectedPeriod = parseMonthAndYear(inputDate);
        const periodRes = await makePostRequest(
          apiUrl,
          postData,
          customHeaders
        );
        response = `END ${JSON.stringify(periodRes.data, null, 2)}`;
      } else if (
        !isNaN(selectedOption) &&
        selectedOption > 0 &&
        selectedOption == 3
      ) {
        const inputDate = "March 2024";
        selectedPeriod = parseMonthAndYear(inputDate);
        const periodRes = await makePostRequest(
          apiUrl,
          postData,
          customHeaders
        );
        response = `END ${JSON.stringify(periodRes.data, null, 2)}`;
      } else {
        response = `END Nothing Selected`;
      }
    } else if (
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
        response = `CON You selected: ${selectedBank} 
        Select Period 
        1. January 2024 
        2. Fabruary 2024 
        3. March 2024`;
      } else {
        response = `CON Invalid selection. Please enter a valid option.`;
      }
    } else if (text.startsWith("1*")) {
      const userEnteredAccount = text.substring(2).trim();

      if (userEnteredAccount !== "" && !isNaN(userEnteredAccount)) {
        account = parseInt(userEnteredAccount);

        accountBanks = []; // Clear the array before making a new request
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
      "Custom-Header": "Custom Value",
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
