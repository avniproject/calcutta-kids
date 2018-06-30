const {RuleFactory, VisitScheduleBuilder} = require('rules-config/rules');
const moment = require("moment");
const ChildBirthVisit = RuleFactory("901e2f48-2fb8-402b-9073-ee2fac33fce4", "VisitSchedule");

const schedulePNC1 = (programEncounter, visitSchedule, currentDateTime = new Date()) => {
    const scheduleBuilder = new VisitScheduleBuilder({
        programEncounter,
    });
    const encounterDateTime = currentDateTime;
    visitSchedule.forEach((vs) => scheduleBuilder.add(vs));
    let earliestDate = moment(encounterDateTime).hours(1).toDate();
    let maxDate = moment(encounterDateTime).hours(48).toDate();
    scheduleBuilder.add({
            name: "Child PNC 1",
            encounterType: "Child PNC",
            earliestDate: earliestDate,
            maxDate: maxDate
        }
    ).whenItem(new Date()).lessThan(maxDate);
    return scheduleBuilder.getAllUnique("name");
};

const schedulePNC2 = (programEncounter, visitSchedule, currentDateTime = new Date()) => {
    const scheduleBuilder = new VisitScheduleBuilder({
        programEncounter,
    });
    const encounterDateTime = currentDateTime;
    visitSchedule.forEach((vs) => scheduleBuilder.add(vs));
    let earliestDate = moment(encounterDateTime).hours(48).toDate();
    let maxDate = moment(encounterDateTime).days(7).toDate();
    scheduleBuilder.add({
            name: "Child PNC 2",
            encounterType: "Child PNC",
            earliestDate: earliestDate,
            maxDate: maxDate
        }
    ).whenItem(new Date()).lessThan(maxDate);
    return scheduleBuilder.getAllUnique("name");
};


@ChildBirthVisit("f94d4f18-9ff6-4f7b-988e-e7956d947bb0", "Child Birth Visit Schedule - PNC1", 10.0)
class PNC1Visit {
    static exec(programEncounter, visitSchedule = [], scheduleConfig) {
        return schedulePNC1(programEncounter, visitSchedule, programEncounter.encounterDateTime);
    }
}

@ChildBirthVisit("1c36c3d9-4ded-48a9-9c58-c0985d9ae6f2", "Child Birth Visit Schedule - PNC2", 11.0)
class PNC2Visit {
    static exec(programEncounter, visitSchedule = [], scheduleConfig) {
        return schedulePNC2(programEncounter, visitSchedule, programEncounter.encounterDateTime);
    }
}

module.exports = {PNC1Visit, PNC2Visit};