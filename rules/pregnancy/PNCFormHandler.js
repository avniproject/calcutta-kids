const {RuleFactory, FormElementStatusBuilder, FormElementsStatusHelper, StatusBuilderAnnotationFactory} = require('rules-config/rules');
const RuleHelper = require('../RuleHelper');

const filter = RuleFactory('78b1400e-8100-4ba6-b78e-fef580f7fb77', 'ViewFilter');
const WithStatusBuilder = StatusBuilderAnnotationFactory('programEncounter', 'formElement');

@filter("5d7deca4-b95f-4bb1-b432-fed29ed95e52", "Mother PNC Form Handler", 100.0, {})
class PNCFormHandler {
    @WithStatusBuilder
    areYourStitchesOpenOrLoose([programEncounter, formElement], statusBuilder) {
        statusBuilder.show().when.valueInEncounter("Stitches during delivery").is.yes;
        return statusBuilder.build();
    }

    @WithStatusBuilder
    isThereAnyDischargeFromTheWound([programEncounter, formElement], statusBuilder) {
        statusBuilder.show().when.valueInEncounter("Stitches during delivery").is.yes;
        return statusBuilder.build();
    }

    @WithStatusBuilder
    whyEatingSameOrLess([programEncounter, formElement], statusBuilder) {
        statusBuilder.show().when.valueInEncounter("Eating compared to your pre-pregnancy food intake")
            .containsAnyAnswerConceptName("Less", "Same");
        return statusBuilder.build();
    }

    @WithStatusBuilder
    specifyOtherReasonForEatingLess([programEncounter, formElement], statusBuilder) {
        statusBuilder.show().when.valueInEncounter("Reason for eating less than pre-pregnancy")
            .containsAnyAnswerConceptName("Other");
        return statusBuilder.build();
    }

    static exec(programEncounter, formElementGroup, today) {
        return FormElementsStatusHelper
            .getFormElementsStatusesWithoutDefaults(new PNCFormHandler(), programEncounter, formElementGroup, today);
    }
}


module.exports = {PNCFormHandler};