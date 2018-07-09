import { RuleFactory, FormElementsStatusHelper, StatusBuilderAnnotationFactory, complicationsBuilder as ComplicationsBuilder } from 'rules-config/rules';
import ObservationMatcherAnnotationFactory from '../ObservationMatcherAnnotationFactory';
import RuleHelper from '../RuleHelper';

const CodedObservationMatcher = ObservationMatcherAnnotationFactory(RuleHelper.Scope.Encounter, 'containsAnyAnswerConceptName')(['programEncounter', 'formElement']);

const ViewFilter = RuleFactory("1aef21a6-e629-4cb5-8d63-ef252a9ad7d1", 'ViewFilter');

@ViewFilter('62f3aaa0-bd90-4974-ba9d-3d2ab5a073a4', 'Child PNC Doctor Checkup Form Handler', 100.0, {})
class ChildPNCDoctorCheckupFormHandler {

    @CodedObservationMatcher("Birth Defects", ['Other'])
    otherBirthDefects() { }

    static exec(programEncounter, formElementGroup, today) {
        return FormElementsStatusHelper
            .getFormElementsStatusesWithoutDefaults(new ChildPNCDoctorCheckupFormHandler(), programEncounter, formElementGroup, today);
    }
}

module.exports = { ChildPNCDoctorCheckupFormHandler };
