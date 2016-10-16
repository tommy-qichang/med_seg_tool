module.exports = {
//annotation = [{"pos":{"x":-35.47,"y":47.2,"z":130},"scale":{"x":-93.67,"y":62.1,"z":-59}}]
    cleanAnnotation: function (annotation, slideNum){

        //00: proposal neg; 01: proposal pos; 10:negative confirm; 11:positive confirm
        var slideIndicator = [];
        var slideAnnoLocation = [];
        var sizeW = 512;
        var sizeH = 512;
        for (i = 0, len = annotation.length; i < len; i++) {
            var posZ = annotation[i].pos.z / 10 + 1;
            var scaleZ = Math.round(annotation[i].scale.z / 10) / 2;

            var minX = annotation[i].pos.x - Math.abs(annotation[i].scale.x) / 2 + sizeW / 2;
            var minY = annotation[i].pos.y - Math.abs(annotation[i].scale.y) / 2 + sizeH / 2;
            var minZ = posZ - Math.abs(scaleZ);

            var maxX = annotation[i].pos.x + Math.abs(annotation[i].scale.x) / 2 + sizeW / 2;
            var maxY = annotation[i].pos.y + Math.abs(annotation[i].scale.y) / 2 + sizeH / 2;
            var maxZ = posZ + Math.abs(scaleZ);

            minX = Math.round(minX);
            minY = Math.round(minY);
            minZ = Math.round(minZ);
            maxX = Math.round(maxX);
            maxY = Math.round(maxY);
            maxZ = Math.round(maxZ);


            for (j = 0, jlen = slideNum; j < jlen; j++) {
                if (j >= (minZ - 1) && j <= (maxZ - 1)) {
                    slideIndicator[j] = 1;
                    if (slideAnnoLocation[j] == undefined) {
                        slideAnnoLocation[j] = [];
                    }
                    slideAnnoLocation[j].push({xmin: minX, ymin: sizeH - maxY, xmax: maxX, ymax: sizeH - minY})
                } else if (slideIndicator[j] == undefined) {
                    slideIndicator[j] = 0;
                    slideAnnoLocation[j] = [];
                }

            }

        }

        return {slideIndicator: slideIndicator, slideAnnoLocation: slideAnnoLocation}

    }

};