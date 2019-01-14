const {RuleFactory} = require('rules-config/rules');
const _ = require('lodash');
const moment = require("moment");

const EnrolmentRule = RuleFactory("c5b2eb03-7ed3-4fbc-95b7-07412219368f", "VisitSchedule");
const HomeVisitRule = RuleFactory("2a13df4b-6d61-4f11-850d-1ea6d13860df", "VisitSchedule");
const RuleHelper = require('../RuleHelper');

@EnrolmentRule("cb1f2e59-215b-44a6-afdc-d99bddf6face", "MotherPostMotherProgramEnrolmentVisits", 10.0)
class MotherPostEnrolmentVisits {
    static exec(programEnrolment, visitSchedule = []) {
        let scheduleBuilder = RuleHelper.createEnrolmentScheduleBuilder(programEnrolment, visitSchedule);
        const enrolmentDayOfMonth = moment(programEnrolment.enrolmentDateTime).date();
        const homeVisitEarliestDate = enrolmentDayOfMonth < 22 ? programEnrolment.enrolmentDateTime : RuleHelper.firstOfNextMonth(programEnrolment.enrolmentDateTime);
        const homeVisitNumberOfDaysForMaxOffset = (21 - moment(homeVisitEarliestDate).date());
        return RuleHelper.scheduleOneVisit(scheduleBuilder, 'Home Visit - ' + visitNameSuffix(programEnrolment.individual, homeVisitEarliestDate), 'Mother Home Visit', homeVisitEarliestDate, homeVisitNumberOfDaysForMaxOffset);
    }
}

const visitNameSuffix = (individual, earliestDate) => {
    let ageOfYoungestChildInMonths = RuleHelper.getAgeOfYoungestChildInMonths(individual, earliestDate);
    return ageOfYoungestChildInMonths <= 3 ? 'Child younger than 3 months' : ageOfYoungestChildInMonths <= 6 ? 'Child between 3-6 months' : 'Child older than 6 months';
};

@HomeVisitRule("aa862394-4b02-4879-b582-ab58683dde06", "MotherPostHomeVisitVisits", 10.0)
class MotherPostHomeVisitVisits {
    static exec(programEncounter, visitSchedule = []) {
        let scheduleBuilder = RuleHelper.createProgramEncounterVisitScheduleBuilder(programEncounter, visitSchedule);
        return RuleHelper.scheduleOneVisit(scheduleBuilder, 'Home Visit' + visitNameSuffix(programEncounter.programEnrolment.individual, programEncounter.getRealEventDate()), 'Mother Home Visit', RuleHelper.firstOfNextMonth(programEncounter.getRealEventDate()), 21);
    }
}

module.exports = {MotherPostHomeVisitVisits: MotherPostHomeVisitVisits, MotherPostEnrolmentVisits: MotherPostEnrolmentVisits};