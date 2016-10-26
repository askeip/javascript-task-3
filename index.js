'use strict';

var robbery = require('./robbery');

var gangSchedule = {
    Danny: [
        { from: 'ПН 00:00+5', to: 'ПН 23:59+5' },
        { from: 'ВТ 00:00+5', to: 'СР 01:00+5' },
        { from: 'СР 02:00+5', to: 'СР 23:29+5' }
    ],
    Rusty: [
        { from: 'ПН 00:00+5', to: 'ПН 23:59+5' },
        { from: 'ВТ 00:00+5', to: 'СР 01:00+5' },
        { from: 'СР 02:00+5', to: 'СР 23:29+5' }
    ],
    Linus: [
        { from: 'ПН 00:00+5', to: 'ПН 23:59+5' },
        { from: 'ВТ 00:00+5', to: 'СР 01:00+5' },
        { from: 'СР 02:00+5', to: 'СР 23:29+5' }
    ]
};

var bankWorkingHours = {
    from: '00:00+5',
    to: '23:59+5'
};

// Время не существует
var longMoment = robbery.getAppropriateMoment(gangSchedule, 121, bankWorkingHours);

// Выведется false и ""
console.info(longMoment.exists());
console.info(longMoment.format('Метим на %DD, старт в %HH:%MM!'));

// Время существует
var moment = robbery.getAppropriateMoment(gangSchedule, 30, bankWorkingHours);

// Выведется true и "Метим на ВТ, старт в 11:30!"
console.info(moment.exists());
console.info(moment.format('Метим на %DD, старт в %HH:%MM!'));

if (robbery.isStar) {
    // Вернет true
    moment.tryLater();
    // "ВТ 16:00"
    console.info(moment.format('%DD %HH:%MM'));

    // Вернет true
    moment.tryLater();
    // "ВТ 16:30"
    console.info(moment.format('%DD %HH:%MM'));

    // Вернет true
    moment.tryLater();
    // "СР 10:00"
    console.info(moment.format('%DD %HH:%MM'));

    // Вернет false
    moment.tryLater();
    // "СР 10:00"
    console.info(moment.format('%DD %HH:%MM'));
}
