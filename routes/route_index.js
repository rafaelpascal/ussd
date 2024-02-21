var nubanUtil = require("./nuban");

module.exports = function (server) {
  server.get("/", (req, res, next) => {
    res.send("Initial page here");
  });

  server.post("/accounts/banks", (req, res, next) => {
    nubanUtil.getAccountBanks(req, res, next);
  });

  server.post("/banks/accounts", (req, res, next) => {
    nubanUtil.ussd(req, res, next);
  });
};
