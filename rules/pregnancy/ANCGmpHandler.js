import { RuleFactory, complicationsBuilder as ComplicationsBuilder } from 'rules-config/rules';
import lib from '../lib';

const pregnancyGMPDecision = RuleFactory("4632c1f5-59cd-4e65-899c-beb2c87a3bff", "Decision");

@pregnancyGMPDecision("47b05f6b-dac4-456f-8878-7ccef7cf365e", "ANC GMP decisions [CK]", 100.0, {})
class GMPDecision {
    static highRisks(programEncounter) {
        const { programEnrolment, encounterDateTime } = programEncounter;
        const complicationsBuilder = new ComplicationsBuilder({
            programEncounter: programEncounter,
            complicationsConcept: 'High Risk Conditions'
        });

        complicationsBuilder.addComplication("Irregular weight gain")
            .when.valueInEncounter("Weight").lessThanOrEqualTo(35);

        complicationsBuilder.addComplication("Diet Advice Do's")
            .when.valueInEncounter("Weight").lessThanOrEqualTo(35);

        complicationsBuilder.addComplication("Irregular weight gain")
            .whenItem(lib.calculations.isNormalWeightGain(programEnrolment, programEncounter, encounterDateTime)).is.not.truthy;

        complicationsBuilder.addComplication('Intrauterine Growth Retardation')
            .whenItem(lib.calculations.isNormalWeightGain(programEnrolment, programEncounter, encounterDateTime)).is.not.truthy;

        return complicationsBuilder.getComplications();
    }

    static referral(programEncounter) {
        const { programEnrolment, encounterDateTime } = programEncounter;
        const complicationsBuilder = new ComplicationsBuilder({
            programEncounter: programEncounter,
            complicationsConcept: 'Refer to the hospital for'
        });

        complicationsBuilder.addComplication("Irregular weight gain")
            .whenItem(lib.calculations.isNormalWeightGain(programEnrolment, programEncounter, encounterDateTime)).is.not.truthy;

        return complicationsBuilder.getComplications();
    }

    static exec(programEncounter, decisions, context, today) {
        decisions.encounterDecisions.push(GMPDecision.highRisks(programEncounter));
        decisions.encounterDecisions.push(GMPDecision.referral(programEncounter));
        return decisions;
    }
}

module.exports = { GMPDecision };
