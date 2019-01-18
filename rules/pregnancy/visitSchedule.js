const {RuleFactory} = require('rules-config/rules');
const moment = require("moment");
const RuleHelper = require('../RuleHelper');

const EnrolmentRule = RuleFactory("026e2f5c-8670-4e4b-9a54-cb03bbf3093d", "VisitSchedule");
const ANCHomeVisitRule = RuleFactory("5565a4d1-ef0e-4ff5-bce5-fc4f7d94ce99", "VisitSchedule");
const DeliveryRule = RuleFactory("cc6a3c6a-c3cc-488d-a46c-d9d538fcc9c2", "VisitSchedule");
const PNCRule = RuleFactory("78b1400e-8100-4ba6-b78e-fef580f7fb77", "VisitSchedule");
const AbortionRule = RuleFactory("32428a7e-d553-4172-b697-e8df3bbfb61d", "VisitSchedule");
const PostAbortionRule = RuleFactory("a7ec8c80-edb2-4751-a5ec-498a9e0240a0", "VisitSchedule");
const PostAncGmpRule = RuleFactory("4632c1f5-59cd-4e65-899c-beb2c87a3bff", "VisitSchedule");
const ANCDoctorVisitRule = RuleFactory("3a95e9b0-731a-4714-ae7c-10e1d03cebfe", "VisitSchedule");


@ANCDoctorVisitRule("dedbf481-0456-463f-9ece-b1639ce1c3ad", "ANC Doctor Visits Followup at home", 100.0)
class ANCDoctorVisits {
    static exec(programEncounter, visitSchedule = [], scheduleConfig) {
        let scheduleBuilder = RuleHelper.createProgramEncounterVisitScheduleBuilder(programEncounter, visitSchedule);
        let followupDate = programEncounter.getObservationReadableValue('Followup date');
        if (!_.isNil(followupDate)) {
            RuleHelper.addSchedule(scheduleBuilder, 'ANC Doctor Checkup Followup', 'ANC', followupDate, 3);
        }
        RuleHelper.addSchedule(scheduleBuilder, 'Doctor Visit Followup at Home', 'Doctor Visit Followup at Home', moment(programEncounter.encounterDateTime).add(3, 'days').toDate(), 2);
        return scheduleBuilder.getAllUnique("encounterType");
    }
}


@EnrolmentRule("f94d4f18-9ff6-4f7b-988e-e7956d947bb0", "PregnancyPostPregnancyEnrolmentVisits", 10.0)
class PregnancyPostEnrolmentVisits {
    static exec(programEnrolment, visitSchedule = [], scheduleConfig) {
        let scheduleBuilder = RuleHelper.createEnrolmentScheduleBuilder(programEnrolment, visitSchedule);
        const enrolmentDayOfMonth = moment(programEnrolment.enrolmentDateTime).date();

        const homeVisitEarliestDate = enrolmentDayOfMonth < 22 ? programEnrolment.enrolmentDateTime : RuleHelper.firstOfNextMonth(programEnrolment.enrolmentDateTime);
        const homeVisitNumberOfDaysForMaxOffset = (21 - moment(homeVisitEarliestDate).date());
        RuleHelper.addSchedule(scheduleBuilder, 'ANC Home Visit', 'ANC Home Visit', homeVisitEarliestDate, homeVisitNumberOfDaysForMaxOffset);


        const gmpVisitEarliestDate = enrolmentDayOfMonth < 22 ? moment(RuleHelper.firstOfCurrentMonth(programEnrolment.enrolmentDateTime)).add(21, 'days').toDate() : programEnrolment.enrolmentDateTime;
        const lastDayOfMonth = moment(programEnrolment.enrolmentDateTime).endOf('month').date();
        const gmpVisitNumberOfDaysForMaxOffset = (lastDayOfMonth - moment(gmpVisitEarliestDate).date());
        RuleHelper.addSchedule(scheduleBuilder, 'First ANC GMP', 'ANC GMP', gmpVisitEarliestDate, gmpVisitNumberOfDaysForMaxOffset);

        return scheduleBuilder.getAllUnique("encounterType");
    }
}

@PostAncGmpRule("30eabd2e-9352-41e0-a5bc-988bd83bb7a2", "PregnancyPostAncGmpVisits", 10.0)
class PregnancyPostAncGmpVisits {
    static exec(programEncounter, visitSchedule = [], scheduleConfig) {
        let scheduleBuilder = RuleHelper.createProgramEncounterVisitScheduleBuilder(programEncounter, visitSchedule);
        const firstOfNextMonth = RuleHelper.firstOfNextMonth(programEncounter.getRealEventDate());
        const earliestDate = moment(firstOfNextMonth).add(21, 'days').toDate();
        const lastDayOfMonth = moment(programEncounter.getRealEventDate()).endOf('month').date();
        const numberOfDaysForMaxOffset = (lastDayOfMonth - moment(firstOfNextMonth).date());

        return RuleHelper.scheduleOneVisit(scheduleBuilder, 'ANC GMP', 'ANC GMP', earliestDate, numberOfDaysForMaxOffset);
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
        RuleHelper.addSchedule(scheduleBuilder, 'PNC 1', 'PNC', programEncounter.encounterDateTime, 7);
        return scheduleBuilder.getAllUnique("encounterType");
    }
}

@PNCRule("4775ad43-acbf-42af-9952-2d4b8896cbfc", "PregnancyPostMotherPNCVisits", 11.0)
class PregnancyPostPNCVisits {
    static exec(programEncounter, visitSchedule = []) {
        let scheduleBuilder = RuleHelper.createProgramEncounterVisitScheduleBuilder(programEncounter, visitSchedule);
        if (programEncounter.name === 'PNC 1') {
            return RuleHelper.scheduleOneVisit(scheduleBuilder, 'PNC 2', 'PNC', moment(programEncounter.encounterDateTime).add(7, 'days').toDate(), 7);
        }
        return visitSchedule;
    }
}

@AbortionRule("419b7eee-371d-4f2e-ae5d-f495ba1bf82a", "PregnancyPostAbortionVisits", 10.0)
class PregnancyPostAbortionVisits {
    static exec(programEncounter, visitSchedule = []) {
        let scheduleBuilder = RuleHelper.createProgramEncounterVisitScheduleBuilder(programEncounter, visitSchedule);
        return RuleHelper.scheduleOneVisit(scheduleBuilder, 'First post abortion home visit', 'Post abortion home visit', programEncounter.encounterDateTime, 7);
    }
}

@PostAbortionRule("9f834276-b63a-4e84-aa5b-d883dc529662", "PregnancyPostPostAbortionVisits", 10.0)
class PregnancyPostPostAbortionVisits {
    static exec(programEncounter, visitSchedule = []) {
        let scheduleBuilder = RuleHelper.createProgramEncounterVisitScheduleBuilder(programEncounter, visitSchedule);
        let numberOfPostAbortionEncounters = programEncounter.programEnrolment.numberOfEncountersOfType('Post abortion home visit');
        if (numberOfPostAbortionEncounters < 3) {
            let earliestDateTime = numberOfPostAbortionEncounters > 1 ? moment(programEncounter.getRealEventDate()).add(14, 'days').toDate() : programEncounter.getRealEventDate();
            let name = numberOfPostAbortionEncounters > 1 ? 'Third post abortion home visit' : 'Second post abortion home visit';
            return RuleHelper.scheduleOneVisit(scheduleBuilder, name, 'Post abortion home visit', earliestDateTime, 7);
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
    PregnancyPostAncGmpVisits: PregnancyPostAncGmpVisits,
    ANCDoctorVisits: ANCDoctorVisits,
};