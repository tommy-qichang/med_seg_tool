/**
 * Created by qichang on 10/29/16.
 */
var easyimg = require('easyimage');
var fs = require('fs');
var path = require('path');

var fixedWidth = 512;
var fixedHeight = 512;

function getStringNum(input,space){
    var sid = "00"+input;
    return sid.substring(sid.length-space);
}
function getDirectories(srcpath) {
    return fs.readdirSync(srcpath).filter(function(file) {
        return fs.statSync(path.join(srcpath, file)).isDirectory();
    });
}

function listAllImages(){
    var files = getDirectories(".");
    for(var i in files) {
        var imagesList = fs.readdirSync(files[i] + "/imgs/");
        for (var img in imagesList) {
            var images = files[i] + "/imgs/" + imagesList[img];
            easyimg.info(images).then(
                function (file) {

                    var w = file.width;
                    var h = file.height;
                    if(w != fixedWidth || h != fixedHeight){
                        console.log(file.path+"|w:"+w+"|h:"+h);
                    }
                }, function (err) {
                    console.log(err);
                }
            );
        }

    }
}

function handleImage(file){

    var w = file.width;
    var h = file.height;
    if(w != fixedWidth || h != fixedHeight){
        var realpath = path.dirname(file.path);
        var filename = path.basename(file.path);
        var origPath = realpath+"/orig";
        var origFile = realpath+"/orig/"+filename;
        if (!fs.existsSync(origPath)){
            fs.mkdirSync(origPath);
        }
        fs.renameSync(file.path,origFile);

        var minLen = Math.min(w,h);
        //w:400 h:300 400*512/300  300*512/300
        //w:800 h:512  800*512/512   512*512/512
        //w:800 h:600  800*512/600 600*512/600
        var resizeW = (w*fixedWidth)/minLen;
        var resizeH = (h*fixedHeight)/minLen;

        var config  = {
            src: origFile,
            dst: file.path,
            width:resizeW,
            height:resizeH,
            cropwidth:fixedWidth,
            height:fixedHeight,
            x:0,
            y:0
        };


    }
}

listAllImages();

//
// for(var i =1; i<32;i++){
//     var sid = getStringNum(i,2);
//
//     var tid = getStringNum(i+2,2);
//
//     var config  = {
//         src:"./ser002img000"+strId2+".dcm.jpeg",
//         dst:"./dst/ser002img000"+strId1+".dcm.jpeg",
//         width:759.5,
//         height:512,
//         cropwidth:512,
//         height:512,
//         x:0,
//         y:0
//     };
//     console.log(config.src+"|"+config.dst);
//     easyimg.rescrop(config).then(function(image){
//         console.log('resize success for id:'+strId);
//     },function(err){
//         console.log(err);
//     });
// }