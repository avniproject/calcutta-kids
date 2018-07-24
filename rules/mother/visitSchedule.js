const {RuleFactory, VisitScheduleBuilder} = require('rules-config/rules');
const _ = require('lodash');
const moment = require("moment");

const EnrolmentRule = RuleFactory("c5b2eb03-7ed3-4fbc-95b7-07412219368f", "VisitSchedule");
const HomeVisitRule = RuleFactory("2a13df4b-6d61-4f11-850d-1ea6d13860df", "VisitSchedule");
const RuleHelper = require('../RuleHelper');

@EnrolmentRule("cb1f2e59-215b-44a6-afdc-d99bddf6face", "MotherPostMotherProgramEnrolmentVisits", 10.0)
class MotherPostEnrolmentVisits {
    static exec(programEnrolment, visitSchedule = []) {
        let scheduleBuilder = RuleHelper.createEnrolmentScheduleBuilder(programEnrolment, visitSchedule);
        let dateOfDelivery = getDateOfDelivery(programEnrolment);
        if (_.isNil(dateOfDelivery)) {
            return RuleHelper.scheduleOneVisit(scheduleBuilder, 'Home visit', 'Mother Home Visit', programEnrolment.enrolmentDateTime, 0);
        } else {
            let earliestDate = moment(dateOfDelivery).add(1, 'months').toDate();
            return RuleHelper.scheduleOneVisit(scheduleBuilder, 'Home visit', 'Mother Home Visit', earliestDate, 21);
        }
    }
}

@HomeVisitRule("aa862394-4b02-4879-b582-ab58683dde06", "MotherPostHomeVisitVisits", 10.0)
class MotherPostHomeVisitVisits {
    static exec({programEnrolment, encounterDateTime}, visitSchedule = []) {
        let scheduleBuilder = RuleHelper.createEnrolmentScheduleBuilder(programEnrolment, visitSchedule);
        let earliestDate = moment(encounterDateTime).add(1, 'months').toDate();
        return RuleHelper.scheduleOneVisit(scheduleBuilder, 'Home visit', 'Mother Home Visit', earliestDate, 21);
    }
}

const getDateOfDelivery = (programEnrolment) => {
    let previousPregnancyEnrolment = programEnrolment.individual.getPreviousEnrolment('Pregnancy', programEnrolment.uuid);
    if (!_.isNil(previousPregnancyEnrolment))
        return previousPregnancyEnrolment.findObservationInEntireEnrolment('Date of delivery');
    return null;
};

module.exports = {MotherPostHomeVisitVisits: MotherPostHomeVisitVisits, MotherPostEnrolmentVisits: MotherPostEnrolmentVisits};