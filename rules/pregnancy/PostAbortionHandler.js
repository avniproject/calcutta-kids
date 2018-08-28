const {RuleFactory, FormElementsStatusHelper} = require('rules-config/rules');
const RuleHelper = require("../RuleHelper");
const filter = RuleFactory('a7ec8c80-edb2-4751-a5ec-498a9e0240a0', 'ViewFilter');

@filter("bf61911e-90b6-405c-9d22-0f115a9b0671", "Post abortion form handler", 100.0, {})
class PostAbortionHandler {
    otherAbortionComplaints(programEncounter, formElement) {
        return RuleHelper.encounterCodedObsHas(programEncounter, formElement, 'Abortion complaints', 'Other');
    }

    static exec(programEncounter, formElementGroup, today) {
        return FormElementsStatusHelper
            .getFormElementsStatusesWithoutDefaults(new PostAbortionHandler(), programEncounter, formElementGroup, today);
    }
}

module.exports = {PostAbortionHandler};
