const {RuleFactory, VisitScheduleBuilder} = require('rules-config/rules');
const moment = require("moment");
const ChildBirthVisit = RuleFactory("901e2f48-2fb8-402b-9073-ee2fac33fce4", "VisitSchedule");
const ChildEnrolment = RuleFactory("1608c2c0-0334-41a6-aab0-5c61ea1eb069", "VisitSchedule");


const schedulePNC1 = (programEncounter, visitSchedule, currentDateTime = new Date()) => {
    const scheduleBuilder = new VisitScheduleBuilder({
        programEncounter,
    });
    const encounterDateTime = currentDateTime;
    visitSchedule.forEach((vs) => scheduleBuilder.add(vs));
    let earliestDate = moment(encounterDateTime).add(1, 'minutes').toDate();
    let maxDate = moment(encounterDateTime).add(48, 'hours').toDate();
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
    let earliestDate = moment(encounterDateTime).add(48, 'hours').toDate();
    let maxDate = moment(encounterDateTime).add(7, 'days').toDate();
    scheduleBuilder.add({
            name: "Child PNC 2",
            encounterType: "Child PNC",
            earliestDate: earliestDate,
            maxDate: maxDate
        }
    ).whenItem(new Date()).lessThan(maxDate);
    return scheduleBuilder.getAllUnique("name");
};


@ChildEnrolment("df647850-916a-47c9-8ba7-309fdb60d85e", "Schedule a birth visit immediately after enrolment", 10.0)
class BirthVisitSchedule {
    static exec(programEnrolment, visitSchedule = []) {
        const scheduleBuilder = new VisitScheduleBuilder({
            programEnrolment,
        });
        const enrolmentDateTime = programEnrolment.enrolmentDateTime || new Date();
        visitSchedule.forEach((vs) => scheduleBuilder.add(vs));
        let earliestDate = moment(enrolmentDateTime).add(1, 'minutes').toDate();
        let maxDate = moment(enrolmentDateTime).add(1, 'days').toDate();
        scheduleBuilder.add({
                name: "Birth",
                encounterType: "Birth",
                earliestDate: earliestDate,
                maxDate: maxDate
            }
        ).whenItem(new Date()).lessThan(maxDate);
        return scheduleBuilder.getAllUnique("name");
    }
}

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

module.exports = {PNC1Visit, PNC2Visit, BirthVisitSchedule};