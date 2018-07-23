const {PostPregnancyANCHomeVisitVisits, PregnancyPostDeliveryVisits, PregnancyPostEnrolmentVisits, PregnancyPostMotherPNCVisits} = require('./pregnancy/visitSchedule');
const {MotherPostEnrolmentVisits, MotherPostHomeVisitVisits} = require('./mother/visitSchedule');
const {ChildPostChildEnrolmentVisits, ChildPostHomeVisitVisits, ChildPostPNCVisits} = require('./child/visitSchedule');
const {GeneralPostDoctorVisitVisits} = require('./general/generalVisitSchedule');

module.exports = {
    PostPregnancyANCHomeVisitVisits, PregnancyPostDeliveryVisits, PregnancyPostEnrolmentVisits, PregnancyPostMotherPNCVisits,
    MotherPostEnrolmentVisits, MotherPostHomeVisitVisits,
    ChildPostChildEnrolmentVisits, ChildPostHomeVisitVisits, ChildPostPNCVisits,
    GeneralPostDoctorVisitVisits
};