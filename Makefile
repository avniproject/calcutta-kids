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
org_admin_name=ck-admin

define _curl
	curl -X $(1) $(server_url)/$(2) -d $(3)  \
		-H "Content-Type: application/json"  \
		-H "USER-NAME: $(org_admin_name)"  \
		$(if $(token),-H "AUTH-TOKEN: $(token)",)
	@echo
	@echo
endef

define _curl_as_openchs
	curl -X $(1) $(server_url)/$(2) -d $(3)  \
		-H "Content-Type: application/json"  \
		-H "USER-NAME: admin"  \
		$(if $(token),-H "AUTH-TOKEN: $(token)",)
	@echo
	@echo
endef

auth:
	$(if $(poolId),$(eval token:=$(shell node scripts/token.js $(poolId) $(clientId) $(username) $(password))))
	echo $(token)

# <create_org>
create_org: ## Create Calcutta Kids org and user+privileges
	psql -U$(su) openchs < create_organisation.sql
# </create_org>

# <create_views>
create_views: ## Create Calcutta Kids org and user+privileges
	psql -U$(su) openchs < create_views.sql
# </create_views>

# <refdata>

deploy_checklists:
	$(call _curl,POST,concepts,@child/checklistConcepts.json)
	$(call _curl,POST,forms,@child/checklistForm.json)
	$(call _curl,POST,checklistDetail,@child/checklist.json)

deploy_non_coded_concepts:
	node nonCoded ./concepts.json | $(call _curl,POST,concepts,@-)
	node nonCoded ./child/homeVisitConcepts.json | $(call _curl,POST,concepts,@-)
	node nonCoded ./child/enrolmentConcepts.json | $(call _curl,POST,concepts,@-)
	node nonCoded ./child/pncConcepts.json | $(call _curl,POST,concepts,@-)
	node nonCoded ./pregnancy/ancHomeVisitConcepts.json | $(call _curl,POST,concepts,@-)
	node nonCoded ./doctorVisitConcepts.json | $(call _curl,POST,concepts,@-)
	node nonCoded ./pregnancy/pregnancyConcepts.json | $(call _curl,POST,concepts,@-)
	node nonCoded ./pregnancy/deliveryConcepts.json | $(call _curl,POST,concepts,@-)
	node nonCoded ./pregnancy/ancDoctorVisitConcepts.json | $(call _curl,POST,concepts,@-)
	node nonCoded ./pregnancy/pncConcepts.json | $(call _curl,POST,concepts,@-)
	node nonCoded ./child/checklistConcepts.json | $(call _curl,POST,concepts,@-)

deploy_admin_user:
	$(call _curl_as_openchs,POST,users,@users/admin-user.json)

deploy_test_users:
	$(call _curl,POST,users,@users/test-users.json)

deploy_concepts:
	$(if $(shell command -v node 2> /dev/null),make deploy_non_coded_concepts token=$(token) poolId=$(poolId) clientId=$(clientId) server=$(server) username=$(username) password=$(password))
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
	$(call _curl,POST,concepts,@migrationConcepts.json)

deploy_refdata: deploy_concepts
	$(call _curl,POST,locations,@locations.json)
	$(call _curl,POST,catchments,@catchments.json)
	$(call _curl,POST,programs,@programs.json)
	$(call _curl,POST,encounterTypes,@encounterTypes.json)
	$(call _curl,POST,operationalEncounterTypes,@operationalModules/operationalEncounterTypes.json)
	$(call _curl,POST,operationalPrograms,@operationalModules/operationalPrograms.json)

	$(call _curl,DELETE,forms,@pregnancy/enrolmentDeletions.json)
	$(call _curl,DELETE,forms,@pregnancy/motherDeliveryFormDeletions.json)
	$(call _curl,DELETE,forms,@pregnancy/ancDoctorVisitFormDeletions.json)
	$(call _curl,DELETE,forms,@pregnancy/pncDeletions.json)
	$(call _curl,DELETE,forms,@pregnancy/abortionDeletions.json)
	$(call _curl,PATCH,forms,@pregnancy/enrolmentAdditions.json)
	$(call _curl,PATCH,forms,@pregnancy/ancDoctorVisitFormAdditions.json)
	$(call _curl,PATCH,forms,@pregnancy/motherDeliveryFormAdditions.json)
	$(call _curl,PATCH,forms,@pregnancy/pncAdditions.json)
	$(call _curl,POST,forms,@pregnancy/ancHomeVisitForm.json)
	$(call _curl,POST,forms,@pregnancy/ancGMP.json)
	$(call _curl,POST,forms,@pregnancy/postAbortionForm.json)

	$(call _curl,DELETE,forms,@child/anthroAssessmentFormDeletions.json)
	$(call _curl,DELETE,forms,@child/birthFormDeletions.json)
	$(call _curl,DELETE,forms,@child/pncDeletions.json)
	$(call _curl,PATCH,forms,@child/anthroAssessmentFormAdditions.json)
	$(call _curl,PATCH,forms,@child/birthFormAdditions.json)
	$(call _curl,PATCH,forms,@child/enrolmentAdditions.json)
	$(call _curl,PATCH,forms,@child/pncAdditions.json)
	$(call _curl,POST,forms,@child/childHomeVisit.json)
	$(call _curl,POST,forms,@child/pncDoctorCheckup.json)

	$(call _curl,POST,forms,@mother/motherProgramEnrolmentNullForm.json)
	$(call _curl,POST,forms,@mother/motherHomeVisitForm.json)

	$(call _curl,PATCH,forms,@general/labTestsAdditions.json)
	$(call _curl,DELETE,forms,@general/labTestsDeletions.json)
	$(call _curl,POST,forms,@general/doctorVisitForm.json)
	$(call _curl,POST,forms,@general/doctorVisitFollowupForm.json)

	$(call _curl,POST,forms,@registrationForm.json)
	$(call _curl,POST,forms,@sesForm.json)

	$(call _curl,POST,formMappings,@formMappings.json)
# </refdata>

# <deploy>
#deploy_to_local_as_staging:
#	make auth create_deploy poolId=$(OPENCHS_STAGING_USER_POOL_ID) clientId=$(OPENCHS_STAGING_APP_CLIENT_ID) server=http://localhost port=8021 username=$(org_admin_name) password=$(password)
#
#deploy_staging_local:
#	make auth deploy poolId=$(OPENCHS_STAGING_USER_POOL_ID) clientId=$(OPENCHS_STAGING_APP_CLIENT_ID) server=http://localhost port=8021 username=$(org_admin_name) password=$(password)
#

deploy: deploy_admin_user deploy_refdata deploy_checklists deploy_rules deploy_test_users##

deploy_wo_users: deploy_refdata deploy_checklists deploy_rules

deploy_prod:
#	there is a bug in server side. which sets both isAdmin, isOrgAdmin to be false. it should be done. also metadata upload should not rely on isAdmin role.
#	need to be fixed. then uncomment the following line.
#	make auth deploy_admin_user poolId=$(OPENCHS_PROD_USER_POOL_ID) clientId=$(OPENCHS_PROD_APP_CLIENT_ID) server=https://server.openchs.org port=443 username=admin password=$(password)
	make auth deploy_wo_users poolId=$(OPENCHS_PROD_USER_POOL_ID) clientId=$(OPENCHS_PROD_APP_CLIENT_ID) server=https://server.openchs.org port=443 username=$(org_admin_name) password=$(password)

deploy_staging:
#	make auth deploy_admin_user poolId=$(OPENCHS_STAGING_USER_POOL_ID) clientId=$(OPENCHS_STAGING_APP_CLIENT_ID) server=https://staging.openchs.org port=443 username=admin password=$(password)
	make auth deploy_wo_users poolId=$(OPENCHS_STAGING_USER_POOL_ID) clientId=$(OPENCHS_STAGING_APP_CLIENT_ID) server=https://staging.openchs.org port=443 username=$(org_admin_name) password=$(password)

deploy_test_users_staging:
	make auth deploy_test_users poolId=$(OPENCHS_STAGING_USER_POOL_ID) clientId=$(OPENCHS_STAGING_APP_CLIENT_ID) server=https://staging.openchs.org port=443 username=$(org_admin_name) password=$(password)

deploy_rules: ##
	node index.js "$(server_url)" "$(token)" "$(org_admin_name)"
# </deploy>

# <c_d>
create_deploy: create_org create_views deploy ##
# </c_d>

deps:
	npm i

by_org_admin:
	$(eval username:=$(org_admin_name))

staging:
	$(eval poolId:=$(OPENCHS_STAGING_USER_POOL_ID))
	$(eval clientId:=$(OPENCHS_STAGING_APP_CLIENT_ID))
	$(eval server_url:= https://staging.openchs.org:443)

curl_staging: staging by_org_admin auth #password=password
	$(eval method:=$(if $(method),$(method),POST))
	$(call _curl,$(method),$(api),@$(file))

# <package>
#build_package: ## Builds a deployable package
#	rm -rf output/impl
#	mkdir -p output/impl
#	cp registrationForm.json catchments.json deploy.sh output/impl
#	cd output/impl && tar zcvf ../openchs_impl.tar.gz *.*
# </package>
