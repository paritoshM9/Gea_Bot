# Gea_Bot



This Chatbot has been made for the GEA Hackathon 2k18. Link - https://gea-hackathon-18.hackerearth.com/ 

The demo video is here - https://youtu.be/7-aa2oR5tCU



**Instructions on running it:**

- Zip the contents of the "dialogflow" folder.
- Open google dialogflow website and sign in .
- Create a new agent and name it anything
- Go to the agent settings -> Import as zip and import the zipped file.
- Open the 'fulfillment' folder from github project 
- Follow the instructions give in 'Readme.md' in that folder to apply cloud functions in the chatbot.
- Deploy the 'inline-editor'
- Use your phone's google assistant ( logged in with the same email which you used in dialogflow) and call "Talk to my test app".
- That's it ! 




**Database Information:**

3 databases are used:

1. *Appliances*: This includes the model number, serial number and the type of appliance. In "other_files" folder , a python script 'dataToFirebase.py ' is used to convert the data from excel to json format - 'gea_data.json' which can be uploaded on firebase easily. This can be modified by admin only

   Demo data:

   | Dryer | GFD48ESSKWW | DRBG0107 |
   | ----- | ----------- | -------- |
   | Dryer | GFD48ESSKWW | DRBG0108 |
   | Dryer | GFD48ESSKWW | DRBG0109 |
   | Dryer | GFD48ESSKWW | DRBG0110 |

2. *Technician :* This contains the technician id, their name , their alloted slots and their visit timings on different days. 'gea_technician_data.json' contains their information which is uploaded on firebase. 

   This can be modified by admin only

   Sample data for pincode:

   122102

   632014

   122006

   560037

3. *Service*: This contains the booking details of all the users based on the tracking id. This is dynamic and changes according to the users activity .


**Introduction**

GeaBot is a chatbot which can help users to book service appointments for their GE appliances, reschedule existing services and even cancel the existing appointments. 

It is integrated with Google Assistant and can be integrated on many such platforms like Telegram, facebook messenger , twitter and many more. Since, we are using Google Assistant, it also supports voice commands and makes the conversation very convenient.



Here are the 4 major tasks it can do:



![](https://image.ibb.co/gn05B9/Whats_App_Image_2018_10_07_at_21_56_25_4.jpg)

**1) Book Service Appointments:** 

​	In this, initially the user has to provide the model number and serial number of the appliance for which he wants the service. 

Validation of model and serial number happens from the  appliance database stored in the Firebase.

![](https://image.ibb.co/iwTiW9/Whats_App_Image_2018_10_07_at_21_56_25_2.jpg)

Here is how the database looks like:

![](https://image.ibb.co/d0OxPU/Screenshot_288.png)



After successful verification, the user details like name, address , email are taken which are collected in a separate database for contacting purpose. 

Based on the address, we check the availability of the technicians in that pincode and give them the time slot options . 

We have a database with pincode and the technician available dates and timings.

![](https://image.ibb.co/dPJ8W9/Screenshot_289.png)



The user selects his suitable slot

![](https://image.ibb.co/k8POW9/Whats_App_Image_2018_10_07_at_21_56_25_1.jpg)

A unique tracking id is generated and an **email is sent to the user regarding his appointment.** 

![](https://image.ibb.co/mCggJp/Whats_App_Image_2018_10_07_at_21_56_25.jpg)

![](https://image.ibb.co/jyABjU/Screenshot_290.png)



**2) See Booking Details:**

This comes under manage existing service section and show the user , booked service appointment details. 

The user is supposed to give his unique service tracking id which has to be verified from the database.

![](https://image.ibb.co/mNUqB9/Whats_App_Image_2018_10_07_at_21_56_26_4.jpg)

![](https://image.ibb.co/dW2oyp/Whats_App_Image_2018_10_07_at_21_56_26_3.jpg)

Here is the look of the Booked Service database:



![](https://image.ibb.co/cGhP4U/Screenshot_287.png)



**3) Reschedule the service**

This helps the user to change the date and time of his existing booked services . It asks for the Tracking id and suggests the Service slot options once again based on the user's address.



![](https://image.ibb.co/fnQ8yp/Whats_App_Image_2018_10_07_at_21_56_26_2.jpg)

**4) Cancel your booked services:**

The user also gets an option to cancel the existing service appointment.



![](https://image.ibb.co/eB9CPU/Whats_App_Image_2018_10_07_at_21_56_26.jpg)

**Future Improvements:**

1) Finding the Pin codes directly from the given address using api , removing the need of asking user for pincode.

2) Providing user, the ability to share his location on google maps and technician can have the same location and can reach the right address easily.

3) Providing a chatbot facility for technician as well , where they can easily keep track of the bookings and locations.

4) Adding the booking date to users calendar. 