const {RuleFactory, FormElementsStatusHelper, StatusBuilderAnnotationFactory} = require('rules-config/rules');

const WithStatusBuilder = StatusBuilderAnnotationFactory('programEncounter', 'formElement');
const filter = RuleFactory('32428a7e-d553-4172-b697-e8df3bbfb61d', 'ViewFilter');

@filter('32e06ba9-8b72-42bb-8aa0-37bf2c229cef', 'Abortion Form Handler', 100.0)
class AbortionHandler{

    @WithStatusBuilder
    postAbortionComplaints([], statusBuilder) {
        statusBuilder.skipAnswers('[DEPRECATED] Per vaginal bleeding');
    }
    static exec(programEncounter, formElementGroup, today) {
        return FormElementsStatusHelper
            .getFormElementsStatusesWithoutDefaults(new AbortionHandler(), programEncounter, formElementGroup, today);
    }

}
module.exports={AbortionHandler};


