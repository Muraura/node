const cleanPhone = (phone) => {
    let preffix = '0';
    let result = '';
    if (phone.charAt(0) == 0) {
        phone.substr(1);
        result = preffix + phone.substr(1);
    } else if (phone.charAt(0) == '7') {
        result = preffix + phone;
    } else if (phone.charAt(0) == '2') {
        result = preffix + phone.substr(3);
    } else if (phone.charAt(0) == '+') {
        result = preffix + phone.substr(4);
    }
    return result;
}

module.exports = cleanPhone;