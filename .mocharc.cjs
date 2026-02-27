module.exports = {
  timeout: 30000,
  retries: 1,
  parallel: false,
  reporter: "mochawesome",
  reporterOptions: [
    "reportDir=mochawesome-report",
    "reportFilename=api-report",
    "overwrite=true",
    "html=true",
    "json=true",
  ],
  require: ["dotenv/config"],
};
