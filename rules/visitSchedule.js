const {RuleFactory, VisitScheduleBuilder} = require('rules-config/rules');
const moment = require("moment");
const {ANCHomeVisit, ANCHomeVisitRecurring, MotherPNC1VisitSchedule, MotherSecondPNCVisit} = require('./pregnancy/visitSchedule');
const {MotherRecurringHomeVisit, MotherProgramEnrolmentHomeVisit} = require('./mother/visitSchedule');
const {PNC1Visit, PNC2Visit, BirthVisitSchedule, ChildHomeVisit, ChildHomeVisitRecurring, ChildHomeVisitInitial} = require('./child/visitSchedule');

const DoctorVisit = RuleFactory("b80646b2-b74e-415f-974c-f8f48d67b27e", "VisitSchedule");

@DoctorVisit("0303d810-28ad-4a29-8590-4c3795a0cff0", "Follow Up Home Visit", 1.0)
class DoctorFollowUpHomeVisit {
    static exec(programEncounter, visitSchedule = [], scheduleConfig) {
        const scheduleBuilder = new VisitScheduleBuilder({
            programEnrolment: programEncounter.programEnrolment,
            programEncounter: programEncounter
        });
        const encounterDateTime = programEncounter.encounterDateTime || new Date();
        visitSchedule.forEach((vs) => scheduleBuilder.add(vs));
        const followUpDate = programEncounter.getObservationValue("Followup date");
        let earliestDate = followUpDate || moment(encounterDateTime).add(3, 'days').toDate();
        let maxDate = moment(earliestDate).add(7, 'days').toDate();
        scheduleBuilder.add({
                name: "Doctor Visit Followup",
                encounterType: "Doctor Visit Followup",
                earliestDate: earliestDate,
                maxDate: maxDate
            }
        );
        return scheduleBuilder.getAllUnique("encounterType");
    }
}

module.exports = {
    DoctorFollowUpHomeVisit,
    ANCHomeVisit,
    ANCHomeVisitRecurring,
    PNC1Visit,
    MotherPNC1VisitSchedule,
    PNC2Visit,
    BirthVisitSchedule,
    MotherSecondPNCVisit,
    ChildHomeVisit,
    ChildHomeVisitRecurring,
    ChildHomeVisitInitial,
    MotherRecurringHomeVisit,
    MotherProgramEnrolmentHomeVisit
};