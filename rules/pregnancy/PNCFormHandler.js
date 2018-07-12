const {RuleFactory, FormElementsStatusHelper, StatusBuilderAnnotationFactory, complicationsBuilder} = require('rules-config/rules');
const ComplicationsBuilder = complicationsBuilder;
const filter = RuleFactory('78b1400e-8100-4ba6-b78e-fef580f7fb77', 'ViewFilter');
const decision = RuleFactory('78b1400e-8100-4ba6-b78e-fef580f7fb77', 'Decision');
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

@decision("7d4b0ff1-1437-41c0-a739-23cece11408f", "Mother PNC Referral Advice", 100.0)
class MotherPNCDecision {
    static exec(programEncounter, decisions, context, today) {
        const complicationsBuilder = new ComplicationsBuilder({
            programEncounter: programEncounter,
            complicationsConcept: 'Refer to the hospital for'
        });
        complicationsBuilder.addComplication("Open/Loose stitches")
            .valueInEncounter("Open or loose stitches").is.yes;
        complicationsBuilder.addComplication("Discharge from stitches wound")
            .valueInEncounter("Any discharge from wound").is.yes;
        decisions.encounterDecisions.push(complicationsBuilder.getComplications());
        return decisions;
    }
}


module.exports = {PNCFormHandler, MotherPNCDecision};