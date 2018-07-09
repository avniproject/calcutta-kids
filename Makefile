# <makefile>
# Objects: refdata, package
# Actions: clean, build, deploy
help:
	@IFS=$$'\n' ; \
	help_lines=(`fgrep -h "##" $(MAKEFILE_LIST) | fgrep -v fgrep | sed -e 's/\\$$//'`); \
	for help_line in $${help_lines[@]}; do \
	    IFS=$$'#' ; \
	    help_split=($$help_line) ; \
	    help_command=`echo $${help_split[0]} | sed -e 's/^ *//' -e 's/ *$$//'` ; \
	    help_info=`echo $${help_split[2]} | sed -e 's/^ *//' -e 's/ *$$//'` ; \
	    printf "%-30s %s\n" $$help_command $$help_info ; \
	done
# </makefile>

port:= $(if $(port),$(port),8021)
server:= $(if $(server),$(server),http://localhost)
server_url:=$(server):$(port)

su:=$(shell id -un)
org_name=Calcutta Kids

define _curl
	curl -X $(1) $(server_url)/$(2) -d $(3)  \
		-H "Content-Type: application/json"  \
		-H "ORGANISATION-NAME: $(org_name)"  \
		$(if $(token),-H "AUTH-TOKEN: $(token)",)
	@echo
	@echo
endef

# <create_org>
create_org: ## Create Calcutta Kids org and user+privileges
	psql -U$(su) openchs < create_organisation.sql
# </create_org>

# <refdata>
deploy_concepts:
	$(call _curl,POST,concepts,@concepts.json)
	$(call _curl,POST,concepts,@child/homeVisitConcepts.json)
	$(call _curl,POST,concepts,@child/enrolmentConcepts.json)
	$(call _curl,POST,concepts,@child/pncConcepts.json)
	$(call _curl,POST,concepts,@pregnancy/ancHomeVisitConcepts.json)
	$(call _curl,POST,concepts,@doctorVisitConcepts.json)
	$(call _curl,POST,concepts,@pregnancy/pregnancyConcepts.json)
	$(call _curl,POST,concepts,@pregnancy/deliveryConcepts.json)
	$(call _curl,POST,concepts,@pregnancy/ancDoctorVisitConcepts.json)
	$(call _curl,POST,concepts,@pregnancy/pncConcepts.json)

deploy_refdata: deploy_concepts
	$(call _curl,POST,catchments,@catchments.json)
	$(call _curl,POST,programs,@programs.json)
	$(call _curl,POST,encounterTypes,@encounterTypes.json)
	$(call _curl,POST,operationalEncounterTypes,@operationalModules/operationalEncounterTypes.json)
	$(call _curl,POST,operationalPrograms,@operationalModules/operationalPrograms.json)

	$(call _curl,DELETE,forms,@general/labTestsDeletions.json)
	$(call _curl,DELETE,forms,@pregnancy/enrolmentDeletions.json)
	$(call _curl,DELETE,forms,@pregnancy/motherDeliveryFormDeletions.json)
	$(call _curl,DELETE,forms,@pregnancy/ancDoctorVisitFormDeletions.json)
	$(call _curl,DELETE,forms,@child/anthroAssessmentFormDeletions.json)
	$(call _curl,DELETE,forms,@child/birthFormDeletions.json)
	$(call _curl,DELETE,forms,@child/pncDeletions.json)

	$(call _curl,PATCH,forms,@general/labTestsAdditions.json)
	$(call _curl,PATCH,forms,@pregnancy/enrolmentAdditions.json)
	$(call _curl,PATCH,forms,@pregnancy/ancDoctorVisitFormAdditions.json)
	$(call _curl,PATCH,forms,@pregnancy/motherDeliveryFormAdditions.json)
	$(call _curl,PATCH,forms,@child/anthroAssessmentFormAdditions.json)
	$(call _curl,PATCH,forms,@child/birthFormAdditions.json)
	$(call _curl,PATCH,forms,@child/enrolmentAdditions.json)
	$(call _curl,PATCH,forms,@child/pncAdditions.json)
	$(call _curl,PATCH,forms,@pregnancy/pncAdditions.json)

	$(call _curl,POST,forms,@registrationForm.json)
	$(call _curl,POST,forms,@sesForm.json)
	$(call _curl,POST,forms,@child/childHomeVisit.json)
	$(call _curl,POST,forms,@child/pncDoctorCheckup.json)
	$(call _curl,POST,forms,@pregnancy/ancHomeVisitForm.json)
	$(call _curl,POST,forms,@pregnancy/ancGMP.json)
	$(call _curl,POST,forms,@general/doctorVisitForm.json)
	$(call _curl,POST,forms,@general/doctorVisitFollowupForm.json)
	$(call _curl,POST,forms,@mother/motherProgramEnrolmentNullForm.json)
	$(call _curl,POST,forms,@general/doctorVisitForm.json)
	$(call _curl,POST,forms,@general/doctorVisitFollowupForm.json)
	$(call _curl,POST,forms,@general/pregnancyTestFollowupForm.json)
	$(call _curl,POST,forms,@mother/motherHomeVisitForm.json)

	$(call _curl,POST,formMappings,@formMappings.json)
# </refdata>

# <deploy>
deploy: deploy_refdata deploy_rules##
# </deploy>

# <deploy>
deploy_rules: ##
	node index.js "$(server_url)" "$(token)"
# </deploy>

# <c_d>
create_deploy: create_org deploy ##
# </c_d>

deps:
	npm i

# <package>
#build_package: ## Builds a deployable package
#	rm -rf output/impl
#	mkdir -p output/impl
#	cp registrationForm.json catchments.json deploy.sh output/impl
#	cd output/impl && tar zcvf ../openchs_impl.tar.gz *.*
# </package>
