module.exports = function calculateDateRange(sdate, edate) {
    console.log("patricia");
    console.log({
        sdate,
        edate
    });
    let dates = [],
        currentDate = sdate,
        addDays = function (days) {
            let date = new Date(this.valueOf());
            date.setDate(date.getDate() + days);
            return date;
        };
    while (currentDate <= edate) {
        dates.push(currentDate);
        currentDate = addDays.call(currentDate, 1);
    }
    return dates;
}