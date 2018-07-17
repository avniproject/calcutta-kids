const { FormElementStatusBuilder, FormElementStatus } = require('rules-config/rules');
import lib from './lib';

class RuleHelper {
    static encounterCodedObsHas(programEncounter, formElement, conceptName, ...answerConceptNames) {
        let statusBuilder = new FormElementStatusBuilder({programEncounter, formElement});
        statusBuilder.show().when.valueInEncounter(conceptName).containsAnyAnswerConceptName(...answerConceptNames);
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
    };

    static _calculateBMI = (weight, height) => {
        return Math.ceil((weight / Math.pow(height, 2)) * 10000, 1);
    };

    static createBMIFormElementStatus(height, weight, formElement) {
        let value;
        height = height && height.getValue();
        weight = weight && weight.getValue();
        if (Number.isFinite(weight) && Number.isFinite(height)) {
            value = lib.C.calculateBMI(weight, height);
        }
        return new FormElementStatus(formElement.uuid, true, value);
    }

    static removeRecommendation(decisions, groupName, recommendationName, reason) {
        const defaultVal = { name: recommendationName , value: [] };
        const group = decisions[groupName] = decisions[groupName] || [];
        const recommendation = group.find((d) => d.name == recommendationName) || (group.push(defaultVal), defaultVal);
        recommendation.value = recommendation.value || [];
        const withRemoved = recommendation.value.filter((r) => r.toUpperCase() !== reason.toUpperCase());
        const removedOrNot = (withRemoved.length !== recommendation.value.length);
        recommendation.value = withRemoved;
        return removedOrNot;
    }

    static addRecommendation(decisions, groupName, recommendationName, reason) {
        const defaultVal = { name: recommendationName , value: [] };
        const group = decisions[groupName] = decisions[groupName] || [];
        const recommendation = group.find((d) => d.name == recommendationName) || (group.push(defaultVal), defaultVal);
        recommendation.value = recommendation.value || [];
        recommendation.value.push(reason);
        return decisions;
    }
}

module.exports = RuleHelper;