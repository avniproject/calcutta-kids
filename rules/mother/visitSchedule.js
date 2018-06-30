const {RuleFactory, VisitScheduleBuilder} = require('rules-config/rules');
const moment = require("moment");

const MotherProgramEnrolment = RuleFactory("c5b2eb03-7ed3-4fbc-95b7-07412219368f", "VisitSchedule");
const MotherHomeVisit = RuleFactory("2a13df4b-6d61-4f11-850d-1ea6d13860df", "VisitSchedule");


const scheduleHomeVisit = (programEnrolment, visitSchedule, currentDateTime = new Date()) => {
    const scheduleBuilder = new VisitScheduleBuilder({
        programEnrolment,
    });
    const encounterDateTime = currentDateTime;
    visitSchedule.forEach((vs) => scheduleBuilder.add(vs));
    let currentDateMoment = moment(encounterDateTime);
    let earliestDate = currentDateMoment.month(currentDateMoment.month() + 1).date(1).toDate();
    let maxDate = moment(earliestDate).add(21, 'days').toDate();
    scheduleBuilder.add({
            name: "Home Visit",
            encounterType: "Mother Home Visit",
            earliestDate: earliestDate,
            maxDate: maxDate
        }
    );
    return scheduleBuilder.getAllUnique("encounterType");
};

@MotherProgramEnrolment("cb1f2e59-215b-44a6-afdc-d99bddf6face", "Mother Home visit on enrolment", 10.0)
class MotherProgramEnrolmentHomeVisit {
    static exec(programEnrolment, visitSchedule = []) {
        return scheduleHomeVisit(programEnrolment, visitSchedule, programEnrolment.enrolmentDateTime);
    }
}

@MotherHomeVisit("aa862394-4b02-4879-b582-ab58683dde06", "Recurring Home Visit", 10.0)
class MotherRecurringHomeVisit {
    static exec({programEnrolment, encounterDateTime}, visitSchedule = []) {
        return scheduleHomeVisit(programEnrolment, visitSchedule, encounterDateTime);
    }
}

module.exports = {MotherRecurringHomeVisit, MotherProgramEnrolmentHomeVisit};