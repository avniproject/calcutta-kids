const { RuleFactory, FormElementStatus, FormElementsStatusHelper } = require('rules-config/rules');

const RuleHelper = require('../RuleHelper');
const ObservationMatcherAnnotationFactory = require('../ObservationMatcherAnnotationFactory');
const CodedObservationMatcher = ObservationMatcherAnnotationFactory(RuleHelper.Scope.Enrolment, 'containsAnyAnswerConceptName')(['programEnrolment', 'formElement']);

const MotherProgramEnrolmentFilter = RuleFactory('026e2f5c-8670-4e4b-9a54-cb03bbf3093d', 'ViewFilter');

const _calculateBMI = (weight, height) => {
    return Math.ceil((weight / Math.pow(height, 2)) * 10000, 1);
};

@MotherProgramEnrolmentFilter('40202177-7142-45c1-bf70-3d3b432799c0', 'Hide non applicable questions for first pregnancy', 100.0, {})
class HideNAFirstPregnancyQuestions {

    @CodedObservationMatcher('Is this your first pregnancy?', ['No'])
    ageAtFirstPregnancy() { }

    @CodedObservationMatcher('Is this your first pregnancy?', ['No'])
    numberOfMiscarriages() { }

    @CodedObservationMatcher('Is this your first pregnancy?', ['No'])
    numberOfMedicallyTerminatedPregnancies() { }

    @CodedObservationMatcher('Is this your first pregnancy?', ['No'])
    numberOfStillbirths() { }

    @CodedObservationMatcher('Is this your first pregnancy?', ['No'])
    numberOfChildDeaths() { }

    @CodedObservationMatcher('Is this your first pregnancy?', ['No'])
    numberOfLivingChildren() { }

    bmi(programEnrolment, formElement, today) {
        let value;
        let height = programEnrolment.findLatestObservationInEntireEnrolment("Height", programEnrolment);
        let weight = programEnrolment.findLatestObservationInEntireEnrolment("Weight", programEnrolment);
        height = height && height.getValue();
        weight = weight && weight.getValue();
        if (Number.isFinite(weight) && Number.isFinite(height)) {
            value = _calculateBMI(weight, height);
        }
        return new FormElementStatus(formElement.uuid, true, value);
    }

    static exec(programEncounter, formElementGroup, today) {
        return FormElementsStatusHelper
            .getFormElementsStatusesWithoutDefaults(new HideNAFirstPregnancyQuestions(), programEncounter, formElementGroup, today);
    }
}

module.exports = { HideNAFirstPregnancyQuestions };
