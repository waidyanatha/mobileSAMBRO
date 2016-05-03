#!/bin/sh
DIR=/home/lutz

RELEASEKEY=$DIR/sahana-release.keystore
RELEASEPROPERTIES=$DIR/release-signing.properties

if [[ -f "$RELEASEKEY"  && -f "$RELEASEPROPERTIES" ]] ; then   
	cp $RELEASEKEY platforms/android
	cp $RELEASEPROPERTIES platforms/android
else
	echo "-------------------------------------"
	echo "WARNING - release keystore not found in location"
	echo $RELEASEKEY
	echo "You will not be able to build a release version"	
	echo "------------------------------------"
fi
