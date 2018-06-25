const { RuleFactory, FormElementStatusBuilder } = require('rules-config/rules');

//The following ViewFilter logics to be validated.
//Kept on hold as rules-config library is not ready yet.

const MotherProgramEnrolmentRules = RuleFactory('026e2f5c-8670-4e4b-9a54-cb03bbf3093d', 'ViewFilter');
const hideOnFirstPregnancy = (programEnrolment, formElement) => {
    let statusBuilder = new FormElementStatusBuilder({ programEnrolment, formElement });
    statusBuilder.show().when.valueInEnrolment('Is this your first pregnancy?').is.yes.why.no;
    return statusBuilder.build();
}

@MotherProgramEnrolmentRules('40202177-7142-45c1-bf70-3d3b432799c0', 'Number of miscarriages', {})
class NumberOfMiscarriages {
    static exec = hideOnFirstPregnancy
}

@MotherProgramEnrolmentRules('d2967b54-83d5-4567-9e25-9da429ab159d', 'Number of medically terminated pregnancies', {})
class NumberOfMedicallyTerminatedPregnancies {
    static exec = hideOnFirstPregnancy
}

@MotherProgramEnrolmentRules('a02e495b-2b22-4767-aaad-0dfb701434c6', 'Number of stillbirths', {})
class NumberOfStillbirths {
    static exec = hideOnFirstPregnancy
}

@MotherProgramEnrolmentRules('4b438345-395c-48d9-84b1-30e0900c8052', 'Number of child deaths', {})
class NumberOfChildDeaths {
    static exec = hideOnFirstPregnancy
}

@MotherProgramEnrolmentRules('c2ce5fb9-8480-4d50-8d28-419059f32f12', 'Number of living children', {})
class NumberOfLivingChildren {
    static exec = hideOnFirstPregnancy
}

module.exports = {
    NumberOfMiscarriages,
    NumberOfMedicallyTerminatedPregnancies,
    NumberOfStillbirths,
    NumberOfChildDeaths,
    NumberOfLivingChildren
};
