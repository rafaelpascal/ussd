const express = require("express");
const nubanUtil = require("./nuban");
const router = express.Router();

router.route("/banks/accounts").post(nubanUtil.ussd);

module.exports = router;

// module.exports = function (server) {
//   server.get("/ussd", (req, res, next) => {
//     res.send("Appmart Ussd Payment status verification Is Running");
//   });

//   server.post("/accounts/banks", (req, res, next) => {
//     nubanUtil.getAccountBanks(req, res, next);
//   });

//   server.post("/banks/accounts", (req, res, next) => {
//     nubanUtil.ussd(req, res, next);
//   });
// };
