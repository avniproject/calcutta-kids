const {RuleFactory, FormElementStatusBuilder, FormElementsStatusHelper, complicationsBuilder} = require('rules-config/rules');
const ComplicationsBuilder = complicationsBuilder;

//const childBirthDecisions = RuleFactory("901e2f48-2fb8-402b-9073-ee2fac33fce4", "Decision");
const pregnancyGMPDecision = RuleFactory("4632c1f5-59cd-4e65-899c-beb2c87a3bff", "Decision");


@pregnancyGMPDecision("47b05f6b-dac4-456f-8878-7ccef7cf365e", "ANC GMP decisions [CK]", 100.0, {})
class GMPDecision {
    static immediateReferral(programEncounter) {
        const complicationsBuilder = new ComplicationsBuilder({
            programEncounter: programEncounter,
            complicationsConcept: 'Refer to the hospital immediately for'
        });

        complicationsBuilder.addComplication("Pregnant Women Weight gain problem")
            .when.valueInEncounter("weight").lessThan(35);

        return complicationsBuilder.getComplications();
    }

    static exec(programEncounter, decisions, context, today) {
        decisions.encounterDecisions.push(GMPDecision.immediateReferral(programEncounter));
        return decisions;
    }
}

module.exports = {GMPDecision};
