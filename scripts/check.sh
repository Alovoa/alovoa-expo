#!/bin/bash
yarn type-check
yarn lint --fix
EXPO_DOCTOR_ENABLE_DIRECTORY_CHECK=false yarn doctor
