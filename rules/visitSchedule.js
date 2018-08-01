const {RuleFactory} = require('rules-config/rules');
const {PregnancyPostANCHomeVisitVisits, PregnancyPostDeliveryVisits, PregnancyPostEnrolmentVisits, PregnancyPostPNCVisits, PregnancyPostAbortionVisits, PregnancyPostPostAbortionVisits, PregnancyPostAncGmpVisits} = require('./pregnancy/visitSchedule');
const {MotherPostEnrolmentVisits, MotherPostHomeVisitVisits} = require('./mother/visitSchedule');
const {ChildPostChildEnrolmentVisits, ChildPostHomeVisitVisits, ChildPostPNCVisits} = require('./child/visitSchedule');
const {GeneralPostDoctorVisitVisits} = require('./general/generalVisitSchedule');
const moment = require("moment");
const RuleHelper = require('./RuleHelper');

const ProgramEncounterCancelRule = RuleFactory("aac5c57a-aa01-49bb-ad20-70536dd2907f", "VisitSchedule");

@ProgramEncounterCancelRule("aca832d6-f570-4945-89d8-fe28cdff4bc7", "PostProgramEncounterCancelVisits", 10.0)
class PostProgramEncounterCancelVisits {
    static exec(programEncounter, visitSchedule = [], scheduleConfig) {
        if (programEncounter.encounterType.name === 'Child Home Visit') {
            return ChildPostHomeVisitVisits.exec(programEncounter, visitSchedule);
        } else if (programEncounter.encounterType.name === 'Mother Home Visit') {
            return MotherPostHomeVisitVisits.exec(programEncounter, visitSchedule);
        } else if (programEncounter.encounterType.name === 'ANC Home Visit') {
            let visitCancelReason = programEncounter.getObservationReadableValue('Visit cancel reason');
            if (visitCancelReason === 'Away' || visitCancelReason === 'Absent') //Visit can get cancelled for reasons like delivery in which case it would be "Other"
                return PregnancyPostANCHomeVisitVisits.exec(programEncounter, visitSchedule);
        }
        return visitSchedule;
    }
}

module.exports = {
    PregnancyPostANCHomeVisitVisits,
    PregnancyPostDeliveryVisits,
    PregnancyPostEnrolmentVisits,
    PregnancyPostPNCVisits,
    PregnancyPostAbortionVisits,
    PregnancyPostPostAbortionVisits,
    PregnancyPostAncGmpVisits,

    MotherPostEnrolmentVisits,
    MotherPostHomeVisitVisits,

    ChildPostChildEnrolmentVisits,
    ChildPostHomeVisitVisits,
    ChildPostPNCVisits,

    GeneralPostDoctorVisitVisits,
    PostProgramEncounterCancelVisits
};