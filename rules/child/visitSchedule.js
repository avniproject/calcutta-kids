const {RuleFactory} = require('rules-config/rules');
const moment = require("moment");
const EnrolmentRule = RuleFactory("1608c2c0-0334-41a6-aab0-5c61ea1eb069", "VisitSchedule");
const PNCRule = RuleFactory("e09dddeb-ed72-40c4-ae8d-112d8893f18b", "VisitSchedule");
const HomeVisitRule = RuleFactory("35aa9007-fe7a-4a59-b985-0a1c038df889", "VisitSchedule");
const HomeVisitCancelRule = RuleFactory("", "VisitSchedule");
const RuleHelper = require('../RuleHelper');
import lib from '../lib';

@EnrolmentRule("0bdfd933-1ba5-4fc1-989f-b4226ae010bd", "ChildPostChildEnrolmentVisits", 10.0)
class ChildPostChildEnrolmentVisits {
    static exec(programEnrolment, visitSchedule = []) {
        let scheduleBuilder = RuleHelper.createEnrolmentScheduleBuilder(programEnrolment, visitSchedule);
        RuleHelper.addSchedule(scheduleBuilder, 'Birth form', 'Birth', programEnrolment.enrolmentDateTime, 0);
        if (moment(programEnrolment.individual.dateOfBirth).add(2, 'days').isSameOrBefore(programEnrolment.enrolmentDateTime) && !moment(programEnrolment.individual.dateOfBirth).add(10, 'days').isBefore(programEnrolment.enrolmentDateTime))
            RuleHelper.addSchedule(scheduleBuilder, 'Child PNC 1', 'Child PNC', programEnrolment.enrolmentDateTime, 10);
        else if (moment(programEnrolment.individual.dateOfBirth).add(10, 'days').isSameOrBefore(programEnrolment.enrolmentDateTime) && !moment(programEnrolment.individual.dateOfBirth).add(42, 'days').isBefore(programEnrolment.enrolmentDateTime))
            RuleHelper.addSchedule(scheduleBuilder, 'Child PNC 2', 'Child PNC', programEnrolment.enrolmentDateTime, 32);
        lib.log(JSON.stringify(visitSchedule));
        return scheduleBuilder.getAllUnique("encounterType");
    }
}

@PNCRule("2f21603a-0bdb-4732-b8fb-cb0bb58cbdc1", "ChildPostPNCVisits", 10.0)
class ChildPostPNCVisits {
    static exec(programEncounter, visitSchedule = [], scheduleConfig) {
        let scheduleBuilder = RuleHelper.createProgramEncounterVisitScheduleBuilder(programEncounter, visitSchedule);
        if (programEncounter.name === 'Child PNC 2') {
            let earliestDate = RuleHelper.firstOfNextMonth(programEncounter.programEnrolment.individual.dateOfBirth);
            return RuleHelper.scheduleOneVisit(scheduleBuilder, 'Child Home Visit - ' + visitNameSuffix(programEncounter.programEnrolment.individual, earliestDate), 'Child Home Visit', earliestDate, 21);
        } else if (programEncounter.name === 'Child PNC 1') {
            return RuleHelper.scheduleOneVisit(scheduleBuilder, 'Child PNC 2', 'Child PNC', moment(programEncounter.programEnrolment.individual.dateOfBirth).add(7, 'days').toDate(), 3);
        } else {
            return visitSchedule;
        }
    }
}

@HomeVisitRule('702f6b57-f46b-47cb-a413-7e609468402e', 'ChildPostHomeVisitVisits', 10.0)
class ChildPostHomeVisitVisits {
    static exec(programEncounter, visitSchedule = []) {
        let scheduleBuilder = RuleHelper.createProgramEncounterVisitScheduleBuilder(programEncounter, visitSchedule);
        let earliestDate = RuleHelper.firstOfNextMonth(programEncounter.getRealEventDate());
        return RuleHelper.scheduleOneVisit(scheduleBuilder, 'Child Home Visit - ' + visitNameSuffix(programEncounter.programEnrolment.individual, earliestDate), 'Child Home Visit', earliestDate, 21);
    }
}

const visitNameSuffix = (individual, earliestDate) => {
    let ageInMonths = individual.getAgeInMonths(earliestDate);
    return ageInMonths <= 3 ? 'age less than 3 months' : ageInMonths <= 6 ? 'age between 3-6 months' : 'age greater than 6 months';
};

module.exports = {
    ChildPostChildEnrolmentVisits: ChildPostChildEnrolmentVisits,
    ChildPostPNCVisits: ChildPostPNCVisits,
    ChildPostHomeVisitVisits: ChildPostHomeVisitVisits
};