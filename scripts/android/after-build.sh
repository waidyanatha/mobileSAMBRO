#!/bin/bash

ZIPALIGN=/var/lib/jenkins/possum/android-sdk-linux/build-tools/20.0.0/zipalign
#ZIPALIGN=/Users/lutz/Library/Android/sdk/build-tools/23.0.2/zipalign
BUILDLOC=platforms/android/build/outputs/apk
APK=android-release-unsigned.apk

if [ -f $ZIPALIGN ]; then
	$ZIPALIGN -v 4 $BUILDLOC/$APK $BUILDLOC/SAMBROmobile-latest-release.apk
else
	echo "ZIPALIGN not found"
fi
