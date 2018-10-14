// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues
'use strict';
 
const functions = require('firebase-functions');
const {WebhookClient} = require('dialogflow-fulfillment');
const {Card, Suggestion} = require('dialogflow-fulfillment');
const {List} = require('dialogflow-fulfillment');
//const { List } = require('actions-on-google');
const {Suggestions} = require('actions-on-google');
const admin = require('firebase-admin');
const sgMail = require('@sendgrid/mail');
const {dialogflow} = require('actions-on-google');
const app = dialogflow({debug: true});
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: 'ws://geabot-5ac27.firebaseio.com/',
});
const {
  
  Permission,
  
} = require('actions-on-google');
process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements
process.env.SENDGRID_API_KEY='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';
// app.intent('Default Welcome Intent', (conv) => {
//   conv.ask(new Permission({
//     context: 'Hi there, to get to know you better',
//     permissions: 'NAME'
//   }));
// });

// app.intent('actions_intent_PERMISSION', (conv, params, permissionGranted) => {
//   if (!permissionGranted) {
//     conv.ask(`Ok, no worries. What's your favorite color?`);
//     conv.ask(new Suggestions('Blue', 'Red', 'Green'));
//   } else {
//     conv.data.userName = conv.user.name.display;
//     conv.ask(`Thanks, ${conv.data.userName}. What's your favorite color?`);
//     conv.ask(new Suggestions('Blue', 'Red', 'Green'));
//   }
// });

// app.intent('favorite color', (conv, {color}) => {
//   const luckyNumber = color.length;
//   if (conv.data.userName) {
//     conv.close(`${conv.data.userName}, your lucky number is ${luckyNumber}.`);
//   } else {
//     conv.close(`Your lucky number is ${luckyNumber}.`);
//   }
// });


exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
  
  function dayToDate(add_number){
      var d = new Date();
      
    d.setDate(d.getDate() + add_number); 
    
    var dd = d.getDate();
    var mm = d.getMonth() + 1;
    var y = d.getFullYear();

    var s = dd + '/'+ mm + '/'+ y;
    return s;
  }
  function validatePin(agent){
      
      const pin = agent.parameters.pincode;
      //agent.add(`here is your pin - ${pin}`);
      var context = agent.getContext("issuetaken");
      var issue = context.parameters.issue;
      var key;
      var address = agent.parameters.address;
      var name = agent.parameters.name;
      var email = agent.parameters.email;
      var phone_number = agent.parameters.phone_number;
      
      var childData;
    var flag = 0;
    return admin.database().ref('technician').once("value").then(function(snapshot) {
        
        var tech;
        var day = Array();
        var start_time = Array();
        var end_time = Array();
    snapshot.forEach(function(childSnapshot) {
      // key will be "ada" the first time and "alan" the second time
      key = childSnapshot.key;
      // childData will be the actual contents of the child
      var pin_d = childSnapshot.val()["pin"];
      var technician = childSnapshot.val()["technician"];
      var e_time = childSnapshot.val()["end_time"];
      var day_d = childSnapshot.val()["day"];
      var s_time = childSnapshot.val()["start_time"];

      //childData = childSnapshot.val()["last"];
      //agent.add(`Thank you your model no is ${model_number} your key is ${key} and childData is ${childData}...`);
      //agent.add(`${model_n}   ${serial_n}   ${type}`);
      if(pin_d == pin ){
         
         tech = technician;
         day.push(day_d);
         start_time.push(s_time);
         end_time.push(e_time);
         
         
      }  
        
      //var   agent.add(`your technician is ${technician} `);
        
        
        
      //}
      
      
  });
  if(day.length>0){
  agent.add(`Choose the suitable slot from the following. You can say, the first one.`)
  agent.add(new Suggestion(`${day[0]} ${start_time[0]} - ${end_time[0]}`));
  agent.add(new Suggestion(`${day[1]} ${start_time[1]} - ${end_time[1]}`));
  agent.add(new Suggestion(`${day[2]} ${start_time[2]} - ${end_time[2]}`));

  //agent.add(new Suggestions(['suggestion 1', 'suggestion 2']));
  agent.setContext({
              name: 'userinfotaken',
              lifespan: 10,
              parameters:{day: day, tech:tech, start_time:start_time, end_time:end_time, address:address, issue:issue, name:name,pin:pin,email:email,phone_number:phone_number}
              
            });
  }
  else{
      agent.add(`Sorry! We do not service this location yet. `);
      
  }
});
      
      
      
  }
  
  function finalBookingOrdinal(agent){
      
      //const tech = agent.parameters.tech;
    var ordinal = agent.parameters.ordinal;
    //var d = agent.parameters.day;
    //var slot = agent.parameters.number;
    const context = agent.getContext("userinfotaken");
    const context_appliance = agent.getContext("serialvalidated");
    //const context_issue = agent.getContext("issueTaken");
    const serial_n = context_appliance.parameters.serial_number;
    const model_n = context_appliance.parameters.model_number;
    const type = context_appliance.parameters.type;
    const address = context.parameters.address;
    const name = context.parameters.name;
    const email = context.parameters.email;
    const phone = context.parameters.phone_number;
    const pin = context.parameters.pin;

    const issue = context.parameters.issue;
    const days_a = context.parameters.day;
    const start_time = context.parameters.start_time;
    const end_time = context.parameters.end_time;

    
    const tech = context.parameters.tech;
    const tracking_id = Math.random().toFixed(7).toString(36).replace('0.', '');
    // agent.setContext({
    //           name: 'detailsAfterBooking',
    //           lifespan: 1,
    //           parameters:{tracking_id:tracking_id}
              
    //         });
    function writeUserData(tracking_id, serial_n,model_n,type, issue, technician ,date, day, s_time, e_time,c_name,c_address, c_phone, c_email, c_pin) {
  admin.database().ref('service/' + tracking_id).set({
    
    serial_number: serial_n,
    model_number:model_n,
    appliance_type: type,
    issue : issue,
    technician_name: technician, 
    service_date: date,
    service_day: day,
    from:s_time,
    to:e_time,
    customer_name:c_name,
    customer_email:c_email,
    customer_phone:c_phone,
    customer_address:c_address,
    customer_pin:c_pin
  });
}

    //var day_a = Array("sunday","monday","tuesday","wednesday","thursday","friday","saturday");
    //var date = new Date();
    // var day_num = date.getDay();
    // var day = day_a.findIndex(days_a[ordinal-1])
    // if(day - day_num >= 0){
    //     date = dayToDate(day-day_num);
    // }
    // else{
    //     date = dayToDate(7 - (day_num-day));
    // }
    var date = new Date().toJSON().slice(0,10).replace(/-/g,'/');
    writeUserData(tracking_id,serial_n,model_n,type,issue,tech,date,days_a[ordinal-1],start_time[ordinal-1],end_time[ordinal-1],name,address,phone,email,pin);
   
    if(ordinal){
    agent.add(`You service is confirmed on ${date}. Your tracking id is ${tracking_id}. ${tech} will come on ${days_a[ordinal-1]} from ${start_time[ordinal-1]} - ${end_time[ordinal-1]}\n\n`);
    agent.add(`An email has been sent regarding the appointment details`);
    agent.add(`Is there anything else?`);
    agent.add(new Suggestion(`Show Service Details`));
    agent.add(new Suggestion(`No! Thanks!`));
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const msg = {
      to: `${email}`,
      from: 'paritosh.mahajan98@gmail.com',
      subject: 'GEA Appliance Service Appointment',
      text:  `Hi ${name}\n\nGreetings from GEA ! Your service has been confirmed. \n\n 
      Tracking id: ${tracking_id}\n\n Serial number:${serial_n} \n\n Model number: ${model_n} \n\n Service Day:${days_a[ordinal-1]}\n\n Slot: ${start_time[ordinal - 1]} - ${end_time[ordinal-1]} \n\n Technician Name: ${tech}\n\n Address: ${address}\n\nFor more details contact us on 9999xxxx .\n\n Thank you and have a nice day!`
    };
    console.log(msg);
    sgMail.send(msg);
    
    agent.add(`Is there anything else?`);
    agent.add(new Suggestion('Show Service Details'));
    agent.add(new Suggestion(`No! Thanks`));
    }
    else{
        agent.add(`Sorry! I didn't get that`);
    } 
    
  }
  
  //------------------------------------------------------------------------
  
  function finalBookingDay(agent){
      
      //const tech = agent.parameters.tech;
    var day = agent.parameters.days;
    var time_period = agent.parameters.timeperiod;
    //var d = agent.parameters.day;
    //var slot = agent.parameters.number;
    const context = agent.getContext("userinfotaken");
    const context_appliance = agent.getContext("serialvalidated");
    //const context_issue = agent.getContext("issueTaken");
    const serial_n = context_appliance.parameters.serial_number;
    const model_n = context_appliance.parameters.model_number;
    const type = context_appliance.parameters.type;
    const address = context.parameters.address;
    const name = context.parameters.name;
    const email = context.parameters.email;
    const phone = context.parameters.phone_number;
    const pin = context.parameters.pin;

    const issue = context.parameters.issue;
    const days_a = context.parameters.day;
    const start_time = context.parameters.start_time;
    const end_time = context.parameters.end_time;

    
    const tech = context.parameters.tech;
    const tracking_id = Math.random().toFixed(7).toString(36).replace('0.', '');
    // agent.setContext({
    //           name: 'detailsAfterBooking',
    //           lifespan: 1,
    //           parameters:{tracking_id:tracking_id}
              
    //         });
    function writeUserData(tracking_id, serial_n,model_n,type, issue, technician ,date, day, s_time, e_time,c_name,c_address, c_phone, c_email, c_pin) {
  admin.database().ref('service/' + tracking_id).set({
    
    serial_number: serial_n,
    model_number:model_n,
    appliance_type: type,
    issue : issue,
    technician_name: technician, 
    service_date: date,
    service_day: day,
    from:s_time,
    to:e_time,
    customer_name:c_name,
    customer_email:c_email,
    customer_phone:c_phone,
    customer_address:c_address,
    customer_pin:c_pin
  });
}
    //var day_a = Array("sunday","monday","tuesday","wednesday","thursday","friday","saturday");
    //var date = new Date();
    var date = new Date().toJSON().slice(0,10).replace(/-/g,'/');

    // var day_num = date.getDay();
    // var day_booking = day_a.findIndex(day)
    // if(day_booking - day_num >= 0){
    //     date = dayToDate(day_booking-day_num);
    // }
    // else{
    //     date = dayToDate(7 - (day_num-day_booking));
    // }
    writeUserData(tracking_id,serial_n,model_n,type,issue,tech,date,day,time_period[0],time_period[1],name,address,phone,email,pin);
    //agent.add(`${name} ${address} ${phone} ${email} ${pin}`)
    if(time_period){
    agent.add(`You service is confirmed. Your tracking id is ${tracking_id}. ${tech} will come on ${day} from ${time_period[0]} - ${time_period[1]}\n\n`);
    agent.add(`An email has been sent regarding the appointment details`);
    
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const msg = {
      to: `${email}`,
      from: 'paritosh.mahajan98@gmail.com',
      subject: 'GEA Appliance Service Appointment',
      text:  `Hi ${name} ! \n\nGreetings from GEA ! Your service has been confirmed. \n\n 
      Tracking id: ${tracking_id}\n\n Serial number:${serial_n} \n\n Model number: ${model_n} \n\n Service Day:${day}\n\n Slot: ${time_period[0]} - ${time_period[1]} \n\n Technician Name: ${tech}\n\n Address: ${address}\n\n For more details contact us on 9999xxxx .\n\n Thank you and have a nice day!`
    };
    console.log(msg);
    sgMail.send(msg);
    
    agent.add(`Is there anything else?`);
    agent.add(new Suggestion('Show Service Details'));
    agent.add(new Suggestion(`No! Thanks`));    
        
        
        
    }
    else{
        var index = 0;
        if(days_a[1] == day){
            index = 1;
        }
        else if(days_a[2] == day){
            index = 2;
        }
        time_period = Array(start_time[index], end_time[index]);
        agent.add(`You service is confirmed on ${date}. Your tracking id is ${tracking_id}. ${tech} will come on ${day} from ${time_period[0]} - ${time_period[1]}`);

    } 
  }
  
  //-----------------------------------------------------------------------------
  function trackService(agent){
    
    const tracking_id = agent.parameters.tracking_id;
    return admin.database().ref('service').once("value").then(function(snapshot) {
    var flag = 1;
    snapshot.forEach(function(childSnapshot) {
      // key will be "ada" the first time and "alan" the second time
      var key = childSnapshot.key;
      // childData will be the actual contents of the child
      var appliance_type = childSnapshot.val()["appliance_type"];
      var serial_n = childSnapshot.val()["serial_number"];
      var service_day = childSnapshot.val()["service_day"];
      var from = childSnapshot.val()["from"];
      var to = childSnapshot.val()["to"];
      var issue = childSnapshot.val()["issue"];
      var tech = childSnapshot.val()["technician_name"];
      var address = childSnapshot.val()["customer_address"];
      var date = childSnapshot.val()["service_date"];
      if(key === tracking_id && flag===1){
      agent.add(`Got it! Here are your service details:\n\nTracking id: ${tracking_id}\nAppliance Type:${appliance_type}\nSerial number: ${serial_n}\nService Day:${service_day}\nIssue:${issue}\nSlot: ${from} - ${to}\nDate: ${date} \nTechnician Name: ${tech}\n\nWhat do you want to do ?`
    );
      flag = 0;
      
      }
      
  });
  
  if(flag ===1){
          agent.add(`Not a valid tracking id`);
      }
      agent.add(new Suggestion(`Cancel the service`));
      agent.add(new Suggestion('Reschedule the service'));
  
  
  
  //agent.add(new Suggestion(`Cancel the service`));
    //agent.add(new Suggestion(`Reschedule the service`));
});

  }
  
  //----------------------------------------------------------------------------
  
  function cancelService(agent){
      
      const context = agent.getContext("cancelorreschedule");
      const tracking_id = context.parameters.tracking_id;
      agent.add('Your service has been cancelled successfully.');
      agent.add(`Is there anything else?`);
      agent.add(new Suggestion(`Book a service`));
      agent.add(new Suggestion(`No! Thanks!`));
      return admin.database().ref('service/' + tracking_id).remove();
      
      
  }
  
  //----------------------------------------------------------------------------
  
  function rescheduleService(agent){
      
     const context = agent.getContext("cancelorreschedule");
     const tracking_id = context.parameters.tracking_id;  
     var service_day;
     var from;
     var to;
     var pin;
     return admin.database().ref('service/'+tracking_id)
     .once("value").then(function(snapshot) {
         pin = snapshot.val()["customer_pin"];
         
         //-----------------------------
                
                return admin.database().ref('technician').once("value").then(function(snapshot) {
        
                var tech;
                    var days_a = Array();
                    var start_time = Array();
                    var end_time = Array();     
                snapshot.forEach(function(childSnapshot) {
                  // key will be "ada" the first time and "alan" the second time
                  var key = childSnapshot.key;
                  // childData will be the actual contents of the child
                  var pin_d = childSnapshot.val()["pin"];
                  var technician = childSnapshot.val()["technician"];
                  var e_time = childSnapshot.val()["end_time"];
                  var day_d = childSnapshot.val()["day"];
                  var s_time = childSnapshot.val()["start_time"];
            
                  //childData = childSnapshot.val()["last"];
                  //agent.add(`Thank you your model no is ${model_number} your key is ${key} and childData is ${childData}...`);
                  //agent.add(`${model_n}   ${serial_n}   ${type}`);
                  if(pin_d == pin ){
                     
                     tech = technician;
                     days_a.push(day_d);
                     start_time.push(s_time);
                     end_time.push(e_time);
                     
                     
                  }  
                 
              
              
              
            });
              if(days_a.length>0){
              agent.add(`Ok ! Choose the suitable slot from the following. You can say, the first one.`)
              agent.add(new Suggestion(`${days_a[0]} ${start_time[0]} - ${end_time[0]}`));
              agent.add(new Suggestion(`${days_a[1]} ${start_time[1]} - ${end_time[1]}`));
              agent.add(new Suggestion(`${days_a[2]} ${start_time[2]} - ${end_time[2]}`));
            
             
               }
              
            });
                     
                     
                     
                     
         
         //------------------------------
         //agent.add(`${pin}`);
});
   
      
  }
  
  //---------------------------------------------------------------------------
  function updateUserData(tracking_id, technician ,day, s_time, e_time) {
                  admin.database().ref('service/' + tracking_id).update({
                    
                   
                    technician_name: technician, 
                    service_day: day,
                    from:s_time,
                    to:e_time,
                    
                  });
             
              }
  function rescheduleOrdinal(agent){
      var ordinal = agent.parameters.ordinal;
      const context = agent.getContext("cancelorreschedule");
      var tracking_id = context.parameters.tracking_id;
    //   agent.setContext({
    //               name: 'detailsAfterRescheduling',
    //               lifespan: 1,
    //               parameters:{tracking_id:tracking_id}
              
    //         });
    
      //agent.add(`${tracking_id}`)
     var service_day;
     var from;
     var to;
     var pin;
     return admin.database().ref('service/'+tracking_id)
     .once("value").then(function(snapshot) {
         pin = snapshot.val()["customer_pin"];
         
         //-----------------------------
                
                return admin.database().ref('technician').once("value").then(function(snapshot) {
        
                var tech;
                    var days_a = Array();
                    var start_time = Array();
                    var end_time = Array();     
                    snapshot.forEach(function(childSnapshot) {
                  // key will be "ada" the first time and "alan" the second time
                  var key = childSnapshot.key;
                  // childData will be the actual contents of the child
                  var pin_d = childSnapshot.val()["pin"];
                  var technician = childSnapshot.val()["technician"];
                  var e_time = childSnapshot.val()["end_time"];
                  var day_d = childSnapshot.val()["day"];
                  var s_time = childSnapshot.val()["start_time"];
                  if(pin_d == pin ){
                     
                     tech = technician;
                     days_a.push(day_d);
                     start_time.push(s_time);
                     end_time.push(e_time);
                     
                     
                  }  
                 
              
              
              
            });
              if(days_a.length>0){
                service_day = days_a[ordinal - 1];
                from = start_time[ordinal-1];
                to = end_time[ordinal-1];

                updateUserData(tracking_id,tech,service_day, from,to);
                agent.add(`Record successfully updated `);
                agent.add(`Service is booked on ${service_day}. ${tech} will come in between ${from} to ${to}`);
                agent.add(`Is there anything else?`);
                
                agent.add(new Suggestion("manage existing service"));
                //agent.add(new Suggestion(`No! Thanks`));
                
              }
              
            });
                          //------------------------------
         //agent.add(`${pin}`);
});
   
   
  }
  
  //--------------------------------------------------------------------------
  function rescheduleDay(agent){
     var service_day = agent.parameters.days;
     var time = agent.parameters.time;
     const context = agent.getContext("cancelorreschedule");
     var tracking_id = context.parameters.tracking_id;
    //  agent.setContext({
    //                   name: 'detailsAfterRescheduling',
    //                   lifespan: 1,
    //                   parameters:{tracking_id:tracking_id}
                  
    //             });
      //agent.add(`${tracking_id}`)
     var from = time[0];
     var to = time[1];
     var pin;
     var tech;
     //agent.add(`${service_day} ${to} ${tracking_id}`);
     
     return admin.database().ref('service/'+tracking_id)
     .once("value").then(function(snapshot) {
         pin = snapshot.val()["customer_pin"];
         
         //-----------------------------
                
                return admin.database().ref('technician').once("value").then(function(snapshot) {
        
                snapshot.forEach(function(childSnapshot) {
                  // key will be "ada" the first time and "alan" the second time
                  var key = childSnapshot.key;
                  // childData will be the actual contents of the child
                  var technician = childSnapshot.val()["technician"];
                  var day_d = childSnapshot.val()["day"];
                  var pin_d = childSnapshot.val()["pin"];

                  if(pin_d == pin && day_d == service_day ){
                     
                     tech = technician;
                     updateUserData(tracking_id,tech,service_day, from,to);
                     agent.add(`Record successfully updated `);
                     agent.add(`Service is booked on ${service_day}. ${tech} will come in between ${from} to ${to}`);
                     agent.add(`Is there anything else?`);
                    
                     agent.add(new Suggestion(`manage existing service`));
                     agent.add(new Suggestion(`No! Thanks`));
                     
                     return;
                    
                  }  
                 
              
            });
              

              
            });
                          //------------------------------
         //agent.add(`${pin}`);
});
   
   
  }
  //---------------------------------------------------------------------------
  function bookService(agent){
      
      agent.add(`To book a service appointment, I would need few details. Can you please tell me the model number and the serial number of your appliance.`);
  }
  //---------------------------------------------------------------------------
  
  //---------------------------------------------------------------------------
  function listhandler(agent){
      var value = agent.getContextArgument('actions_intent_option', 'OPTION').value;
      agent.add(`${value} hehehe`);

  }
  //----------------------------------------------------------------------------
  function issueCapture(agent){
      var issue = agent.parameters.issue;
      agent.setContext({
              name: 'issueTaken',
              lifespan: 10,
              parameters:{issue:issue}
              
            });
      agent.add("For booking a service we may need some more details. Please enter your name");
  }
  
  function handleModel(agent) {
    const model_number = agent.parameters.model_number;

    const serial_number = agent.parameters.serial_number;
    
    var query = admin.database().ref("users").orderByKey();
    var key;
    var childData;
    var flag = 0;
    var type;
    return admin.database().ref('appliances').once("value").then(function(snapshot) {
    snapshot.forEach(function(childSnapshot) {
      // key will be "ada" the first time and "alan" the second time
      key = childSnapshot.key;
      // childData will be the actual contents of the child
      var model_n = childSnapshot.val()["Model Number"];
      var serial_n = childSnapshot.val()["Serial Number"];

      type = childSnapshot.val()["Product Line"];

      //childData = childSnapshot.val()["last"];
      //agent.add(`Thank you your model no is ${model_number} your key is ${key} and childData is ${childData}...`);
      //agent.add(`${model_n}   ${serial_n}   ${type}`);
      if(model_n === model_number && serial_n === serial_number){
        if(flag === 0){
        agent.add(`Appliance verified successfully and its a ${type}\nKindly tell us about the issue in details`);
        flag = 1;
        agent.setContext({
              name: 'serialvalidated',
              lifespan: 10,
              parameters:{model_number:model_number,serial_number:serial_number,type:type}
              
            });
        return;
        }
      }
      
      
  });
  if(flag === 0){
      agent.add(`Given details are not valid`);
      agent.add(new Suggestion('Reenter details'));
  }
});

  }
  function getServiceDetailsAfterBooking(agent){
    const context = agent.getContext("detailsAfterBooking");
    
      const tracking_id = context.parameters.tracking_id;
    return admin.database().ref('service').once("value").then(function(snapshot) {
    var flag = 1;
    snapshot.forEach(function(childSnapshot) {
      // key will be "ada" the first time and "alan" the second time
      var key = childSnapshot.key;
      // childData will be the actual contents of the child
      var appliance_type = childSnapshot.val()["appliance_type"];
      var serial_n = childSnapshot.val()["serial_number"];
      var service_day = childSnapshot.val()["service_day"];
      var from = childSnapshot.val()["from"];
      var to = childSnapshot.val()["to"];
      var issue = childSnapshot.val()["issue"];
      var tech = childSnapshot.val()["technician_name"];
      var address = childSnapshot.val()["customer_address"];
      if(key === tracking_id && flag===1){
      agent.add(`Here are your updated service details:\n\nTracking id: ${tracking_id}\nAppliance Type:${appliance_type}\nSerial number: ${serial_n}\nService Day:${service_day}\nIssue:${issue}\nSlot: ${from} - ${to}\nTechnician Name: ${tech}\n\nWhat do you want to do ?`
    );
      flag = 0;
      
      }
      
  });
 
  
  //agent.add(new Suggestion(`Cancel the service`));
    //agent.add(new Suggestion(`Reschedule the service`));
});
  }
  
  
  function getServiceDetailsAfterRescheduling(agent){
    const context = agent.getContext("detailsAfterRescheduling");
    agent.add(`Here are your details:`);
    const tracking_id = context.parameters.tracking_id;
    return admin.database().ref('service').once("value").then(function(snapshot) {
    var flag = 1;
    snapshot.forEach(function(childSnapshot) {
      // key will be "ada" the first time and "alan" the second time
      var key = childSnapshot.key;
      // childData will be the actual contents of the child
      var appliance_type = childSnapshot.val()["appliance_type"];
      var serial_n = childSnapshot.val()["serial_number"];
      var service_day = childSnapshot.val()["service_day"];
      var from = childSnapshot.val()["from"];
      var to = childSnapshot.val()["to"];
      var issue = childSnapshot.val()["issue"];
      var tech = childSnapshot.val()["technician_name"];
      var address = childSnapshot.val()["customer_address"];
      if(key === tracking_id && flag===1){
      agent.add(`Here are your updated service details:\n\nTracking id: ${tracking_id}\nAppliance Type:${appliance_type}\nSerial number: ${serial_n}\nService Day:${service_day}\nIssue:${issue}\nSlot: ${from} - ${to}\nTechnician Name: ${tech}\n\nWhat do you want to do ?`
    );
      flag = 0;
      
      }
      
  });
 
  
  //agent.add(new Suggestion(`Cancel the service`));
    //agent.add(new Suggestion(`Reschedule the service`));
});
  }

  // Run the proper function handler based on the matched Dialogflow intent name
  let intentMap = new Map();
  intentMap.set('BookServiceDataCapture', handleModel);
  intentMap.set('UserInfoCapture',validatePin);
  intentMap.set('FinalBooking-Ordinal', finalBookingOrdinal);
  intentMap.set('FinalBooking-Day', finalBookingDay);
  
  intentMap.set('IssueCapture',issueCapture);
  intentMap.set('TrackService',trackService);
  intentMap.set('cancel',cancelService);
  intentMap.set('Reschedule-ShowOptions',rescheduleService);
  intentMap.set('Reschedule-Ordinal',rescheduleOrdinal);
  intentMap.set('Reschedule-Day',rescheduleDay);
  intentMap.set('GetServiceDetailsAfterBooking',getServiceDetailsAfterBooking);
  intentMap.set('GetServiceDetailsAfterRescheduling',getServiceDetailsAfterRescheduling);
  //intentMap.set('Default Welcome Intent',welcome);
  intentMap.set('ListHandler',listhandler)
//   agent.intent('ListHandler', (conv, params, option) => {
//       if (!option) {
//     conv.ask('You did not select any item from the list or carousel');
//   } else if (option === 'Book Service Appointment') {
//     conv.ask('Book');
//   } else if (option === 'EGYPT') {
//     conv.ask('42 gods who ruled on the fate of the dead in the ');
//   } else if (option === 'RECIPES') {
//     conv.ask(`Here's a beautiful simple recipe that's full `);
//   } else {
//     conv.ask('You selected an unknown item from the list, or carousel');
//   }
// //handler code goes here
// })
  agent.handleRequest(intentMap);
  
  
});
