const moment = require("moment");

let time = moment();

function formatMessage(username, text) {
    return {
        username,
        text,
        time: time.format("h:mm a")
    }
}

module.exports = formatMessage;