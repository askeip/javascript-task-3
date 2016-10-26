'use strict';

/**
 * Сделано задание на звездочку
 * Реализовано оба метода и tryLater
 */
exports.isStar = false; // true;

var gmtRegExp = /\+(\w+)/;
var dayToNumFormat = {
    ПН: 1,
    ВТ: 2,
    СР: 3,
    ЧТ: 4,
    ПТ: 5,
    СБ: 6,
    ВС: 7
};
var numToDayFormat = {
    1: 'ПН',
    2: 'ВТ',
    3: 'СР',
    4: 'ЧТ',
    5: 'ПТ',
    6: 'СБ',
    7: 'ВС'
};
var dayToNumRegExp = /([а-я]+)/i;
var timeToNumsRegExp = /(\d+):(\d+)/;
var formatDayInfoToDate = function (dayInfo, gmtDiff, dayNum) {
    if (typeof dayNum === 'undefined') {
        dayNum = dayToNumFormat[dayToNumRegExp.exec(dayInfo)[0]];
    }
    var nums = timeToNumsRegExp.exec(dayInfo);
    var bankGmtHour = Number(nums[1]) + gmtDiff;
    if (bankGmtHour > 23) {
        dayNum -= 1;
        bankGmtHour -= 24;
    }

    return new Date(2012, 9, dayNum, bankGmtHour, Number(nums[2]), 0);
};

var formatObjToObj = function (scheduleObj, gmtDiff, dayNum) {
    return { from: formatDayInfoToDate(scheduleObj.from, gmtDiff, dayNum),
        to: formatDayInfoToDate(scheduleObj.to, gmtDiff, dayNum) };
};

/**
 * @this enumFormatObjToDateObj
 * @param {Object} scheduleObj
 * @returns {{from, to}}
 */
var enumFormatObjToDateObj = function (scheduleObj) {
    return formatObjToObj(scheduleObj, this);
};

/**
 * @param {Object} oneManSchedule
 * @param {Number} bankGmt
 * @returns {Array}
 */
var formatScheduleToDates = function (oneManSchedule, bankGmt) {
    var gmtDiff = bankGmt - Number(gmtRegExp.exec(oneManSchedule[0].from)[1]);

    return oneManSchedule.map(enumFormatObjToDateObj, gmtDiff).sort();
};

var defaultStart = formatObjToObj({ from: '00:00+0', to: '00:00+0' }, 0, 1);
var defaultEnd = formatObjToObj({ from: '23:59+0', to: '23:59+0' }, 0, 3);
var throwExtraDays = function (acc, dateObj) {
    if (dateObj.to < defaultStart.from || dateObj.from > defaultEnd.to) {
        return acc;
    } else if (dateObj.from < defaultStart.from) {
        acc.push({ from: defaultStart.from, to: dateObj.to });
    } else if (dateObj.to > defaultEnd.to) {
        acc.push({ from: dateObj.from, to: defaultEnd.to });
    } else {
        acc.push(dateObj);
    }

    return acc;
};

var implementSchedule = function (oneSchedule) {
    for (var i = 0; i < oneSchedule.length; i++) {
        if (oneSchedule[i + 1] !== undefined && (oneSchedule[i].to.getDay() <
            oneSchedule[i + 1].from.getDay())) {
            oneSchedule.splice(i + 1, 0, {
                from: new Date(2012, 9, oneSchedule[i].to.getDay(), 23, 59, 0),
                to: new Date(2012, 9, oneSchedule[i].to.getDay() + 1, 0, 0, 0)
            });
        }
    }
};

var formatAllToDate = function (workingHours, schedule) {
    var bankGmt = Number(gmtRegExp.exec(workingHours.from)[1]);
    var formattedSchedule = [];
    for (var oneManSchedule in schedule) {
        if (schedule.hasOwnProperty(oneManSchedule)) {
            var oneSchedule = [defaultStart];
            formatScheduleToDates(schedule[oneManSchedule], bankGmt)
                .reduce(throwExtraDays, oneSchedule);
            oneSchedule.push(defaultEnd);
            implementSchedule(oneSchedule);
            oneSchedule = oneSchedule.sort();
            formattedSchedule.push(oneSchedule);
        }
    }

    return formattedSchedule;
};

var parseBankSchedule = function (workingHours) {
    var bDate = [];
    for (var i = 1; i < 4; i++) {
        bDate.push(formatObjToObj(workingHours, 0, i));
    }

    return bDate;
};

/**
 * @param {Object} schedule – Расписание Банды
 * @param {Number} duration - Время на ограбление в минутах
 * @param {Object} workingHours – Время работы банка
 * @param {String} workingHours.from – Время открытия, например, "10:00+5"
 * @param {String} workingHours.to – Время закрытия, например, "18:00+5"
 * @returns {Object}
 */
exports.getAppropriateMoment = function (schedule, duration, workingHours) {
    // oct 2012
    duration *= 60 * 1000;
    var correctTimes = formatAllToDate(workingHours, schedule);

    var bankDate = parseBankSchedule(workingHours);

    var index = 0;

    var getClosestFreeTimes = function (indexes) {
        var freeTimes = [];
        for (var i = 0; i < correctTimes.length; i++) {
            var day = correctTimes[i][indexes[i]].to.getDay();
            var to = Math.max(bankDate[day - 1].from, correctTimes[i][indexes[i]].to);
            var from = Math.min(correctTimes[i][indexes[i] + 1].from, bankDate[day - 1].to);

            /* if (day === 2 && i === 2) {
                console.info(bankDate[day - 1].from);
                console.info(correctTimes[i][indexes[i]].to);
                console.info(new Date(to));
            } */
            freeTimes.push(from - to);
        }

        return freeTimes;
    };

    var getFromTimes = function (indexes) {
        var fromTimes = [];
        for (var i = 0; i < correctTimes.length; i++) {
            fromTimes.push(new Date(correctTimes[i][indexes[i]].to));
        }

        return fromTimes;
    };

    // var halfHourConstant = 30 * 60 * 1000;
    var enoughTime = function (indexes, minFreeTimeIndex, fineTimings) {
        var endTime = correctTimes[minFreeTimeIndex][indexes[minFreeTimeIndex]].to;
        for (var j = 0; j < 2; j++) {
            var curIndex = (minFreeTimeIndex + j + 1) % 3;
            var maxEndTime = Math.max(endTime, correctTimes[curIndex][indexes[curIndex]].to);
            var day = correctTimes[j][indexes[j]].to.getDay();
            var minStartTime = Math.min(correctTimes[curIndex][indexes[curIndex] + 1].from,
                correctTimes[minFreeTimeIndex][indexes[minFreeTimeIndex] + 1].from,
                bankDate[day - 1].to);
            var freeTime = minStartTime - maxEndTime;
            if (freeTime < duration) {
                indexes[minFreeTimeIndex]++;

                return;
            }
        }
        var fromTimes = getFromTimes(indexes);
        var maxFromTime = Math.max.apply(Math, fromTimes);
        fineTimings.push(new Date(maxFromTime));
        indexes[minFreeTimeIndex]++;
    };

    var startFromInterval = function (indexes, fineTimings) {
        var freeTimes = getClosestFreeTimes(indexes);
        var minFreeTime = Math.min.apply(Math, freeTimes);
        var minFreeTimeIndex = freeTimes.indexOf(minFreeTime);
        // var day = correctTimes[minFreeTimeIndex][indexes[minFreeTimeIndex]].from.getDay();
        if (minFreeTime < duration) {
            indexes[minFreeTimeIndex]++;
        } else {
            enoughTime(indexes, minFreeTimeIndex, fineTimings);
        }
    };

    var isIndexesOutOfRange = function (indexes) {
        for (var i = 0; i < 3; i++) {
            if (correctTimes[i][indexes[i] + 1] === undefined) {
                return true;
            }
        }

        return false;
    };

    var countRobbingTime = function () {
        var indexes = [0, 0, 0];
        var fineTimings = [];
        while (!isIndexesOutOfRange(indexes)) {
            startFromInterval(indexes, fineTimings);
        }

        return fineTimings;
    };

    var robbingTime = countRobbingTime();

    return {

        /**
         * Найдено ли время
         * @returns {Boolean}
         */
        exists: function () {
            return robbingTime.length > 0;
        },

        /**
         * Возвращает отформатированную строку с часами для ограбления
         * Например,
         *   "Начинаем в %HH:%MM (%DD)" -> "Начинаем в 14:59 (СР)"
         * @param {String} template
         * @returns {String}
         */
        format: function (template) {
            if (robbingTime.length === 0) {
                return '';
            }
            var hrs = robbingTime[index].getHours();
            if (hrs < 10) {
                hrs = '0' + hrs;
            }
            var mns = robbingTime[index].getMinutes();
            if (mns < 10) {
                mns = '0' + mns;
            }
            template = template.replace(/%HH/, hrs);
            template = template.replace(/%MM/, mns);
            template = template.replace(/%DD/, numToDayFormat[robbingTime[index].getDay()]);

            return template;
        },

        /**
         * Попробовать найти часы для ограбления позже [*]
         * @star
         * @returns {Boolean}
         */
        tryLater: function () {
            if (robbingTime.length > index + 1) {
                index++;

                return true;
            }

            return false;
        }
    };
};
