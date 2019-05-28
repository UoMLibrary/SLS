const gulp = require('gulp');
const del = require('del');
const fs = require('fs');
const cheerio = require('cheerio');
const request = require('request');
const jsonfile = require('jsonfile');
const htmlmin = require('gulp-htmlmin');
const inlinesource = require('gulp-inline-source');

gulp.task(
    'build-html',
    function() {
        return gulp.src(
            ['./src/index.html']
        )
            .pipe(inlinesource())
            .pipe(htmlmin({collapseWhitespace: true}))
            .pipe(gulp.dest('./dist/LIB-MLE-online-resource-v2'));
    }
);

gulp.task(
    'extract-legacy-online-resources',
    function(cb) {
        request(
            {
                uri: 'https://www.library.manchester.ac.uk/using-the-library/students/training-and-skills-support/my-learning-essentials/online-resources/',
                method: 'GET'
            },
            function(error, response, body) {

                if(error) {
                    console.log("Couldn't get resources webpage");
                } else {

                    const $ = cheerio.load(response.body);

                    const resources = [];

                    $('.mle_item').each(
                        function(i, elem) {

                            // parse tags
                            const tags = [];
                            $(this).find('.tags_list').find('a').each(
                                function(j, tag) {
                                    tags.push($(this).text().trim());
                                }
                            );

                            const resource = {
                                featured: $(this).find('.featured').text().trim() === "Featured",
                                title: $(this).find('.mle_title').text().trim(),
                                description: $(this).find('.mle_description').text().trim(),
                                duration: $(this).find('.mle_detail').find('li').find('span.fine-detail').eq(0).text().trim(),
                                format: $(this).find('.mle_detail').find('li').find('span.fine-detail').eq(1).text().trim(),
                                link: $(this).find('.mle_button').find('a').eq(0).attr('href'),
                                tags: tags
                            };


                          resources.push(resource);

                        }
                    );

                    var date = new Date();
                    var dateString = new Date(date.getTime() - (date.getTimezoneOffset() * 60000 ))
                        .toISOString()
                        .split("T")[0];

                    jsonfile.writeFileSync('./legacy-exports/' + dateString + '.json', resources);

                    cb();

                }

            }
        );
    }
);

gulp.task(
    'create-static-resources',
    function (cb) {
        jsonfile.readFile(
            './src/resources.json',
            function (err, resources) {
                if (err) console.error(err);
                // console.dir(resources)
                fs.writeFileSync(
                    '/src/default-resources.js',
                    "var defaultResources = '" + escape(JSON.stringify(resources)) + "';"
                );
                cb();
            }
        )
    }
);

gulp.task(
    'dev-server',
    function() {
        var liveServer = require("live-server");
        var params = {
            port: 8181, // Set the server port. Defaults to 8080.
            host: "0.0.0.0", // Set the address to bind to. Defaults to 0.0.0.0 or process.env.IP.
            root: "./dist/LIB-MLE-online-resource-v2", // Set root directory that's being served. Defaults to cwd.
            open: true, // When false, it won't load your browser by default.
            file: "index.html" // When set, serve this file (server root relative) for every 404 (useful for single-page applications),
        };
        liveServer.start(params);
    }
);

gulp.task(
    'dev-watch',
    function() {
        gulp.watch(
            './src/**/*.*',
            {ignoreInitial: false},
            gulp.series('build-html')
        )
    }
);

gulp.task(
    'dev',
    gulp.parallel('dev-server', 'dev-watch')
);
