const {RuleFactory, FormElementsStatusHelper, StatusBuilderAnnotationFactory} = require('rules-config/rules');

const WithStatusBuilder = StatusBuilderAnnotationFactory('programEncounter', 'formElement');

const filters = RuleFactory("aac5c57a-aa01-49bb-ad20-70536dd2907f", 'ViewFilter');
@filters('198dd711-68e4-486c-b4c4-cf5191ef56fb', 'ProgramEncounterCancelViewFilter', 100)
class ProgramEncounterCancelViewFilter {

    @WithStatusBuilder
    cancelReason([], statusBuilder) {
        statusBuilder.skipAnswers('Away from village');
    }

    static exec(programEncounter, formElementGroup, today) {
        return FormElementsStatusHelper
            .getFormElementsStatusesWithoutDefaults(new ProgramEncounterCancelViewFilter(), programEncounter, formElementGroup, today);
    }
}

export {
    ProgramEncounterCancelViewFilter,
}