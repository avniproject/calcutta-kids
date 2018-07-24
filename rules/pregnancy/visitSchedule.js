const {RuleFactory, VisitScheduleBuilder} = require('rules-config/rules');
const moment = require("moment");
const RuleHelper = require('../RuleHelper');

const EnrolmentRule = RuleFactory("026e2f5c-8670-4e4b-9a54-cb03bbf3093d", "VisitSchedule");
const ANCHomeVisitRule = RuleFactory("5565a4d1-ef0e-4ff5-bce5-fc4f7d94ce99", "VisitSchedule");
const DeliveryRule = RuleFactory("cc6a3c6a-c3cc-488d-a46c-d9d538fcc9c2", "VisitSchedule");
const PNCRule = RuleFactory("78b1400e-8100-4ba6-b78e-fef580f7fb77", "VisitSchedule");

@EnrolmentRule("f94d4f18-9ff6-4f7b-988e-e7956d947bb0", "PregnancyPostPregnancyEnrolmentVisits", 10.0)
class PregnancyPostEnrolmentVisits {
    static exec(programEnrolment, visitSchedule = [], scheduleConfig) {
        let scheduleBuilder = RuleHelper.createEnrolmentScheduleBuilder(programEnrolment, visitSchedule);
        let earliestDate = firstOfNextMonth(programEnrolment.enrolmentDateTime);
        return RuleHelper.scheduleOneVisit(scheduleBuilder, 'ANC Home Visit', 'ANC Home Visit', earliestDate, 21);
    }
}

@ANCHomeVisitRule("a6540db8-d8d1-4e50-96ce-5c4f80561520", "PregnancyPostANCHomeVisitVisits", 10.0)
class PregnancyPostANCHomeVisitVisits {
    static exec(programEncounter, visitSchedule = []) {
        let scheduleBuilder = RuleHelper.createProgramEncounterVisitScheduleBuilder(programEncounter, visitSchedule);
        let earliestDate = firstOfNextMonth(programEncounter.encounterDateTime);
        return RuleHelper.scheduleOneVisit(scheduleBuilder, 'ANC Home Visit', 'ANC Home Visit', earliestDate, 21);
    }
}

@DeliveryRule("1a3f01f8-792f-4615-acb0-5fc61f4b5198", "PregnancyPostDeliveryVisits", 10.0)
class PregnancyPostDeliveryVisits {
    static exec(programEncounter, visitSchedule = []) {
        // Check whether PNC visit has already happened, in case PNC form was filled before the delivery form
        if (programEncounter.programEnrolment.hasEncounterOfType('PNC')) return visitSchedule;

        let scheduleBuilder = RuleHelper.createProgramEncounterVisitScheduleBuilder(programEncounter, visitSchedule);
        return RuleHelper.scheduleOneVisit(scheduleBuilder, 'PNC 1', 'PNC', programEncounter.encounterDateTime, 0);
    }
}

@PNCRule("4775ad43-acbf-42af-9952-2d4b8896cbfc", "PregnancyPostMotherPNCVisits", 11.0)
class PregnancyPostPNCVisits {
    static exec(programEncounter, visitSchedule = []) {
        let scheduleBuilder = RuleHelper.createProgramEncounterVisitScheduleBuilder(programEncounter, visitSchedule);
        let dateOfDelivery = programEncounter.findObservationInEntireEnrolment("Date of delivery");
        if (_.isNil(dateOfDelivery) && programEncounter.name === 'PNC 1') {
            return RuleHelper.scheduleOneVisit(scheduleBuilder, 'PNC 2', 'PNC', programEncounter.encounterDateTime, 5);
        } else if (programEncounter.name === 'PNC 1') {
            return RuleHelper.scheduleOneVisit(scheduleBuilder, 'PNC 2', 'PNC', moment(dateOfDelivery).add(7, 'days').toDate(), 3);
        } else {
            return visitSchedule;
        }
    }
}

let firstOfNextMonth = function (realEventDate) {
    const currentDate = moment(realEventDate).date();
    const month = currentDate > 21 ? moment(realEventDate).month() + 1 : moment(realEventDate).month();
    return moment(realEventDate).month(month).date(1).toDate();
};

module.exports = {PregnancyPostEnrolmentVisits: PregnancyPostEnrolmentVisits, PregnancyPostANCHomeVisitVisits: PregnancyPostANCHomeVisitVisits, PregnancyPostDeliveryVisits: PregnancyPostDeliveryVisits, PregnancyPostPNCVisits: PregnancyPostPNCVisits};