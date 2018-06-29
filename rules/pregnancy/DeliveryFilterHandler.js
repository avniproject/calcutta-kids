const { RuleFactory, FormElementStatusBuilder, FormElementsStatusHelper } = require('rules-config/rules');
const DeliveryFilter = RuleFactory("cc6a3c6a-c3cc-488d-a46c-d9d538fcc9c2", 'ViewFilter');
const RuleHelper = require('../RuleHelper');
const ObservationMatcherAnnotationFactory = require('../ObservationMatcherAnnotationFactory');
const CodedObservationMatcher = ObservationMatcherAnnotationFactory(RuleHelper.Scope.Encounter, 'containsAnswerConceptName')(['programEncounter', 'formElement']);

@DeliveryFilter('39f152ec-4b3a-4b08-b4cd-49c569d8a404', 'Skip logic for delivery form', 100.0)
// @AsFormElementGroupExecutable()
class DeliveryFilterHandler {
    static exec(programEncounter, formElementGroup, today) {
        return FormElementsStatusHelper
            .getFormElementsStatusesWithoutDefaults(new DeliveryFilterHandler(), programEncounter, formElementGroup, today);
    }

    @CodedObservationMatcher('Place of delivery', ['Other'])
    otherPlaceOfDelivery(){}

    @CodedObservationMatcher('Place of delivery',['Home in FB', 'Home outside FB'])
    whyDidYouChooseToHaveABirthAtHome() {}

    @CodedObservationMatcher('Reason to have birth at home', ['Other'])
    otherReasonToHaveBirthAtHome(){}

    @CodedObservationMatcher('Place of delivery', ['Government Hospital'])
    didYouReceiveJsy(){}

    @CodedObservationMatcher('Place of delivery', ['Private hospital'])
    labourTime(){}

    @CodedObservationMatcher('Place of delivery',['Home in FB', 'Home outside FB'])
    dateOfDischarge() {}
}

module.exports = DeliveryFilterHandler;