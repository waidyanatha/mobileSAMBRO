#!/bin/bash

ZIPALIGN=/var/lib/jenkins/possum/android-sdk-linux/build-tools/20.0.0/zipalign
#ZIPALIGN=/Users/lutz/Library/Android/sdk/build-tools/23.0.2/zipalign
BUILDLOC=platforms/android/build/outputs/apk
APK=android-release-unsigned.apk
TARGETBASE=SAMBROmobile


VERSION=`grep "version=" config.xml|grep -v xml |awk -F '"' '{print $2}'`

TARGET=$TARGETBASE-$VERSION.apk

if [ -f $BUILDLOC/$TARGET ]; then
	rm $BUILDLOC/$TARGET
fi

if [ -f $ZIPALIGN ]; then
	$ZIPALIGN -v 4 $BUILDLOC/$APK $BUILDLOC/$TARGET
else
	echo "ZIPALIGN not found"
fi
