
module.exports = {
  /**
    * Application configuration section
    * http://pm2.keymetrics.io/docs/usage/application-declaration/
    */
   apps : [{
    name: "els-catalogue",
    script: "index.js",
    restart_delay: 30000,
    log_date_format: "DD/MM/YYYY HH:mm:ss",
    merge_logs: true
  },
  {
    name: "els-consumer-catalogue",
    script: "consumer.js",
    restart_delay: 30000,
    log_date_format: "DD/MM/YYYY HH:mm:ss",
    merge_logs: true,
  }]
 
  /**
    * Deployment section
    * http://pm2.keymetrics.io/docs/usage/deployment/
    */
};
