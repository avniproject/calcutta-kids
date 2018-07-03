const {RuleFactory, RuleCondition, FormElementStatusBuilder, FormElementsStatusHelper} = require('rules-config/rules');
const RuleHelper = require('./RuleHelper');
const ObservationMatcherAnnotationFactory = require('./ObservationMatcherAnnotationFactory');
const ppiPointsMatrix = require('./ppiPointsMatrix');

const CodedObservationMatcher = ObservationMatcherAnnotationFactory(RuleHelper.Scope.Encounter, 'containsAnyAnswerConceptName')(['programEncounter', 'formElement']);
const sesFormRules = RuleFactory("6ae07f4d-c639-4cfa-a78b-9f39e0b24c60", 'ViewFilter');
const sesDecisions = RuleFactory("6ae07f4d-c639-4cfa-a78b-9f39e0b24c60", "Decision");

@sesDecisions("0670b789-12b2-4857-8358-626d91c3bb73", "SES Form decisions [CK]", 100.0, {})
class SESDecisions {
    static ppiDecision(encounter) {
        let ppiScore = [...ppiPointsMatrix]
            .map(([question, answers]) => answers[encounter.getObservationReadableValue(question)])
            .reduce((total, val) => total + val, 0);

        return {name: "PPI", value: ppiScore}
    }

    static exec(encounter, decisions) {
        decisions.encounterDecisions.push(SESDecisions.ppiDecision(encounter));
        return decisions;
    }
}

@sesFormRules("4eb88dc1-545e-4672-9422-173e64af54c1", "SES Form rules [CK]", 100.0, {})
class SESFormRules {
    static exec(programEncounter, formElementGroup, today) {
        return FormElementsStatusHelper
            .getFormElementsStatusesWithoutDefaults(new SESFormRules(), programEncounter, formElementGroup, today);
    }

    @CodedObservationMatcher('Marital status', ['Other'])
    whatOtherMaritalStatus() {
    }

    ageAtFirstMarriage(programEncounter, formElement) {
        let statusBuilder = new FormElementStatusBuilder({programEncounter, formElement});
        statusBuilder.show().when.valueInEncounter("Marital status").not.containsAnswerConceptName("Unmarried");
        return statusBuilder.build();
    }

    @CodedObservationMatcher('Religion', ['Other'])
    ifOtherReligionPleaseSpecify() {
    }

    @CodedObservationMatcher('Migrated to Kolkata from another place', ['Yes'])
    whereDidYouMigrateFrom() {
    }

    @CodedObservationMatcher('Migrated from', ['Other'])
    ifFromOtherPlaceNameOfPlace() {
    }

    @CodedObservationMatcher('Occupation', ['Other'])
    whichOtherOccupation() {
    }

    @CodedObservationMatcher('Occupation', ['Housewife plus additional work'])
    whatIsTheAdditionalWorkYouDo() {
    }

    @CodedObservationMatcher('Occupation', ['Housewife plus additional work'])
    isThisWorkDoneAtHomeOrOutsideOfTheHome() {
    }

    @CodedObservationMatcher('Any other income earner in the household?', ['Yes'])
    whatIsHisHerOccupation() {
    }

    @CodedObservationMatcher('Accommodation', ['Other'])
    whichAccommodationIfOther() {
    }

    @CodedObservationMatcher('Received ANC services when pregnant', ['Yes'])
    pregnancyCareReceivedFrom() {
    }

    @CodedObservationMatcher('ANC service received from', ['Other'])
    whichOtherFacilityWasPregnancyCareReceivedFrom() {
    }

    @CodedObservationMatcher('Receiving GMP services for child?', ['Yes'])
    weighingServiceAvailedFrom() {
    }

    @CodedObservationMatcher('GMP service received from', ['Other'])
    whichOtherFacilityWasWeighingServiceAvailedFrom() {
    }

    @CodedObservationMatcher('Receiving food rations for child?', ['Yes'])
    foodRationsReceivedFrom() {
    }

    @CodedObservationMatcher('Food rations received from', ['Other'])
    whichOtherFacilityWasFoodRationReceivedFrom() {
    }

    @CodedObservationMatcher('Receiving curative health services for self and child?', ['Yes'])
    healthServicesReceivedFrom() {
    }

    @CodedObservationMatcher('Curative health services received from', ['Other'])
    whichOtherFacilityWasHealthServicesReceivedFrom() {
    }

    @CodedObservationMatcher('Received immunizations for child', ['Yes'])
    immunizationServiceReceivedFrom() {
    }

    @CodedObservationMatcher('Immunization received from', ['Other'])
    whichOtherFacilityWasImmunizationReceivedFrom() {
    }

    @CodedObservationMatcher('Used emergency services for self or child', ['Yes'])
    emergencyServiceReceivedFrom() {
    }

    @CodedObservationMatcher('Emergency services received from', ['Other'])
    whichOtherFacilityWasEmergencyServiceReceivedFrom() {
    }

    @CodedObservationMatcher('Received other medical assistance', ['Yes'])
    medicalAssistanceReceivedFrom() {
    }

    @CodedObservationMatcher('Medical assistance received from', ['Other'])
    whichOtherFacilityWasMedicalAssistanceReceivedFrom() {
    }

    idOfChild1(programEncounter, formElement) {
        let statusBuilder = new FormElementStatusBuilder({programEncounter, formElement});
        statusBuilder.show().when.valueInEncounter("Number of children currently enrolled in Calcutta Kids")
            .is.greaterThanOrEqualTo(1);
        return statusBuilder.build();
    }

    idOfChild2(programEncounter, formElement) {
        let statusBuilder = new FormElementStatusBuilder({programEncounter, formElement});
        statusBuilder.show().when.valueInEncounter("Number of children currently enrolled in Calcutta Kids")
            .is.greaterThanOrEqualTo(2);
        return statusBuilder.build();
    }

    idOfChild3(programEncounter, formElement) {
        let statusBuilder = new FormElementStatusBuilder({programEncounter, formElement});
        statusBuilder.show().when.valueInEncounter("Number of children currently enrolled in Calcutta Kids")
            .is.greaterThanOrEqualTo(3);
        return statusBuilder.build();
    }

    idOfChild4(programEncounter, formElement) {
        let statusBuilder = new FormElementStatusBuilder({programEncounter, formElement});
        statusBuilder.show().when.valueInEncounter("Number of children currently enrolled in Calcutta Kids")
            .is.greaterThanOrEqualTo(4);
        return statusBuilder.build();
    }

    idOfChild5(programEncounter, formElement) {
        let statusBuilder = new FormElementStatusBuilder({programEncounter, formElement});
        statusBuilder.show().when.valueInEncounter("Number of children currently enrolled in Calcutta Kids")
            .is.greaterThanOrEqualTo(5);
        return statusBuilder.build();
    }

    idOfChild6(programEncounter, formElement) {
        let statusBuilder = new FormElementStatusBuilder({programEncounter, formElement});
        statusBuilder.show().when.valueInEncounter("Number of children currently enrolled in Calcutta Kids")
            .is.greaterThanOrEqualTo(6);
        return statusBuilder.build();
    }

    dobOfOldestChildNotEnrolledInCk(programEncounter, formElement) {
        let statusBuilder = new FormElementStatusBuilder({programEncounter, formElement});
        statusBuilder.show().when.valueInEncounter("Number of children NOT enrolled in Calcutta Kids")
            .is.greaterThanOrEqualTo(1);
        return statusBuilder.build();
    }

    genderOfOldestChildNotEnrolledInCk(programEncounter, formElement) {
        let statusBuilder = new FormElementStatusBuilder({programEncounter, formElement});
        statusBuilder.show().when.valueInEncounter("Number of children NOT enrolled in Calcutta Kids")
            .is.greaterThanOrEqualTo(1);
        return statusBuilder.build();
    }

    dobOfSecondOldestChildNotEnrolledInCk(programEncounter, formElement) {
        let statusBuilder = new FormElementStatusBuilder({programEncounter, formElement});
        statusBuilder.show().when.valueInEncounter("Number of children NOT enrolled in Calcutta Kids")
            .is.greaterThanOrEqualTo(2);
        return statusBuilder.build();
    }

    genderOfSecondOldestChildNotEnrolledInCk(programEncounter, formElement) {
        let statusBuilder = new FormElementStatusBuilder({programEncounter, formElement});
        statusBuilder.show().when.valueInEncounter("Number of children NOT enrolled in Calcutta Kids")
            .is.greaterThanOrEqualTo(2);
        return statusBuilder.build();
    }

    dobOfThirdOldestChildNotEnrolledInCk(programEncounter, formElement) {
        let statusBuilder = new FormElementStatusBuilder({programEncounter, formElement});
        statusBuilder.show().when.valueInEncounter("Number of children NOT enrolled in Calcutta Kids")
            .is.greaterThanOrEqualTo(3);
        return statusBuilder.build();
    }

    genderOfThirdOldestChildNotEnrolledInCk(programEncounter, formElement) {
        let statusBuilder = new FormElementStatusBuilder({programEncounter, formElement});
        statusBuilder.show().when.valueInEncounter("Number of children NOT enrolled in Calcutta Kids")
            .is.greaterThanOrEqualTo(3);
        return statusBuilder.build();
    }

    dobOfFourthOldestChildNotEnrolledInCk(programEncounter, formElement) {
        let statusBuilder = new FormElementStatusBuilder({programEncounter, formElement});
        statusBuilder.show().when.valueInEncounter("Number of children NOT enrolled in Calcutta Kids")
            .is.greaterThanOrEqualTo(4);
        return statusBuilder.build();
    }

    genderOfFourthOldestChildNotEnrolledInCk(programEncounter, formElement) {
        let statusBuilder = new FormElementStatusBuilder({programEncounter, formElement});
        statusBuilder.show().when.valueInEncounter("Number of children NOT enrolled in Calcutta Kids")
            .is.greaterThanOrEqualTo(4);
        return statusBuilder.build();
    }

    dobOfFifthOldestChildNotEnrolledInCk(programEncounter, formElement) {
        let statusBuilder = new FormElementStatusBuilder({programEncounter, formElement});
        statusBuilder.show().when.valueInEncounter("Number of children NOT enrolled in Calcutta Kids")
            .is.greaterThanOrEqualTo(5);
        return statusBuilder.build();
    }

    genderOfFifthOldestChildNotEnrolledInCk(programEncounter, formElement) {
        let statusBuilder = new FormElementStatusBuilder({programEncounter, formElement});
        statusBuilder.show().when.valueInEncounter("Number of children NOT enrolled in Calcutta Kids")
            .is.greaterThanOrEqualTo(5);
        return statusBuilder.build();
    }

    dobOfSixthOldestChildNotEnrolledInCk(programEncounter, formElement) {
        let statusBuilder = new FormElementStatusBuilder({programEncounter, formElement});
        statusBuilder.show().when.valueInEncounter("Number of children NOT enrolled in Calcutta Kids")
            .is.greaterThanOrEqualTo(6);
        return statusBuilder.build();
    }

    genderOfSixthOldestChildNotEnrolledInCk(programEncounter, formElement) {
        let statusBuilder = new FormElementStatusBuilder({programEncounter, formElement});
        statusBuilder.show().when.valueInEncounter("Number of children NOT enrolled in Calcutta Kids")
            .is.greaterThanOrEqualTo(6);
        return statusBuilder.build();
    }
}

module.exports = {SESFormRules, SESDecisions};