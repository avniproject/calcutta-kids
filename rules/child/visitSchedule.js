const {RuleFactory, VisitScheduleBuilder} = require('rules-config/rules');
const moment = require("moment");
const ChildEnrolmentVisit = RuleFactory("1608c2c0-0334-41a6-aab0-5c61ea1eb069", "VisitSchedule");

const schedulePNC1 = (programEnrolment, visitSchedule, currentDateTime = new Date()) => {
    const scheduleBuilder = new VisitScheduleBuilder({
        programEnrolment: programEnrolment
    });
    const encounterDateTime = currentDateTime;
    visitSchedule.forEach((vs) => scheduleBuilder.add(vs));
    let earliestDate = encounterDateTime;
    let maxDate = moment(encounterDateTime).hours(48).toDate();
    scheduleBuilder.add({
            name: "Child PNC 1",
            encounterType: "Child PNC",
            earliestDate: earliestDate,
            maxDate: maxDate
        }
    );
    return scheduleBuilder.getAllUnique("encounterType");
};


@ChildEnrolmentVisit("f94d4f18-9ff6-4f7b-988e-e7956d947bb0", "ANC Home Visit", 10.0)
class PNC1Visit {
    static exec(programEnrolment, visitSchedule = [], scheduleConfig) {
        return schedulePNC1(programEnrolment, visitSchedule, programEnrolment.enrolmentDateTime);
    }
}

module.exports = {PNC1Visit};