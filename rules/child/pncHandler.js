import { RuleFactory, FormElementsStatusHelper, StatusBuilderAnnotationFactory, complicationsBuilder as ComplicationsBuilder } from 'rules-config/rules';

const ViewFilter = RuleFactory('e09dddeb-ed72-40c4-ae8d-112d8893f18b', 'ViewFilter');
const Decision = RuleFactory('e09dddeb-ed72-40c4-ae8d-112d8893f18b', 'Decision');
const WithStatusBuilder = StatusBuilderAnnotationFactory('programEncounter', 'formElement');

@ViewFilter('31a45914-67d6-4294-aa65-9fa87c9f590c', 'Child PNC Form Handler', 100.0, {})
class ChildPNCFormHandler {

    @WithStatusBuilder
    activityRelatedComplaints([], statusBuilder) {
        statusBuilder.skipAnswers('Sluggish movements', 'Unconscious', 'Not sucking milk at all');
    }

    @WithStatusBuilder
    anySkinProblems([], statusBuilder) {
        //TODO: 'Umbilical cord is infected' to be unVoided in core and skipped in other implementations
        statusBuilder.skipAnswers('Wrinkled Skin', 'Sunken fontanelle', 'Skin blisters');
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

@Decision('32f2d341-0f39-49af-9ec7-f0bd06152ae9', 'Child PNC Form Decisions', 100.0, {})
class ChildPNCFormDecisions {
    static referToHospital(programEncounter) {
        const builder = new ComplicationsBuilder({
            programEncounter: programEncounter,
            complicationsConcept: 'Refer to hospital'
        });

        ['Lethargy', 'Fever', 'Redness or discharge on the skin around the belly button'].forEach((c) => {
            builder.addComplication(c)
                .ageInMonths.lessThanOrEqualTo(1).and
                .valueInEncounter('Is your baby having any of the following problems?').containsAnyAnswerConceptName(c);
        });
        return builder.getComplications();
    }

    static referToCKDoctor(programEncounter) {
        const builder = new ComplicationsBuilder({
            programEncounter: programEncounter,
            complicationsConcept: 'Refer to Calcutta Kids doctor'
        });

        ['Lethargy', 'Fever', 'Redness or discharge on the skin around the belly button'].forEach((c) => {
            builder.addComplication(c)
                .ageInMonths.lessThanOrEqualTo(3).and
                .ageInMonths.greaterThan(1).and
                .valueInEncounter('Is your baby having any of the following problems?').containsAnyAnswerConceptName(c);
        });
        return builder.getComplications();
    }

    static exec(programEncounter, decisions, context, today) {
        decisions.encounterDecisions.push(ChildPNCFormDecisions.referToHospital(programEncounter), ChildPNCFormDecisions.referToCKDoctor(programEncounter));
        return decisions;
    }
}

module.exports = { ChildPNCFormHandler, ChildPNCFormDecisions };
