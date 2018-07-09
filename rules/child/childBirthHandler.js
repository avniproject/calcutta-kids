import {RuleFactory, complicationsBuilder as ComplicationsBuilder} from 'rules-config/rules';

const decisions = RuleFactory("901e2f48-2fb8-402b-9073-ee2fac33fce4", "Decision");

@decisions("6a4d0bb3-a3e7-4c14-b44d-cfb2fc308fa1", "Child Birth decisions [CK]", 100.0, {})
class BirthDecisions {
    static immediateReferral(programEncounter) {
        const complicationsBuilder = new ComplicationsBuilder({
            programEncounter: programEncounter,
            complicationsConcept: 'Refer to the hospital immediately for'
        });

        complicationsBuilder.addComplication("Child born Underweight")
            .when.valueInEncounter("Birth Weight").lessThan(2.6);

        return complicationsBuilder.getComplications();
    }

    static exec(programEncounter, decisions, context, today) {
        decisions.encounterDecisions.push(BirthDecisions.immediateReferral(programEncounter));
        return decisions;
    }
}

module.exports = { BirthDecisions };