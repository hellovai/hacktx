#/bin/bash

function json_escape(){
  echo -n $1 | python -c 'import json,sys; print json.dumps(sys.stdin.read())'
}

PROBLEM="$1"
CODE="$2"

COUNTER=1
printf "["
for i in $(ls ./data/$PROBLEM/*.in)
do
	STATUS="PASS"
	EXTRA=""
	ans=$(echo $i | rev | cut -c 4- | rev)
	answer=$ans".ans"
	OUTPUT=$(cat $i | python run_sandbox.py "$CODE") # | perl -pe 's/\\/\\\\/g' | perl -pe 's/"/\\"/g' | perl -pe "s/'/\\'/g" | perl -pe "s/\n/\\n/g" | perl -pe "s/\t/\\t/g")
	INPUT=$(cat $i);
	DIFF=$(diff <(echo $OUTPUT) <(cat $answer));
	if [ "$DIFF" != "" ] 
	then
	    STATUS="FAIL"
	fi
	# OUTPUT=$(echo $OUTPUT | perl -pe 's/\\/\\\\/g' | perl -pe 's/"/\\"/g' | perl -pe "s/'/\\'/g" | perl -pe "s/\n/\\n/g" | perl -pe "s/\t/\\t/g")
	VAR=$(cat $i)
	printf '{"status":%s, "output":%s, "input":%s},' $(json_escape $STATUS) $(json_escape $OUTPUT) $(json_escape $VAR)
done
echo "]"
