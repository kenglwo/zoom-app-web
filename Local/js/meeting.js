import { ZoomMtg } from "@zoomus/websdk";
const testTool = window.testTool;
// get meeting args from url
const tmpArgs = testTool.parseQuery();
const meetingConfig = {
  apiKey: tmpArgs.apiKey,
  meetingNumber: tmpArgs.mn,
  userName: (function () {
    if (tmpArgs.name) {
      try {
        return testTool.b64DecodeUnicode(tmpArgs.name);
      } catch (e) {
        return tmpArgs.name;
      }
    }
    return (
      "CDN#" +
      tmpArgs.version +
      "#" +
      testTool.detectOS() +
      "#" +
      testTool.getBrowserInfo()
    );
  })(),
  passWord: tmpArgs.pwd,
  leaveUrl: "/index.html",
  role: parseInt(tmpArgs.role, 10),
  userEmail: (function () {
    try {
      return testTool.b64DecodeUnicode(tmpArgs.email);
    } catch (e) {
      return tmpArgs.email;
    }
  })(),
  lang: tmpArgs.lang,
  signature: tmpArgs.signature || "",
  china: tmpArgs.china === "1",
};

console.log(JSON.stringify(ZoomMtg.checkSystemRequirements()));

// it's option if you want to change the WebSDK dependency link resources. setZoomJSLib must be run at first
ZoomMtg.preLoadWasm();
ZoomMtg.prepareJssdk();
function beginJoin(signature) {
  ZoomMtg.init({
    leaveUrl: meetingConfig.leaveUrl,
    webEndpoint: meetingConfig.webEndpoint,
    success: function () {
      console.log(meetingConfig);
      console.log("signature", signature);
      ZoomMtg.i18n.load(meetingConfig.lang);
      ZoomMtg.i18n.reload(meetingConfig.lang);
      ZoomMtg.join({
        meetingNumber: meetingConfig.meetingNumber,
        userName: meetingConfig.userName,
        signature: signature,
        apiKey: meetingConfig.apiKey,
        userEmail: meetingConfig.userEmail,
        passWord: meetingConfig.passWord,
        success: function (res) {
          console.log("join meeting success");
          console.log("get attendeelist");
          ZoomMtg.getAttendeeslist({
            success: function (res) {
              // TODO: send data to the server
              // console.log("success!!", res.result);
              const attendeesList = JSON.stringify(res.result.attendeesList);
              // const attendeesList = JSON.stringify(res.result);
              console.log(attendeesList);

              const today = new Date();
              const captureStart = `${today.getFullYear()}-${today.getMonth()+1}-${today.getDate()} ${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`              

              const meetingInfo = {
                "meeting_id": meetingConfig.meetingNumber,
                "datetime_start": captureStart,
                "attendees_list": attendeesList
              }

              console.log(meetingInfo);

              var xhr = new XMLHttpRequest();
              xhr.open('POST', 'http://localhost:3000/api/zoom/attendees_list');
              xhr.setRequestHeader('content-type', 'application/json;charset=UTF-8');
              xhr.send(JSON.stringify(meetingInfo));
            },
          });
          // ZoomMtg.getCurrentUser({
          //   success: function (res) {
          //     console.log("success getCurrentUser", res.result.currentUser);
          //   },
          // });
        },
        error: function (res) {
          console.log(res);
        },
      });
    },
    error: function (res) {
      console.log(res);
    },
  });

  ZoomMtg.inMeetingServiceListener('onUserJoin', function (data) {
    console.log('inMeetingServiceListener onUserJoin', data);
  });

  ZoomMtg.inMeetingServiceListener('onUserLeave', function (data) {
    console.log('inMeetingServiceListener onUserLeave', data);
  });

  ZoomMtg.inMeetingServiceListener('onUserIsInWaitingRoom', function (data) {
    console.log('inMeetingServiceListener onUserIsInWaitingRoom', data);
  });

  ZoomMtg.inMeetingServiceListener('onMeetingStatus', function (data) {
    console.log('inMeetingServiceListener onMeetingStatus', data);
    if(data.meetingStatus === 3){
      const today = new Date();
      const timestamp = `${today.getFullYear()}-${today.getMonth()+1}-${today.getDate()} ${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`;

      const meetingEndInfo = {
          'datetime_end': timestamp
      }

      console.log(">>>>>>>>>>>> Leaving from the meeting....");
      console.log(meetingEndInfo);

      var xhr = new XMLHttpRequest();
      xhr.open('POST', 'http://localhost:3000/api/zoom/meeting_end');
      xhr.setRequestHeader('content-type', 'application/json;charset=UTF-8');
      xhr.send(JSON.stringify(meetingEndInfo));
    }

  });

  // ZoomMtg.leaveMeeting({
  //   success: function(res) {
  //     console.log('$$$$$$$$$$$k$$$$$$$$$$$$ Leave meeting success');
  //     const today = new Date();
  //     const timestamp = `${today.getFullYear()}-${today.getMonth()+1}-${today.getDate()} ${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`;

  //     const meetingEndInfo = {
  //         'datetime_end': timestamp
  //     }

  //     var xhr = new XMLHttpRequest();
  //     xhr.open('POST', 'http://localhost:3000/api/zoom/meeting_end');
  //     xhr.setRequestHeader('content-type', 'application/json;charset=UTF-8');
  //     xhr.send(JSON.stringify(meetingEndInfo));

  //   }
  // });
  
}

beginJoin(meetingConfig.signature);
