'use strict';

keywordSegmentsControllers.controller('Step2Ctrl', ['$scope', 'DataShareService', function ($scope, DataShareService) {
    $scope.numShowKeywords = 50;
    $scope.currentPageNum = 0;      //0 == first page
    $scope.currentKeywordsMatched = 0;
	$scope.countArray = []
    $scope.countArraySorted = [];
    $scope.doNotDelete = [];
    $scope.matchButtonPressed = false;
    $scope.matchDuplicateButtonPressed = false;
	/*
	// Fetch Keywords, expects JSON
	$http.get('scripts/Dish Tv Sample.json').success(function(data) {
		$scope.actualData = angular.fromJson(data);
		$scope.dummyData = $scope.actualData;
        $scope.updateKeywordTable();
	});
	*/
    //////////////////////////// Keywords Table and Pager /////////////////////////
    // Updates pager(at the bottom of the table) on initial load and on change of numShowKeywords
    $scope.changePage = function(next) {
        if(next >= 0) {
            $scope.currentPageNum++;
//            DataShareService.fetchKeywords( $scope.currentPageNum * $scope.numShowKeywords , $scope.numShowKeywords, function(data) { $scope.dummyData = data; } );
        } else {
            $scope.currentPageNum = ($scope.currentPageNum === 0) ? 0 : $scope.currentPageNum - 1;
//           DataShareService.fetchKeywords( $scope.currentPageNum, $scope.numShowKeywords, function(data) { $scope.dummyData = data; } );
        }
        $scope.updateKeywordTable();
    };

    $scope.updateKeywordTable = function() {
        DataShareService.fetchKeywords( $scope.currentPageNum * $scope.numShowKeywords, $scope.numShowKeywords, function(data) {
            $scope.dummyData = data;
            if($scope.matchButtonPressed) $scope.markMatches();
        } );
    };

/*
    $scope.changePage = function(next) {
        if(next >= 0) {
            $scope.currentPageNum = ($scope.actualData.length > ($scope.currentPageNum+1)*$scope.numShowKeywords) ? $scope.currentPageNum + 1 : $scope.currentPageNum;
        } else {
            $scope.currentPageNum = ($scope.currentPageNum === 0)? 0 : $scope.currentPageNum - 1;
        }
        $scope.updateKeywordTable();
    };
*/
    // Updates keywordstable on initial load and on change of numShowKeywords
/*
    $scope.updateKeywordTable = function() {
        // Calculate Keywords to show
        // First page is currentPageNum = 0
        var startIndex = 0;
        if( Number( $scope.currentPageNum * $scope.numShowKeywords ) < Number($scope.actualData.length) ) {
            startIndex = Number( $scope.currentPageNum * $scope.numShowKeywords );
        } else {
            // Changed startIndex is too high set it to 0 and start page also
            // to 0
            startIndex = 0;
            $scope.currentPageNum = 0;
        }
        var endIndex = Number( (Number(startIndex) + Number($scope.numShowKeywords) < Number($scope.actualData.length)) ? Number(startIndex) + Number($scope.numShowKeywords) : $scope.actualData.length );
        $scope.dummyData = $scope.actualData.slice(startIndex, endIndex);
    };
*/
    //////////////////////////// End Keywords Table and Pager /////////////////////////
     $scope.markButton = function() {
        $scope.matchButtonPressed = true;
        $scope.markMatches();
    };
   
    // Mark matches between keywords and Negative Keyword List
    $scope.markMatches = function() {
       //actualData vs StopWordList Matching Code Here 
       $scope.dummyData.forEach( function(currentValue, index, array) {   // Map returns a new array leaving orginal array untouched

            if(typeof $scope.negativeKeywordList !== 'undefined') {       // Mark all false if stopWordsList does not exists

                if($scope.negativeKeywordList.length > 0) {               // Exist and has at least one element

                    if($scope.doNotDelete.indexOf(currentValue.id) === -1) {

                        if($scope.negativeKeywordList.some( function(negativeKeyword, index, array) {    //  .some returns true for matches at least one match
                            //stopWord.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, '\\$1');        // Clean stopWord of special characters
                            //stopWord = "\\b\\"+ stopWord + "\\b";                          // create a regexp
                            return new RegExp('\\b' + negativeKeyword.negativekeyword + '\\b', 'i').test(currentValue.keyword);    // returns true of false
                        }) === true) {
                            currentValue.negativeKeywordMatch = true;                      // atleast one match found in the stop word list for current keyword
                            console.log(currentValue.keyword);
                            //return currentValue;
                        } else {
                             //currentValue.negativeKeywordMatch = false;                    // no match found
                             //return currentValue;
                        }
                    }
                } else {
                    //currentValue.negativeKeywordMatch = false;                         // No element in stopWordsList
                    //return currentValue;
                }
            } else {
                //currentValue.negativeKeywordMatch = false;                             // stopWOrdsList not defined
                //return currentValue;
            }
        });
        countMatchedKeywords();
    };

    // Reset button pressed
    $scope.resetMatches = function() {
        $scope.dummyData.forEach( function(element, index) {
            element.negativeKeywordMatch = false; 
        });
        $scope.doNotDelete = [];
        $scope.matchButtonPressed = false;
        $scope.matchDuplicateButtonPressed = false;
        countMatchedKeywords();
    };
/*
    $scope.resetMatches = function() {
        $scope.actualData.forEach( function(element, index) {
            element.negativeKeywordMatch = false; 
        });
        $scope.doNotDelete = [];
        $scope.matchButtonPressed = false;
        countMatchedKeywords();
    };
*/
    // Delete matches
    $scope.deleteMatches = function() {

        if($scope.matchButtonPressed) {
            DataShareService.deleteMatchingNegativewordsFromKeywords( $scope.doNotDelete.toString(), function(res) { console.log(res); } );
            $scope.matchButtonPressed = false;
        }

        if($scope.matchDuplicateButtonPressed) {
            DataShareService.deleteDuplicatesFromKeywords( $scope.doNotDelete.toString(), function(res) { console.log(res); } );
            $scope.matchDuplicateButtonPressed = false;
        }

        countMatchedKeywords();
        $scope.updateKeywordTable();
    };
/*
    $scope.deleteMatches = function() {
        $scope.actualData = $scope.actualData.filter( function(element, index) {
			return !element.negativeKeywordMatch;
        });
		DataShareService.updateActualData($scope.actualData);
        $scope.updateKeywordTable();
		$scope.keywordCount();		// Update the word cloud
        countMatchedKeywords();
    };
*/
    // Handle manula stopWordMatch check box toggle 
    $scope.negativeKeyowrdCheckBoxToggle = function(id) {
        $scope.dummyData.forEach( function(element, index){
            if(element.id === id) {
                if(element.negativeKeywordMatch === true) {
                    element.negativeKeywordMatch = !true; 
                    if( $scope.doNotDelete.indexOf(id) === -1 ) $scope.doNotDelete.push(id);
                    //DataShareService.toggleDeleteFlag( id, element.stopWordMatch, function(res) {} );
                }
                else
                {
                    element.negativeKeywordMatch = true; 
                    if( $scope.doNotDelete.indexOf(id) !== -1 ) $scope.doNotDelete.splice( $scope.doNotDelete.indexOf(id), 1 );
                }
                //element.negativeKeywordMatch = !element.negativeKeywordMatch; 
                //console.log(element);
            }
        });
        if($scope.matchButtonPressed) $scope.markMatches();
        console.log($scope.doNotDelete);
        countMatchedKeywords();
    };
/*
    $scope.negativeKeyowrdCheckBoxToggle = function(keyword) {
        $scope.actualData.forEach( function(element, index){
            if(element.Keyword === keyword) {
                element.negativeKeywordMatch = !element.negativeKeywordMatch; 
                console.log(element);
            }
        });
        countMatchedKeywords();
    };
*/
    // Maintain a count of keywords currently matched (local function);
    var countMatchedKeywords = function() {
/*        $scope.currentKeywordsMatched = 0; 
        $scope.actualData.forEach( function(element, index) {
            if(element.negativeKeywordMatch === true) {
                $scope.currentKeywordsMatched = $scope.currentKeywordsMatched + 1;
            }
        });
*/
    };

    //////////////////////////// Handle Negative Keyword (Stop Words) Interface ///////////////////
	// Fetch Stop words list
	// Expects a string with new line separating individual words
	/*
	$http.get('scripts/NegativeKeywords_Step1.txt').success(function(data) {
		// Create JS array splitting at new line
		data = data.split('\r\n');
        $scope.addNegativeKeywordList(data);
	});
*/

    // Delete a Stop Word from the displayed list
    $scope.deleteNegativeKeyword = function(id) {
        //$scope.stopWordList.splice( $scope.stopWordList.indexOf(stopWord), 1 );
		//DataShareService.updateStopWordList($scope.stopWordList);
        DataShareService.destroyNegativeKeyword(id, function(res) {});
        $scope.updateNegativeKeywordTable();
    };
/*
    $scope.deleteNegativeKeyword = function(negativeKeyword) {
        $scope.negativeKeywordList.splice( $scope.negativeKeywordList.indexOf(negativeKeyword), 1 );
		DataShareService.updateNegativeKeywordList($scope.negativeKeywordList);
    };
*/
    // Add Negative Keyword (formarly stop word) button pressed
    // Add a new user input Stop Word to the displayed list
    $scope.addNewNegativeKeyword = function(newNegativeKeyword) {
        if(typeof newNegativeKeyword !== 'undefined') {
            // Replace multiple consicutive space with one space
            newNegativeKeyword = newNegativeKeyword.replace(/(\s)+/g, '$1');
            // Dont add only blank space input
            if(newNegativeKeyword !== '') {
                DataShareService.saveNewNegativeKeyword(newNegativeKeyword, function(res) {
                    $scope.newNegativeKeyword = "";
                    $scope.updateNegativeKeywordTable();
                });
            }
        }
    };
/*
    $scope.addNewNegativeKeyword = function(newNegativeKeyword) {
        if(typeof newNegativeKeyword !== 'undefined') {
            // Replace , with space
            newNegativeKeyword = newNegativeKeyword.split(',').join(' ');
            // Replace multiple consicutive space with one space
            newNegativeKeyword = newNegativeKeyword.replace(/(\s)+/g, '$1');
            // Dont add only blank space input
            if(newNegativeKeyword !== '') {
                // Split at space
                $scope.addNegativeKeywordList(newNegativeKeyword.split(' '));
				//$scope.markMatches();
				$scope.newNegativeKeyword = "";
            }
        }
    };
*/
    $scope.updateNegativeKeywordTable = function() {

        DataShareService.fetchNegativeKeywordList( function(data) {
            // Create JS array splitting at new line
            //console.log(data);
            //data = data.split('\r\n');
//            $scope.addStopWordList(data);
            $scope.negativeKeywordList = data;
        });
    };

    // Add string array to StopeWordsList
/*
    $scope.addNegativeKeywordList = function(data) {
        // Merge new array with any existing data
        if(typeof $scope.negativeKeywordList !== 'undefined') {
            data = data.concat($scope.negativeKeywordList);
        }
        // Make all words lower case
        //data = $.map(data, function(item) {
        data.forEach(function(item, index) {
            item = item.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, '\\$1');        // Clean stopWord of special characters
            return item.toLowerCase();
        });
        // Remove duplicates
        data = data.filter(function(elem, pos) {
            return data.indexOf(elem) === pos;
        });
        data.sort();
        $scope.negativeKeywordList = data;
		DataShareService.updateNegativeKeywordList($scope.negativeKeywordList);		
    };
*/
    //////////////////////////// End Handle Stop Words Interface ///////////////////
    
    //  Remove duplicates
    $scope.markOrderIndepDuplicates = function() {
        $scope.matchDuplicateButtonPressed = true;
        $scope.dummyData.forEach( function(element, index) {
            var temp = element.keyword.split(' ').sort().join(' ');
            $scope.dummyData.forEach (function (elem, ind) {
                if (index < ind) {
//                    if( element.Keyword.split(' ').sort().join(' ') == elem.Keyword.split(' ').sort().join(' ') )  {
                        if( temp == elem.keyword.split(' ').sort().join(' ') )  {
                        elem.negativeKeywordMatch = true;
//                        console.log(elem.Keyword);
                    }
                }
            });
        });
        countMatchedKeywords();
    };
	
	// Word Cloud Same as ctrl3 one
	// Fetch keywords count list
	$scope.keywordCount = function() {
		var max, min;
		$scope.countArray = [];
		$scope.countArraySorted = [];
		$scope.actualData.forEach( function(element, index) {
			element.Keyword.split(' ').forEach( function(elem, ind) {
				var temp = elem.trim();
				if(typeof $scope.countArray[temp] === 'undefined') {
					$scope.countArray[temp] = 1;
				} else {
					$scope.countArray[temp] = $scope.countArray[temp] + 1;
				}
			})
		});
		$scope.bySortedValue($scope.countArray, function(key, value) {
			max = (max >= value) ? max : value;
			min = (min < value) ? min : value;
			$scope.countArraySorted.push({Keyword: key, count: value, userInputSegment: '', userInputSegmentArray: []});
		});
		
		$scope.countArraySorted.forEach( function(e,i) {
			e.count = (e.count-min)/(max-min);
		});
		
		///$scope.updateKeywordTable();
	};
	// local function to sort keyword count sudo assoc array
	$scope.bySortedValue = function(obj, callback, context) {
		var tuples = [];
		for (var key in obj) {
			tuples.push([key, obj[key]]);
		}
		tuples.sort(function(a, b) { return a[1] < b[1] ? 1 : a[1] > b[1] ? -1 : 0 });
		tuples.reverse();
		var length = tuples.length;
		while (length--) callback.call(context, tuples[length][0], tuples[length][1]);
		//bySortedValue(someObj, this.method, this);
	};
  
////////////////////////////////////////// INIT	
    $scope.updateKeywordTable();
/*
	DataShareService.fetchActualData( function(data) {
		$scope.actualData = data;
		$scope.dummyData = $scope.actualData;
		$scope.updateKeywordTable();
		$scope.keywordCount();		// Update the word cloud
	});
*/
    $scope.updateNegativeKeywordTable();
/*
	DataShareService.fetchNegativeKeywordList( function(data) {
		// Create JS array splitting at new line
		//data = data.split('\r\n');
        $scope.addNegativeKeywordList(data);
	});
*/
}]);
