import { FormElementStatusBuilder, RuleFactory, FormElementsStatusHelper, StatusBuilderAnnotationFactory, complicationsBuilder as ComplicationsBuilder } from 'rules-config/rules';
import ObservationMatcherAnnotationFactory from '../ObservationMatcherAnnotationFactory';
import RuleHelper from '../RuleHelper';
import lib from '../lib';

const homeVisitDecisions = RuleFactory("2a13df4b-6d61-4f11-850d-1ea6d13860df", "Decision");
const homeVisitFilter = RuleFactory('2a13df4b-6d61-4f11-850d-1ea6d13860df', 'ViewFilter');
const withStatusBuilder = StatusBuilderAnnotationFactory('programEncounter', 'formElement');
const codedObservationMatcher = ObservationMatcherAnnotationFactory(RuleHelper.Scope.Encounter, 'containsAnyAnswerConceptName')(['programEncounter', 'formElement']);

@homeVisitDecisions("41d2cf55-720e-4633-aeac-e005a887bd26", "Mother Home Visit decisions [CK]", 100.0, {})
class MotherHomeVisitDecisions {
    static referToCkDoctor(programEncounter) {
        const complicationsBuilder = new ComplicationsBuilder({
            programEncounter: programEncounter,
            complicationsConcept: 'Refer to Calcutta Kids doctor'
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

const getAgeOfYoungestChildInMonths = (programEncounter) => {
    const youngestChild = lib.C.getYoungestChild(programEncounter.programEnrolment.individual);
    return youngestChild.getAgeInMonths(programEncounter.encounterDateTime);
};

@homeVisitFilter("a0018a51-4cac-4690-9aa1-91505d3d4759", "Mother Home Visit form rules", 100.0, {})
class MotherHomeVisitFormRules {

    @withStatusBuilder
    doYouHaveAnyOfTheFollowingHealthProblems([programEncounter, formElement], statusBuilder) {
        statusBuilder.show().whenItem(getAgeOfYoungestChildInMonths(programEncounter)).is.lessThan(3);
    }

    @codedObservationMatcher("Mother's health problems", ['Other'])
    specifyOtherProblem() { }

    @withStatusBuilder
    didYouReceiveStitchesDuringDelivery([programEncounter, formElement], statusBuilder) {
        statusBuilder.show().whenItem(getAgeOfYoungestChildInMonths(programEncounter)).is.lessThan(3);
    }

    @withStatusBuilder
    areYourStitchesOpenOrLoose([programEncounter, formElement], statusBuilder) {
        statusBuilder.show()
            .when.valueInEncounter("Did mother receive stitches during delivery?").containsAnswerConceptName("Yes")
            .and.whenItem(getAgeOfYoungestChildInMonths(programEncounter)).is.lessThan(3);
    }

    @withStatusBuilder
    isThereDischargeFromTheWound([programEncounter, formElement], statusBuilder) {
        statusBuilder.show()
            .when.valueInEncounter("Did mother receive stitches during delivery?").containsAnswerConceptName("Yes")
            .and.whenItem(getAgeOfYoungestChildInMonths(programEncounter)).is.lessThan(3);
    }

    @withStatusBuilder
    whereDoYouGetYourIfaTablets([programEncounter, formElement], statusBuilder) {
        statusBuilder.show().whenItem(getAgeOfYoungestChildInMonths(programEncounter)).is.lessThan(3);
    }

    @withStatusBuilder
    howManyIfaTabletsHaveYouConsumedSinceYourLastVisit([programEncounter, formElement], statusBuilder) {
        statusBuilder.show().when.valueInEncounter("Where does mother get IFA tablets from?").not.containsAnswerConceptName("NA").and.whenItem(getAgeOfYoungestChildInMonths(programEncounter)).is.lessThan(3);
    }

    @withStatusBuilder
    whereDoYouGetYourCalciumTablets([programEncounter, formElement], statusBuilder) {
        statusBuilder.show().whenItem(getAgeOfYoungestChildInMonths(programEncounter)).is.lessThan(6);
    }

    @withStatusBuilder
    howManyCalciumTabletsHaveYouConsumedSinceYourLastVisit([programEncounter, formElement], statusBuilder) {
        statusBuilder.show().whenItem(getAgeOfYoungestChildInMonths(programEncounter)).is.lessThan(6).and.when.valueInEncounter("Where does mother get Calcium tablets from?").not.containsAnswerConceptName("NA");
    }

    @withStatusBuilder
    howMuchAreYouEatingComparedToYourPrePregnancyFoodIntake([programEncounter, formElement], statusBuilder) {
        statusBuilder.show().whenItem(getAgeOfYoungestChildInMonths(programEncounter)).is.lessThan(6);
    }

    @withStatusBuilder
    whyAreYouEatingTheSameOrLess([programEncounter, formElement], statusBuilder) {
        statusBuilder.show().whenItem(getAgeOfYoungestChildInMonths(programEncounter)).is.lessThan(6)
            .and.valueInEncounter('Food consumption compared to pre-pregnancy food intake?')
            .containsAnyAnswerConceptName('Same as pre-pregnancy', 'Less than pre-pregnancy');
    }

    @codedObservationMatcher('Reasons for eating the same or less than pre-pregnancy', ['Other'])
    otherReasonsForEatingSameOrLess() { }

    @withStatusBuilder
    areYouDrinkingAtLeastOneGlassOfMilkPerDay([programEncounter, formElement], statusBuilder) {
        statusBuilder.show().whenItem(getAgeOfYoungestChildInMonths(programEncounter)).is.lessThan(6);
    }

    @codedObservationMatcher('Is mother drinking at least one glass of milk per day?', ['No'])
    counselToDrinkSufficientMilk() { }

    @codedObservationMatcher('Is mother using any family planning methods?', ['Yes'])
    whatTypeOfFamilyPlanningMethodsAreYouUsing() { }

    @codedObservationMatcher('Type of family planning methods used by mother', ['Pill'])
    counselAboutUsingPills() { }

    @codedObservationMatcher('Type of family planning methods used by mother', ['Other'])
    whichOtherFamilyPlanningMethodsAreBeingUsed() { }

    @withStatusBuilder
    areYouHavingAnyOfTheFollowingBreastFeedingProblems([programEncounter, formElement], statusBuilder) {
        statusBuilder.show().whenItem(getAgeOfYoungestChildInMonths(programEncounter)).is.lessThan(6);
    }

    @codedObservationMatcher('Breast-feeding problems', ['Cracked Nipple', 'Retracted Nipples', 'Engorged breast', 'Mother unwilling to breastfeed'])
    counselAboutBreastfeeding() { }

    @codedObservationMatcher('Breast-feeding problems', ['Other'])
    whatOtherBreastFeedingProblems() { }

    static exec(programEncounter, formElementGroup, today) {
        return FormElementsStatusHelper
            .getFormElementsStatusesWithoutDefaults(new MotherHomeVisitFormRules(), programEncounter, formElementGroup, today);
    }
}

module.exports = { MotherHomeVisitFormRules, MotherHomeVisitDecisions };