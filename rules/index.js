const {RuleFactory, FormElementStatusBuilder, FormElementsStatusHelper} = require('rules-config/rules');
const MotherHomeVisitFormRules = require("./mother/motherHomeVisitHandler");
const {HomeVisitDecisions, ChildHomeVisitFilter} = require("./child/childHomeVisit");
const DeliveryFilterHandler = require('./pregnancy/DeliveryFilterHandler');
const ANCHomeVisitFilterHandler = require('./pregnancy/ANCHomeVisitFilterHandler');
const {ANCDoctorVisitAbdominalExamination, ANCDoctorVisitRemoveAllDecisions} = require('./pregnancy/ANCDoctorVisitHandler');
const DoctorVisitFollowupFormRules = require("./doctorVisitFollowupHandler");
const {DoctorFollowUpHomeVisit} = require('./visitSchedule');
const {BirthFormRules, BirthDecisions} = require("./child/childBirthHandler");


//The following ViewFilter logics to be validated.
//Kept on hold as rules-config library is not ready yet.

const MotherProgramEnrolmentFilter = RuleFactory('026e2f5c-8670-4e4b-9a54-cb03bbf3093d', 'ViewFilter');

class MotherProgramEnrolmentHandler {
    constructor() {
        const hideOnFirstPregnancy = (programEnrolment, formElement) => {
            let statusBuilder = new FormElementStatusBuilder({programEnrolment, formElement});
            statusBuilder.show().when.valueInEnrolment('Is this your first pregnancy?').is.no;
            return statusBuilder.build();
        };
        this.numberOfMiscarriages = hideOnFirstPregnancy;
        this.numberOfMedicallyTerminatedPregnancies = hideOnFirstPregnancy;
        this.numberOfStillbirths = hideOnFirstPregnancy;
        this.numberOfChildDeaths = hideOnFirstPregnancy;
        this.numberOfLivingChildren = hideOnFirstPregnancy;
    }
}

@MotherProgramEnrolmentFilter('40202177-7142-45c1-bf70-3d3b432799c0', 'Hide non applicable questions for first pregnancy', 100.0, {})
class HideNAFirstPregnancyQuestions {
    static exec(programEncounter, formElementGroup, today) {
        return FormElementsStatusHelper
            .getFormElementsStatusesWithoutDefaults(new MotherProgramEnrolmentHandler(), programEncounter, formElementGroup, today);
    }
}


module.exports = {
    HideNAFirstPregnancyQuestions,
    MotherHomeVisitFormRules,
    HomeVisitDecisions,
    BirthFormRules,
    BirthDecisions,
    ChildHomeVisitFilter,
    DeliveryFilterHandler,
    ANCHomeVisitFilterHandler,
    ANCDoctorVisitAbdominalExamination,
    DoctorVisitFollowupFormRules,
    DoctorFollowUpHomeVisit,
    ANCDoctorVisitRemoveAllDecisions
};
