cd $1
echo $1
mkdir -p dicom
mkdir -p imgs
mv IM* dicom

../../../dcm4che/bin/dcm2jpg $1/dicom/ $1/imgs/

cd dicom
num=$(find . -maxdepth 1 -type f|wc -l)
echo $num
cd ../..
echo \{\"dcmid\":\"$2\",\"slideNum\":$num\} > $1.json


