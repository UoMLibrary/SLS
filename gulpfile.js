const gulp = require('gulp');
const del = require('del');

const cheerio = require('cheerio');
const request = require('request');
const jsonfile = require('jsonfile');
const htmlmin = require('gulp-htmlmin');

const inlinesource = require('gulp-inline-source');

gulp.task(
    'build-html',
    function() {
        return gulp.src(
            ['./online-resources/src/index.html']
        )
            .pipe(inlinesource())
            .pipe(htmlmin({collapseWhitespace: true}))
            .pipe(gulp.dest('./dist/t4-content-types/LIB-MLE-online-resource-v2'));
    }
);

gulp.task(
    'clean-online-resources',
    function() {
        return del(buildPath);
    }
);

gulp.task(
    'build-online-resources',
    gulp.series('clean-online-resources', 'build-html')
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

                    jsonfile.writeFileSync('online-resources/legacy-exports-' + dateString + '.json', resources);
                    cb();

                }

            }
        );
    }
);

gulp.task(
    'dev',
    function() {
        gulp.watch(
            srcPath + "/**/*.*",
            gulp.series('build', 'build-to-submodules')
        );
    }
);