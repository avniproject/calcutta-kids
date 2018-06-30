const {RuleFactory, VisitScheduleBuilder} = require('rules-config/rules');
const moment = require("moment");
const MotherEnrolmentVisit = RuleFactory("026e2f5c-8670-4e4b-9a54-cb03bbf3093d", "VisitSchedule");

@MotherEnrolmentVisit("f94d4f18-9ff6-4f7b-988e-e7956d947bb0", "ANC Home Visit", 10.0)
class ANCHomeVisit {
    static exec(programEncounter, visitSchedule = [], scheduleConfig) {
        const scheduleBuilder = new VisitScheduleBuilder({
            programEnrolment: programEncounter.programEnrolment,
            programEncounter: programEncounter
        });
        const encounterDateTime = programEncounter.encounterDateTime || new Date();
        visitSchedule.forEach((vs) => scheduleBuilder.add(vs));
        const currentDate = moment(encounterDateTime).date();
        const month = currentDate > 21 ? moment(encounterDateTime).month() + 1 : moment(encounterDateTime).month();
        scheduleBuilder.add({
                name: "ANC Home Visit",
                encounterType: "ANC Home Visit",
                earliestDate: moment(encounterDateTime).month(month).date(1).toDate(),
                maxDate: moment(encounterDateTime).month(month).date(21).toDate()
            }
        );
        return scheduleBuilder.getAllUnique("encounterType");
    }
}

module.exports = ANCHomeVisit;