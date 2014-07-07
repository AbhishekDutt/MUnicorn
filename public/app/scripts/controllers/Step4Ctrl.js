'use strict';

keywordSegmentsControllers.controller('Step4Ctrl', ['$scope', '$http', 'DataShareService', function ($scope, $http, DataShareService) {
    $scope.numShowKeywords = 20;
    $scope.currentPageNum = 0;
    $scope.currentKeywordsMatched = 0;


	$scope.exportCSV = function(){
		//var test_array = [["name1", 2, 3], ["name2", 4, 5], ["name3", 6, 7], ["name4", 8, 9], ["name5", 10, 11]];
		var test_array = $scope.actualData.map( function(e, i) {
			//console.log(e);
			return [e.Keyword, e.userInputSegment, e['Avg. Monthly Searches (exact match only)'], e.Competition, e['Suggested bid']];
		});
		test_array.unshift( ['Keyword', 'Segment', 'Avg. Monthly Searches (exact match only)', 'Competition', 'Suggested bid'] );
		var fname = "IJGResults";
		var csvContent = "data:text/csv;charset=utf-8,";
		var dataString;
		test_array.forEach(function(infoArray, index){
			dataString = infoArray.join(",");
			csvContent += dataString+ "\n";
		});

		var encodedUri = encodeURI(csvContent);
		window.open(encodedUri);
	};

	
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
            $scope.currentPageNum = ($scope.actualData.length > ($scope.currentPageNum+1)*$scope.numShowKeywords) ? $scope.currentPageNum + 1 : $scope.currentPageNum;
        } else {
            $scope.currentPageNum = ($scope.currentPageNum === 0)? 0 : $scope.currentPageNum - 1;
        }
        $scope.updateKeywordTable();
    };

    // Updates keywordstable on initial load and on change of numShowKeywords
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
    //////////////////////////// End Keywords Table and Pager /////////////////////////
    
    // Mark matches between keywords and Negative Keyword List
    $scope.markMatches = function() {
       //actualData vs StopWordList Matching Code Here 
        $scope.actualData = $scope.actualData.map( function(currentValue, index, array) {   // Map returns a new array leaving orginal array untouched

            if(typeof $scope.negativeKeywordList !== 'undefined') {       // Mark all false if stopWordsList does not exists
                if($scope.negativeKeywordList.length > 0) {               // Exist and has at least one element
                    if($scope.negativeKeywordList.some( function(negativeKeyword, index, array) {    //  .some returns true for matches at least one match
                        //stopWord.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, '\\$1');        // Clean stopWord of special characters
                        //stopWord = "\\b\\"+ stopWord + "\\b";                          // create a regexp
                        return new RegExp('\\b' + negativeKeyword + '\\b', 'i').test(currentValue.Keyword);    // returns true of false
                    }) === true) {
                        currentValue.negativeKeywordMatch = true;                      // atleast one match found in the stop word list for current keyword
                        return currentValue;
                    } else {
                         //currentValue.negativeKeywordMatch = false;                    // no match found
                         return currentValue;
                    }
                } else {
                    //currentValue.negativeKeywordMatch = false;                         // No element in stopWordsList
                    return currentValue;
                }
            } else {
                //currentValue.negativeKeywordMatch = false;                             // stopWOrdsList not defined
                return currentValue;
            }
        });
        countMatchedKeywords();
    };

    // Reset button pressed
    $scope.resetMatches = function() {
        $scope.actualData.forEach( function(element, index){
            element.negativeKeywordMatch = false; 
        });
        countMatchedKeywords();
    };

    // Delete matches
    $scope.deleteMatches = function() {
        $scope.actualData = $scope.actualData.filter( function(element, index) {
			return !element.negativeKeywordMatch;
        });
		DataShareService.updateActualData($scope.actualData);
        $scope.updateKeywordTable();
        countMatchedKeywords();
    };

    // Handle manula stopWordMatch check box toggle 
           
    $scope.negativeKeyowrdCheckBoxToggle = function(keyword) {
        $scope.actualData.forEach( function(element, index){
            if(element.Keyword === keyword) {
                element.negativeKeywordMatch = !element.negativeKeywordMatch; 
                console.log(element);
            }
        });
        countMatchedKeywords();
    };

    // Maintain a count of keywords currently matched (local function);
    var countMatchedKeywords = function() {
        $scope.currentKeywordsMatched = 0; 
        $scope.actualData.forEach( function(element, index) {
            if(element.negativeKeywordMatch === true) {
                $scope.currentKeywordsMatched = $scope.currentKeywordsMatched + 1;
            }
        });
    };

    //////////////////////////// Handle Negative Keyword (Stop Words) Interface ///////////////////
	// Fetch Stop words list
	// Expects a string with new line separating individual words
	/*$http.get('scripts/NegativeKeywords_Step1.txt').success(function(data) {
		// Create JS array splitting at new line
		data = data.split('\r\n');
        $scope.addNegativeKeywordList(data);
	});

    // Delete a Stop Word from the displayed list
    $scope.deleteNegativeKeyword = function(negativeKeyword) {
        $scope.negativeKeywordList.splice( $scope.negativeKeywordList.indexOf(negativeKeyword), 1 );
    };

    // Add Negative Keyword (formarly stop word) button pressed
    // Add a new user input Stop Word to the displayed list
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

    // Add string array to StopeWordsList
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
    };
    //////////////////////////// End Handle Stop Words Interface ///////////////////
    
    // 
    $scope.markOrderIndepDuplicates = function() {

        $scope.actualData.forEach( function(element, index) {
            var temp = element.Keyword.split(' ').sort().join(' ');
            $scope.actualData.forEach (function (elem, ind) {
                if (index < ind) {
//                    if( element.Keyword.split(' ').sort().join(' ') == elem.Keyword.split(' ').sort().join(' ') )  {
                        if( temp == elem.Keyword.split(' ').sort().join(' ') )  {
                        elem.negativeKeywordMatch = true;
//                        console.log(elem.Keyword);
                    }
                }
            });
        });
        countMatchedKeywords();
    };*/
	
	DataShareService.fetchActualData( function(data) {
		$scope.actualData = data;
		$scope.dummyData = $scope.actualData;
		$scope.updateKeywordTable();
	});
	/*
	// Init
	DataShareService.query(function(data) { 
		$scope.actualData = data;
		$scope.dummyData = $scope.actualData;
		$scope.updateKeywordTable();
	});
	*/
}]);
