const {FormElementStatusBuilder} = require('rules-config/rules');

class RuleHelper {
    static encounterCodedObsHas(programEncounter, formElement, conceptName, answerConceptName) {
        let statusBuilder = new FormElementStatusBuilder({programEncounter, formElement});
        statusBuilder.show().when.valueInEncounter(conceptName).containsAnswerConceptName(answerConceptName);
        return statusBuilder.build();
    }
}

module.exports = RuleHelper; 