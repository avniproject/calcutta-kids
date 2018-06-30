const {RuleFactory, VisitScheduleBuilder} = require('rules-config/rules');
const moment = require("moment");
const MotherEnrolmentVisit = RuleFactory("026e2f5c-8670-4e4b-9a54-cb03bbf3093d", "VisitSchedule");
const ANCHomeVisitSchedule = RuleFactory("5565a4d1-ef0e-4ff5-bce5-fc4f7d94ce99", "VisitSchedule");

const scheduleANCHomeVisit = (programEnrolment, visitSchedule, currentDateTime = new Date()) => {
    const scheduleBuilder = new VisitScheduleBuilder({
        programEnrolment: programEnrolment
    });
    const encounterDateTime = currentDateTime;
    visitSchedule.forEach((vs) => scheduleBuilder.add(vs));
    const currentDate = moment(encounterDateTime).date();
    const month = currentDate > 21 ? moment(encounterDateTime).month() + 1 : moment(encounterDateTime).month();
    let earliestDate = moment(encounterDateTime).month(month).date(1).toDate();
    let maxDate = moment(encounterDateTime).month(month).date(21).toDate();
    scheduleBuilder.add({
            name: "ANC Home Visit",
            encounterType: "ANC Home Visit",
            earliestDate: earliestDate,
            maxDate: maxDate
        }
    ).when.valueInEntireEnrolment("Estimated Date of Delivery").greaterThan(earliestDate);
    return scheduleBuilder.getAllUnique("encounterType");
};


@MotherEnrolmentVisit("f94d4f18-9ff6-4f7b-988e-e7956d947bb0", "ANC Home Visit", 10.0)
class ANCHomeVisit {
    static exec(programEnrolment, visitSchedule = [], scheduleConfig) {
        return scheduleANCHomeVisit(programEnrolment, visitSchedule, programEnrolment.enrolmentDateTime);
    }
}

@ANCHomeVisitSchedule("a6540db8-d8d1-4e50-96ce-5c4f80561520", "ANC Home Visit Recurring", 10.0)
class ANCHomeVisitRecurring {
    static exec({programEnrolment, encounterDateTime}, visitSchedule = [], scheduleConfig) {
        return scheduleANCHomeVisit(programEnrolment, visitSchedule, encounterDateTime);
    }
}

module.exports = {ANCHomeVisit, ANCHomeVisitRecurring};