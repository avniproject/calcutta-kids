const {RuleFactory} = require('rules-config/rules');
const {PregnancyPostANCHomeVisitVisits, PregnancyPostDeliveryVisits, PregnancyPostEnrolmentVisits, PregnancyPostPNCVisits, PregnancyPostAbortionVisits, PregnancyPostPostAbortionVisits, PregnancyPostAncGmpVisits} = require('./pregnancy/visitSchedule');
const {MotherPostEnrolmentVisits, MotherPostHomeVisitVisits} = require('./mother/visitSchedule');
const {ChildPostChildEnrolmentVisits, ChildPostHomeVisitVisits, ChildPostPNCVisits, ChildGMPMonthly} = require('./child/visitSchedule');
const {GeneralPostDoctorVisitVisits} = require('./general/generalVisitSchedule');

const ProgramEncounterCancelRule = RuleFactory("aac5c57a-aa01-49bb-ad20-70536dd2907f", "VisitSchedule");

const postVisitMap = {
    "Child Home Visit": ChildPostHomeVisitVisits,
    "Mother Home Visit": MotherPostHomeVisitVisits,
    "ANC Home Visit": PregnancyPostANCHomeVisitVisits,
    "ANC GMP": PregnancyPostAncGmpVisits,
    "Anthropometry Assessment": ChildGMPMonthly
};

@ProgramEncounterCancelRule("aca832d6-f570-4945-89d8-fe28cdff4bc7", "PostProgramEncounterCancelVisits", 10.0)
class PostProgramEncounterCancelVisits {
    static exec(programEncounter, visitSchedule = [], scheduleConfig) {
        let visitCancelReason = programEncounter.findCancelEncounterObservationReadableValue('Visit cancel reason');
        if (visitCancelReason === 'Program exit') return visitSchedule;

        let postVisit = postVisitMap[programEncounter.encounterType.name];

        if (!_.isNil(postVisit) && visitCancelReason !== 'Program exit') {
            return postVisit.exec(programEncounter, visitSchedule);
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
    PostProgramEncounterCancelVisits,
    ChildGMPMonthly,
};