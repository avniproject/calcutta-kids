const {RuleFactory, FormElementStatusBuilder, FormElementsStatusHelper, StatusBuilderAnnotationFactory} = require('rules-config/rules');
const RuleHelper = require('../RuleHelper');

const ViewFilter = RuleFactory('e09dddeb-ed72-40c4-ae8d-112d8893f18b', 'ViewFilter');
const WithStatusBuilder = StatusBuilderAnnotationFactory('programEncounter', 'formElement');

@ViewFilter("31a45914-67d6-4294-aa65-9fa87c9f590c", "Child PNC Form Handler", 100.0, {})
class ChildPNCFormHandler {

    @WithStatusBuilder
    activityRelatedComplaints([], statusBuilder) {
        statusBuilder.skipAnswers('Sluggish movements', 'Unconscious', 'Not sucking milk at all');
    }

    @WithStatusBuilder
    anySkinProblems([], statusBuilder) {
        //TODO: 'Umbilical cord is infected' to be unVoided in core and skipped in other implementations
        statusBuilder.skipAnswers('Wrinkled Skin','Sunken fontanelle','Skin blisters');
    }

    @WithStatusBuilder
    anyEyeProblems([], statusBuilder) {
        statusBuilder.skipAnswers('Icterus present');
    }

    static exec(programEncounter, formElementGroup, today) {
        return FormElementsStatusHelper
            .getFormElementsStatusesWithoutDefaults(new ChildPNCFormHandler(), programEncounter, formElementGroup, today);
    }
}

module.exports = {ChildPNCFormHandler};
