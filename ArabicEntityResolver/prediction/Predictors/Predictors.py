import pickle 
from rest_framework.response import Response
from Laboratory import authentication
from Laboratory.models import person
from Laboratory import utility
from Patient.models import patient
from rest_framework.exceptions import NotAcceptable
import numpy as np

from datetime import datetime 

def getPersonHealthInfo(person):
      patientt = patient.objects.filter(person=person).first()
      
      print(f"{patientt.weight} {patientt.height}")
      print(f"{patientt.person.birthday}")

      return {'birthday' :  patientt.person.birthday , 'weight' : patientt.weight , 'height':patientt.height}
      
def BMI(height , weight):
      return weight / (height * height)   

def Age(birthday):
     return f"{datetime.today().year - birthday.year}"


def Diabetes(request):
    with open("web_project/Patient/Predictors/diabetes.pkl",'rb') as file:
            Diabetes = pickle.load(file)
    access_token = request.headers.get('Authorization').split(' ')[1]
    print(request.data)
    personInfo=getPersonHealthInfo(authentication.get_token_id(access_token))
    print(getPersonHealthInfo(authentication.get_token_id(access_token))['weight'])
   
    print(BMI(getPersonHealthInfo(authentication.get_token_id(request.headers.get('Authorization').split(' ')[1]))['height'],getPersonHealthInfo(authentication.get_token_id(request.headers.get('Authorization').split(' ')[1]))['weight']))
    print(type(Age(personInfo['birthday'])))
                                                            #	gender	AGE	Urea	Cr	HbA1c	Chol	TG	HDL	LDL	BMI 
    new_row =np.array( [[ utility.getGenderrr(authentication.get_token_id(access_token)) , int(Age(personInfo['birthday'] )), float(request.data['input']['Urea']) ,float(request.data['input']['Cr'])  ,float(request.data['input']['HBA1c']) ,float(request.data['input']['Chol']),float(request.data['input']['Tg']) ,float(request.data['input']['HDL']),float(request.data['input']['LDL']) , BMI(personInfo['height'],personInfo['weight'])]])
    print(new_row)   
    print(Diabetes.predict_proba(new_row)[0]*100)
    
    proba = Diabetes.predict_proba(new_row)[0]*100
    print(proba.argmax())
    #suggestion

    if proba.argmax() == 2:
        recommondation ="It is highly recommended to consult with a healthcare professional or a specialist in diabetes to discuss further evaluation, treatment options, and lifestyle modifications"
    else : 
        recommondation = "It is advisable to take proactive measures to prevent the onset of diabetes. This includes adopting a healthy lifestyle, such as maintaining a balanced diet, regular exercise, managing stress levels, and periodic monitoring of blood sugar levels."
     
    
    return Response(data = {"labels" :['not Diabetic','Predict-diabetic' , 'Diabetic'] , "proba" :  proba  ,  "recommondation": recommondation ,  "model" : "Diabetes"  })       


    


def Anemia(request):
       with open("web_project/Patient/Predictors/logistic_regression_model.pkl",'rb') as file:
             Anemia = pickle.load(file)
            # linear_output = getXPoint(X,Anemia)
          
       access_token = request.headers.get('Authorization').split(' ')[1]
     
       new_row =np.array([[ utility.getGender(authentication.get_token_id(access_token)), float(request.data['input']['hemoglobin']),float( request.data['input']['MCH']) ,
            float(request.data['input']['MCHC']), float(request.data['input']['MCV'])]])

       proba = Anemia.predict_proba(new_row)[0][1]*100
       print(f"anemia proba {proba}")
       print(round(proba,2))
     
       if(proba > 75):
        recommondation ="Schedule an appointment with a healthcare professional to discuss your symptoms and undergo necessary tests."
       else : 
        recommondation = "Ensure you consume a balanced diet rich in iron, vitamin B12, and folate."
    
       return Response(data = {"labels" :['anemic','not anemic'] , "proba" : round(proba,2)   , "recommondation": recommondation , "model" : "Anemia" })       