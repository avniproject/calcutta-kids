const {FormElementStatusBuilder} = require('rules-config/rules');

class RuleHelper {
    static encounterCodedObsHas(programEncounter, formElement, conceptName, answerConceptName) {
        let statusBuilder = new FormElementStatusBuilder({programEncounter, formElement});
        return statusBuilder.show().when.valueInEncounter(conceptName).containsAnswerConceptName(answerConceptName).build();
    }
}

module.exports = RuleHelper; 