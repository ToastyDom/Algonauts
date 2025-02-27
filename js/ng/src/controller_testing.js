momentsApp.controller('mainCtrl', ["$scope", "$log", "$timeout", "$http", "$sce", "$mdSidenav", "angularGridInstance",
    // momentsApp.controller('mainCtrl', ["$scope", "$log", "$timeout", "$http", "$sce",
    function ($scope, $log, $timeout, $http, $sce, $mdSidenav, angularGridInstance) {
        window.$scope = $scope
        $scope.trustAsHtml = function (string) {
            return $sce.trustAsHtml(string);
        };

        $scope.data = [];

        $scope.videos = [];
        $scope.categories = [];

        $scope.allVideos = [];
        $scope.allCategories = [];

        $scope.allPlaces = [];
        $scope.allObjects = [];

        $scope.possibleVideos = [];
        $scope.possibleCategories = [];
        $scope.homepageCategories = ['dancing', 'falling']


        // $http.get('data/data_filtered_new.json').then(
        //     function (response) {
        //         console.log('got json response')
        //         $scope.data = response.data;
        //         $scope.allCategories = Object.keys(response.data).sort();
        //         $scope.allVideos = $scope.shuffle($scope.allVideos.concat.apply([],
        //             Object.values(response.data)));
        //         $scope.videos = $scope.allVideos.slice(0, $scope.limit)

        //         // Get unique objects and places
        //         // for (i = 0; i < $scope.allVideos.length; i++){
        //         // $scope.allVideos[i].places.classes = $scope.allVideos[i].places.classes.map(item => item.split('_').join(' '));
        //         // $scope.allVideos[i].objects.classes = $scope.allVideos[i].objects.classes.map(item => item.split('_').join(' '));
        //         // $scope.allPlaces.push.apply($scope.allPlaces, $scope.allVideos[i].places.classes)
        //         // $scope.allObjects.push.apply($scope.allObjects, $scope.allVideos[i].objects.classes)
        //         // }
        //         // $scope.allPlaces = [...new Set($scope.allPlaces.map(item => item))];
        //         // $scope.allObjects = [...new Set($scope.allObjects.map(item => item))];
        //     },
        //     function (response) {
        //         // called asynchronously if an error occurs
        //         // or server returns response with an error status.
        //         console.log('could not get json response');
        //     });

        $scope.limit = 25;
        $scope.searchText = "";
        $scope.autoplay = false;
        $scope.muted = false;

        $scope.setSearchText = function (text) {
            console.log('Setting searchText to ' + text)
            $scope.searchText = text;
            $scope.applyQuery(text)
        }

        $scope.toggleMuted = function () {
            $scope.muted = !$scope.muted;
            var videos = document.getElementsByClassName('grid-video video-loaded');
            for (video of videos) {
                video.muted = $scope.muted;
            }
        };

        $scope.togglePlay = function (video) {
            if (video.paused == true) {
                video.play();
            } else {
                video.pause();
            }
        };

        $scope.toggleAutoplay = function () {
            $scope.autoplay = !$scope.autoplay
            var videos = document.getElementsByClassName('grid-video video-loaded');
            for (video of videos) {
                if ($scope.autoplay == true) {
                    video.play();
                } else {
                    video.pause();
                }
            }
        };

        //apply search and sort method
        $scope.$watch('searchText', function (val) {
            val = val.toLowerCase();
            console.log(val)
            // $scope.videos = $scope.shuffle($scope.querySearch(val).slice(0, $scope.limit))
            // $scope.videos = $scope.shuffle($scope.querySearch(val).slice(0, 100))
            // $scope.videos = $scope.querySearch(val).slice(0, 100)
            $scope.queriedVideos = $scope.querySearch(val)
            // $scope.queriedVideos = $scope.querySearch(val).slice(0, 100)
            // $scope.possibleVideos = Array.prototype.concat.apply([],
            // $scope.possibleCategories.map(function(key) { return $scope.data[key] }));

            // $scope.selectedItem = $scope.possibleCategories[0]
        });

        $scope.applyQuery = function (val) {
            // val = val.toLowerCase();
            // console.log(val)
            // console.log($scope.querySearchText(val))
            // $scope.videos = $scope.shuffle($scope.querySearch(val).slice(0, $scope.limit))
            // $scope.videos = $scope.shuffle($scope.querySearch(val).slice(0, 100))
            // $scope.videos = $scope.querySearch(val).slice(0, 100)
            if (typeof val != 'undefined') {
                console.log(val)
                $scope.videos = $scope.querySearch(val)
                console.log('number of videos: ' + $scope.videos.length)
            }
            // $scope.videos = $scope.queriedVideos;
        }

        $scope.querySearch = function (query) {
            query = query.toLowerCase();
            return $scope.allVideos.filter(function (obj) {
                return obj['class'].toLowerCase().indexOf(query) === 0;
                // return obj['class'].toLowerCase().indexOf(query) === 0 ||
                // obj['places']['classes'][0].toLowerCase().indexOf(query) == 0 ||
                // obj['objects']['classes'][0].toLowerCase().indexOf(query) == 0;
            });
        };

        $scope.querySearchText = function (query) {
            query = query.toLowerCase();
            // return $scope.allCategories.filter(function(obj) {
            return $scope.allCategories.filter(function (obj) {
                return obj.toLowerCase().indexOf(query) === 0;
            });
        };

        $scope.more = function () {
            $scope.limit++;
            $scope.refresh();
        }

        $scope.toggleLeft = buildToggler('left');
        $scope.toggleRight = buildToggler('right');

        function buildToggler(componentId) {
            return function () {
                $mdSidenav(componentId).toggle();
            };
        }

        // $scope.querySearch = function(query) {
        //     query = query.toLowerCase();
        //     return $scope.allCategories.filter(function(obj) {
        //         // return obj.toLowerCase().indexOf(val) != -1;
        //         return obj.toLowerCase().indexOf(query) === 0;
        //     });
        // };

        /**
         * Return the proper object when the append is called.
         */
        $scope.transformChip = function (chip) {
            // If it is an object, it's already a known chip
            if (angular.isObject(chip)) {
                return chip;
            }

            // Otherwise, create a new one
            return {
                name: chip
            }
        };

        $scope.refresh = function () {
            console.log('Refreshing')
            angularGridInstance.gallery.refresh()
        };


        $scope.loadMore = function () {
            console.log('calling loadMore()')
            console.log('scope.limit:' + $scope.limit)
            $scope.videos = $scope.videos.concat($scope.allVideos.slice($scope.limit, $scope.limit + 1))
            $scope.limit = $scope.limit += 1
            console.log($scope.videos)
            console.log('scope.limit:' + $scope.limit)
            $scope.searchText = $scope.searchText
        }
        // $scope.loadMore = function() {
        //     console.log("loading more");
        //     var last = $scope.videos.length;
        //     var cur = 0;
        //     var count = 0;
        //     var minNum = Math.min(($window.innerHeight / 90) * ($window.innerWidth / 90), 30);
        //     if (cur < $scope.possibleVideos.length) {
        //         while ((count < 3 || $scope.videos.length < minNum) && cur < $scope.possibleVideos.length) {
        //             if (!contains($scope.videos, $scope.possibleVideos[cur])) {
        //                 $scope.videos.push($scope.possibleVideos[cur]);
        //                 count++;
        //             }
        //             cur++;
        //         }
        //     }
        // };

        var contains = function (arr, img) {
            for (var i = 0; i < arr.length; i++) {
                if (arr[i].name === img.name) {
                    return true;
                }
            }
            return false;
        };

        $scope.shuffle = function (arr, options) {

            if (!Array.isArray(arr)) {
                throw new Error('shuffle expect an array as parameter.');
            }

            options = options || {};

            var collection = arr,
                len = arr.length,
                rng = options.rng || Math.random,
                random,
                temp;

            if (options.copy === true) {
                collection = arr.slice();
            }

            while (len) {
                random = Math.floor(rng() * len);
                len -= 1;
                temp = collection[len];
                collection[len] = collection[random];
                collection[random] = temp;
            }

            return collection;
        };


        $scope.title = "Moments"
        $scope.subtitle = "The same moments happen in all places"

        $scope.projectTitle = "Moments Dataset"
        $scope.projectDesc = "``The best things in life are not things; they are moments'' of raining, walking, splashing, resting, laughing, crying, jumping, etc. <i>Moments</i> represent a collection of one million labelled videos, involving people, animals, objects or natural phenomena, that capture the gist of a dynamic instant.";
        // $scope.projectSubDesc = "MASSVIS consists of over 5000 static visualizations of which over 2000 contain visualization type information, and hundreds of these visualizations have extensive annotations, memorability scores, eye-movements, and labels."

        $scope.aboutDetails = [
            [
                ["1 detailed taxonomy for classifying visualizations", "taxonomy.png"],
                ["10s of eye-tracking lab participants", "10s-of-people.png"]
            ],

            [
                ["100s of labeled visualizations", "100s-labeled-viz.png"],
                ["100s of memorability scores", "100s-mem-scores.png"]
            ],

            [
                ["100s of participants on Amazon’s Mechanical Turk", "100s-of-people.png"],
                ['1000s of visualizations "in-the-wild"', "1000s-visualization.png"]
            ],

            [
                ['1000s of manual annotations', "1000s-annotations.png"],
                ['1000s of polygonal labels on visualizations', "100s-labeled-viz.png"]
            ],

            [
                ['1000s of text descriptions', "1000s-text-desc.png"],
                ['10,000s of eye fixations', "1000s-eyetracking.png"]
            ]
        ];

        $scope.acknowledgement = "This work has been supported in part by the National Science Foundation (NSF) under grant 1016862, MIT Big Data Initiative at CSAIL, Google, and Xerox awards to Aude Oliva. This work has also been made possible through support from the Department of Defense through the National Defense Science & Engineering Graduate Fellowship (NDSEG) Program, the NSF Graduate Research Fellowship Program, the Natural Sciences and Engineering Research Council of Canada Postgraduate Doctoral Scholarship (NSERC PGS-D), and the Kwanjeong Educational Foundation."
        $scope.bookChapters = [{
            title: "Eye Fixation Metrics for Large Scale Evaluation and Comparison of Information Visualizations",
            link: "http://link.springer.com/chapter/10.1007/978-3-319-47024-5_14",
            bibtex: "http://citation-needed.services.springer.com/v2/references/10.1007/978-3-319-47024-5_14?format=bibtex&flavour=citation",
            authors: "Bylinskii, Z., Borkin, M. A., Kim, N. W., Pfister, H., and Oliva, A.",
            source: "In Burch, M., Chuang, L., Fisher, B., Schmidt, A., Weiskopf, D. (Eds.), Eye Tracking and Visualization: Foundations, Techniques, and Applications (pp. 235-255). Springer International Publishing"
        }]
        $scope.journalPapers = [{
                title: "Beyond Memorability: Visualization Recognition and Recall",
                link: "http://vcg.seas.harvard.edu/files/pfister/files/infovis_submission251-camera.pdf",
                supplement: "http://vcg.seas.harvard.edu/files/pfister/files/infovis_submission251-supplementalmaterial-camera.pdf",
                video: "http://vcg.seas.harvard.edu/files/pfister/files/infovis-251_teaser.mp4",
                slides: "http://vcg.seas.harvard.edu/files/pfister/files/infovis-2015_final.pdf",
                bibtex: "http://vcg.seas.harvard.edu/publications/export/bibtex/534661",
                authors: "Borkin, M.<sup>*</sup>,  Bylinskii, Z.<sup>*</sup>, Kim, N.W., Bainbridge C.M., Yeh, C.S., Borkin, D., Pfister, H., & Oliva, A.",
                source: "IEEE Transactions on Visualization and Computer Graphics (Proceedings of InfoVis 2015)"
            },
            {
                title: "What Makes a Visualization Memorable?",
                link: "http://vcg.seas.harvard.edu/files/pfister/files/infovis_borkin-128-camera_ready_0.pdf",
                supplement: "http://vcg.seas.harvard.edu/files/pfister/files/supplemental-infovis128.pdf",
                video: "http://vcg.seas.harvard.edu/files/pfister/files/experiment-screengrab.mp4",
                slides: "http://vcg.seas.harvard.edu/files/pfister/files/infovis2013_borkin-vizmem.pdf",
                bibtex: "http://vcg.seas.harvard.edu/publications/export/bibtex/83476",
                authors: "Borkin, M., Vo, A., Bylinskii, Z., Isola, P., Sunkavalli, S., Oliva, A., & Pfister, H.",
                source: "IEEE Transactions on Visualization and Computer Graphics (Proceedings of InfoVis 2013)"
            }
        ]
        $scope.otherPapers = [{
                title: "Eye Fixation Metrics for Large Scale Analysis of Information Visualizations",
                link: "http://web.mit.edu/zoya/www/Bylinskii_eyefixations_small.pdf",
                slides: "http://web.mit.edu/zoya/www/ETVIS_red.pdf",
                //bibtex: "http://vcg.seas.harvard.edu/publications/export/bibtex/371751",
                authors: "Bylinskii, Z., & Borkin, M.",
                source: "First Workshop on Eyetracking and Visualizations (ETVIS 2015) in conjunction with IEEE VIS 2015"
            },
            {
                title: "A Crowdsourced Alternative to Eye-tracking for Visualization Understanding",
                link: "http://namwkim.org/files/CHI2015-WIP-Bubble.pdf",
                slides: "http://namwkim.org/files/CHI2015-WIP-Bubble-Poster.pdf",
                bibtex: "http://vcg.seas.harvard.edu/publications/export/bibtex/371751",
                authors: "Kim, N.W., Bylinskii, Z., Borkin, M., Oliva, A., Gajos, K.Z., & Pfister, H.",
                site: "https://namwkim.github.io/bubbleview/",
                source: "Proceedings of the ACM Conference Extended Abstracts on Human Factors in Computing Systems (CHI EA '15)"
            }
        ]
        $scope.techReports = [{
            title: "BubbleView: an interface for crowdsourcing image importance maps and tracking visual attention",
            link: "https://arxiv.org/pdf/1702.05150",
            site: "https://namwkim.github.io/bubbleview/",
            bibtex: "https://namwkim.github.io/bubbleview/",
            authors: "Kim, N.W.<sup>*</sup>, Bylinskii, Z.<sup>*</sup>, Borkin, M., Gajos, K.Z., Oliva, A., Durand F., & Pfister, H.",
            source: "arXiv preprint, 2017 (accepted to TOCHI)"
        }]

        $scope.coreMembers = [
            {
                name: "Team Leader: Radoslaw Cichy",
                url: "http://userpage.fu-berlin.de/rmcichy/",
                photo: "radek.png",
                affiliation: "Research Group Leader, Freie Universität Berlin"
            },
            {
                name: "Team Leader: Aude Oliva",
                url: "http://cvcl.mit.edu/aude.htm",
                photo: "aude.jpg",
                affiliation: "Principal Research Scientist, MIT"
            },
            {
                name: "Team Leader: Gemma Roig",
                url: "http://web.mit.edu/gemmar/www/",
                photo: "gemma.jpg",
                affiliation: "Assistant Professor, SUTD" // Singapore University of Technology and Design //SUTD
            }

        ];

        $scope.members = [
            {
                name: "Alex Andonian",
                url: "http://alexandonian.com",
                photo: "alex.jpg",
                affiliation: "Research Assistant, MIT"
            },
            {
                name: "Kshitij Dwivedi",
                url: "",
                photo: "kshitij.jpg",
                affiliation: "PhD Student, SUTD" // Singapore University of Technology and Design 
            },
            // {
            //     name: "Talia Konkle",
            //     url: "",
            //     photo: "",
            //     affiliation: ""
            // },
            {
                name: "Benjamin Lahner",
                url: "https://www.linkedin.com/in/benlahner/",
                photo: "ben.jpg",
                affiliation: "Research Assistant, MIT"
            },
            {
                name: "Alex Lascelles",
                url: "https://www.linkedin.com/in/alexlascelles/",
                photo: "alexl.jpg",
                affiliation: "Research Assistant, MIT"
            },
            {
                name: "Yalda Mohsenzadeh",
                url: "https://sites.google.com/site/dryaldamohsenzadeh/",
                photo: "yalda.jpg",
                affiliation: "Postdoctoral Researcher, MIT"
            },
            {
                name: "Kandan Ramakrishnan",
                url: "http://people.csail.mit.edu/krama/",
                photo: "kandan.jpg",
                affiliation: "Postdoctoral Researcher, MIT"
            },
            // {
            //     name: "Gemma Roig",
            //     url: "http://web.mit.edu/gemmar/www/",
            //     photo: "gemma.jpg",
            //     affiliation: "Assistant Professor, SUTD" // Singapore University of Technology and Design //SUTD
            // },
            {
                name: "Bolei Zhou",
                url: "http://bzhou.ie.cuhk.edu.hk/",
                photo: "bolei.jpg",
                affiliation: "Assistant Professor, CUHK" // Chinese University of Hong Kong //CUHK
            }
        ];

        $scope.speakers = [
            {
                name: "Matt Botvinick",
                url: "https://deepmind.com/",
                photo: "matthew.jpg",
                affiliation: "Google DeepMind"
            },
            {
                name: "David Cox",
                url: "http://www.coxlab.org/",
                photo: "david.jpg",
                affiliation: "Harvard"
            },
            {
                name: "James DiCarlo",
                url: "http://dicarlolab.mit.edu/",
                photo: "james.jpg",
                affiliation: "MIT"
            },
            {
                name: "Talia Konkle",
                url: "http://konklab.fas.harvard.edu/",
                photo: "talia.jpg",
                affiliation: "Harvard"
            },
            {
                name: "Tom Neselaris",
                url: "http://www.naselarislab.net/",
                photo: "tomN.jpg",
                affiliation: "MUSC"
            },
            {
                name: "Aude Oliva",
                url: "http://cvcl.mit.edu/aude.htm",
                photo: "aude.jpg",
                affiliation: "MIT"
            }
            // {
            //     name: "",
            //     url: "",
            //     photo: "",
            //     affiliation: ""
            // }

        ];

        // 'http://challenge.algonauts.csail.mit.edu/competitions/58/results/55/data'    =  Test leaderboard fMRI
        // 'http://challenge.algonauts.csail.mit.edu/competitions/59/results/56/data'       = Test leaderboard MEG
        // 'http://challenge.algonauts.csail.mit.edu/competitions/77/results/74/data'    = Real fMRI leaderboard
        // 'http://challenge.algonauts.csail.mit.edu/competitions/78/results/75/data'     =  Real MEG leaderboard
        
        //fMRI
        $http.get('http://challenge.algonauts.csail.mit.edu/competitions/77/results/74/data').then(
            function (response) {
                // console.log('got json response')
                $scope.data = response.data;
                console.log("fmri response.data  =",response.data);
                $scope.leaderboardResults_fmri = $scope.csv_parse_fmri(response.data);
                
            },
            function (response) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
                console.log('could not get json response');
            });

        // MEG
        $http.get('http://challenge.algonauts.csail.mit.edu/competitions/78/results/75/data').then(
            function (response) {
                $scope.data = response.data;
                console.log("meg response.data: \n", response.data);
                $scope.leaderboardResults_meg = $scope.csv_parse_meg(response.data);
                
            },
            function (response) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
                console.log('could not get json response');
            });

        // fMRI
        $scope.csv_parse_fmri = function(leaderboard_rawdata) {
            const rows = [];
            leaderboard_rawdata.split('\n').forEach((row, index) => {
                if (index > 1) {
                    const cols = row.split(',');
                    if (cols.length>1){
                        const score_NNR2 = cols[2].substring(0,cols[2].length-4); 
                        const metric1_NNR2 = cols[3].substring(0,cols[3].length-4); 
                        const metric2_NNR2 = cols[4].substring(0,cols[4].length-4);
                        const score_R2 = ((score_NNR2*((0.0640+0.0647)/2.0))/100.0).toFixed(4);    // Using the exact calculations done in the scoring program to reconstruct missing csv data
                        const metric1_R2 = ((metric1_NNR2*0.0640)/100.0).toFixed(4); 
                        const metric2_R2 = ((metric2_NNR2*0.0647)/100.0).toFixed(4);
                        const data = {
                            Rank: index-1,
                            User: cols[1],
                            Metric1_R2: metric1_R2,
                            Metric1_NNR2: metric1_NNR2,
                            Metric2_R2: metric2_R2,
                            Metric2_NNR2: metric2_NNR2,
                            Score_R2: score_R2,
                            Score_NNR2: score_NNR2    
                        };
                        rows.push(data);
                    }
                }
            });
            return rows;
        };

        // MEG
        $scope.csv_parse_meg = function(leaderboard_rawdata) {
            const rows = [];
            leaderboard_rawdata.split('\n').forEach((row, index) => {
                if (index > 1) {
                    const cols = row.split(',');
                    if (cols.length>1){
                        const score_NNR2 = cols[2].substring(0,cols[2].length-4); 
                        const metric1_NNR2 = cols[3].substring(0,cols[3].length-4); 
                        const metric2_NNR2 = cols[4].substring(0,cols[4].length-4);
                        const score_R2 = ((score_NNR2*((0.3562+0.4452)/2.0))/100.0).toFixed(4);    // Using the exact calculations done in the scoring program to reconstruct missing csv data
                        const metric1_R2 = ((metric1_NNR2*0.3562)/100.0).toFixed(4); 
                        const metric2_R2 = ((metric2_NNR2*0.4452)/100.0).toFixed(4);
                        const data = {
                            Rank: index-1,
                            User: cols[1],
                            Metric1_R2: metric1_R2,
                            Metric1_NNR2: metric1_NNR2,
                            Metric2_R2: metric2_R2,
                            Metric2_NNR2: metric2_NNR2,
                            Score_R2: score_R2,
                            Score_NNR2: score_NNR2
                        };
                        rows.push(data);
                    }
                }
            });
            return rows;
        };
        

        // // function to parse csv into just the rows we want.  csv_data = $scope.data
        // $scope.csvtorows = function(csv_data) {
        //     let rows = [];
        //     csv_data.split('\n').forEach(r => rows.push(r.split(',')));
        //     let rows_wanted = [];
        //     for (i = 2; i<rows.length-1; i++){
        //         rows_wanted.push(rows[i])
        //         };
        //     return rows;
        // };

        

        // function to parse a single row
        // $scope.parserow = function(row_input) {
        //     let 
        // };

        // rows = []
        // csv_string = $scope.data
        // csv_string.split('\n').forEach(r => rows.push(r.split(',')));

        //          Take just the data rows (exclude first 2 and last row):
        // rowsss=[]
        // for (i = 2; i<rows.length-1; i++){
        //     rowsss.push(rows[i])
        //     }

        // Y = rows[3]
        // PAD = Y.slice(1,5)    slicing down the row into the elements we want
        // for (i = 1; i < 4; i++){
        //     PAD[i] = PAD[i].substring(0,PAD[i].length-4)
        //     }


        // To automate it for each Y=rows[3]  something like this:
        // PAD =[]
        // for (i=0;i<=rows.length;i++){
        //     PAD.push(rows[i].slice(1,5))
        //     for (j = 1; j < 4; j++){
        //         PAD[i][j] = PAD[i][j].substring(0,PAD[i][j].length-4)
        //     }
        //      }


        // asd = rows[2][3].substring(0,rows[2][3].length - 4)     for removing brackets from an element. Need for loop to only do this for last 3 elements:
        // something like:
        // for (i = 1; i < 4; i++){
        //     PAD[i] = PAD[i].substring(0,PAD[i].length-4)
        //     }

        $scope.datasetTitle = "Dataset Download"
        $scope.contactTitle = "Let's Get In Touch!";
        $scope.contactDesc = "Questions? Comments?"

        $scope.license = "By checking this box, you agree to the following license agreement: Access to, and use of, the images, and annotations in this dataset are for research and educational uses only. No commercial use, reproduction or distribution of the images, or any modifications thereof, is permitted. "

        $scope.eyeTitle = "Eye-movement Data";
        $scope.eyeDesc = "We have eye-movement data for a total of 393 visualizations and 33 viewers, with an average of 16 viewers per visualization. Each viewer looked at each visualization for 10 seconds, generating an average of 37 fixation points. This is a total of about 600 fixation points per visualization across all viewers. We store the (x,y) location of each fixation on a visualization, the time-point when the fixation occurred during the viewing period, and the duration (in ms) of each fixation. We provide tools for visualizing the fixation sequences, fixation durations, and fixation heatmaps on top of visualizations."
        $scope.eyeData = "https://github.com/massvis/eyetracking";
        $scope.eyeCode = "https://github.com/massvis/eyetracking/tree/master/matlab_files/visualizationCode";

        $scope.datasets = [{
                name: "all5k",
                size: "(~2.42G)",
                desc: "This data contains 5,814 single- and multi-panel visualizations scraped from the web from seven different online sources making up a total of four different source categories (government and world organizations, news media, infographics, and scientific publications). We provide the original visualizations, original URLs, source and category labels, as well as whether each visualization is single or multi-panel. This data is described in “What makes a visualization memorable?” (InfoVis 2013).",
                bibtex: "http://vcg.seas.harvard.edu/publications/export/bibtex/83476"
            },
            {
                name: "single2k",
                size: "(~625M)",
                desc: "This data contains a subset of the visualizations from all5k, limited to only single-panel, stand-alone visualizations (a total of 2,068 visualizations). We provide the original URLs, source and category labels, and visualization type. The taxonomy used to classify the visualization type is described in “What makes a visualization memorable?” (InfoVis 2013).",
                bibtex: "http://vcg.seas.harvard.edu/publications/export/bibtex/83476"
            },
            {
                name: "targets410",
                size: "(~140M)",
                desc: "This data contains taxonomic labels and attributes for 410 visualizations. These include the source, category, and type of each visualization, as well as the following attributes: data-ink ratio, number of distinctive colors, black & white, visual density, human recognizable object (HRO), and human depiction. We also provide the transcribed title for each visualization and where the title was located on the visualization. From the Amazon Mechanical Turk (AMT) Experiments, we provide the number of hits, misses, false alarms, and correct rejections per image, which can be converted into the desired memorability scores (HR, FAR, dprime, etc.)",
                bibtex: "http://vcg.seas.harvard.edu/publications/export/bibtex/83476"
            },
            {
                name: "targets393",
                size: "(~160M)",
                desc: "This data contains taxonomic labels and attributes for 393 visualizations. These include the source, category, and type of each visualization, as well as the following attributes: data-ink ratio, number of distinctive colors, black & white, visual density, human recognizable object (HRO), and human depiction. We also provide the transcribed title for each visualization and where the title was located on the visualization, as well as whether the visualization contained data or message redundancy. From Borkin et al. 2013 we include at-a-glance memorability scores (after 1 second of viewing) and from Borkin, Bylinskii et al. 2015 we include prolonged memorability scores (after 10 seconds of viewing). As described in “Beyond Memorability: Visualization Recognition and Recall“ (InfoVis 2015), we provide participant's eye movements and textual descriptions.",
                bibtex: "http://vcg.seas.harvard.edu/publications/export/bibtex/534661"
            }
        ];
        $scope.password = "";
        $scope.dataLinks = [];

        function validateEmail(email) {
            var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
            return re.test(email);
        }
        $scope.request = function () {
            if ($("#licensechk").prop('checked') == false) {
                $("#license-alert").show();
                $timeout(function () {
                    $("#license-alert").hide(400);
                }, 2000)
                return;
            }

            // validate form data
            var name = $("#name").val();
            var email = $("#email").val();
            var inst = $("#inst").val();
            var instAddr = $("#inst_addr").val();
            var ivgrName = $("#ivgr_name").val();
            var ivgrEmail = $("#ivgr_email").val();
            var othrEmail = $("#othr_email").val();
            var rqstResn = $("#rqst_resn").val();
            $log.log(name + "," + email + "," + inst + "," + instAddr + "," + ivgrName + "," + ivgrEmail + "," + othrEmail + "," + rqstResn);
            if (name == "" || email == "" || !validateEmail(email)) {
                $log.log("not enough information")
                $("#request-alert").show();
                $timeout(function () {
                    $("#request-alert").hide(400);
                }, 2000)
                return;
            }
            // request data
            var requested = [];
            $scope.datasets.forEach(function (d) {
                if ($("#" + d.name).prop('checked')) {
                    if (d.name == "all5k") {
                        requested.push("news");
                        requested.push("science");
                        requested.push("government");
                        requested.push("vis1");
                        requested.push("vis2");
                        requested.push("vis3");
                    } else {
                        requested.push(d.name);
                    }
                }

                $log.log(d.name + ", " + $("#" + d.name).prop('checked'));
            })
            if (requested.length == 0) {
                $("#data-alert").show();
                $timeout(function () {
                    $("#data-alert").hide(400);
                }, 2000)
                return;
            }

            var request = {
                name: name,
                email: email,
                inst: inst,
                inst_addr: instAddr,
                ivgr_name: ivgrName,
                ivgr_email: ivgrEmail,
                othr_email: othrEmail,
                rqst_resn: rqstResn,
                requested: requested
            }


            $http.post("index.fcgi/datarequest", request)
                .success(function (result) {

                    if (result) {
                        $("#accesspw").html(result.password);
                        $("#myModal").modal();

                        $timeout(function () {

                            $scope.password = result.password;
                            $log.log("PASSWORD:" + $scope.password)
                            dataLinks = []
                            requested.forEach(function (f) {
                                if (f == "all5k") {
                                    dataLinks.push({
                                        link: "all5k(part1).zip",
                                        pw: $scope.password
                                    });
                                    dataLinks.push({
                                        link: "all5k(part2).zip",
                                        pw: $scope.password
                                    });
                                } else {
                                    dataLinks.push({
                                        link: (f + ".zip"),
                                        pw: $scope.password
                                    });
                                }

                            })
                            $log.log(dataLinks);
                            $scope.dataLinks = dataLinks;
                        })
                    } else {
                        $("#request-error").show();
                        $timeout(function () {
                            $("#request-error").hide(400);
                        }, 2000)
                    }
                })
                .error(function () {
                    $("#request-error").show();
                    $timeout(function () {
                        $("#request-error").hide(400);
                    }, 2000)

                })
        }
    }
]);