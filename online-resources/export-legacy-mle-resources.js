const cheerio = require('cheerio');

const request = require('request');

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

            console.log(JSON.stringify(resources));

        }

    }
);