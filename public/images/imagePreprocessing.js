#!/usr/bin/env node
//-a rename -p ./remote/images/
var easyimg = require('easyimage');
var fs = require('fs');
var exec = require('child_process').execSync;
var path = require('path');
var argv = require('yargs')
    .options('w', {
        alias: 'width',
        default: 512,
        describe: "expect resize width",
        type: "number"
    })
    .options('h', {
        alias: 'height',
        default: 512,
        describe: "expect resize height",
        type: 'number'
    })
    .options('a', {
        alias: 'action',
        default: 'val',
        describe: "actions that may take: val|resize|rename|convert",
        type: 'string'
    })
    .options('p', {
        alias: 'path',
        default: '.',
        describe: "root path of preprocessing",
        demand: true
    })
    .usage('Usage: $0 [options]')
    .example('$0 -w 512 -h 512 -a val', 'validate if the size correct as predefined.')
    .help('?')
    .alias('?', 'help')
    .argv;

function main() {

    if (argv.a == "val") {
        var lists = listAllImages(argv.p);
        testImage(lists, argv.w, argv.h);
    } else if (argv.a == "resize") {
        var lists = listAllImages(argv.p);
        testImage(lists, argv.w, argv.h, handleImage);
    } else if (argv.a == "rename"){
        var lists = listAllImages(argv.p);
        renameImages(lists);
    } else if (argv.a == "convert"){
        var lists = getDirectories(argv.p);
        convertDCM(lists,argv.p);
    }

}

function convertDCM(list,rootPath){
    for(var i in list){

        var root = path.resolve("./convert.sh").replace(' ','\\ ');
        var folder = path.resolve(path.join(rootPath,list[i])).replace(' ','\\ ');
        var item = path.basename(folder);
        var dcm2jpg = path.resolve("./dcm4che/bin/dcm2jpg").replace(' ','\\ ');
        // var imgFolder = path.resolve(dir,item,"./dicom").replace(' ','\\ ');
        // var cmd = root+' '+dcmFolder+' ' +imgFolder;
        var result = exec(root+' ' +folder+' '+item+" "+dcm2jpg);
    }

}

function getStringNum(input, space) {
    var sid = "00" + input;
    return sid.substring(sid.length - space);
}
function getDirectories(srcpath) {
    return fs.readdirSync(srcpath).filter(function (file) {
        return fs.statSync(path.join(srcpath, file)).isDirectory();
    });
}

function listAllImages(rootPath) {
    var files = getDirectories(rootPath);
    var checkImagesList = [];
    for (var i in files) {
        var imagesList = fs.readdirSync(path.join(rootPath, files[i], "imgs"));
        for (var img in imagesList) {
            var images = path.join(rootPath, files[i], "imgs", imagesList[img]);
            if (/(jpeg|jpg|gif)$/.test(images)) {
                checkImagesList.push(images);
            }
        }
    }
    return checkImagesList;
}

function renameImages(imageList) {
    for (var i in imageList) {
        var imgPath = imageList[i];
        var baseName = path.basename(imgPath);
        var dirName = path.dirname(imgPath);
        var len = imageList.length;
        if(i%10 ==0){
            console.log(Math.round((i / len) * 100) + "%finished");
        }
        if (/^IM/.test(baseName)) {
            var origId = parseInt(baseName.substring(0,baseName.length-5).substring(2));
            var id = getStringNum(++origId,2);
            var newPath = path.join(dirName, `ser002img000${id}.dcm.jpeg`);
            fs.renameSync(imgPath,newPath);
        }
    }
}

function testImage(checkImagesList, fixedWidth, fixedHeight, imageHandler) {
    var curIdex = 0;
    var len = checkImagesList.length;
    var maximunImageNumber = 30;
    var curImageNumber = 0;
    var needResize = false;
    var handler = setInterval(function () {
        if (curIdex >= len) {
            if (needResize == true) {
                console.log("Need Resize the images");
            } else {
                console.log("finished scan, do not need resize any image.");
            }
            clearInterval(handler);
            return;
        }
        if (curIdex % 10 == 0) {
            console.log(Math.round((curIdex / len) * 100) + "%finished");
        }
        if (curImageNumber < maximunImageNumber) {
            var curImage = checkImagesList[curIdex];
            curImageNumber++;
            curIdex++;
            // console.log("check image:"+curImage+"| curImageNumber:"+curImageNumber+"| curIdx:"+curIdex);
            easyimg.info(curImage).then(
                function (file) {
                    var w = file.width;
                    var h = file.height;

                    if (w != fixedWidth || h != fixedHeight) {
                        console.log("====>" + file.path + "|w:" + w + "|h:" + h);
                        if (imageHandler != undefined) {
                            imageHandler(file, fixedWidth, fixedHeight);
                        }
                        needResize = true;
                    }
                    curImageNumber--;
                }, function (err) {
                    console.log(err);
                    curImageNumber--;
                }
            );

        }


    }, 10);

}

function handleImage(file, fixedWidth, fixedHeight) {

    var w = file.width;
    var h = file.height;
    if (w != fixedWidth || h != fixedHeight) {
        var realpath = path.dirname(file.path);
        var filename = path.basename(file.path);
        var origPath = realpath + "/orig";
        var origFile = realpath + "/orig/" + filename;
        if (!fs.existsSync(origPath)) {
            fs.mkdirSync(origPath);
        }
        fs.renameSync(file.path, origFile);

        var minLen = Math.min(w, h);
        //w:400 h:300 400*512/300  300*512/300
        //w:800 h:512  800*512/512   512*512/512
        //w:800 h:600  800*512/600 600*512/600
        var resizeW = (w * fixedWidth) / minLen;
        var resizeH = (h * fixedHeight) / minLen;

        var config = {
            src: origFile,
            dst: file.path,
            width: resizeW,
            height: resizeH,
            cropwidth: fixedWidth,
            height: fixedHeight,
            x: 0,
            y: 0
        };
        easyimg.rescrop(config).then(function (image) {
            console.log('resize success for id:' + image.path);
        }, function (err) {
            console.log(err);
        });


    }
}

main();