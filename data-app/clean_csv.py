import pandas as pd
import json
import requests
import re

RUNS = 0


def fetch_unknown_prof(x):
    global RUNS
    if RUNS < 20:
        dept = x["SUBJECT"].iloc[0]
        catalog_nbr = x["CATALOG_NBR"].iloc[0]
        term = str(x["TERM"].iloc[0])
        section = x["CLASS_SECTION"].iloc[0]
        level=catalog_nbr[0]
        professor="null"

        with requests.get("http://classinfo.umn.edu/?subject="+dept+"&term="+term+"&level="+level+"&json=1") as url:
            print("url: http://classinfo.umn.edu/?subject="+dept+"&term="+term+"&level="+level+"&json=1")
            try:
                decodedContent=url.content.decode("latin-1")
                data=json.loads(decodedContent,strict=False)
                print(json.dumps(data,indent=2))
                for key in data:
                    if re.search((term+"-"+dept+"-"+catalog_nbr),key)!=None:
                        classComp=data[key]["Class Component"]
                        if classComp=="Lecture" or classComp=="LEC": #Are there any other ways they specifiy lectures?
                            professor=re.findall("\\t(.*)",data[key]["Instructor Data"])[0]
            except ValueError:
                print("Json malformed, icky!")
            except KeyError:
                print("No Instructor data, very sad")
                RUNS=100

        print(f"{dept} {catalog_nbr} section {section} taught on term {term} which is a level {catalog_nbr[0]} class and was taught by {professor}.")
        RUNS += 1

df = pd.read_csv("raw_data.csv",dtype={6:str,14:str})
# Unneeded Data
del df["INSTITUTION"]
del df["CAMPUS"]
del df["Unnamed: 14"]
del df["JOBCODE_DESCR"]
del df["TERM_DESCR"]
del df["CLASS_HDCNT"]
del df["INSTR_ROLE"]
df = df[~(df["CRSE_GRADE_OFF"] == "NR")]
# Add missing term numbers for most recent semester, cast to take from float to int.
df["TERM"] = df["TERM"].fillna(1209)
df = df.astype({"TERM":int})
# Write class name as the proper full name that students are accustomed to.
df["FULL_NAME"] = df["SUBJECT"] + ' ' + df["CATALOG_NBR"]
# Replace unknown professor values with either a correct name or "Unknown Professor"
df[df["HR_NAME"].isnull()].groupby(["TERM","FULL_NAME","CLASS_SECTION"]).apply(fetch_unknown_prof)
df["HR_NAME"] = df["HR_NAME"].fillna("Unknown Professor")
df.to_csv("cleaned_data.csv",index=False)
