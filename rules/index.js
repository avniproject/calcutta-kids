const {RuleFactory, FormElementStatusBuilder, FormElementsStatusHelper} = require('rules-config/rules');
const {HomeVisitDecisions, ChildHomeVisitFilter} = require("./childHomeVisit");

//The following ViewFilter logics to be validated.
//Kept on hold as rules-config library is not ready yet.

const MotherProgramEnrolmentFilter = RuleFactory('026e2f5c-8670-4e4b-9a54-cb03bbf3093d', 'ViewFilter');
const DeliveryFilter = RuleFactory("cc6a3c6a-c3cc-488d-a46c-d9d538fcc9c2", 'ViewFilter');

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

@DeliveryFilter('39f152ec-4b3a-4b08-b4cd-49c569d8a404', 'Skip logic for delivery form', 100.0, {})
class DeliveryFilterHandler {
    otherPlaceOfDelivery(programEncounter, formElement) {
        return DeliveryFilterHandler.encounterCodedObsHas(programEncounter, formElement, 'Place of delivery', 'Other');
    }

    whyDidYouChooseToHaveABirthAtHome(programEncounter, formElement) {
        const statusBuilder = new FormElementStatusBuilder({
            programEncounter,
            formElement
        });
        statusBuilder.show().when.valueInEncounter('Place of delivery').containsAnyAnswerConceptName('Home in FB', 'Home outside FB');
        return statusBuilder.build();
    }

    otherReasonToHaveBirthAtHome(programEncounter, formElement) {
        return DeliveryFilterHandler.encounterCodedObsHas(programEncounter, formElement, 'Reason to have birth at home', 'Other');
    }

    didYouReceiveJsy(programEncounter, formElement) {
        return DeliveryFilterHandler.encounterCodedObsHas(programEncounter, formElement, 'Place of delivery', 'Government Hospital');
    }

    labourTime(programEncounter, formElement) {
        return DeliveryFilterHandler.encounterCodedObsHas(programEncounter, formElement, 'Place of delivery', 'Private hospital');
    }

    dateOfDischarge(programEncounter, formElement) {
        const statusBuilder = new FormElementStatusBuilder({
            programEncounter,
            formElement
        });
        statusBuilder.show().when.valueInEncounter('Place of delivery').not.containsAnyAnswerConceptName('Home in FB', 'Home outside FB');
        return statusBuilder.build();
    }

    static encounterCodedObsHas(programEncounter, formElement, conceptName, answerConceptName) {
        const statusBuilder = new FormElementStatusBuilder({programEncounter, formElement});
        statusBuilder.show().when.valueInEncounter(conceptName).containsAnswerConceptName(answerConceptName);
        return statusBuilder.build();
    }

    static exec(programEncounter, formElementGroup, today) {
        return FormElementsStatusHelper
            .getFormElementsStatusesWithoutDefaults(new DeliveryFilterHandler(), programEncounter, formElementGroup, today);
    }

}

@MotherProgramEnrolmentFilter('40202177-7142-45c1-bf70-3d3b432799c0', 'Hide non applicable questions for first pregnancy', 100.0, {})
class HideNAFirstPregnancyQuestions {
    static exec(programEncounter, formElementGroup, today) {
        return FormElementsStatusHelper
            .getFormElementsStatusesWithoutDefaults(new MotherProgramEnrolmentHandler(), programEncounter, formElementGroup, today);
    }
}

const homeVisitFilter = RuleFactory('2a13df4b-6d61-4f11-850d-1ea6d13860df', 'ViewFilter');

class CKHomeVisitHandler {
    specifyOtherProblem(programEncounter, formElement) {
        let statusBuilder = new FormElementStatusBuilder({programEncounter, formElement});
        statusBuilder.show().when.valueInEncounter("Mother's health problems").containsAnswerConceptName("Other");
        return statusBuilder.build();
    }

    areYourStitchesOpenOrLoose(programEncounter, formElement) {
        let statusBuilder = new FormElementStatusBuilder({programEncounter, formElement});
        statusBuilder.show().when.valueInEncounter("Did mother receive stitches during delivery?")
            .containsAnswerConceptName("Yes");
        return statusBuilder.build();
    }

    isThereDischargeFromTheWound(programEncounter, formElement) {
        let statusBuilder = new FormElementStatusBuilder({programEncounter, formElement});
        statusBuilder.show().when.valueInEncounter("Did mother receive stitches during delivery?")
            .containsAnswerConceptName("Yes");
        return statusBuilder.build();
    }

    whyAreYouEatingTheSameOrLess(programEncounter, formElement) {
        let statusBuilder = new FormElementStatusBuilder({programEncounter, formElement});
        statusBuilder.show().when.valueInEncounter("Food consumption compared to pre-pregnancy food intake?")
            .containsAnswerConceptName("Same as pre-pregnancy")
            .or.containsAnswerConceptName("Less than pre-pregnancy");
        return statusBuilder.build();
    }

    otherReasonsForEatingSameOrLess(programEncounter, formElement) {
        let statusBuilder = new FormElementStatusBuilder({programEncounter, formElement});
        statusBuilder.show().when.valueInEncounter("Reasons for eating the same or less than pre-pregnancy")
            .containsAnswerConceptName("Other");
        return statusBuilder.build();
    }

    whatTypeOfFamilyPlanningMethodsAreYouUsing(programEncounter, formElement) {
        let statusBuilder = new FormElementStatusBuilder({programEncounter, formElement});
        statusBuilder.show().when.valueInEncounter("Is mother using any family planning methods?")
            .containsAnswerConceptName("Yes");
        return statusBuilder.build();
    }

    whichOtherFamilyPlanningMethodsAreBeingUsed(programEncounter, formElement) {
        let statusBuilder = new FormElementStatusBuilder({programEncounter, formElement});
        statusBuilder.show().when.valueInEncounter("Type of family planning methods used by mother")
            .containsAnswerConceptName("Other");
        return statusBuilder.build();
    }

    whatOtherBreastFeedingProblems(programEncounter, formElement) {
        let statusBuilder = new FormElementStatusBuilder({programEncounter, formElement});
        statusBuilder.show().when.valueInEncounter("Breast-feeding problems")
            .containsAnswerConceptName("Other");
        return statusBuilder.build();
    }

}

@homeVisitFilter("a0018a51-4cac-4690-9aa1-91505d3d4759", "Home Visit form rules", 100.0, {})
class CKHomeVisitFormRules {
    static exec(programEncounter, formElementGroup, today) {
        return FormElementsStatusHelper
            .getFormElementsStatusesWithoutDefaults(new CKHomeVisitHandler(), programEncounter, formElementGroup, today);
    }
}


module.exports = {
    HideNAFirstPregnancyQuestions,
    CKHomeVisitFormRules,
    HomeVisitDecisions,
    ChildHomeVisitFilter,
    DeliveryFilterHandler
};
