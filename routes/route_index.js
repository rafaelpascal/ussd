var nubanUtil = require("./nuban");

module.exports = function (server) {
  server.get("/", (req, res, next) => {
    res.send("Appmart Ussd Payment status verification Is Running");
  });

  server.post("/accounts/banks", (req, res, next) => {
    nubanUtil.getAccountBanks(req, res, next);
  });

  server.post("/banks/accounts", (req, res, next) => {
    nubanUtil.ussd(req, res, next);
  });
};
