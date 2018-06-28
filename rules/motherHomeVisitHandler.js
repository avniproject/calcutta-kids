const { RuleFactory, FormElementStatusBuilder, FormElementsStatusHelper } = require('rules-config/rules');

const homeVisitFilter = RuleFactory('2a13df4b-6d61-4f11-850d-1ea6d13860df', 'ViewFilter');

class MotherHomeVisitHandler {
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

@homeVisitFilter("a0018a51-4cac-4690-9aa1-91505d3d4759", "Mother Home Visit form rules", 100.0, {})
class MotherHomeVisitFormRules {
    static exec(programEncounter, formElementGroup, today) {
        return FormElementsStatusHelper
            .getFormElementsStatusesWithoutDefaults(new MotherHomeVisitHandler(), programEncounter, formElementGroup, today);
    }
}

module.exports = MotherHomeVisitFormRules;