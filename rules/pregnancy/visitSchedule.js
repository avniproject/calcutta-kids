const {RuleFactory, VisitScheduleBuilder} = require('rules-config/rules');
const moment = require("moment");
const RuleHelper = require('../RuleHelper');

const EnrolmentRule = RuleFactory("026e2f5c-8670-4e4b-9a54-cb03bbf3093d", "VisitSchedule");
const ANCHomeVisitRule = RuleFactory("5565a4d1-ef0e-4ff5-bce5-fc4f7d94ce99", "VisitSchedule");
const DeliveryRule = RuleFactory("cc6a3c6a-c3cc-488d-a46c-d9d538fcc9c2", "VisitSchedule");
const PNCRule = RuleFactory("78b1400e-8100-4ba6-b78e-fef580f7fb77", "VisitSchedule");
const AbortionRule = RuleFactory("32428a7e-d553-4172-b697-e8df3bbfb61d", "VisitSchedule");
const PostAbortionRule = RuleFactory("a7ec8c80-edb2-4751-a5ec-498a9e0240a0", "VisitSchedule");
const PostAncGmpRule = RuleFactory("4632c1f5-59cd-4e65-899c-beb2c87a3bff", "VisitSchedule");

@EnrolmentRule("f94d4f18-9ff6-4f7b-988e-e7956d947bb0", "PregnancyPostPregnancyEnrolmentVisits", 10.0)
class PregnancyPostEnrolmentVisits {
    static exec(programEnrolment, visitSchedule = [], scheduleConfig) {
        let scheduleBuilder = RuleHelper.createEnrolmentScheduleBuilder(programEnrolment, visitSchedule);
        let earliestDate = RuleHelper.firstOfNextMonth(programEnrolment.enrolmentDateTime);
        RuleHelper.addSchedule(scheduleBuilder, 'ANC Home Visit', 'ANC Home Visit', earliestDate, 21);
        RuleHelper.addSchedule(scheduleBuilder, 'First ANC GMP', 'ANC GMP', moment(earliestDate).add(21, 'days').toDate(), 9);
        return scheduleBuilder.getAllUnique("encounterType");
    }
}

@PostAncGmpRule("30eabd2e-9352-41e0-a5bc-988bd83bb7a2", "PregnancyPostAncGmpVisits", 10.0)
class PregnancyPostAncGmpVisits {
    static exec(programEncounter, visitSchedule = [], scheduleConfig) {
        let scheduleBuilder = RuleHelper.createProgramEncounterVisitScheduleBuilder(programEncounter, visitSchedule);
        let earliestDate = RuleHelper.firstOfNextMonth(programEncounter.getRealEventDate());
        return RuleHelper.scheduleOneVisit(scheduleBuilder, 'ANC GMP', 'ANC GMP', moment(earliestDate).add(21, 'days').toDate(), 9);
    }
}

@ANCHomeVisitRule("a6540db8-d8d1-4e50-96ce-5c4f80561520", "PregnancyPostANCHomeVisitVisits", 10.0)
class PregnancyPostANCHomeVisitVisits {
    static exec(programEncounter, visitSchedule = []) {
        let scheduleBuilder = RuleHelper.createProgramEncounterVisitScheduleBuilder(programEncounter, visitSchedule);
        let earliestDate = RuleHelper.firstOfNextMonth(programEncounter.getRealEventDate());
        return RuleHelper.scheduleOneVisit(scheduleBuilder, 'ANC Home Visit', 'ANC Home Visit', earliestDate, 21);
    }
}

@DeliveryRule("1a3f01f8-792f-4615-acb0-5fc61f4b5198", "PregnancyPostDeliveryVisits", 10.0)
class PregnancyPostDeliveryVisits {
    static exec(programEncounter, visitSchedule = []) {
        // Check whether PNC visit has already happened, in case PNC form was filled before the delivery form
        if (programEncounter.programEnrolment.hasEncounterOfType('PNC')) return visitSchedule;

        let scheduleBuilder = RuleHelper.createProgramEncounterVisitScheduleBuilder(programEncounter, visitSchedule);
        RuleHelper.addSchedule(scheduleBuilder, 'PNC 1', 'PNC', programEncounter.encounterDateTime, 1);
        return scheduleBuilder.getAllUnique("encounterType");
    }
}

@PNCRule("4775ad43-acbf-42af-9952-2d4b8896cbfc", "PregnancyPostMotherPNCVisits", 11.0)
    class PregnancyPostPNCVisits {
    static exec(programEncounter, visitSchedule = []) {
        let scheduleBuilder = RuleHelper.createProgramEncounterVisitScheduleBuilder(programEncounter, visitSchedule);
        let deliveryDateAsOfDate = programEncounter.programEnrolment.findObservationValueInEntireEnrolment("Date of delivery",false);
        if (_.isNil(deliveryDateAsOfDate) && programEncounter.name === 'PNC 1') {
            return RuleHelper.scheduleOneVisit(scheduleBuilder, 'PNC 2', 'PNC', programEncounter.encounterDateTime, 5);
        } else if (programEncounter.name === 'PNC 1') {
            return RuleHelper.scheduleOneVisit(scheduleBuilder, 'PNC 2', 'PNC', moment(deliveryDateAsOfDate.value).add(7, 'days').toDate(), 8);
        } else {
            return visitSchedule;
        }
    }
}

@AbortionRule("419b7eee-371d-4f2e-ae5d-f495ba1bf82a", "PregnancyPostAbortionVisits", 10.0)
class PregnancyPostAbortionVisits {
    static exec(programEncounter, visitSchedule = []) {
        let scheduleBuilder = RuleHelper.createProgramEncounterVisitScheduleBuilder(programEncounter, visitSchedule);
        let dateOfAbortion = programEncounter.getObservationValue('Date of abortion');
        return RuleHelper.scheduleOneVisit(scheduleBuilder, 'First post abortion home visit', 'Post abortion home visit', dateOfAbortion, 7);
    }
}

@PostAbortionRule("9f834276-b63a-4e84-aa5b-d883dc529662", "PregnancyPostPostAbortionVisits", 10.0)
class PregnancyPostPostAbortionVisits {
    static exec(programEncounter, visitSchedule = []) {
        let scheduleBuilder = RuleHelper.createProgramEncounterVisitScheduleBuilder(programEncounter, visitSchedule);
        let numberOfPostAbortionEncounters = programEncounter.programEnrolment.numberOfEncountersOfType('Post abortion home visit');
        if (numberOfPostAbortionEncounters < 3) {
            let gap = numberOfPostAbortionEncounters > 1 ? 14 : 7;
            return RuleHelper.scheduleOneVisit(scheduleBuilder, 'Post abortion home visit', 'Post abortion home visit', moment(programEncounter.encounterDateTime).add(gap, 'days').toDate(), 7);
        }
        return visitSchedule;
    }
}

module.exports = {
    PregnancyPostEnrolmentVisits: PregnancyPostEnrolmentVisits,
    PregnancyPostANCHomeVisitVisits: PregnancyPostANCHomeVisitVisits,
    PregnancyPostDeliveryVisits: PregnancyPostDeliveryVisits,
    PregnancyPostPNCVisits: PregnancyPostPNCVisits,
    PregnancyPostAbortionVisits: PregnancyPostAbortionVisits,
    PregnancyPostPostAbortionVisits: PregnancyPostPostAbortionVisits,
    PregnancyPostAncGmpVisits: PregnancyPostAncGmpVisits
};