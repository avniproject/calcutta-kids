const RuleHelper = require("../RuleHelper");
const {RuleFactory, FormElementsStatusHelper, FormElementStatusBuilder, FormElementStatus} = require('rules-config/rules');
const filter = RuleFactory('9ed7e0a9-6122-41ee-8413-1cef6792e2c6', 'ViewFilter');

@filter("0c1f3813-baf4-4bf4-ab92-881a2d4f8fa3", "Lab Test form handler", 100.0, {})
class LabTestHandlerCK {
    urineRoutineExamination(programEncounter, formElement) {
        let statusBuilder = new FormElementStatusBuilder({programEncounter, formElement});
        statusBuilder.show().when.valueInEncounter("Urine routine examination").is.defined;
        return statusBuilder.build();
    }

    static exec(programEncounter, formElementGroup, today) {
        switch (`${formElementGroup.name} ${programEncounter.programEnrolment.program.name}`) {
            case "USG Scan Results Child":
                return RuleHelper.hideFormElementGroup(formElementGroup);
            case "USG Scan Results CK Mother":
                return RuleHelper.hideFormElementGroup(formElementGroup);
            default:
                return FormElementsStatusHelper
                    .getFormElementsStatusesWithoutDefaults(new LabTestHandlerCK(), programEncounter, formElementGroup, today);
        }
    }
}

module.exports = {LabTestHandlerCK};