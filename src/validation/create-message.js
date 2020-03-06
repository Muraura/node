const createMessage = (value) => {

    if (value <= 2) {
        return "Success"
    }
    if (value > 2 && value <= 4) {
        return "Warning"
    }
    if (value > 4) {
        return "Danger"
    }
}

module.exports = createMessage;