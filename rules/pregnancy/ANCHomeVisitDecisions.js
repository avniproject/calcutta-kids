const {RuleFactory, FormElementStatusBuilder, FormElementsStatusHelper, complicationsBuilder} = require('rules-config/rules');
const ComplicationsBuilder = complicationsBuilder;

const ancHomeVisitDecisions = RuleFactory("5565a4d1-ef0e-4ff5-bce5-fc4f7d94ce99", "Decision");

@ancHomeVisitDecisions("87ca4ff2-2d57-44e7-b741-eba7401399a8", "ANC Home Visit Decisions", 100.0, {})
class ANCHomeVisitDecisions {
    static referral(programEncounter) {
        const referralBuilder = new ComplicationsBuilder({
            programEncounter: programEncounter,
            complicationsConcept: 'Referral'
        });

        referralBuilder.addComplication("Refer to hospital")
            .when.valueInEncounter("Pregnancy complications").containsAnyAnswerConceptName("Convulsions without fever", "Leak of amniotic fluid", "Per vaginal bleeding", "Excessive vomiting and inability to consume anything orally");

        referralBuilder.addComplication("Refer to Calcutta Kids doctor")
            .when.valueInEncounter("Pregnancy complications").is.defined.and.
            valueInEncounter("Pregnancy complications").not.containsAnyAnswerConceptName("Convulsions without fever", "Leak of amniotic fluid", "Per vaginal bleeding", "Excessive vomiting and inability to consume anything orally");
        return referralBuilder.getComplications();
    }

    static exec(programEncounter, decisions, context, today) {
        decisions.encounterDecisions.push(ANCHomeVisitDecisions.referral(programEncounter));
        return decisions;
    }
}

module.exports = { ANCHomeVisitDecisions };