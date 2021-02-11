import { ZoomMtg } from "@zoomus/websdk";

// check current user
//   function getCurrentUser() {
//       ZoomMtg.getCurrentUser({
//         success: function (res) {
//         console.log("success getCurrentUser", res.result.currentUser);
//         },
//     });
//   }
console.log("#############################");
 
    // setIntervalの基本
    var timer1 = null;
    var cnt = 0;
 
    function event() {
      ZoomMtg.getCurrentUser({
        success: function (res) {
          console.log("success getCurrentUser", res.result.currentUser);
        }
      });
      cnt++;
    console.log('this time number is: ' + cnt);
    }
 
    // タイマー開始
    timer1 = setInterval(event, 3000);