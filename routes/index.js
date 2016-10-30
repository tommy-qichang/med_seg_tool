var express = require('express');
const fs = require('fs');
var router = express.Router();
var cleaner = require('../utils/dataCleaner.js');
var imgPath = './public/data/images/';

/* GET home page. */
router.get('/', function(req, res, next) {
  info = getAnnotationInfo(imgPath);

  res.render('index', {info:info});
});


function getAnnotationInfo(root){
  var files =  fs.readdirSync(root);
  var allJsonFiles = {};
  for (var i in files){
    if(/\d+\.json/.test(files[i])){

      var key = files[i].replace(/\.json/,'');
      var jsonFile = getOneAnnotationInfo(files[i]);
      allJsonFiles[key] = jsonFile;

    }
  }
  return allJsonFiles;
}

function getOneAnnotationInfo(fileName){
  var file = fs.readFileSync(imgPath + fileName);
  var jsonFile = JSON.parse(file);

  if(jsonFile.slideIndicator == undefined){
    var cleanAnno = cleaner.cleanAnnotation(jsonFile.annotation,jsonFile.slideNum);
    jsonFile.slideIndicator = cleanAnno.slideIndicator;
    jsonFile.slideAnnoLocation = cleanAnno.slideAnnoLocation;
  }
  return jsonFile;
}

function saveOneAnnotationInfo(fileName,jsonFile){
  fs.writeFileSync(imgPath+fileName,JSON.stringify(jsonFile));
}

/* GET annotation json data */
router.get('/lists', function(req, res, next) {
  info = getAnnotationInfo(imgPath);
  res.send(info);
});

/* GET detail page. */
router.get('/detail', function(req, res, next) {
  scanId = req.param('scan');
  var json = getOneAnnotationInfo(scanId+".json");
  res.render('detail', {info:json});
});

/* Save Annotation Image. */
router.post('/save', function(req, res, next) {
  var scanId = req.body['scan'];
  var id = req.body['id'];
  var path = `public/data/annotations/${scanId}/`;
  var fileName = `ser002img000${id}.png`;
  var annoTimeSpend = req.body['annoTimespend'];
  data = req.body['data'];
  if(scanId == undefined || id == undefined || data == undefined){
    res.status(400);
    res.send('wrong parameters');
  }
  if (!fs.existsSync(path)){
    fs.mkdirSync(path);
  }
  try{
    fs.writeFileSync(path+fileName,data.replace(/^data:image\/png;base64,/, ""),'base64');

    var jsonFile = getOneAnnotationInfo(scanId+".json");
    var index = parseInt(id)-1;
    var indicator = jsonFile.slideIndicator[index];
    if(indicator == 0){
      jsonFile.slideIndicator[index]=2;
    }else if(indicator == 1){
      jsonFile.slideIndicator[index] = 3;
    }
    if(jsonFile.annoTimeSpend == undefined){

      jsonFile.annoTimeSpend =[];
      jsonFile.annoTimeSpend[index] = annoTimeSpend;
    }else if(jsonFile.annoTimeSpend[index]==null){
      jsonFile.annoTimeSpend[index]=annoTimeSpend;
    }else{
      jsonFile.annoTimeSpend[index] += ("|"+annoTimeSpend);
    }

    saveOneAnnotationInfo(scanId+".json",jsonFile);
    res.status(200);
    res.send('success');
  }catch(e){
    console.error(e);
    res.status(500);
    res.send('fail to save');
  }

});

module.exports = router;
