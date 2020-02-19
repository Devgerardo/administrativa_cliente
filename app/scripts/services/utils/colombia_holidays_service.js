'use strict';


angular.module('colombiaHolidaysService', [])
    .factory('colombiaHolidaysService', function (){
        return {
            validarFecha: function (date) {

                if (date.getDay() === 0 || date.getDay() === 6) {
                    return false;
                }
                var myHolidays = holidays.getColombiaHolidaysByYear(date.getFullYear());
                var strDate = date.toJSON().split('T')[0];
                for (var i = 0; i < myHolidays.length; i++) {
                    if (myHolidays[i].holiday === strDate) {
                        return false;
                    }
                }
                return true;
            }
        };
    });