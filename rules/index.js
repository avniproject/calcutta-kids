const {RuleFactory, FormElementStatusBuilder} = require('rules-config/rules');

//The following ViewFilter logics to be validated.
//Kept on hold as rules-config library is not ready yet.

const MotherProgramEnrolmentFilter = RuleFactory('026e2f5c-8670-4e4b-9a54-cb03bbf3093d', 'ViewFilter');
const hideOnFirstPregnancy = (programEnrolment, formElement) => {
    let statusBuilder = new FormElementStatusBuilder({programEnrolment, formElement});
    statusBuilder.show().when.valueInEnrolment('Is this your first pregnancy?').is.yes;
    return statusBuilder.build();
}

@MotherProgramEnrolmentFilter('40202177-7142-45c1-bf70-3d3b432799c0', 'Number of miscarriages', 100.0, {})
class NumberOfMiscarriages {
    static exec = hideOnFirstPregnancy
}

@MotherProgramEnrolmentFilter('d2967b54-83d5-4567-9e25-9da429ab159d', 'Number of medically terminated pregnancies', 101.0, {})
class NumberOfMedicallyTerminatedPregnancies {
    static exec = hideOnFirstPregnancy
}

@MotherProgramEnrolmentFilter('a02e495b-2b22-4767-aaad-0dfb701434c6', 'Number of stillbirths', 102.0, {})
class NumberOfStillbirths {
    static exec = hideOnFirstPregnancy
}

@MotherProgramEnrolmentFilter('4b438345-395c-48d9-84b1-30e0900c8052', 'Number of child deaths', 103.0, {})
class NumberOfChildDeaths {
    static exec = hideOnFirstPregnancy
}

@MotherProgramEnrolmentFilter('c2ce5fb9-8480-4d50-8d28-419059f32f12', 'Number of living children', 104.0, {})
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
