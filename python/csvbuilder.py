from os import listdir
from os.path import isfile, join
onlyfiles = [f for f in listdir("prices/") if isfile(join("prices/", f))]
output = ""
items = ['gtx 1050','gtx 1050 ti','gtx 1060','gtx 1070','gtx 1070 ti','gtx 1080','gtx 1080 ti','gtx 1660','gtx 1660 super','gtx 1660 ti','rtx 2060','rtx 2070','rtx 2070 super','rtx 2080','rtx 2080 super','rtx 2080 ti','rtx 3060','rtx 3060 ti','rtx 3070','rtx 3080','rtx 3090']

output = ""
line = ""
for item in items:
    line += item + ","
line = line[:-1]
output = line
#print(line)

for file in onlyfiles:
    if file.endswith(".json"):
        contents = open("prices/" + file, "r").read()
        contents = contents.replace("{","").replace("}","")
        splitCommas = contents.split(',')
        line = ""
        for item in splitCommas:
            if item.split(":")[1].replace(".","").isnumeric():
                line += item.split(":")[1] + ","
                #print(item.split(":")[1])
        line = line[:-1]
        output = output + "\n" + line

file = open("prices/joined.csv", "w")
file.write(output)
file.close()
