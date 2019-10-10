const {RuleFactory} = require('rules-config/rules');
const moment = require("moment");
const RuleHelper = require('../RuleHelper');

const DoctorVisitRule = RuleFactory("b80646b2-b74e-415f-974c-f8f48d67b27e", "VisitSchedule");

@DoctorVisitRule("55afa1bf-3c06-4a33-addf-19fa7b5a95a7", "GeneralPostDoctorVisitVisits", 10.0)
class GeneralPostDoctorVisitVisits {
    static exec(programEncounter, visitSchedule = [], scheduleConfig) {
        let scheduleBuilder = RuleHelper.createProgramEncounterVisitScheduleBuilder(programEncounter, visitSchedule);
        GeneralPostDoctorVisitVisits.scheduleFollowupDoctorVisit(programEncounter, scheduleBuilder);
        GeneralPostDoctorVisitVisits.scheduleFollowupHomeVisit(programEncounter, scheduleBuilder);

        return scheduleBuilder.getAll();
    }

    static scheduleFollowupDoctorVisit(programEncounter, scheduleBuilder) {
        const scheduledFollowupVisits = programEncounter.programEnrolment.scheduledEncountersOfType('Doctor Visit');
        let followupDate = programEncounter.getObservationReadableValue('Followup date');
        if (!_.isNil(followupDate)) {
            const visitAlreadyScheduled = _.find(scheduledFollowupVisits, (enc) => moment(enc.earliestVisitDateTime).isSame(moment(followupDate), 'day'));
            if (!visitAlreadyScheduled) {
                RuleHelper.addSchedule(scheduleBuilder, 'Doctor visit - followup', 'Doctor Visit', followupDate, 3, 'createNew');
            }
        }
    }

    static scheduleFollowupHomeVisit(programEncounter, scheduleBuilder) {
        const scheduledFollowupVisits = programEncounter.programEnrolment.scheduledEncountersOfType('Doctor Visit Followup at Home');
        const followupDate = moment(programEncounter.encounterDateTime).add(3, 'days');
        const visitAlreadyScheduled = _.find(scheduledFollowupVisits, (enc) => moment(enc.earliestVisitDateTime).isSame(followupDate, 'day'));
        if (!visitAlreadyScheduled) {
            RuleHelper.addSchedule(scheduleBuilder, 'Doctor Visit Followup at Home',
                'Doctor Visit Followup at Home', followupDate.toDate(), 7, 'createNew');
        }
    }
}

module.exports = {
    GeneralPostDoctorVisitVisits: GeneralPostDoctorVisitVisits
};