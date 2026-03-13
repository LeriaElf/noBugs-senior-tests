module.exports = {
  timeout: 30000,
  retries: 1,
  parallel: false,
  reporter: "mocha-multi-reporters",
  reporterOptions: "configFile=reporter-config.json",
  require: ["dotenv/config"],
};
