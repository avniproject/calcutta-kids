const {RuleFactory, FormElementStatusBuilder, FormElementsStatusHelper} = require('rules-config/rules');
const filter = RuleFactory('5565a4d1-ef0e-4ff5-bce5-fc4f7d94ce99', 'ViewFilter');

@filter('9fb619f0-bf38-46fb-84db-b64f0574f5b0', 'Skip logic for ANCHomeVisit')
class ANCHomeVisitFilterHandler {
    static exec(programEncounter, formElementGroup, today) {
        return FormElementsStatusHelper
            .getFormElementsStatusesWithoutDefaults(new ANCHomeVisitFilterHandler(), programEncounter, formElementGroup, today);
    }

    constructor() {
        this.whatIsTheNameOfTheInstitution =
    }
}

module.exports = ANCHomeVisitFilterHandler;