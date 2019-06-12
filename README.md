# My Learning Essentials - Online Resource

This repository homes a web application to filter and display the different online resources provided by [My Learning Essentials](https://www.library.manchester.ac.uk/using-the-library/students/training-and-skills-support/my-learning-essentials)

- [Demo](https://uomlibrary.github.io/mle-online-resources/)
- [Link to Production](https://www.library.manchester.ac.uk/using-the-library/students/training-and-skills-support/my-learning-essentials/online-resources/)
- [Link to Dev](http://libdev.cmsstage.manchester.ac.uk/using-the-library/students/training-and-skills-support/my-learning-essentials/online-resources/)

## Dependencies

- [NodeJS](https://nodejs.org/) (developed on v10.15.3)

## Installation

```npm install```

## Development
Run: ```gulp dev```

Local development app runs on port [8181](http://localhost:8181)

If source file (any file located in ```<project-path>/src```) is edited, a build is triggered and the development live-server instance will restart

## Deployment

### Building
- Run ```gulp build``` to execute build process
- Copy contents of ```<project-path>/dist/LIB-MLE-online-resource-v2/index.html```

### Publishing
- Go to [T4 site manager](https://sitemanager.manchester.ac.uk)
- Navigate to Assets -> Content Types -> LIB-MLE-online-resource-v2 -> Edit. 
- [Info] This should result in you arriving at the [LIB-MLE-online-resource-v2 Content Type](https://sitemanager.manchester.ac.uk/terminalfour/SiteManager?ctfn=template&fnno=10&tid=1953&gid=668)
- Now navigate to: Content Layout -> Edit text/html
- Paste contents of ```<project-path>/dist/LIB-MLE-online-resource-v2/index.html```
- Save changes
- Run T4 publish

## Application

The application is built using [AngularJS](https://angularjs.org/) (not to be mistaken with Angular)

It displays online resources determined by a ```resources.json``` file

![picture](screenshot.png)

##### Example ```resources.json``` file:
```json
[
  {
    "featured": false,
    "title": "Better safe than sorry: proofreading your work",
    "description": "This resource explores three vital elements to review when proofreading your work - flow, clarity and accuracy - and gives you a chance to learn about and apply some techniques to ensure that you check your work properly.",
    "duration": "15 minutes",
    "format": "Online tutorial",
    "link": "https://www.escholar.manchester.ac.uk/learning-objects/mle/proofreading/",
    "tags": [
      "assignments",
      "writing"
    ]
  },
  {
    "featured": false,
    "title": "Podcast: 12 tips for successful revision",
    "description": "",
    "duration": "7 mins",
    "format": "Audio",
    "link": "https://w.soundcloud.com/player/?url=https%3A%2F%2Fapi.soundcloud.com%2Ftracks%2F294406254&auto_play=false&show_artwork=true&visual=true&origin=twitter",
    "tags": [
      "exam extra",
      "planning",
      "revising",
      "study strategies"
    ]
  }
]
```

Things to note:
- Application expects an array of "Resource" objects from ```resources.json```
- You may include soundcloud embeds by using a ```https://w.soundcloud.com/player/``` link (example in JSON above). You can find this link by visiting any soundcloud track, viewing the page source and finding the element:
```html
<meta property="twitter:player" content="https://w.soundcloud.com/player/?url=https%3A%2F%2Fapi.soundcloud.com%2Ftracks%2F294406254&amp;auto_play=false&amp;show_artwork=true&amp;visual=true&amp;origin=twitter">
```

### Resource input

A three-pronged approach has been taken to ensure that resources are available for the application at when it is loaded:

- Embedding at build-time. Build-time resources are determined by the ```src/default-resources.js``` file which is placed inline in the built html. Is generated from ```resources.json```.
- Retrieving at run-time using URI specified in ```src/config.js```. 
``` js
var config = {
    resourcesJsonUrl: "https://raw.githubusercontent.com/UoMLibrary/mle-online-resources/master/resources.json"
};
```
- An external URI specified in query string ```http://localhost:8181/?resourcesSource=<url-encoded-resources-source>```

If multiple resources are available (e.g. the app is able to load external resources. The order of precedence is: *external URI* > *config URI* > *embedded resources*.

:)