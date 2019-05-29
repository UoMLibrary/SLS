const gulp = require('gulp');
const del = require('del');
const fs = require('fs');
const cheerio = require('cheerio');
const request = require('request');
const jsonfile = require('jsonfile');
const htmlmin = require('gulp-htmlmin');
const inlinesource = require('gulp-inline-source');
const hljs = require('highlight.js');
const emoji = require('markdown-it-emoji');
const md = require('markdown-it')({
    highlight: function (str, lang) {
        if (lang && hljs.getLanguage(lang)) {
            try {
                return '<pre class="hljs"><code>' +
                    hljs.highlight(lang, str, true).value +
                    '</code></pre>';
            } catch (__) {}
        }

        return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>';
    }
}).use(emoji);

// Remember old renderer, if overridden, or proxy to default renderer
var defaultRender = md.renderer.rules.link_open || function(tokens, idx, options, env, self) {
    return self.renderToken(tokens, idx, options);
};

md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
    // If you are sure other plugins can't add `target` - drop check below
    var aIndex = tokens[idx].attrIndex('target');

    if (aIndex < 0) {
        tokens[idx].attrPush(['target', '_blank']); // add new attribute
    } else {
        tokens[idx].attrs[aIndex][1] = '_blank';    // replace value of existing attr
    }

    // pass token to default renderer.
    return defaultRender(tokens, idx, options, env, self);
};



gulp.task(
    'build-app-html',
    function() {
        return gulp
            .src([
                './build/index.html',
            ])
            .pipe(
                inlinesource({
                    saveRemote: false
                })
            )
            .pipe(htmlmin({collapseWhitespace: true}))
            .pipe(gulp.dest('./dist/LIB-MLE-online-resource-v2'));
    }
);

gulp.task(
    'build-docs-readme-html-from-md',
    function(cb) {
        const readme = fs.readFileSync('./README.md', {encoding: 'utf8'});
        const result = md.render(readme);
        fs.writeFileSync(
            './docs/readme.html',
            '<link rel="stylesheet" href="uom.css" inline>'
            +'<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.15.6/styles/default.min.css" inline>'
            +'<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.15.6/highlight.min.js" inline></script>'
            +'<div class="uom uom-padding">' + result + '</div>'
        );
        cb();
    }
);

gulp.task(
    'build-docs-readme-html-inline',
    function() {
        return gulp
            .src('./docs/readme.html')
            .pipe(
                inlinesource({
                    saveRemote: false
                }))
            .pipe(gulp.dest('docs'))
    }
);

gulp.task(
    'build-docs-readme',
    gulp.series(
        'build-docs-readme-html-from-md',
        'build-docs-readme-html-inline'
    )
);

gulp.task(
    'build-docs',
    gulp.series(
        'build-docs-readme'
    )
);

gulp.task(
    'build-create-static-resources',
    function (cb) {
        jsonfile.readFile(
            './build/resources.json',
            function (err, resources) {
                if (err) console.error(err);
                // console.dir(resources)

                // create build dir if it doesn't exist
                fs.writeFileSync(
                    './build/default-resources.js',
                    "var defaultResources = '" + escape(JSON.stringify(resources)) + "';",
                    {flag:'w+', encoding:'utf8'}
                );

                cb();
            }
        )
    }
);

gulp.task(
    'build-copy-sources',
    function() {
        return gulp
            .src([
                './src/**/*'
            ])
            .pipe(gulp.dest('./build'))
    }
);

gulp.task(
    'build',
    gulp.series(
        'build-copy-sources',
        'build-create-static-resources',
        'build-app-html',
        'build-docs'
    )
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
            gulp.series('build')
        )
    }
);

gulp.task(
    'dev',
    gulp.parallel('dev-server', 'dev-watch')
);
