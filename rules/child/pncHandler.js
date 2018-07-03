import { RuleFactory, FormElementsStatusHelper, StatusBuilderAnnotationFactory, complicationsBuilder as ComplicationsBuilder } from 'rules-config/rules';
import ObservationMatcherAnnotationFactory from '../ObservationMatcherAnnotationFactory';
import RuleHelper from '../RuleHelper';

const CodedObservationMatcher = ObservationMatcherAnnotationFactory(RuleHelper.Scope.Encounter, 'containsAnyAnswerConceptName')(['programEncounter', 'formElement']);

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

    @CodedObservationMatcher('PNC stool related complaints', ['Loose stools'])
    looseMotionSinceHowManyDays() { }

    @CodedObservationMatcher('Did the baby receive colostrums (first milk)?', ['No'])
    whyDidTheBabyNotReceiveColostrums() { }

    @CodedObservationMatcher('Baby did not receive colostrum because', ['Other'])
    whatOtherReasonForBabyNotReceivingColostrum() { }

    @CodedObservationMatcher('Did the baby receive anything before s/he started breastfeeding?', ['Yes'])
    whatDidTheBabyReceiveBeforeBreastfeeding() { }

    @CodedObservationMatcher('Other things baby was fed before breastfeeding', ['Other'])
    whatOtherThingsWasBabyFedBeforeBreastfeeding() { }

    @CodedObservationMatcher('Things baby was fed since beginning breastfeeding', ['Other'])
    whatOtherThingsDidYouFeedYourChildSinceBeginningBreastfeeding() { }

    @CodedObservationMatcher('Things baby was fed since beginning breastfeeding', ["Cow's milk"])
    frequencyOfCowsMilk() { }

    @CodedObservationMatcher("Frequency of cow's milk", ['Other'])
    otherFrequencyOfCowsMilk() { }

    @CodedObservationMatcher('Things baby was fed since beginning breastfeeding', ['Formula'])
    frequencyOfFormula() { }

    @CodedObservationMatcher("Frequency of formula", ['Other'])
    otherFrequencyOfFormula() { }

    @CodedObservationMatcher('Things baby was fed since beginning breastfeeding', ['Water'])
    frequencyOfWater() { }

    @CodedObservationMatcher("Frequency of water", ['Other'])
    otherFrequencyOfWater() { }

    @CodedObservationMatcher('Things baby was fed since beginning breastfeeding', ['Water based liquids (sugar water, juice etc)'])
    frequencyOfWaterBasedLiquids() { }

    @CodedObservationMatcher("Frequency of water-based liquids", ['Other'])
    otherFrequencyOfWaterBasedLiquids() { }

    @CodedObservationMatcher('Things baby was fed since beginning breastfeeding', ['Other'])
    frequencyOfOther() { }

    @CodedObservationMatcher('Frequency of other', ['Other'])
    otherFrequencyOfOther() { }

    @CodedObservationMatcher('Why did you feed your baby something other than breast milk?', ['Other'])
    otherReasonWhyYouFedSomethingOtherThanBreastMilk() { }

    @CodedObservationMatcher('Are you having any of the following breastfeeding problems?', ['Other'])
    specifyOtherBreastfeedingProblems() { }

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
