.PHONY: help
PROJECT_NAME ?= skillstring-pdf-highlight-api
DOCKER_DEV_COMPOSE_FILE := "docker/dev/docker-compose.yml"
TARGET_MAX_CHAR_NUM=10

# a variable that stores application's container id if the container is running
CONTAINER_ID := $(shell docker-compose -f docker/dev/docker-compose.yml ps -q app)
ifeq ($(CONTAINER_ID),)
	CONTAINER := $(shell docker-compose -f docker/dev/docker-compose.yml ps -q app)
else
	CONTAINER := $(shell docker ps -q --no-trunc | grep $$(docker-compose -f docker/dev/docker-compose.yml ps -q app))
endif

# function that displays an error to user if the application is not running
define container_err
	${INFO} "Please execute \"make start\" to start the app"
endef

## Show help
help:
	@echo ''
	@echo 'Usage:'
	@echo '${YELLOW} make ${RESET} ${GREEN}<target> [options]${RESET}'
	@echo ''
	@echo 'Targets:'
	@awk '/^[a-zA-Z\-\_0-9]+:/ { \
		message = match(lastLine, /^## (.*)/); \
		if (message) { \
			command = substr($$1, 0, index($$1, ":")-1); \
			message = substr(lastLine, RSTART + 3, RLENGTH); \
			printf "  ${YELLOW}%-$(TARGET_MAX_CHAR_NUM)s${RESET} %s\n", command, message; \
		} \
	} \
	{ lastLine = $$0 }' $(MAKEFILE_LIST)
	@echo ''

## Generate .env file from the provided sample
env_file:
	${INFO} "Copying sample env file to .env"
	@ cp env.sample .env
	@ echo " "
	${SUCCESS} "Sample file copied successfully, edit the file with appropriate values"

## Start local development server containers
start:
	@ ${INFO} "Creating mongodb volume"
	@ docker volume create --name=skillstring_data > /dev/null
	@ ${INFO} "Building required docker images"
	@ docker-compose -f $(DOCKER_DEV_COMPOSE_FILE) build app
	@ ${INFO} "Build Completed successfully"
	@ echo " "
	@ ${INFO} "Starting local development server"
	@ docker-compose -f $(DOCKER_DEV_COMPOSE_FILE) up

## Stop local development server containers
stop:
	${INFO} "Stop development server containers"
	@ docker-compose -f $(DOCKER_DEV_COMPOSE_FILE) down -v
	${INFO} "All containers stopped successfully"

## Remove all development containers and volumes
clean:
	${INFO} "Cleaning your local environment"
	${INFO} "Note all ephemeral volumes will be destroyed"
	@ docker-compose -f $(DOCKER_DEV_COMPOSE_FILE) down -v
	@ docker images -q -f label=application=$(PROJECT_NAME) | xargs -I ARGS docker rmi -f ARGS
	${INFO} "Removing dangling images"
	@ docker images -q -f dangling=true -f label=application=$(PROJECT_NAME) | xargs -I ARGS docker rmi -f ARGS
	@ docker system prune
	${INFO} "Clean complete"

## [ service ] Ssh into service container
ssh:
ifeq ($(CONTAINER),)
	$(call container_err)
else
	${INFO} "Open app container terminal"
	@ docker-compose -f $(DOCKER_DEV_COMPOSE_FILE) exec app ash
endif


# COLORS
GREEN  := $(shell tput -Txterm setaf 2)
YELLOW := $(shell tput -Txterm setaf 3)
WHITE  := $(shell tput -Txterm setaf 7)
NC := "\e[0m"
RESET  := $(shell tput -Txterm sgr0)
# Shell Functions
INFO := @bash -c 'printf "\n"; printf $(YELLOW); echo "===> $$1"; printf "\n"; printf $(NC)' SOME_VALUE
SUCCESS := @bash -c 'printf "\n"; printf $(GREEN); echo "===> $$1"; printf "\n"; printf $(NC)' SOME_VALUE
