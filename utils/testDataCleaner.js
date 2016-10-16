/**
 * Created by qichang on 10/10/16.
 */

var cleaner = require('./dataCleaner.js');


var annotation3 = [{"pos":{"x":52.07,"y":-102.42,"z":80},"scale":{"x":59.65,"y":91.94,"z":41}},{"pos":{"x":-35.47,"y":47.2,"z":130},"scale":{"x":-93.67,"y":62.1,"z":-59}}];
result3 = cleaner.cleanAnnotation(annotation3,28);
assertEquals(result3.slideIndicator[6] ,1);
assertEquals(result3.slideIndicator[10],1 );

// TestCase("testCleaner.js",{
//     "cleaner test 1": function(){
//
//         var annotation1 = [{"pos":{"x":-35.47,"y":47.2,"z":130},"scale":{"x":-93.67,"y":62.1,"z":-59}}];
//         result1 = cleaner.cleanAnnotation(annotation1,30);
//         assertEquals(result1.slideIndicator[10] ,1 );
//         assertEquals(result1.slideIndicator[16] ,1 );
//         assertEquals(result1.slideAnnoLocation[10][0].xmax ,267 );
//         assertEquals(result1.slideAnnoLocation[10][0].xmin ,174 );
//     },
//     "cleaner test 2": function(){
//
//         var annotation2 = [{"pos":{"x":52.07,"y":-102.42,"z":80},"scale":{"x":59.65,"y":91.94,"z":41}}];
//         result2 = cleaner.cleanAnnotation(annotation2,28);
//         assertEquals(result2.slideIndicator[6] ,1);
//         assertEquals(result2.slideIndicator[10],1 );
//     }
//
// });