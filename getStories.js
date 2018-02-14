const {
  getStories,
  getMediaByCode,
  getUserByUsername
} = require('instagram-stories');
var fs = require('fs');
var download = require('download-file');
var req = require('request');
var argv = require('minimist')(process.argv.slice(2));

//Your instagram id
const personalUserId = "";

//get it in the cookies of your browser once you're connected to instagram on the computer
const mySessionId = "";

if(argv.u){
  var username = argv.u;
  var dataDir = "./data/" + username + "/";

  req('https://www.instagram.com/' + username + '/?__a=1', function(err,resp,body){

    var instaObj = JSON.parse(body);

    if(argv.s){
      getStories({ id: instaObj.user.id, userid: personalUserId, sessionid: mySessionId}).then(stories => {
        stories.items.forEach(function (elem){

          //elem_media type : 1 = picture, 2 = video
          if(elem.media_type == 1){
            if(!fs.existsSync(dataDir + elem.device_timestamp + ".jpg")){
              download(elem.image_versions2.candidates[0].url,{directory : dataDir, filename : elem.device_timestamp + ".jpg"});
            } else {
              console.log("jpg already existing : " + elem.device_timestamp);
            }
          }

          else if(elem.media_type == 2){
            if(!fs.existsSync(dataDir + elem.device_timestamp + ".mp4")){
              download(elem.video_versions[0].url,{directory : dataDir, filename : elem.device_timestamp + ".mp4"});
            } else {
              console.log("mp4 already existing : " + elem.device_timestamp);
            }
          }
        });
      });
    }

    if(argv.p) {

      //Replace some parts of the url to get full size picture
      var url = instaObj.user.profile_pic_url_hd.replace("vp/","");
      url = url.replace("s320x320","s1080x1080");

      var pdpName = url.split('/');
      pdpName = pdpName[pdpName.length - 1];

      if(!fs.existsSync( dataDir + "pdp_" + pdpName)){
        download(url,{directory : dataDir, filename : "pdp_" + pdpName});
      } else {
        console.log("pdp_" + pdpName + " is already downloaded");
      }
    }
  });
} else if(!argv.h) {
  console.log("You must set a username using : -u <username>");
}

if(argv.h){
  console.log("Help :\n     -u <username> : set the username of the account you want\n     -p : get profile picture\n     -s : get stories");
}
