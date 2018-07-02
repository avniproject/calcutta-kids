const {RuleFactory, FormElementStatusBuilder, FormElementsStatusHelper, complicationsBuilder} = require('rules-config/rules');
const ComplicationsBuilder = complicationsBuilder;

const childEnrolmentDecision = RuleFactory("1608c2c0-0334-41a6-aab0-5c61ea1eb069", "Decision");


@childEnrolmentDecision("a4edfca4-a2de-40f6-8d02-8b5ef8a2d37e", "Child Enrolment decisions [CK]", 100.0, {})
class ChildEnrolmentDecisions {
    static highRisk(programEnrolment) {
        const highRiskBuilder = new ComplicationsBuilder({
            programEnrolment: programEnrolment,
            complicationsConcept: 'High Risk Conditions'
        });

        highRiskBuilder.addComplication("Child born Underweight")
            .when.valueInEnrolment("Birth Weight").is.lessThan(2.6);
        return highRiskBuilder.getComplications();
    }

    static exec(programEnrolment, decisions, context, today) {
        decisions.enrolmentDecisions.push(ChildEnrolmentDecisions.highRisk(programEnrolment));
        return decisions;
    }
}


module.exports = {ChildEnrolmentDecisions};