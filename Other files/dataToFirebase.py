import pandas as pd
import json
data = pd.read_excel('SampleModelSerialGEA.xlsx')


dictionary = {}
dictionary["appliances"] = {}

length = len(data)
for i in range(length):
	dictionary["appliances"][i+1] = {}
	dictionary["appliances"][i+1]["Model Number"] = data["Model Number"][i]
	dictionary["appliances"][i+1]["Serial Number"] = data["Serial Number"][i]
	dictionary["appliances"][i+1]["Product Line"] = data["Product Line"][i]

with open('gea_data.json', 'w') as outfile:
    json.dump(dictionary, outfile)