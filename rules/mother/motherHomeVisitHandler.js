import { FormElementStatusBuilder, RuleFactory, FormElementsStatusHelper, StatusBuilderAnnotationFactory, complicationsBuilder as ComplicationsBuilder } from 'rules-config/rules';
import lib from '../lib';

const homeVisitDecisions = RuleFactory("2a13df4b-6d61-4f11-850d-1ea6d13860df", "Decision");
const homeVisitFilter = RuleFactory('2a13df4b-6d61-4f11-850d-1ea6d13860df', 'ViewFilter');
const withStatusBuilder = StatusBuilderAnnotationFactory('programEncounter', 'formElement');

@homeVisitDecisions("41d2cf55-720e-4633-aeac-e005a887bd26", "Mother Home Visit decisions [CK]", 100.0, {})
class MotherHomeVisitDecisions {
    static referToCkDoctor(programEncounter) {
        const complicationsBuilder = new ComplicationsBuilder({
            programEncounter: programEncounter,
            complicationsConcept: 'Refer to Calcutta Kids doctor for'
        });

        complicationsBuilder.addComplication("High fever (above 102°C)")
            .when.valueInEncounter("Mother's health problems")
                .containsAnswerConceptName("High fever (above 102°C)");

        complicationsBuilder.addComplication("Foul smelling vaginal discharge or blood")
            .when.valueInEncounter("Mother's health problems")
                .containsAnswerConceptName("Foul smelling vaginal discharge or blood");

        complicationsBuilder.addComplication("Moderate to severe abdominal pain")
            .when.valueInEncounter("Mother's health problems")
                .containsAnswerConceptName("Moderate to severe abdominal pain");

        complicationsBuilder.addComplication("Vaginal/urethral problems")
            .when.valueInEncounter("Mother's health problems")
                .containsAnswerConceptName("Vaginal/urethral problems");

        complicationsBuilder.addComplication("Possible breast infection (severe pain, abscess, foul smelling discharge, fever)")
            .when.valueInEncounter("Breast-feeding problems")
                .containsAnswerConceptName("Possible breast infection (severe pain, abscess, foul smelling discharge, fever)");

        return complicationsBuilder.getComplications();
    }

    static referToHospitalOrCkDoctor(programEncounter) {
        const complicationsBuilder = new ComplicationsBuilder({
            programEncounter: programEncounter,
            complicationsConcept: 'Refer to Hospital or Calcutta Kids doctor for'
        });

        complicationsBuilder.addComplication("Problems with stitches or discharge from the wound")
            .when.valueInEncounter("Are mother's stitches open or loose?").containsAnswerConceptName("Yes")
            .or.when.valueInEncounter("Is there discharge from the wound?").containsAnswerConceptName("Yes");

        return complicationsBuilder.getComplications();
    }

    static exec(programEncounter, decisions, context, today) {
        decisions.encounterDecisions.push(MotherHomeVisitDecisions.referToCkDoctor(programEncounter));
        decisions.encounterDecisions.push(MotherHomeVisitDecisions.referToHospitalOrCkDoctor(programEncounter));
        return decisions;
    }
}

@homeVisitFilter("a0018a51-4cac-4690-9aa1-91505d3d4759", "Mother Home Visit form rules", 100.0, {})
class MotherHomeVisitFormRules {

    @withStatusBuilder
    doYouHaveAnyOfTheFollowingHealthProblems([{programEnrolment, encounterDateTime}, formElement], statusBuilder) {
        const youngestChild = lib.C.getYoungestChild(programEnrolment.individual);
        statusBuilder.show().whenItem(youngestChild.getAgeInMonths(encounterDateTime)).is.lessThan(3);
    }

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

    static exec(programEncounter, formElementGroup, today) {
        return FormElementsStatusHelper
            .getFormElementsStatusesWithoutDefaults(new MotherHomeVisitFormRules(), programEncounter, formElementGroup, today);
    }
}

module.exports = {MotherHomeVisitFormRules, MotherHomeVisitDecisions} ;