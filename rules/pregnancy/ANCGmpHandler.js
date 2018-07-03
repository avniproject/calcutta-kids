const {RuleFactory, FormElementStatusBuilder, FormElementsStatusHelper, complicationsBuilder} = require('rules-config/rules');
const ComplicationsBuilder = complicationsBuilder;

const pregnancyGMPDecision = RuleFactory("4632c1f5-59cd-4e65-899c-beb2c87a3bff", "Decision");


@pregnancyGMPDecision("47b05f6b-dac4-456f-8878-7ccef7cf365e", "ANC GMP decisions [CK]", 100.0, {})
class GMPDecision {
    static immediateReferral(programEncounter) {
        const complicationsBuilder = new ComplicationsBuilder({
            programEncounter: programEncounter,
            complicationsConcept: 'High Risk Conditions'
        });

        complicationsBuilder.addComplication("Irregular weight gain")
            .when.valueInEncounter("Weight").lessThanOrEqualTo(35);
        complicationsBuilder.addComplication("Diet Advice Do's")
            .when.valueInEncounter("Weight").lessThanOrEqualTo(35);

        return complicationsBuilder.getComplications();
    }

    static exec(programEncounter, decisions, context, today) {
        decisions.encounterDecisions.push(GMPDecision.immediateReferral(programEncounter));
        return decisions;
    }
}

module.exports = {GMPDecision};
