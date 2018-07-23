const {RuleFactory, VisitScheduleBuilder} = require('rules-config/rules');
const moment = require("moment");
const RuleHelper = require('../RuleHelper');

const DoctorVisitRule = RuleFactory("b80646b2-b74e-415f-974c-f8f48d67b27e", "VisitSchedule");

@DoctorVisitRule("55afa1bf-3c06-4a33-addf-19fa7b5a95a7", "PostDoctorVisitVisits", 10.0)
class PostDoctorVisitVisits {
    static exec(programEncounter, visitSchedule = [], scheduleConfig) {
        let scheduleBuilder = RuleHelper.createProgramEncounterVisitScheduleBuilder(programEncounter, visitSchedule);
        return RuleHelper.scheduleOneVisit(scheduleBuilder, 'Doctor Visit Followup', 'Doctor Visit Followup', moment(programEncounter.encounterDateTime).add(3, 'days').toDate(), 21);
    }
}

module.exports = {
    GeneralPostDoctorVisitVisits: PostDoctorVisitVisits
};