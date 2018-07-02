const { FormElementStatusBuilder } = require('rules-config/rules');

class RuleHelper {
    static encounterCodedObsHas(programEncounter, formElement, conceptName, answerConceptName) {
        let statusBuilder = new FormElementStatusBuilder({programEncounter, formElement});
        statusBuilder.show().when.valueInEncounter(conceptName).containsAnswerConceptName(answerConceptName);
        return statusBuilder.build();
    }

    static encounterCodedObsNotHave(programEncounter, formElement, conceptName, answerConceptName) {
        let statusBuilder = new FormElementStatusBuilder({programEncounter, formElement});
        statusBuilder.show().when.valueInEncounter(conceptName).not.containsAnswerConceptName(answerConceptName);
        return statusBuilder.build();
    }


    static generalObservationMatcher(context, scope, conceptName, matchingFn, [...answers] /*always array*/) {
        let statusBuilder = new FormElementStatusBuilder(context);
        statusBuilder.show().when['valueIn'+scope](conceptName)[matchingFn](...answers);
        return statusBuilder.build();
    }

    static Scope = {
        Enrolment:'Enrolment',
        Encounter:'Encounter',
        EntireEnrolment:'EntireEnrolment'
    }
}

module.exports = RuleHelper;