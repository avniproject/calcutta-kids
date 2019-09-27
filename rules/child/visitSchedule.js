const {RuleFactory} = require('rules-config/rules');
const moment = require("moment");
const EnrolmentRule = RuleFactory("1608c2c0-0334-41a6-aab0-5c61ea1eb069", "VisitSchedule");
const PNCRule = RuleFactory("e09dddeb-ed72-40c4-ae8d-112d8893f18b", "VisitSchedule");
const GMPRule = RuleFactory("d062907a-690c-44ca-b699-f8b2f688b075", "VisitSchedule");
const HomeVisitRule = RuleFactory("35aa9007-fe7a-4a59-b985-0a1c038df889", "VisitSchedule");
const PostBirthVisitRule = RuleFactory("901e2f48-2fb8-402b-9073-ee2fac33fce4", "VisitSchedule");
const RuleHelper = require('../RuleHelper');
import lib from '../lib';

@EnrolmentRule("0bdfd933-1ba5-4fc1-989f-b4226ae010bd", "ChildPostChildEnrolmentVisits", 10.0)
class ChildPostChildEnrolmentVisits {
    static exec(programEnrolment, visitSchedule = []) {
        let scheduleBuilder = RuleHelper.createEnrolmentScheduleBuilder(programEnrolment, visitSchedule);

        if (!programEnrolment.hasEncounterOfType('Birth')){
            RuleHelper.addSchedule(scheduleBuilder, 'Birth form', 'Birth', programEnrolment.enrolmentDateTime, 0);
        }

        const enrolmentDayOfMonth = moment(programEnrolment.enrolmentDateTime).date();

        //TODO this type of code everywhere can be extracted into a RuleHelper method that takes a date range in which to schedule a visit
        const homeVisitEarliestDate = enrolmentDayOfMonth < 22 ? programEnrolment.enrolmentDateTime : RuleHelper.firstOfNextMonth(programEnrolment.enrolmentDateTime);
        const homeVisitNumberOfDaysForMaxOffset = (21 - moment(homeVisitEarliestDate).date());
        RuleHelper.addSchedule(scheduleBuilder, 'Child Home Visit - ' + visitNameSuffix(programEnrolment.individual, homeVisitEarliestDate), 'Child Home Visit', homeVisitEarliestDate, homeVisitNumberOfDaysForMaxOffset);

        const earliestDate = enrolmentDayOfMonth < 22 ? moment(RuleHelper.firstOfCurrentMonth(programEnrolment.enrolmentDateTime)).add(21, 'days').toDate() : programEnrolment.enrolmentDateTime;
        const lastDayOfMonth = moment(programEnrolment.enrolmentDateTime).endOf('month').date();
        const numberOfDaysForMaxOffset = (lastDayOfMonth - moment(earliestDate).date());
        RuleHelper.addSchedule(scheduleBuilder, 'Child GMP', 'Anthropometry Assessment', earliestDate, numberOfDaysForMaxOffset);
        lib.log(JSON.stringify(visitSchedule));
        return scheduleBuilder.getAllUnique("encounterType");
    }
}

@PostBirthVisitRule("736afb5a-a092-4a46-b507-c6d3b7b74bb4", "ChildPostBirthVisits", 10.0)
class ChildPostBirthVisitsCK {
    static exec(programEncounter, visitSchedule = [], scheduleConfig) {
        let scheduleBuilder = RuleHelper.createProgramEncounterVisitScheduleBuilder(programEncounter, visitSchedule);
        RuleHelper.addSchedule(scheduleBuilder, 'Child PNC 1', 'Child PNC', programEncounter.encounterDateTime, 7);
        return scheduleBuilder.getAllUnique("encounterType");
    }
}

@PNCRule("2f21603a-0bdb-4732-b8fb-cb0bb58cbdc1", "ChildPostPNCVisits", 10.0)
class ChildPostPNCVisits {
    static exec(programEncounter, visitSchedule = [], scheduleConfig) {
        let scheduleBuilder = RuleHelper.createProgramEncounterVisitScheduleBuilder(programEncounter, visitSchedule);
        if (programEncounter.name === 'Child PNC 1') {
            return RuleHelper.scheduleOneVisit(scheduleBuilder, 'Child PNC 2', 'Child PNC', moment(programEncounter.encounterDateTime).add(7, 'days').toDate(), 7);
        } else {
            return visitSchedule;
        }
    }
}

@GMPRule("7a2b9abf-3a53-477d-8625-61a778a2c0af", "Child GMP Monthly", 10.0)
class ChildGMPMonthly {
    static exec(programEncounter, visitSchedule = [], scheduleConfig) {
        let scheduleBuilder = RuleHelper.createProgramEncounterVisitScheduleBuilder(programEncounter, visitSchedule);
        let firstOfNextMonth = RuleHelper.firstOfNextMonth(programEncounter.getRealEventDate());
        let earliestDate = moment(firstOfNextMonth).add(21, 'days').toDate();

        const lastDayOfMonth = moment(programEncounter.getRealEventDate()).endOf('month').date();
        const numberOfDaysForMaxOffset = (lastDayOfMonth - moment(firstOfNextMonth).date());


        RuleHelper.addSchedule(scheduleBuilder, 'Child GMP', 'Anthropometry Assessment', earliestDate, numberOfDaysForMaxOffset);
        return scheduleBuilder.getAllUnique("encounterType");
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
    ChildPostHomeVisitVisits: ChildPostHomeVisitVisits,
    ChildGMPMonthly: ChildGMPMonthly,
    ChildPostBirthVisitsCK: ChildPostBirthVisitsCK
};